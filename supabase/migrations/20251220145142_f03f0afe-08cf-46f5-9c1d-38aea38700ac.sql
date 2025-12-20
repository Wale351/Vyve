-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_streamer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create streams table
CREATE TABLE public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  game_category TEXT,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  playback_url TEXT,
  stream_key TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tips table
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_eth NUMERIC NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Streams policies
CREATE POLICY "Anyone can view streams"
  ON public.streams FOR SELECT
  USING (true);

CREATE POLICY "Streamers can insert own streams"
  ON public.streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can update own streams"
  ON public.streams FOR UPDATE
  TO authenticated
  USING (auth.uid() = streamer_id);

CREATE POLICY "Streamers can delete own streams"
  ON public.streams FOR DELETE
  TO authenticated
  USING (auth.uid() = streamer_id);

-- Chat messages policies
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Tips policies
CREATE POLICY "Users can view tips they sent or received"
  ON public.tips FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send tips"
  ON public.tips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX idx_streams_streamer_id ON public.streams(streamer_id);
CREATE INDEX idx_streams_is_live ON public.streams(is_live);
CREATE INDEX idx_streams_game_category ON public.streams(game_category);
CREATE INDEX idx_chat_messages_stream_id ON public.chat_messages(stream_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_tips_stream_id ON public.tips(stream_id);
CREATE INDEX idx_tips_receiver_id ON public.tips(receiver_id);
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, wallet_address, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'wallet_address', ''),
    COALESCE(new.raw_user_meta_data ->> 'username', '')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();