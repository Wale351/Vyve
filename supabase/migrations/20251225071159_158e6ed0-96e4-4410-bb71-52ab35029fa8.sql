-- ================================================
-- COMPLETE PROFILE SYSTEM RESET
-- ================================================

-- Drop dependent views first
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile limited" ON public.profiles;

-- Drop existing triggers
DROP TRIGGER IF EXISTS prevent_username_change_trigger ON public.profiles;
DROP TRIGGER IF EXISTS enforce_avatar_cooldown_trigger ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.prevent_username_change();
DROP FUNCTION IF EXISTS public.enforce_avatar_cooldown();
DROP FUNCTION IF EXISTS public.is_profile_complete(uuid);

-- Create enums for role and verification status
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('viewer', 'streamer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop and recreate profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  profile_image_url text,
  role public.user_role NOT NULL DEFAULT 'viewer',
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  last_profile_image_update timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Username constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  -- Bio length constraint
  CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 500),
  -- Display name length
  CONSTRAINT display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 50)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES FOR PROFILES
-- ================================================

-- Everyone can read all profiles
CREATE POLICY "Anyone can read profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Users can insert only their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ================================================
-- TRIGGERS: Prevent username changes and enforce image cooldown
-- ================================================

CREATE OR REPLACE FUNCTION public.profile_update_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent username changes
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    RAISE EXCEPTION 'Username cannot be changed after profile creation';
  END IF;
  
  -- Prevent wallet_address changes
  IF OLD.wallet_address IS DISTINCT FROM NEW.wallet_address THEN
    RAISE EXCEPTION 'Wallet address cannot be changed';
  END IF;
  
  -- Enforce 30-day profile image cooldown
  IF OLD.profile_image_url IS DISTINCT FROM NEW.profile_image_url THEN
    IF OLD.last_profile_image_update IS NOT NULL AND 
       OLD.last_profile_image_update > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Profile image can only be changed once every 30 days. Next change allowed: %', 
        (OLD.last_profile_image_update + interval '30 days')::date;
    END IF;
    NEW.last_profile_image_update = now();
  END IF;
  
  -- Update timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER profile_update_rules_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profile_update_rules();

-- ================================================
-- CREATE FOLLOWS TABLE
-- ================================================

CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Prevent duplicate follows and self-follows
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Create indexes for performance
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES FOR FOLLOWS
-- ================================================

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
ON public.follows
FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Check if profile is complete
CREATE OR REPLACE FUNCTION public.is_profile_complete(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND username IS NOT NULL
      AND profile_image_url IS NOT NULL
  );
$$;

-- Check if user is a streamer
CREATE OR REPLACE FUNCTION public.is_streamer(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role = 'streamer'
  );
$$;

-- Get follower count
CREATE OR REPLACE FUNCTION public.get_follower_count(p_profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.follows WHERE following_id = p_profile_id;
$$;

-- Get following count
CREATE OR REPLACE FUNCTION public.get_following_count(p_profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.follows WHERE follower_id = p_profile_id;
$$;

-- ================================================
-- RECREATE PUBLIC_PROFILES VIEW (security invoker)
-- ================================================
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  username,
  display_name,
  bio,
  profile_image_url,
  role,
  verification_status,
  created_at
FROM public.profiles;

-- ================================================
-- RECREATE FOREIGN KEY RELATIONSHIPS
-- ================================================

-- Clear orphaned data
DELETE FROM public.chat_messages WHERE sender_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.streams WHERE streamer_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.tips WHERE sender_id NOT IN (SELECT id FROM auth.users) OR receiver_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.stream_muted_users WHERE muted_by NOT IN (SELECT id FROM auth.users) OR muted_user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.streamer_blocked_users WHERE streamer_id NOT IN (SELECT id FROM auth.users) OR blocked_user_id NOT IN (SELECT id FROM auth.users);

-- Recreate constraints (will fail gracefully if profile doesn't exist yet)
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE public.streams DROP CONSTRAINT IF EXISTS streams_streamer_id_fkey;
ALTER TABLE public.tips DROP CONSTRAINT IF EXISTS tips_sender_id_fkey;
ALTER TABLE public.tips DROP CONSTRAINT IF EXISTS tips_receiver_id_fkey;
ALTER TABLE public.stream_muted_users DROP CONSTRAINT IF EXISTS stream_muted_users_muted_by_fkey;
ALTER TABLE public.stream_muted_users DROP CONSTRAINT IF EXISTS stream_muted_users_muted_user_id_fkey;
ALTER TABLE public.streamer_blocked_users DROP CONSTRAINT IF EXISTS streamer_blocked_users_streamer_id_fkey;
ALTER TABLE public.streamer_blocked_users DROP CONSTRAINT IF EXISTS streamer_blocked_users_blocked_user_id_fkey;