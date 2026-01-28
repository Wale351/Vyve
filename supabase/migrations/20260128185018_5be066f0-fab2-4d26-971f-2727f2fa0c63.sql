-- Fix community_comments: Allow any authenticated user to comment (not just members)
DROP POLICY IF EXISTS "Members can comment" ON public.community_comments;

CREATE POLICY "Authenticated users can comment"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow post authors and community owners to delete any comment on their posts
DROP POLICY IF EXISTS "Authors can delete comments" ON public.community_comments;

CREATE POLICY "Comment authors and post owners can delete comments"
  ON public.community_comments FOR DELETE
  USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN communities c ON c.id = cp.community_id
      WHERE cp.id = community_comments.post_id 
      AND (cp.author_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- Ensure posts are visible to anyone (not just members) for public communities
DROP POLICY IF EXISTS "Members can view posts" ON public.community_posts;

CREATE POLICY "Anyone can view posts in active communities"
  ON public.community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id
      AND c.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM community_memberships cm
      WHERE cm.community_id = community_posts.community_id
      AND cm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id
      AND c.owner_id = auth.uid()
    )
  );