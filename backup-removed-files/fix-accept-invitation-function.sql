-- Fix the accept_trip_invitation function to also update the trips.members array
-- This ensures compatibility with both the new trip_members table and the old members array

CREATE OR REPLACE FUNCTION public.accept_trip_invitation
(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
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
RETURN FALSE;
END
IF;
  
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

-- Also update the trips.members array for backward compatibility
UPDATE public.trips 
  SET members = CASE 
    WHEN members IS NULL THEN ARRAY[user_email]
    WHEN user_email = ANY(members) THEN members
    ELSE array_append(members, user_email)
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

RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
