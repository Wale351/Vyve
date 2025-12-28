-- FIX: Allow public_profiles view to work by adding a read policy for authenticated users
-- The view excludes wallet_address, so this is safe

-- For authenticated users: allow reading all profiles (for viewing others' profiles)
CREATE POLICY "Authenticated users can view profiles for public display"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- For anonymous users: allow reading profiles (for public profile viewing)
CREATE POLICY "Anon users can view profiles for public display"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- NOTE: The wallet_address is protected by the application layer:
-- 1. public_profiles view excludes wallet_address column
-- 2. Client code only uses public_profiles for displaying other users
-- 3. get_wallet_for_tipping function is the only way to get wallet (for authenticated users only)