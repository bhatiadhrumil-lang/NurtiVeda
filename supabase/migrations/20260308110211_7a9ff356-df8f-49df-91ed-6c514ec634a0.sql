-- Meal plans table (predefined plans)
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  diet_type TEXT NOT NULL, -- keto, mediterranean, vegan, paleo, balanced
  goal TEXT NOT NULL, -- weight_loss, muscle_gain, maintenance, health
  daily_calories INTEGER NOT NULL,
  protein_ratio NUMERIC NOT NULL DEFAULT 0.3,
  carbs_ratio NUMERIC NOT NULL DEFAULT 0.4,
  fat_ratio NUMERIC NOT NULL DEFAULT 0.3,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  tips TEXT[],
  substitutions JSONB DEFAULT '[]'::jsonb,
  foods JSONB DEFAULT '[]'::jsonb, -- allowed foods list
  sample_meals JSONB DEFAULT '[]'::jsonb, -- sample meal ideas
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User selected meal plans
CREATE TABLE public.user_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  daily_calorie_target INTEGER NOT NULL,
  protein_grams INTEGER NOT NULL,
  carbs_grams INTEGER NOT NULL,
  fat_grams INTEGER NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  progress_notes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meal reminders
CREATE TABLE public.meal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  reminder_time TIME NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_reminders ENABLE ROW LEVEL SECURITY;

-- Meal plans are public read
CREATE POLICY "Anyone can read meal plans" ON public.meal_plans
  FOR SELECT USING (true);

-- User meal plans policies
CREATE POLICY "Users can read own meal plans" ON public.user_meal_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON public.user_meal_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON public.user_meal_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON public.user_meal_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Meal reminders policies
CREATE POLICY "Users can read own reminders" ON public.meal_reminders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON public.meal_reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.meal_reminders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.meal_reminders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);