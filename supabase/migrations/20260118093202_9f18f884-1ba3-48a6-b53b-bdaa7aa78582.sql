-- Create verification_documents table for streamer verification workflow
CREATE TABLE public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('id_front', 'id_back', 'selfie', 'proof_of_address')),
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_type)
);

-- Enable RLS
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own verification documents"
ON public.verification_documents
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own verification documents"
ON public.verification_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending documents
CREATE POLICY "Users can update own pending documents"
ON public.verification_documents
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all documents
CREATE POLICY "Admins can view all verification documents"
ON public.verification_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any documents
CREATE POLICY "Admins can update verification documents"
ON public.verification_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create verification_requests table to track overall verification status
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_resubmission')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  admin_notes text,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification request
CREATE POLICY "Users can view own verification request"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own verification request
CREATE POLICY "Users can insert own verification request"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending/needs_resubmission request
CREATE POLICY "Users can update own pending verification request"
ON public.verification_requests
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'needs_resubmission'));

-- Admins can view all requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for verification documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create admin function to review verification
CREATE OR REPLACE FUNCTION public.admin_review_verification(
  p_request_id uuid,
  p_status text,
  p_notes text DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check admin role
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get user_id from request
  SELECT user_id INTO v_user_id FROM verification_requests WHERE id = p_request_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Verification request not found';
  END IF;

  -- Update the request
  UPDATE verification_requests
  SET 
    status = p_status,
    admin_notes = COALESCE(p_notes, admin_notes),
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    updated_at = now()
  WHERE id = p_request_id;

  -- If approved, set user as verified creator
  IF p_status = 'approved' THEN
    UPDATE profiles SET verified_creator = true WHERE id = v_user_id;
  END IF;

  -- Log the action
  PERFORM log_admin_action(
    'verification_review',
    'verification_request',
    p_request_id::text,
    jsonb_build_object('status', p_status, 'notes', p_notes)
  );
END;
$$;

-- Function to get pending verification requests for admin
CREATE OR REPLACE FUNCTION public.get_pending_verifications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  avatar_url text,
  status text,
  submitted_at timestamptz,
  document_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin role
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    vr.id,
    vr.user_id,
    p.username,
    p.avatar_url,
    vr.status,
    vr.submitted_at,
    (SELECT COUNT(*) FROM verification_documents vd WHERE vd.user_id = vr.user_id) as document_count
  FROM verification_requests vr
  JOIN profiles p ON p.id = vr.user_id
  ORDER BY vr.submitted_at DESC;
END;
$$;