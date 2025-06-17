-- Debug script for invitation system
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check if trip_invitations table exists and has data
SELECT 'trip_invitations table check' as test;
SELECT COUNT(*) as total_invitations
FROM trip_invitations;

-- 2. Check recent invitations
SELECT 'Recent invitations' as test;
SELECT
    id,
    trip_id,
    invited_by,
    invited_user_id,
    invited_email,
    status,
    created_at,
    expires_at
FROM trip_invitations
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check profiles table for email data
SELECT 'Profile emails check' as test;
SELECT id, email, full_name, username
FROM profiles 
LIMIT
5;

-- 4. Check if there are any pending invitations
SELECT 'Pending invitations' as test;
SELECT
    ti.*,
    p.email as inviter_email,
    t.name as trip_name
FROM trip_invitations ti
    LEFT JOIN profiles p ON p.id = ti.invited_by
    LEFT JOIN trips t ON t.id = ti.trip_id
WHERE ti.status = 'pending'
    AND ti.expires_at > NOW();

-- 5. Check RLS policies on trip_invitations
SELECT 'RLS policies check' as test;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'trip_invitations';

-- 6. Test current user's access (replace with actual user email)
-- Uncomment and replace 'user@example.com' with actual user email to test
-- SELECT 'Test user invitation access' as test;
-- SELECT * FROM trip_invitations 
-- WHERE invited_email = 'user@example.com' 
-- OR invited_user_id = auth.uid();
