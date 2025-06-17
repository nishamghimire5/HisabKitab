-- Create user_friends table for the friends system
-- Execute this in Supabase SQL Editor

CREATE TABLE public.user_friends
(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT timezone
    ('utc'::text, now
    ()) NOT NULL,
    updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT timezone
    ('utc'::text, now
    ()) NOT NULL,
    
    -- Ensure users can't friend themselves and no duplicate friendships
    CONSTRAINT user_friends_no_self_friend CHECK
    (user_id != friend_user_id),
    UNIQUE
    (user_id, friend_user_id)
);

    -- Create indexes for performance
    CREATE INDEX idx_user_friends_user_id ON public.user_friends(user_id);
    CREATE INDEX idx_user_friends_friend_user_id ON public.user_friends(friend_user_id);
    CREATE INDEX idx_user_friends_status ON public.user_friends(status);

    -- Enable RLS
    ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

    -- RLS Policies
    -- Users can view friendships where they are involved
    CREATE POLICY "Users can view their friendships" ON public.user_friends
    FOR
    SELECT USING (
        auth.uid() = user_id OR auth.uid() = friend_user_id
    );

    -- Users can create friend requests
    CREATE POLICY "Users can send friend requests" ON public.user_friends
    FOR
    INSERT WITH CHECK (
        auth.uid() =
    user_id
    );

    -- Users can update friend requests they received
    CREATE POLICY "Users can respond to friend requests" ON public.user_friends
    FOR
    UPDATE USING (
        auth.uid()
    = friend_user_id
    );

    -- Users can delete friendships they are part of
    CREATE POLICY "Users can delete their friendships" ON public.user_friends
    FOR
    DELETE USING (
        auth.uid
    () = user_id OR auth.uid
    () = friend_user_id
    );

    -- Grant permissions
    GRANT ALL ON public.user_friends TO authenticated;
    GRANT SELECT ON public.user_friends TO anon;
