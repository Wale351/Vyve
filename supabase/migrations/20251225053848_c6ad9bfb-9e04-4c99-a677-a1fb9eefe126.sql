-- Create a function to securely store stream keys in the private schema
CREATE OR REPLACE FUNCTION public.store_stream_key(p_stream_id uuid, p_stream_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO private.stream_secrets (stream_id, stream_key)
  VALUES (p_stream_id, p_stream_key);
END;
$$;

-- Revoke public access and only allow service role to call this
REVOKE ALL ON FUNCTION public.store_stream_key(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.store_stream_key(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.store_stream_key(uuid, text) FROM authenticated;