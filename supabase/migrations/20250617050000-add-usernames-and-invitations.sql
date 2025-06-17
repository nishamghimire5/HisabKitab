-- Migration: Add username support and trip invitations
-- Date: 2025-06-17

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
    WITH TIME ZONE DEFAULT timezone
    ('utc'::text, now
    ()),
  joined_at TIMESTAMP
    WITH TIME ZONE,
  created_at TIMESTAMP
    WITH TIME ZONE DEFAULT timezone
    ('utc'::text, now
    ()) NOT NULL,
  UNIQUE
    (trip_id, user_id)
);

    -- Create trip_invitations table for pending invitations
    CREATE TABLE public.trip_invitations
    (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
        invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        invited_email TEXT,
        invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
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
  updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT timezone
        ('utc'::text, now
        ()) NOT NULL
);

        -- Enable RLS on new tables
        ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;

        -- RLS policies for trip_members
        CREATE POLICY "Users can view trip members for trips they have access to" ON public.trip_members
  FOR
        SELECT USING (
    EXISTS (
      SELECT 1
            FROM public.trips
            WHERE trips.id = trip_members.trip_id
                AND (trips.created_by = auth.uid() OR auth.email()::text = ANY(trips.members))
    )
        OR user_id = auth.uid
        ()
  );

        CREATE POLICY "Trip owners can manage members" ON public.trip_members
  FOR ALL USING
        (
    EXISTS
        (
      SELECT 1
        FROM public.trips
        WHERE trips.id = trip_members.trip_id
            AND trips.created_by = auth.uid()
    )
        );

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
            EXISTS (
            SELECT 1 FROM publ
        c.trips
        
         trips.id = trip_invitations.trip_id
   
            AND trips.created_by = auth.uid()
    )
        );

        CREATE POLICY "Users can update invitations they sent or received" ON public.trip_invitations
  FOR
        UPDATE USING (
    invited_user_id = auth.uid()
        OR invited_by = auth.uid
        ()
  );

        -- Function to handle username generation
        CREATE OR REPLACE FUNCTION public.generate_username
        (email TEXT, full_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
        DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
        BEGIN
            -- Try to use full name first, then email prefix
            IF full_name IS NOT NULL AND LENGTH(TRIM(full_name)) > 0 THEN
    base_username := LOWER
            (REGEXP_REPLACE
            (TRIM
            (full_name), '[^a-zA-Z0-9]', '', 'g'));
        ELSE
    base_username := LOWER
        (SPLIT_PART
        (email, '@', 1));
    base_username := REGEXP_REPLACE
        (base_username, '[^a-zA-Z0-9]', '', 'g');
        END
        IF;
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || 'user';
        END
        IF;
  
  -- Check if username exists and add counter if needed
  final_username := base_username;
        WHILE EXISTS (SELECT 1
        FROM public.profiles
        WHERE username = final_username) LOOP
    final_username := base_username || counter;
    counter := counter + 1;
        END LOOP;

        RETURN final_username;
        END;
$$ LANGUAGE plpgsql;

        -- Update the handle_new_user function to include username
        CREATE OR REPLACE FUNCTION public.handle_new_user
        ()
RETURNS trigger AS $$
        DECLARE
  generated_username TEXT;
        BEGIN
  -- Generate username
  generated_username := public.generate_username
        (
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name'
  );

        INSERT INTO public.profiles
            (id, email, full_name, avatar_url, username)
        VALUES
            (
                NEW.id,
                NEW.email,
                NEW.raw_user_meta_data->>'full_name',
                NEW.raw_user_meta_data->>'avatar_url',
                generated_username
  );
        RETURN NEW;
        END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Function to accept trip invitation
        CREATE OR REPLACE FUNCTION public.accept_trip_invitation
        (invitation_id UUID)
RETURNS BOOLEAN AS $$
        DECLARE
  invitation_record RECORD;
        BEGIN
            -- Get invitation details
            SELECT *
            INTO invitation_record
            FROM public.trip_invitations
            WHERE id = invitation_id
                AND (invited_user_id = auth.uid() OR invited_email = auth.email()
            ::text)
    AND status = 'pending'
    AND expires_at > timezone
            ('utc'::text, now
            ());

        IF NOT FOUND THEN
        RETURN FALSE;
        END
        IF;
  
  -- Add user to trip members
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

        -- Update invitation status
        UPDATE public.trip_invitations 
  SET status = 'accepted', updated_at = timezone('utc'
        ::text, now
        ())
  WHERE id = invitation_id;

        RETURN TRUE;
        END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
