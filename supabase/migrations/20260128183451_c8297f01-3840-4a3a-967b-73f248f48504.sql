-- 1. Create post likes table for persistent per-user likes
CREATE TABLE public.community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes (for count display)
CREATE POLICY "Anyone can view likes"
  ON public.community_post_likes FOR SELECT
  USING (true);

-- Users can like posts (must be logged in)
CREATE POLICY "Users can like posts"
  ON public.community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can unlike"
  ON public.community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Fix community_polls RLS: Allow owner to create polls via posts
-- Drop existing insert policy and recreate to allow community owner
DROP POLICY IF EXISTS "Post authors can create polls" ON public.community_polls;

CREATE POLICY "Community owner can create polls"
  ON public.community_polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN communities c ON c.id = cp.community_id
      WHERE cp.id = community_polls.post_id
        AND c.owner_id = auth.uid()
    )
  );

-- Fix SELECT policy for polls - allow all members OR owner to view
DROP POLICY IF EXISTS "Members can view polls" ON public.community_polls;

CREATE POLICY "Members and owner can view polls"
  ON public.community_polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts cp
      WHERE cp.id = community_polls.post_id
        AND (
          EXISTS (SELECT 1 FROM community_memberships cm WHERE cm.community_id = cp.community_id AND cm.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM communities c WHERE c.id = cp.community_id AND c.owner_id = auth.uid())
        )
    )
  );

-- 3. Fix community_giveaways RLS: Allow community owner to create giveaways
DROP POLICY IF EXISTS "Post authors can create giveaways" ON public.community_giveaways;

CREATE POLICY "Community owner can create giveaways"
  ON public.community_giveaways FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN communities c ON c.id = cp.community_id
      WHERE cp.id = community_giveaways.post_id
        AND c.owner_id = auth.uid()
    )
  );

-- 4. Fix community_posts RLS: Allow owner to create any post type
DROP POLICY IF EXISTS "Owners and mods can create posts" ON public.community_posts;

CREATE POLICY "Owner can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id
        AND c.owner_id = auth.uid()
    )
  );

-- 5. Fix community_comments RLS: Ensure members can view comments
DROP POLICY IF EXISTS "Members can view comments" ON public.community_comments;

CREATE POLICY "Anyone can view comments"
  ON public.community_comments FOR SELECT
  USING (true);

-- 6. Add update policy for community_posts (for reactions update)
DROP POLICY IF EXISTS "Authors can update their posts" ON public.community_posts;

CREATE POLICY "Authors and owner can update posts"
  ON public.community_posts FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id AND c.owner_id = auth.uid()
    )
  );