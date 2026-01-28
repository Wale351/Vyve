-- Only allow verified creators to create communities
DROP POLICY IF EXISTS "Streamers can create communities" ON public.communities;

CREATE POLICY "Verified streamers can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id 
    AND is_streamer(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND verified_creator = true
    )
  );