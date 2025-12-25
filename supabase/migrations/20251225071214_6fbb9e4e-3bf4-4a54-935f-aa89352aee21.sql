-- Add foreign key constraints from related tables to profiles
-- These must be added AFTER profiles are created

ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.streams
ADD CONSTRAINT streams_streamer_id_fkey
FOREIGN KEY (streamer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.tips
ADD CONSTRAINT tips_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.tips
ADD CONSTRAINT tips_receiver_id_fkey
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.stream_muted_users
ADD CONSTRAINT stream_muted_users_muted_by_fkey
FOREIGN KEY (muted_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.stream_muted_users
ADD CONSTRAINT stream_muted_users_muted_user_id_fkey
FOREIGN KEY (muted_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.streamer_blocked_users
ADD CONSTRAINT streamer_blocked_users_streamer_id_fkey
FOREIGN KEY (streamer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.streamer_blocked_users
ADD CONSTRAINT streamer_blocked_users_blocked_user_id_fkey
FOREIGN KEY (blocked_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;