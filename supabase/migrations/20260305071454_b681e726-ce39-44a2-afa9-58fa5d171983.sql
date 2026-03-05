
CREATE TABLE public.dosha_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vata_score integer NOT NULL DEFAULT 0,
  pitta_score integer NOT NULL DEFAULT 0,
  kapha_score integer NOT NULL DEFAULT 0,
  primary_dosha text NOT NULL,
  secondary_dosha text,
  answers jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dosha_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own dosha results"
ON public.dosha_results FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own dosha results"
ON public.dosha_results FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dosha results"
ON public.dosha_results FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
