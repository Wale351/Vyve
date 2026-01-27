-- Communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  banner_url TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rules TEXT,
  is_nft_gated BOOLEAN DEFAULT false,
  nft_contract_address TEXT,
  is_ens_gated BOOLEAN DEFAULT false,
  required_ens_suffix TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community memberships
CREATE TABLE public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Community posts (feed)
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'post' CHECK (post_type IN ('post', 'announcement', 'stream_alert', 'poll', 'giveaway')),
  is_pinned BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community polls
CREATE TABLE public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Poll votes
CREATE TABLE public.community_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Community giveaways
CREATE TABLE public.community_giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prize_type TEXT CHECK (prize_type IN ('eth', 'nft', 'other')),
  prize_amount NUMERIC,
  winner_id UUID REFERENCES public.profiles(id),
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Giveaway entries
CREATE TABLE public.community_giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.community_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

-- Post comments
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view active communities" ON public.communities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Streamers can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND is_streamer(auth.uid()));

CREATE POLICY "Owners can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their communities" ON public.communities
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for memberships
CREATE POLICY "Anyone can view memberships" ON public.community_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_memberships
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage memberships" ON public.community_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND owner_id = auth.uid())
  );

-- RLS Policies for posts
CREATE POLICY "Members can view posts" ON public.community_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.community_memberships WHERE community_id = community_posts.community_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners and mods can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.community_memberships WHERE community_id = community_posts.community_id AND user_id = auth.uid() AND role IN ('moderator', 'admin'))
  );

CREATE POLICY "Authors can update their posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and owners can delete posts" ON public.community_posts
  FOR DELETE USING (
    auth.uid() = author_id 
    OR EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND owner_id = auth.uid())
  );

-- RLS Policies for polls
CREATE POLICY "Members can view polls" ON public.community_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.community_memberships cm ON cm.community_id = cp.community_id
      WHERE cp.id = post_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can create polls" ON public.community_polls
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.community_posts WHERE id = post_id AND author_id = auth.uid())
  );

-- RLS Policies for poll votes
CREATE POLICY "Members can vote" ON public.community_poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view votes" ON public.community_poll_votes
  FOR SELECT USING (true);

-- RLS Policies for giveaways
CREATE POLICY "Members can view giveaways" ON public.community_giveaways
  FOR SELECT USING (true);

CREATE POLICY "Post authors can create giveaways" ON public.community_giveaways
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.community_posts WHERE id = post_id AND author_id = auth.uid())
  );

-- RLS Policies for giveaway entries
CREATE POLICY "Users can enter giveaways" ON public.community_giveaway_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view entries" ON public.community_giveaway_entries
  FOR SELECT USING (true);

-- RLS Policies for comments
CREATE POLICY "Members can view comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Members can comment" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to auto-update member count
CREATE TRIGGER update_member_count_trigger
AFTER INSERT OR DELETE ON public.community_memberships
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

-- Indexes for performance
CREATE INDEX idx_communities_owner ON public.communities(owner_id);
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_memberships_community ON public.community_memberships(community_id);
CREATE INDEX idx_memberships_user ON public.community_memberships(user_id);
CREATE INDEX idx_posts_community ON public.community_posts(community_id);
CREATE INDEX idx_posts_pinned ON public.community_posts(community_id, is_pinned DESC, created_at DESC);