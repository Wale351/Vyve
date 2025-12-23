-- Add wallet address columns to tips table for easy querying
ALTER TABLE public.tips 
ADD COLUMN IF NOT EXISTS from_wallet TEXT,
ADD COLUMN IF NOT EXISTS to_wallet TEXT;

-- Update RLS policy to allow inserting with wallet addresses
DROP POLICY IF EXISTS "Authenticated users can send tips" ON public.tips;

CREATE POLICY "Authenticated users can send tips" 
ON public.tips 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);