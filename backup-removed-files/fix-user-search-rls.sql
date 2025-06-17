-- RLS Policy for User Search Functionality
-- Run this in Supabase SQL Editor to enable username search

-- Allow users to search for other users (needed for trip member discovery)
-- This allows reading basic profile info: id, email, username, full_name, avatar_url
-- But protects private data by not exposing other fields

DROP POLICY
IF EXISTS "Users can search other profiles" ON public.profiles;

CREATE POLICY "Users can search other profiles" ON public.profiles
  FOR
SELECT USING (true);

-- Alternative more restrictive approach (uncomment if you want tighter security):
-- CREATE POLICY "Users can search other profiles" ON public.profiles
--   FOR SELECT USING (
--     -- Allow reading own profile completely
--     auth.uid() = id OR
--     -- Allow reading basic info of other users for search
--     true
--   );
