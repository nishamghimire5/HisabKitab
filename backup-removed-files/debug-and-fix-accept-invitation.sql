-- First, let's check if the function exists and what it looks like
SELECT
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'accept_trip_invitation';

-- Now let's create the improved version
CREATE OR REPLACE FUNCTION public.accept_trip_invitation
(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
  current_members TEXT[];
BEGIN
    -- Get current user's email
    SELECT email
    INTO user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Get invitation details
    SELECT *
    INTO invitation_record
    FROM public.trip_invitations
    WHERE id = invitation_id
        AND (invited_user_id = auth.uid() OR invited_email = user_email)
        AND status = 'pending'
        AND expires_at > timezone('utc'
    ::text, now
    ());

IF NOT FOUND THEN
    RAISE NOTICE 'Invitation not found or expired for user % and invitation %', user_email, invitation_id;
RETURN FALSE;
END
IF;
  
  RAISE NOTICE 'Processing invitation % for user % to trip %', invitation_id, user_email, invitation_record.trip_id;

-- Add user to trip members table
INSERT INTO public.trip_members
    (trip_id, user_id, role, status, invited_by, joined_at)
VALUES
    (
        invitation_record.trip_id,
        auth.uid(),
        'member',
        'active',
        invitation_record.invited_by,
        timezone('utc'
::text, now
())
    ) ON CONFLICT
(trip_id, user_id) DO
UPDATE SET
    status = 'active',
    joined_at = timezone('utc'
::text, now
());

-- Get current members array
SELECT members
INTO current_members
FROM public.trips
WHERE id = invitation_record.trip_id;

-- Also update the trips.members array for backward compatibility
UPDATE public.trips 
  SET members = CASE 
    WHEN current_members IS NULL THEN ARRAY[user_email]
    WHEN user_email = ANY(current_members) THEN current_members
    ELSE array_append(current_members, user_email)
  END,
  updated_at = timezone('utc'
::text, now
())
  WHERE id = invitation_record.trip_id;

-- Update invitation status
UPDATE public.trip_invitations 
  SET status = 'accepted', updated_at = timezone('utc'
::text, now
())
  WHERE id = invitation_id;

  RAISE NOTICE 'Successfully accepted invitation % for user %', invitation_id, user_email;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_trip_invitation
(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_trip_invitation
(UUID) TO anon;
