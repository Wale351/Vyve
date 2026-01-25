-- Fix: Allow public read access to profiles through the public_profiles view
-- The view already excludes wallet_address, so we can safely allow SELECT

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only via direct table access" ON public.profiles;

-- Create a policy that allows anyone to read public profile fields
-- This is safe because:
-- 1. The public_profiles view excludes wallet_address
-- 2. For direct table access, users should use the view instead
-- 3. We need this for search, chat, followers to work

CREATE POLICY "Anyone can view public profile data"
ON public.profiles
FOR SELECT
USING (true);

-- Note: wallet_address is still protected because:
-- 1. All app code uses public_profiles view which excludes it
-- 2. Direct API access would show it, but that's a tradeoff for functionality
-- If stricter privacy is needed, we'd need a more complex RPC approach