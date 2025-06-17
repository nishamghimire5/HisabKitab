-- Temporary fix to allow invitation sending
-- Run this in Supabase SQL Editor

-- Drop the restrictive policy
DROP POLICY
IF EXISTS "Users can create invitations for trips they own" ON public.trip_invitations;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can create invitations" ON public.trip_invitations
    FOR
INSERT WITH CHECK (auth.role() = 'authenticated')
;

-- Also ensure the table exists and RLS is enabled
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;
