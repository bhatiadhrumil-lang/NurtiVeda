import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { normalizeNutrition } from "../_shared/normalize.ts";
import { extractJsonObject } from "../_shared/json.ts";
import { generateWithModelFallback } from "../_shared/gemini.ts";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const RESPONSE_TIMEOUT_MS = 20_000;
// Model preference order: newest proven first, then the stable workhorse,
// then another stable alternative. Sunset/capacity errors fall through.
const MODELS = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-3.5-flash"];
const cache = new Map<string, { expiresAt: number; data: unknown }>();
// Simple per-bucket rate limit to protect the Gemini key from abuse.
// Authenticated callers get a larger bucket; guests share an IP bucket.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_ANON = 30;
const RATE_LIMIT_AUTH = 120;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function rateKey(req: Request): { key: string; authed: boolean } {
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ") && auth.length > 20) {
    // Use a hash of the token as bucket key (we don't verify here; Supabase
    // gateway already validated the anon/service key, and per-token buckets
    // still stop a single client from exhausting quota).
    let h = 0;
    for (let i = 0; i < auth.length; i++) h = (h * 31 + auth.charCodeAt(i)) >>> 0;
    return { key: `tok:${h}`, authed: auth.length > 100 };
  }
  return { key: `ip:${req.headers.get("x-forwarded-for") ?? "unknown"}`, authed: false };
}

function checkRateLimit(req: Request): Response | null {
  const { key, authed } = rateKey(req);
  const limit = authed ? RATE_LIMIT_AUTH : RATE_LIMIT_ANON;
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }
  bucket.count++;
  if (bucket.count > limit) {
    return json({ error: "Rate limit exceeded. Please try again later." }, 429);
  }
  return null;
}

async function getPersistentCache(query: string): Promise<unknown | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/nutrition_cache?query=eq.${encodeURIComponent(query)}&select=data,expires_at`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = rows?.[0];
    if (row && new Date(row.expires_at).getTime() > Date.now()) return row.data;
    return null;
  } catch {
    return null;
  }
}

async function setPersistentCache(query: string, data: unknown): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/nutrition_cache`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        query,
        data,
        expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
      }),
    });
  } catch {
    /* best-effort */
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const limited = checkRateLimit(req);
  if (limited) return limited;

  try {
    const { foodQuery } = await req.json();
    const normalizedQuery = typeof foodQuery === "string" ? foodQuery.trim().replace(/\s+/g, " ").toLowerCase() : "";
    if (!normalizedQuery || normalizedQuery.length > 100) {
      return json({ error: "Enter a food name of up to 100 characters." }, 400);
    }

    const cached = cache.get(normalizedQuery);
    if (cached && cached.expiresAt > Date.now()) return json({ success: true, data: cached.data, cached: true });
    cache.delete(normalizedQuery);
    const persistent = await getPersistentCache(normalizedQuery);
    if (persistent) {
      if (cache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) cache.delete(oldestKey);
      }
      cache.set(normalizedQuery, { data: persistent, expiresAt: Date.now() + CACHE_TTL_MS });
      return json({ success: true, data: persistent, cached: true });
    }

    // 1. Seed the request with Open Food Facts macros when available. This gives
    // Gemini a head start and accurate product-backed values, but the full lookup
    // below is always run so users get complete detail (vitamins, minerals,
    // benefits, Ayurvedic properties) for every search.
    let openFoodMacros: Record<string, { value: number; unit: string }> | null = null;
    let openFoodName: string | null = null;
    try {
      const offUrl = `https://world.openfoodfacts.org/api/v2/search?search_simple=1&search_terms=${encodeURIComponent(normalizedQuery)}&page_size=5&fields=product_name,product_name_en,nutriments`;
      const offResponse = await fetchWithTimeout(offUrl, {}, RESPONSE_TIMEOUT_MS);
      if (offResponse.ok) {
        const offJson = await offResponse.json();
        const products = (offJson?.products ?? []) as Array<Record<string, unknown>>;
        for (const prod of products) {
          const nut = (prod.nutriments ?? prod.nutriment ?? {}) as Record<string, unknown>;
          if (nut && (nut['energy-kcal_100g'] || nut['calories_100g'])) {
            const getNum = (keys: string[]): number => {
              for (const k of keys) {
                const v = nut[k];
                if (typeof v === 'number') return v;
                if (typeof v === 'string') {
                  const num = parseFloat(v);
                  if (!isNaN(num)) return num;
                }
              }
              return 0;
            };
            openFoodMacros = {
              calories: { value: getNum(["energy-kcal_100g", "energy-kcal", "calories_100g", "calories"]), unit: "kcal" },
              protein: { value: getNum(["proteins_100g", "proteins", "protein_100g", "protein"]), unit: "g" },
              carbohydrates: { value: getNum(["carbohydrates_100g", "carbohydrates", "carbs_100g", "carbs"]), unit: "g" },
              fiber: { value: getNum(["fiber_100g", "fiber", "dietary_fiber_100g", "dietary_fiber"]), unit: "g" },
              sugar: { value: getNum(["sugars_100g", "sugars", "sugar_100g", "sugar"]), unit: "g" },
              fat: { value: getNum(["fat_100g", "fat", "total_fat_100g", "total_fat"]), unit: "g" },
              saturatedFat: { value: getNum(["saturated-fat_100g", "saturated-fat", "saturated_fat_100g"]), unit: "g" },
              unsaturatedFat: { value: Math.max(0, getNum(["fat_100g", "fat"]) - getNum(["saturated-fat_100g", "saturated-fat"])), unit: "g" },
            };
            openFoodName = (prod.product_name_en ?? prod.product_name) as string | null;
            break;
          }
        }
      }
    } catch {
      // Ignore OFF errors; Gemini full lookup below still runs.
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return json({ error: "Nutrition analysis is not configured yet. Please contact the site administrator." }, 503);
    }

    const seedHints = openFoodMacros
      ? ` Macro seed from Open Food Facts (${openFoodName ?? normalizedQuery}): ${JSON.stringify(openFoodMacros)}. Prefer these verified macro values where sensible, but still provide the full object shape including all micronutrients, health benefits, and Ayurvedic properties.`
      : "";

    // Shared resilient caller: retries transient Gemini 5xx with backoff and
    // falls through to the next model on sunset/capacity errors.
    const gemini = await generateWithModelFallback(
      (model) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        systemInstruction: {
          parts: [{ text: `You are a precise nutrition database. Return full, accurate nutrition estimates per 100g as JSON only. Use this exact shape: {"foodName":"string","description":"detailed 1-2 sentence description of food origin, taste, texture, and common culinary uses","servingSize":"100g","macronutrients":{"calories":{"value":0,"unit":"kcal"},"protein":{"value":0,"unit":"g"},"carbohydrates":{"value":0,"unit":"g"},"fiber":{"value":0,"unit":"g"},"sugar":{"value":0,"unit":"g"},"fat":{"value":0,"unit":"g"},"saturatedFat":{"value":0,"unit":"g"},"unsaturatedFat":{"value":0,"unit":"g"}},"micronutrients":{"vitamins":[{"name":"string","value":0,"unit":"string","dailyValue":"string"}],"minerals":[{"name":"string","value":0,"unit":"string","dailyValue":"string"}]},"healthBenefits":["string"],"ayurvedicProperties":{"dosha":"string","taste":"string","energy":"string","postDigestive":"string"}}. Provide up to 6 vitamins, up to 6 minerals, 4-5 detailed health benefits, and precise Ayurvedic properties. Keep JSON clean with no markdown.${seedHints}` }],
        },
        contents: [{ role: "user", parts: [{ text: `Food: ${normalizedQuery}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } },
      },
      MODELS,
      { timeoutMs: 12000, attempts: 2 },
    );

    if (!gemini.ok) {
      console.error("Gemini nutrition request failed", gemini.status, gemini.errorText ?? "");
      return json(
        { error: "Nutrition analysis is temporarily unavailable. Please try again.", upstream: gemini.status, detail: gemini.errorText },
        gemini.status === 429 ? 429 : 502,
      );
    }

    const result = gemini.data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    } | null;
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return json({ error: "No nutrition data was returned. Please try again." }, 502);

    // Shared extractor (also covered by vitest): tolerates markdown fences
    // and partial output so one formatting quirk doesn't fail the lookup.
    const data: unknown = extractJsonObject(content);
    if (!data || typeof data !== "object") {
      console.error("Gemini returned unparseable nutrition JSON");
      return json({ error: "Nutrition data could not be read. Please try again." }, 502);
    }

    // Normalize Gemini's (often varying) output into the exact NutritionData
    // shape the frontend expects, so the result card always renders.
    // Shared pure helper (also covered by vitest) — handles both the
    // prompted nested { value, unit } shape and flat alternates.
    const normalized = normalizeNutrition(data as Record<string, unknown>, normalizedQuery, openFoodMacros);

    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(normalizedQuery, { data: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
    await setPersistentCache(normalizedQuery, normalized);
    return json({ success: true, data: normalized, cached: false });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return json({ error: "The nutrition request took too long. Please try again." }, 504);
    }
    console.error("Nutrition lookup failed", error instanceof Error ? error.message : error);
    return json({ error: "Unable to look up nutrition right now. Please try again." }, 500);
  }
});
