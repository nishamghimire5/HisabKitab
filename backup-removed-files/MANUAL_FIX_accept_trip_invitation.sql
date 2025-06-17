-- INSTRUCTION: Execute this SQL in Supabase SQL Editor to fix the accept_trip_invitation function
-- This ensures that when someone accepts an invitation, their email is added to the trips.members array

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

    -- Log for debugging
    RAISE NOTICE 'Accepting invitation % for user %', invitation_id, user_email;

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
  
  -- Get current members array from the trip
  SELECT members
INTO current_members
FROM public.trips
WHERE id = invitation_record.trip_id;

RAISE NOTICE 'Current members for trip %: %', invitation_record.trip_id, current_members;

-- Update the trips.members array to include the user's email
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

-- Also add to trip_members table if it exists (ignore errors if table doesn't exist)
BEGIN
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
EXCEPTION
    WHEN undefined_table THEN
      -- Table doesn't exist, ignore
      RAISE NOTICE 'trip_members table does not exist, skipping';
END;

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
