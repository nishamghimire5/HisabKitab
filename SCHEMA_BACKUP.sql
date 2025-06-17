-- SettleUp Smart - Complete Database Schema Backup
-- Date: 2025-06-17
-- This file contains all the essential SQL migrations and functions used in the application

-- ====================================
-- MIGRATION 1: Add username support and trip invitations
-- ====================================

-- Add username to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN bio TEXT;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create trip_members table for better member management
CREATE TABLE public.trip_members
(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'declined')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP
    WITH TIME ZONE DEFAULT now
    (),
    joined_at TIMESTAMP
    WITH TIME ZONE,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT now
    (),
    updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT now
    (),
    
    UNIQUE
    (trip_id, user_id)
);

    -- Create trip_invitations table
    CREATE TABLE public.trip_invitations
    (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
        inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        invitee_email TEXT NOT NULL,
        invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
        invited_at TIMESTAMP
        WITH TIME ZONE DEFAULT now
        (),
    responded_at TIMESTAMP
        WITH TIME ZONE,
    expires_at TIMESTAMP
        WITH TIME ZONE DEFAULT
        (now
        () + INTERVAL '30 days'),
    created_at TIMESTAMP
        WITH TIME ZONE DEFAULT now
        (),
    updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT now
        (),
    
    UNIQUE
        (trip_id, invitee_email)
);

        -- ====================================
        -- MIGRATION 2: Add friends system
        -- ====================================

        -- Create user_friends table
        CREATE TABLE
        IF NOT EXISTS public.user_friends
        (
    id UUID DEFAULT gen_random_uuid
        () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users
        (id) ON
        DELETE CASCADE,
    friend_user_id UUID
        NOT NULL REFERENCES auth.users
        (id) ON
        DELETE CASCADE,
    status TEXT
        NOT NULL DEFAULT 'pending' CHECK
        (status IN
        ('pending', 'accepted', 'declined')),
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
    CONSTRAINT user_friends_unique UNIQUE
        (user_id, friend_user_id)
);

        -- ====================================
        -- ESSENTIAL FUNCTIONS
        -- ====================================

        -- Function to accept trip invitations
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
            SELECT ti.*, t.members
            INTO invitation_record
            FROM trip_invitations ti
                JOIN trips t ON ti.trip_id = t.id
            WHERE ti.id = invitation_id
                AND ti.invitee_email = user_email
                AND ti.status = 'pending';

            IF NOT FOUND THEN
        RAISE EXCEPTION 'Invitation not found or already processed';
        END
        IF;

    -- Update invitation status
    UPDATE trip_invitations
    SET status = 'accepted',
        responded_at = now(),
        invitee_id = auth.uid()
    WHERE id = invitation_id;

        -- Add user to trip members array if not already present
        current_members := invitation_record.members;
        IF NOT (user_email = ANY(current_members)) THEN
        current_members := array_append
        (current_members, user_email);

        UPDATE trips
        SET members = current_members
        WHERE id = invitation_record.trip_id;
        END
        IF;

    -- Add to trip_members table
    INSERT INTO trip_members
            (trip_id, user_id, role, status, invited_by, invited_at, joined_at)
        VALUES
            (
                invitation_record.trip_id,
                auth.uid(),
                'member',
                'active',
                invitation_record.inviter_id,
                invitation_record.invited_at,
                now()
    )
        ON CONFLICT
        (trip_id, user_id) DO
        UPDATE SET
        status = 'active',
        joined_at = now();

        RETURN TRUE;
        END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

        -- ====================================
        -- ROW LEVEL SECURITY POLICIES
        -- ====================================

        -- Enable RLS on all tables
        ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

        -- Trip members policies
        CREATE POLICY "Users can view trip members for their trips" ON public.trip_members
    FOR
        SELECT USING (
        trip_id IN (
            SELECT id
            FROM trips
            WHERE auth.email() = ANY(members)
        )
        );

        CREATE POLICY "Trip owners can manage members" ON public.trip_members
    FOR ALL USING
        (
        trip_id IN
        (
            SELECT id
        FROM trips
        WHERE created_by = auth.uid()
        )
        );

        -- Trip invitations policies
        CREATE POLICY "Users can view their own invitations" ON public.trip_invitations
    FOR
        SELECT USING (
        invitee_email = auth.email() OR inviter_id = auth.uid()
    );

        CREATE POLICY "Users can send invitations for their trips" ON public.trip_invitations
    FOR
        INSERT WITH CHECK
            (
            inviter_id
        = auth.uid
        () AND
        trip_id IN
        (
            SELECT id
        FROM trips
        WHERE created_by = auth.uid()
        )
        );

        CREATE POLICY "Users can update their own invitations" ON public.trip_invitations
    FOR
        UPDATE USING (
        invitee_email = auth.email()
        OR inviter_id = auth.uid
        ()
    );

        -- User friends policies
        CREATE POLICY "Users can view their own friendships" ON public.user_friends
    FOR
        SELECT USING (user_id = auth.uid() OR friend_user_id = auth.uid());

        CREATE POLICY "Users can create friend requests" ON public.user_friends
    FOR
        INSERT WITH CHECK
            (user_id = auth.ui
        ()
      
          );

        CREATE POLICY "Users can update their own friend requests" ON public.user_friends
    FOR
        UPDATE USING (user_id = auth.uid()
        OR friend_user_id = auth.uid
        ());

        -- ====================================
        -- INDEXES FOR PERFORMANCE
        -- ====================================

        CREATE INDEX
        IF NOT EXISTS idx_trip_members_trip_id ON public.trip_members
        (trip_id);
        CREATE INDEX
        IF NOT EXISTS idx_trip_members_user_id ON public.trip_members
        (user_id);
        CREATE INDEX
        IF NOT EXISTS idx_trip_invitations_trip_id ON public.trip_invitations
        (trip_id);
        CREATE INDEX
        IF NOT EXISTS idx_trip_invitations_invitee_email ON public.trip_invitations
        (invitee_email);
        CREATE INDEX
        IF NOT EXISTS idx_trip_invitations_inviter_id ON public.trip_invitations
        (inviter_id);
        CREATE INDEX
        IF NOT EXISTS idx_user_friends_user_id ON public.user_friends
        (user_id);
        CREATE INDEX
        IF NOT EXISTS idx_user_friends_friend_user_id ON public.user_friends
        (friend_user_id);
