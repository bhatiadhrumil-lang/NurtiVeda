// Resilient Gemini caller shared by Edge Functions (Deno) and vitest.
// Retries transient upstream failures (500/502/503) with backoff instead of
// surfacing a one-off Gemini hiccup as a user-facing failure.
// No Deno / Node / DOM APIs here (fetch/AbortController/setTimeout only).

export interface GeminiResult {
  ok: boolean;
  status: number;
  data: unknown | null;
  /** Upstream error body (truncated) when !ok — safe diagnostic detail. */
  errorText: string | null;
}

export interface FallbackResult extends GeminiResult {
  model: string | null;
}

/** Try models in order, returning the first success. Falls through to the
 *  next model on availability/capacity errors (404 sunset, 500/502/503,
 *  network failure) but stops on quota (429) and client errors (400/403),
 *  which would fail identically on every model. */
export async function generateWithModelFallback(
  buildUrl: (model: string) => string,
  payload: unknown,
  models: string[],
  opts: { attempts?: number; timeoutMs?: number; backoffMs?: number } = {},
  fetchFn: typeof fetch = fetch,
): Promise<FallbackResult> {
  let last: GeminiResult = { ok: false, status: 0, data: null, errorText: null };
  for (const model of models) {
    const r = await callGemini(buildUrl(model), payload, opts, fetchFn);
    if (r.ok) return { ...r, model };
    last = r;
    if (r.status === 429 || r.status === 400 || r.status === 403) break;
  }
  return { ...last, model: null };
}

export async function callGemini(
  url: string,
  payload: unknown,
  opts: { attempts?: number; timeoutMs?: number; backoffMs?: number } = {},
  fetchFn: typeof fetch = fetch,
): Promise<GeminiResult> {
  const attempts = Math.max(1, opts.attempts ?? 2);
  const timeoutMs = opts.timeoutMs ?? 20000;
  const backoffMs = opts.backoffMs ?? 1500;
  let lastStatus = 0;
  let lastErrorText: string | null = null;

  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, backoffMs * i));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchFn(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await (res.json() as Promise<unknown>).catch(() => null);
        return { ok: true, status: res.status, data, errorText: null };
      }
      lastStatus = res.status;
      try {
        const text = await res.text();
        lastErrorText = text ? text.slice(0, 300) : null;
      } catch {
        lastErrorText = null;
      }
      // Retry transient upstream errors only — client errors (400/403/404)
      // and quota (429) would just fail again immediately.
      if (res.status !== 500 && res.status !== 502 && res.status !== 503) {
        return { ok: false, status: res.status, data: null, errorText: lastErrorText };
      }
    } catch {
      clearTimeout(timer);
      lastStatus = 0; // network error / timeout — retryable
    }
  }
  return { ok: false, status: lastStatus, data: null, errorText: lastErrorText };
}
