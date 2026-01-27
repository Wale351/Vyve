-- Fix inconsistent stream data: streams with ended_at should have is_live = false
UPDATE public.streams 
SET is_live = false 
WHERE ended_at IS NOT NULL AND is_live = true;