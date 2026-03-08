
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS weight numeric,
  ADD COLUMN IF NOT EXISTS height numeric,
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;
