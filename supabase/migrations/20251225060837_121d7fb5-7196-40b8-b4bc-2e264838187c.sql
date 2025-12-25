-- Add Livepeer stream id so we can poll Livepeer status
ALTER TABLE public.streams
ADD COLUMN IF NOT EXISTS livepeer_stream_id text;

-- Chat performance: index for stream chat history ordering
CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_created_at
ON public.chat_messages (stream_id, created_at);

-- Ensure realtime delivers full rows for chat updates
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Enable realtime for chat_messages (safe if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;