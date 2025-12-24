-- Create games table for game discovery
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games are publicly viewable
CREATE POLICY "Games are publicly viewable"
  ON public.games FOR SELECT
  USING (true);

-- Add game_id to streams table
ALTER TABLE public.streams ADD COLUMN game_id UUID REFERENCES public.games(id);

-- Add tags array to streams
ALTER TABLE public.streams ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for efficient filtering
CREATE INDEX idx_streams_game_id ON public.streams(game_id);
CREATE INDEX idx_streams_tags ON public.streams USING GIN(tags);
CREATE INDEX idx_games_category ON public.games(category);
CREATE INDEX idx_games_slug ON public.games(slug);

-- Insert some initial games for Base ecosystem
INSERT INTO public.games (name, slug, category, description, thumbnail_url) VALUES
  ('Axie Infinity', 'axie-infinity', 'P2E', 'Turn-based strategy game with collectible creatures', NULL),
  ('Gods Unchained', 'gods-unchained', 'Strategy', 'Free-to-play tactical card game', NULL),
  ('The Sandbox', 'the-sandbox', 'Sandbox', 'Voxel-based metaverse gaming platform', NULL),
  ('Illuvium', 'illuvium', 'RPG', 'Open-world exploration and auto-battler game', NULL),
  ('Splinterlands', 'splinterlands', 'Strategy', 'Play-to-earn digital trading card game', NULL),
  ('Pixels', 'pixels', 'Casual', 'Social farming game on Base', NULL),
  ('Parallel', 'parallel', 'Strategy', 'Sci-fi trading card game', NULL),
  ('Big Time', 'big-time', 'RPG', 'Multiplayer action RPG with NFT items', NULL),
  ('Star Atlas', 'star-atlas', 'Strategy', 'Space exploration strategy MMO', NULL),
  ('Guild of Guardians', 'guild-of-guardians', 'RPG', 'Mobile squad-based dungeon crawler', NULL),
  ('Just Chatting', 'just-chatting', 'IRL', 'Hang out and chat with your community', NULL),
  ('Crypto Talk', 'crypto-talk', 'IRL', 'Discuss crypto, DeFi, and Web3', NULL),
  ('Art & Creative', 'art-creative', 'Creative', 'Digital art, music, and creative content', NULL),
  ('Other Games', 'other-games', 'Other', 'Other blockchain and traditional games', NULL);