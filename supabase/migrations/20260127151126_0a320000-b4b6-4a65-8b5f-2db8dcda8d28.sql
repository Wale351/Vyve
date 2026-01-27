-- Add column to track if user has a resolved ENS/Base name
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_base_name boolean DEFAULT false;

-- Add column to store the original ENS name (for display purposes)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS base_name text;

-- Comment explaining the privacy model
COMMENT ON COLUMN public.profiles.has_base_name IS 'Indicates if the user identity was resolved from ENS/Base. Used for UI badges.';
COMMENT ON COLUMN public.profiles.base_name IS 'The original ENS/Base name if resolved. Stored for reference but not exposed publicly.';

-- Update the public_profiles view to include has_base_name for badge display
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  bio,
  avatar_url,
  verified_creator,
  created_at,
  has_base_name
FROM public.profiles;

-- Grant access
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;