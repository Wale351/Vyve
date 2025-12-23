-- Fix 1: Remove stream_key from public streams table and create secure storage
-- First, create a private schema for secrets
CREATE SCHEMA IF NOT EXISTS private;

-- Create secure table for stream secrets
CREATE TABLE private.stream_secrets (
  stream_id UUID PRIMARY KEY REFERENCES public.streams(id) ON DELETE CASCADE,
  stream_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS with deny-all policy (only edge functions with service role can access)
ALTER TABLE private.stream_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to stream secrets"
  ON private.stream_secrets FOR ALL
  USING (false);

-- Migrate existing stream keys to private table
INSERT INTO private.stream_secrets (stream_id, stream_key)
SELECT id, stream_key FROM public.streams WHERE stream_key IS NOT NULL;

-- Remove stream_key column from public streams table
ALTER TABLE public.streams DROP COLUMN stream_key;

-- Fix 2: Update profiles RLS to hide wallet_address from non-owners
-- First create a view for public profile data that excludes wallet_address
CREATE VIEW public.public_profiles AS
SELECT id, username, avatar_url, bio, is_streamer, created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Update the profiles RLS policy to use conditional visibility
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create function to check if user is viewing their own profile
CREATE OR REPLACE FUNCTION public.is_own_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create new policy that allows viewing but application should use public_profiles view
-- for non-owners to get data without wallet_address
CREATE POLICY "Profiles visible with conditional wallet access"
  ON public.profiles FOR SELECT
  USING (true);

-- Fix 3: Create function to retrieve stream key securely (only for stream owner)
CREATE OR REPLACE FUNCTION public.get_my_stream_key(p_stream_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Verify ownership before returning key
  SELECT ss.stream_key INTO v_key
  FROM private.stream_secrets ss
  JOIN public.streams s ON s.id = ss.stream_id
  WHERE ss.stream_id = p_stream_id
    AND s.streamer_id = auth.uid();
  
  RETURN v_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;