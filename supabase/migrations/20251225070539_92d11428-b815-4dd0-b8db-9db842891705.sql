-- ================================================
-- RESET AND REBUILD PROFILES TABLE
-- ================================================

-- Drop dependent views first
DROP VIEW IF EXISTS public.public_profiles;

-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Profiles visible with conditional wallet access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop existing trigger on auth.users that references the old function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles table (cascade to remove dependencies)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ================================================
-- CREATE NEW PROFILES TABLE
-- ================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  avatar_last_updated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Enforce username constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES
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

-- Users can update only their own profile (bio, avatar_url, avatar_last_updated_at)
-- Username is immutable after creation
CREATE POLICY "Users can update own profile limited"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ================================================
-- FUNCTION: Prevent username changes after creation
-- ================================================
CREATE OR REPLACE FUNCTION public.prevent_username_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If username is being changed, reject
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    RAISE EXCEPTION 'Username cannot be changed after profile creation';
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_username_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_username_change();

-- ================================================
-- FUNCTION: Enforce 30-day avatar update cooldown
-- ================================================
CREATE OR REPLACE FUNCTION public.enforce_avatar_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If avatar_url is being changed
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    -- Check if last update was within 30 days (skip if never updated)
    IF OLD.avatar_last_updated_at IS NOT NULL AND 
       OLD.avatar_last_updated_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Avatar can only be changed once every 30 days. Next change allowed: %', 
        (OLD.avatar_last_updated_at + interval '30 days')::date;
    END IF;
    
    -- Set the new update timestamp
    NEW.avatar_last_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_avatar_cooldown_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_avatar_cooldown();

-- ================================================
-- RECREATE PUBLIC_PROFILES VIEW (without wallet_address)
-- ================================================
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  bio,
  avatar_url,
  created_at
FROM public.profiles;

-- ================================================
-- FUNCTION: Check if profile is complete
-- ================================================
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
      AND avatar_url IS NOT NULL
  );
$$;

-- ================================================
-- UPDATE DEPENDENT TABLES TO USE CASCADE
-- ================================================
-- Update foreign key references if needed (streams, tips, chat_messages already reference profiles.id)