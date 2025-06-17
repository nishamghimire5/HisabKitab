# Apply Friends System Migration

Since we're not running Supabase locally, you need to apply this migration manually in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `supabase/migrations/20250617060000-add-friends-system.sql`
5. Paste it into the SQL editor
6. Run the query

Alternatively, you can copy the SQL directly:

```sql
-- Migration: Add friends system
-- Date: 2025-06-17

-- Create simplified user_friends table
CREATE TABLE IF NOT EXISTS public.user_friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure users can't friend themselves and no duplicate friendships
    CONSTRAINT user_friends_no_self_friend CHECK (user_id != friend_user_id),
    UNIQUE(user_id, friend_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON public.user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_user_id ON public.user_friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON public.user_friends(status);

-- Enable RLS
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their friendships" ON public.user_friends;
DROP POLICY IF EXISTS "Users can send friend requests" ON public.user_friends;
DROP POLICY IF EXISTS "Users can respond to friend requests" ON public.user_friends;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.user_friends;

-- RLS Policies
-- Users can view friendships where they are involved
CREATE POLICY "Users can view their friendships" ON public.user_friends
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR auth.uid()::text = friend_user_id::text
    );

-- Users can create friend requests
CREATE POLICY "Users can send friend requests" ON public.user_friends
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text
    );

-- Users can update friend requests they received
CREATE POLICY "Users can respond to friend requests" ON public.user_friends
    FOR UPDATE USING (
        auth.uid()::text = friend_user_id::text
    );

-- Users can delete friendships they are part of
CREATE POLICY "Users can delete their friendships" ON public.user_friends
    FOR DELETE USING (
        auth.uid()::text = user_id::text OR auth.uid()::text = friend_user_id::text
    );

-- Grant permissions
GRANT ALL ON public.user_friends TO authenticated;
GRANT SELECT ON public.user_friends TO anon;

-- Test the table creation
SELECT 'user_friends table created successfully' as result;
```

## Testing the Friends System

After applying the migration:

1. Load the app and sign in with two different users (or use two browsers/incognito tabs)
2. Open the Friends Manager from the user menu
3. Test sending friend requests from User A to User B
4. Check that User B receives the pending friend request
5. Test accepting/declining friend requests
6. Verify that accepted friends appear in both users' friends lists

## Fixed Issues

1. **Property name mismatch**: Fixed `request.profiles` to `request.friend_profile` in pending requests display
2. **Friend ID mapping**: Fixed friend selection and exclusion to use the correct profile IDs
3. **Database schema**: Added proper friends system migration with RLS policies
4. **Error handling**: Enhanced error handling for missing tables and duplicate requests

The main issue was that pending friend requests were using inconsistent property names, which prevented the recipient from seeing incoming requests properly.
