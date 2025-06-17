-- Safe migration: Drop existing policies and recreate them
-- Run this in Supabase SQL Editor to fix the policy conflict

-- Drop existing policies if they exist
DROP POLICY
IF EXISTS "Users can view their own invitations" ON public.trip_invitations;
DROP POLICY
IF EXISTS "Users can create invitations for trips they own" ON public.trip_invitations;
DROP POLICY
IF EXISTS "Users can update their own invitations" ON public.trip_invitations;

-- Recreate RLS policies for trip_invitations
CREATE POLICY "Users can view their own invitations" ON public.trip_invitations
    FOR
SELECT USING (
        invited_user_id = auth.uid() OR
        invited_email = auth.email()::text OR
        invited_by = auth.uid()
    );

CREATE POLICY "Users can create invitations for trips they own" ON public.trip_invitations
    FOR
INSERT WITH CHECK
    (
    EXISTS
(
    SELECT 1 F
ps
    WHERE trips.id = trip_invitations
    AND trips.created_by = auth.uid()
        )
);

CREATE POLICY "Users can update their own invitations" ON public.trip_invitations
    FOR
UPDATE USING (
        invited_user_id = auth.uid()
OR
        invited_email = auth.email
()::text
    ) WITH CHECK
(
        invited_user_id = auth.uid
() OR
        invited_email = auth.email
()::text
    );

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_trip_invitation
(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
    current_members TEXT[];
BEGIN
    -- Get invitation details
    SELECT *
    INTO invitation_record
    FROM public.trip_invitations
    WHERE id = invitation_id
        AND (invited_user_id = auth.uid() OR invited_email = auth.email()
    ::text)
    AND status = 'pending'
    AND expires_at > NOW
    ();

    IF NOT FOUND THEN
    RETURN FALSE;
END
IF;

    -- Get current trip members
    SELECT members
INTO current_members
FROM public.trips
WHERE id = invitation_record.trip_id;

-- Add user email to trip members if not already added
IF NOT (auth.email()::text = ANY
(current_members)) THEN
UPDATE public.trips
        SET members = array_append(current_members, auth.email()
::text)
        WHERE id = invitation_record.trip_id;
END
IF;

    -- Mark invitation as accepted
    UPDATE public.trip_invitations
    SET status = 'accepted'
    WHERE id = invitation_id;

RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline invitation
CREATE OR REPLACE FUNCTION decline_trip_invitation
(invitation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.trip_invitations
    SET status = 'declined'
    WHERE id = invitation_id
        AND (invited_user_id = auth.uid() OR invited_email = auth.email()
    ::text)
    AND status = 'pending';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
