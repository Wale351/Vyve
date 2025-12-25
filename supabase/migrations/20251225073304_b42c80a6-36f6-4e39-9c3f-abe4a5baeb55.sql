-- Drop dependent view first
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Drop all related triggers  
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS profile_update_rules_trigger ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Now drop the columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_status;

-- Add verified_creator column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_creator boolean DEFAULT false;

-- Handle column renames safely
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'profile_image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN profile_image_url TO avatar_url;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_profile_image_update'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_last_updated_at'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN last_profile_image_update TO avatar_last_updated_at;
  END IF;
END $$;

-- Drop display_name if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name;

-- Ensure updated_at column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Drop old types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;

-- Create profile update rules trigger function
CREATE OR REPLACE FUNCTION public.profile_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    RAISE EXCEPTION 'Username cannot be changed after profile creation';
  END IF;
  
  IF OLD.wallet_address IS DISTINCT FROM NEW.wallet_address THEN
    RAISE EXCEPTION 'Wallet address cannot be changed';
  END IF;
  
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    IF OLD.avatar_last_updated_at IS NOT NULL AND 
       OLD.avatar_last_updated_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'Profile image can only be changed once every 30 days. Next change allowed: %', 
        (OLD.avatar_last_updated_at + interval '30 days')::date;
    END IF;
    NEW.avatar_last_updated_at = now();
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profile_update_rules();

-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('viewer', 'streamer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop and recreate user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer functions for roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'streamer' THEN 2 ELSE 3 END
  LIMIT 1
$$;

-- Recreate public_profiles view with role from user_roles
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.bio,
  p.avatar_url,
  p.verified_creator,
  p.created_at,
  COALESCE(public.get_user_role(p.id), 'viewer'::app_role) as role
FROM public.profiles p;

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_profile_complete(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND username IS NOT NULL AND avatar_url IS NOT NULL);
$$;

CREATE OR REPLACE FUNCTION public.is_streamer(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(p_user_id, 'streamer') OR public.has_role(p_user_id, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.grant_streamer_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'streamer')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Assign default viewer role on profile creation
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Lookup profile by wallet
CREATE OR REPLACE FUNCTION public.get_profile_by_wallet(p_wallet_address text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE wallet_address = p_wallet_address LIMIT 1;
$$;

-- Insert default viewer role for existing profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'viewer'::app_role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;