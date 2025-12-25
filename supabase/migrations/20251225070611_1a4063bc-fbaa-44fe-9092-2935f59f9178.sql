-- First clear orphaned data from related tables
DELETE FROM public.chat_messages WHERE sender_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.streams WHERE streamer_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.tips WHERE sender_id NOT IN (SELECT id FROM public.profiles) OR receiver_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.stream_muted_users WHERE muted_by NOT IN (SELECT id FROM public.profiles) OR muted_user_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.streamer_blocked_users WHERE streamer_id NOT IN (SELECT id FROM public.profiles) OR blocked_user_id NOT IN (SELECT id FROM public.profiles);

-- Fix security definer view by recreating as regular view
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  username,
  bio,
  avatar_url,
  created_at
FROM public.profiles;

-- Recreate foreign key relationships

-- For chat_messages -> profiles
ALTER TABLE public.chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;

ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For streams -> profiles  
ALTER TABLE public.streams
DROP CONSTRAINT IF EXISTS streams_streamer_id_fkey;

ALTER TABLE public.streams
ADD CONSTRAINT streams_streamer_id_fkey
FOREIGN KEY (streamer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For tips -> profiles (sender)
ALTER TABLE public.tips
DROP CONSTRAINT IF EXISTS tips_sender_id_fkey;

ALTER TABLE public.tips
ADD CONSTRAINT tips_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For tips -> profiles (receiver)
ALTER TABLE public.tips
DROP CONSTRAINT IF EXISTS tips_receiver_id_fkey;

ALTER TABLE public.tips
ADD CONSTRAINT tips_receiver_id_fkey
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For stream_muted_users -> profiles
ALTER TABLE public.stream_muted_users
DROP CONSTRAINT IF EXISTS stream_muted_users_muted_by_fkey;

ALTER TABLE public.stream_muted_users
ADD CONSTRAINT stream_muted_users_muted_by_fkey
FOREIGN KEY (muted_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.stream_muted_users
DROP CONSTRAINT IF EXISTS stream_muted_users_muted_user_id_fkey;

ALTER TABLE public.stream_muted_users
ADD CONSTRAINT stream_muted_users_muted_user_id_fkey
FOREIGN KEY (muted_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For streamer_blocked_users -> profiles
ALTER TABLE public.streamer_blocked_users
DROP CONSTRAINT IF EXISTS streamer_blocked_users_streamer_id_fkey;

ALTER TABLE public.streamer_blocked_users
ADD CONSTRAINT streamer_blocked_users_streamer_id_fkey
FOREIGN KEY (streamer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.streamer_blocked_users
DROP CONSTRAINT IF EXISTS streamer_blocked_users_blocked_user_id_fkey;

ALTER TABLE public.streamer_blocked_users
ADD CONSTRAINT streamer_blocked_users_blocked_user_id_fkey
FOREIGN KEY (blocked_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;