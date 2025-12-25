-- Enable REPLICA IDENTITY FULL for realtime updates on streams table
ALTER TABLE public.streams REPLICA IDENTITY FULL;

-- Add streams table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;