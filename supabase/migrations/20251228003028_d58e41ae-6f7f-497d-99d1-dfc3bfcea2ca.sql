-- =====================================================
-- SECURITY FIX - Additional hardening
-- =====================================================

-- 1. FIX PROFILES TABLE - Make wallet_address only visible to owner
-- =====================================================

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view profile details except wallet" ON public.profiles;

-- Keep only the owner-visible policy (already exists)
-- "Users can view own full profile" USING (auth.uid() = id)

-- The public_profiles VIEW is the correct way to access profiles publicly
-- It excludes wallet_address by design

-- 2. FIX PUSH_SUBSCRIPTIONS - Remove overly permissive policy
-- =====================================================

DROP POLICY IF EXISTS "Service can view all subscriptions" ON public.push_subscriptions;

-- Push subscriptions should only be accessed by:
-- 1. Users viewing their own subscriptions (existing policy)
-- 2. Edge functions with service role (no client policy needed)

-- 3. VERIFY FOLLOWS/TIPS ARE CORRECTLY RESTRICTED
-- =====================================================
-- These are already correctly restricted based on the scan feedback
-- Follows: users can only see own relationships (aggregate counts use security definer functions)
-- Tips: only sender/receiver can view (this is correct for privacy)