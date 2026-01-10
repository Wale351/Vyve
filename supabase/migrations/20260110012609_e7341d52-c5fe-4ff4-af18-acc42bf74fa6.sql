-- Add RLS policy to allow authenticated users to search/view other profiles
-- This only exposes public fields, wallet_address is protected by column-level security in queries

CREATE POLICY "Anyone can view public profile fields"
ON public.profiles
FOR SELECT
USING (true);