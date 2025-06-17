-- Enable the invitation system for secure trip member management
-- Run this in Supabase SQL Editor

-- Create trip_invitations table (if not exists)
CREATE TABLE
IF NOT EXISTS public.trip_invitations
(
    id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips
(id) ON
DELETE CASCADE NOT NULL,
    invited_user_id UUID
REFERENCES auth.users
(id) ON
DELETE CASCADE,
    invited_email TEXT,
    invited_by UUID
REFERENCES auth.users
(id) ON
DELETE CASCADE NOT NULL,
    status TEXT
NOT NULL DEFAULT 'pending' CHECK
(status IN
('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    expires_at TIMESTAMP
WITH TIME ZONE DEFAULT
(timezone
('utc'::text, now
()) + interval '7 days'),
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT timezone
('utc'::text, now
()) NOT NULL,
    UNIQUE
(trip_id, invited_user_id),
    UNIQUE
(trip_id, invited_email)
);

-- Enable RLS
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_invitations
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
