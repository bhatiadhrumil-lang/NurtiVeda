import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractJsonObject } from "../_shared/json.ts";
import { generateWithModelFallback } from "../_shared/gemini.ts";
import { normalizeHealthScore } from "../_shared/normalize.ts";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(req: Request): Response | null {
  // Bucket per caller token when present, else per IP. Never collapse all
  // callers into one shared bucket: x-forwarded-for can be absent in some
  // runtimes, which would rate-limit every user globally after 20 requests.
  const auth = req.headers.get("authorization") ?? "";
  let key: string;
  if (auth.startsWith("Bearer ") && auth.length > 20) {
    let h = 0;
    for (let i = 0; i < auth.length; i++) h = (h * 31 + auth.charCodeAt(i)) >>> 0;
    key = `tok:${h}`;
  } else {
    const ip = req.headers.get("x-forwarded-for");
    if (!ip) return null; // no reliable caller id -> skip limiting, don't share one bucket
    key = `ip:${ip}`;
  }
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }
  bucket.count++;
  if (bucket.count > RATE_LIMIT) {
    return json({ error: "Rate limit exceeded. Please try again later." }, 429);
  }
  return null;
}
const MAX_BASE64_CHARS = 8 * 1024 * 1024;
// Model preference order: most reliable first for this key (2.5-flash has
// the most proven successes), newest next, stable alternative last.
// A sunset (404) or saturated (503) model is skipped automatically.
const MODELS = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.5-flash"];
const RESPONSE_TIMEOUT_MS = 30_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const limited = checkRateLimit(req);
  if (limited) return limited;

  try {
    const { imageBase64, mimeType } = await req.json();
    if (typeof imageBase64 !== "string" || imageBase64.length === 0 || imageBase64.length > MAX_BASE64_CHARS) {
      return json({ error: "Upload a valid compressed image smaller than 6 MB." }, 400);
    }
    if (mimeType !== "image/jpeg" && mimeType !== "image/png" && mimeType !== "image/webp") {
      return json({ error: "Only JPEG, PNG, and WebP images are supported." }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return json({ error: "Photo analysis is not configured yet. Please contact the site administrator." }, 503);
    }

    const imageData = imageBase64.includes(",") ? imageBase64.split(",", 2)[1] : imageBase64;
    // Shared resilient caller: retries transient Gemini 5xx with backoff and
    // falls through to the next model on sunset/capacity errors, instead of
    // failing the whole analysis on a one-off upstream hiccup.
    const gemini = await generateWithModelFallback(
      (model) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        systemInstruction: {
            parts: [{ text: "Identify visible food items and return a complete nutrition estimate as JSON only. Use this exact shape: {\"foods\":[{\"name\":\"string\",\"estimatedPortion\":\"string\",\"calories\":0,\"protein\":0,\"carbs\":0,\"fat\":0,\"fiber\":0,\"sugar\":0}],\"totalEstimate\":{\"calories\":0,\"protein\":0,\"carbs\":0,\"fat\":0,\"fiber\":0,\"sugar\":0,\"saturatedFat\":0},\"summary\":\"1-2 sentence meal description\",\"healthScore\":0,\"suggestions\":[\"string\",\"string\"],\"vitamins\":[{\"name\":\"string\",\"value\":0,\"unit\":\"string\",\"dailyValue\":\"string\"}],\"minerals\":[{\"name\":\"string\",\"value\":0,\"unit\":\"string\",\"dailyValue\":\"string\"}],\"healthBenefits\":[\"string\",\"string\",\"string\"]}. IMPORTANT: healthScore must be an integer from 1 to 10 (10 = healthiest), never 0-100. Include fiber and sugar per food, up to 4 key vitamins and 4 key minerals for the whole meal with % daily values, and 2-3 health benefits. Keep JSON clean with no markdown." }],
          },
          contents: [{ role: "user", parts: [
            { text: "Analyze this meal photo." },
            { inlineData: { mimeType, data: imageData } },
          ] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 1600, thinkingConfig: { thinkingBudget: 0 } },
        },
        MODELS,
        { timeoutMs: RESPONSE_TIMEOUT_MS, attempts: 2 },
      );

      if (!gemini.ok) {
        console.error("Gemini photo request failed", gemini.status, gemini.errorText ?? "");
        return json(
          { error: "Photo analysis is temporarily unavailable. Please try again.", upstream: gemini.status, detail: gemini.errorText },
          gemini.status === 429 ? 429 : 502,
        );
      }

      const result = gemini.data as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      } | null;
      const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return json({ error: "No photo analysis was returned. Please try again." }, 502);

    // Shared extractor: tolerates ```json fences so one formatting quirk
    // doesn't fail the whole photo analysis.
    const data: unknown = extractJsonObject(content);
    if (!data || typeof data !== "object") {
      console.error("Gemini returned invalid photo JSON");
      return json({ error: "Photo analysis could not be read. Please try again." }, 502);
    }

    // Guard the 1-10 scale: models occasionally return 0-100 (e.g. 95).
    (data as Record<string, unknown>).healthScore = normalizeHealthScore(
      (data as Record<string, unknown>).healthScore,
    );

    return json({ success: true, data });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return json({ error: "The photo request took too long. Please try again." }, 504);
    }
    console.error("Photo analysis failed", error instanceof Error ? error.message : error);
    return json({ error: "Unable to analyze this photo right now. Please try again." }, 500);
  }
});
