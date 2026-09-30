-- Persistent cache for nutrition-lookup edge function.
-- Falls back to in-memory when SUPABASE_SERVICE_ROLE_KEY is not set.
CREATE TABLE IF NOT EXISTS public.nutrition_cache (
  query text PRIMARY KEY,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_cache ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; no public policies = only service role can read/write.
-- Read access for authenticated users is intentionally omitted; clients must go
-- through the edge function so rate limiting applies.
