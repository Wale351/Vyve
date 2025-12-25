-- Fix RLS policies on blocked/muted users tables to prevent public exposure

-- Drop overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view blocked users" ON public.streamer_blocked_users;
DROP POLICY IF EXISTS "Anyone can view muted users" ON public.stream_muted_users;

-- Create restricted SELECT policies - only involved parties can see
CREATE POLICY "Streamers and blocked users can view blocks"
ON public.streamer_blocked_users FOR SELECT
USING (
  auth.uid() = streamer_id OR auth.uid() = blocked_user_id
);

CREATE POLICY "Streamers and muted users can view mutes"
ON public.stream_muted_users FOR SELECT
USING (
  auth.uid() = muted_by OR auth.uid() = muted_user_id
);