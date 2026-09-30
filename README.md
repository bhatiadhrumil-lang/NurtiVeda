# NutriVeda

NutriVeda is an **AI-powered nutrition and Ayurveda web app**. Search any food for full macro + micronutrient details, upload a meal photo for AI analysis, log meals, follow personalized meal plans, and discover your Ayurvedic dosha — all in a calm, modern UI with dark-mode support.

Local app URL: [http://localhost:8080](http://localhost:8080) (Vite dev server).

> This is a **dynamic full-stack app**, not a static site: a React + TypeScript SPA backed by Supabase (Postgres, Auth, Edge Functions) and the Google Gemini API.

## Features

| Area | What it does |
|---|---|
| Text food search | AI nutrition card: 8 macros, up to 6 vitamins + 6 minerals with %DV, health benefits, Ayurvedic properties (dosha/rasa/virya/vipaka) |
| Photo meal analysis | Upload/drag-drop a meal photo → identified foods, calories + macros + fiber/sugar, health score (1–10), vitamins/minerals, benefits, suggestions |
| Resilient lookup chain | Edge AI → built-in reference DB (25 foods) → Open Food Facts live → labeled demo fallback; all-zero responses are auto-skipped |
| Meal log | Manual + AI-autofill + edit + back-dating; guest mode in `localStorage` auto-syncs to Supabase on first login |
| Meal plans | Predefined plans personalized with Mifflin-St Jeor using real age + activity level; progress, tips, substitutions, reminders |
| Dosha quiz | 10+ question quiz with Vata/Pitta/Kapha scoring, results saved per user |
| Dashboard | Logged-in home shows today's calories vs target, streak, quick actions |
| Barcode lookup | Packaged foods via Open Food Facts (no key needed) |
| Reminders | Per-meal browser notifications via the Notifications API |
| Auth & profiles | Email/password + password reset + resend-confirmation; metric/imperial units; activity level |

## How it works

```
Browser (React SPA)
  ├─ Text search ─→ Edge `nutrition-lookup` ─→ Gemini (model fallback chain)
  │      │                 ├─ Open Food Facts seeding for verified macros
  │      │                 └─ persistent `nutrition_cache` + in-memory cache
  │      ├─ fallback: built-in reference DB (instant, offline-capable)
  │      └─ fallback: Open Food Facts direct (real packaged-food data)
  ├─ Photo upload ─→ client resize/compress (≤1280px JPEG) ─→ Edge `analyze-food-image` ─→ Gemini vision
  ├─ Meal logs / plans / quiz ─→ Supabase Postgres (RLS per user) + `localStorage` for guests
  └─ Auth ─→ Supabase Auth (email confirmation; guest mode needs no account)
```

Key behaviors:

- **Secrets stay server-side.** The browser only holds the Supabase anon key. `GEMINI_API_KEY` lives in Edge Function secrets — never in `VITE_*` variables.
- **AI failures degrade, not crash.** Retry-with-backoff plus a 3-model fallback chain (`gemini-3.8-flash` → `gemini-2.5-flash` → `gemini-3.5-flash`) absorbs sunset/retired models and capacity spikes; upstream status + error detail are returned for diagnosis.
- **No silent zeros.** Any all-zero macro response is rejected and the next source is tried.
- **Personalized calories.** BMR via Mifflin-St Jeor with real age (from date of birth) × activity multiplier (sedentary→active), then goal adjustment.
- **Health score is 1–10**, normalized server-side and clamped at display.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Lucide icons, Recharts, React Router, TanStack Query
- **Backend:** Supabase — Postgres + RLS, Auth, Edge Functions (Deno + TypeScript)
- **AI/data:** Google Gemini API, Open Food Facts API
- **Quality:** Vitest (60+ tests), ESLint, `tsc --noEmit`, GitHub Actions CI

## Project structure

```text
Aws-NutriVeda/
├── public/                        # Static assets + PWA manifest
├── src/
│   ├── components/                # UI (HeroSection, Navbar, Dashboard, results, meal log/plan views…)
│   │   └── ui/                    # shadcn/ui primitives
│   ├── contexts/AuthContext.tsx   # Supabase session + profile state
│   ├── hooks/                     # useNutritionLookup, useMealLogs, useMealPlans, …
│   ├── lib/                       # foodKnowledge, offNutrition, health utils, image-compression (+ tests)
│   ├── pages/                     # Index, Auth, MealLog, MealPlans, DoshaQuiz, Profile, …
│   ├── App.tsx                    # Lazy routes + error boundary
│   └── main.tsx                   # Entry point
├── supabase/
│   ├── functions/
│   │   ├── _shared/               # normalize, JSON extractor, resilient Gemini caller (+tests)
│   │   ├── nutrition-lookup/      # Cached Gemini food lookup
│   │   └── analyze-food-image/    # Gemini meal-photo analysis
│   ├── migrations/                # Schema + nutrition_cache table
│   └── config.toml                # Supabase project config
├── .github/workflows/ci.yml       # lint → typecheck → test → build
└── package.json
```

## Prerequisites

- Node.js 20+, npm
- A Supabase project + Supabase CLI (`supabase login` once)
- A Gemini API key ([Google AI Studio](https://aistudio.google.com))

## Run the web app

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

Required browser settings in `.env` (public values only):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

> Never add `VITE_GEMINI_API_KEY` — `VITE_*` variables ship to every browser.

## Backend setup (Supabase + Gemini)

```bash
# one time: connect this repo to your project
supabase link --project-ref YOUR_PROJECT_REF

# store the Gemini key server-side (no redeploy needed for secret changes)
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY --project-ref YOUR_PROJECT_REF

# deploy the functions
supabase functions deploy nutrition-lookup --project-ref YOUR_PROJECT_REF
supabase functions deploy analyze-food-image --project-ref YOUR_PROJECT_REF
```

Apply the cache-table migration (Dashboard → SQL Editor, or `supabase db push`):

```sql
CREATE TABLE IF NOT EXISTS public.nutrition_cache (
  query text PRIMARY KEY,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.nutrition_cache ENABLE ROW LEVEL SECURITY;
```

Local function development (create `supabase/functions/.env` with `GEMINI_API_KEY=...`, never commit it):

```bash
supabase start
supabase functions serve nutrition-lookup --env-file supabase/functions/.env
supabase functions serve analyze-food-image --env-file supabase/functions/.env
```

## Quality checks

```bash
npm run lint        # ESLint (0 errors)
npm run typecheck   # tsc --noEmit
npm run test        # Vitest suite
npm run build       # Production build
```

## Troubleshooting

| Symptom | Cause → fix |
|---|---|
| Photo/text fails after project was **paused** | Resume the project in the Dashboard; functions come back with it |
| `429 ... exceeded your current quota` | Gemini free quota exhausted → wait for daily reset, enable billing, or rotate the key (`supabase secrets set …`) |
| `404 ... model ... no longer available` | Retired model name → update the `MODELS` list in `supabase/functions/*` and redeploy |
| `Login failed: Email not confirmed` | Click the verification link (check spam), use **Resend confirmation email**, confirm manually in Dashboard → Authentication → Users, or disable "Confirm email" for local dev |
| Photo works but text returns demo/reference data | Edge lookup failing → app correctly falls back; check function Logs for the upstream status |
| `95/10`-style health score | Fixed server-side (normalized to 1–10); redeploy `analyze-food-image` if running an old copy |

## Performance & cost design

- Photos resized/compressed in-browser before upload (faster + cheaper vision calls).
- Text lookups cached 1 hour (memory + Postgres); photo results never cached.
- Per-caller rate limits on both functions; 2-attempt retry with backoff only for transient 5xx.
- Text search works fully offline of Gemini via built-in + Open Food Facts sources.

## References

- [Supabase Edge Function invocation](https://supabase.com/docs/reference/javascript/functions-invoke)
- [Supabase Edge Functions and secrets](https://supabase.com/docs/guides/functions)
- [Gemini Flash models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Open Food Facts API](https://world.openfoodfacts.org/data)
