import { describe, it, expect } from "vitest";
import { callGemini, generateWithModelFallback } from "../../supabase/functions/_shared/gemini.ts";

function stubResponder(script: Array<{ ok: boolean; status: number; body?: unknown; errBody?: string } | { throw: true }>) {
  let calls = 0;
  const fetchFn = (async () => {
    const step = script[Math.min(calls, script.length - 1)];
    calls++;
    if (step && "throw" in step) throw new Error("network down");
    const s = step as { ok: boolean; status: number; body?: unknown; errBody?: string };
    return {
      ok: s.ok,
      status: s.status,
      json: async () => s.body ?? {},
      text: async () => s.errBody ?? "",
    };
  }) as unknown as typeof fetch;
  return { fetchFn, calls: () => calls };
}

describe("callGemini retry", () => {
  it("succeeds on first try", async () => {
    const { fetchFn, calls } = stubResponder([{ ok: true, status: 200, body: { a: 1 } }]);
    const r = await callGemini("https://x", {}, { backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(true);
    expect((r.data as { a: number }).a).toBe(1);
    expect(calls()).toBe(1);
  });

  it("retries a 502 then succeeds (the reported flake)", async () => {
    const { fetchFn, calls } = stubResponder([
      { ok: false, status: 502 },
      { ok: true, status: 200, body: { hello: "world" } },
    ]);
    const r = await callGemini("https://x", {}, { backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(true);
    expect(calls()).toBe(2);
  });

  it("retries a network throw then succeeds", async () => {
    const { fetchFn, calls } = stubResponder([{ throw: true }, { ok: true, status: 200, body: {} }]);
    const r = await callGemini("https://x", {}, { backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(true);
    expect(calls()).toBe(2);
  });

  it("gives up after repeated 503s and reports last status", async () => {
    const { fetchFn, calls } = stubResponder([{ ok: false, status: 503 }]);
    const r = await callGemini("https://x", {}, { attempts: 3, backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(503);
    expect(calls()).toBe(3);
  });

  it("does NOT retry client errors like 400", async () => {
    const { fetchFn, calls } = stubResponder([{ ok: false, status: 400 }]);
    const r = await callGemini("https://x", {}, { backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(false);
    expect(calls()).toBe(1);
  });

  it("captures upstream error text for diagnosis", async () => {
    const { fetchFn } = stubResponder([{ ok: false, status: 400, errBody: '{"error":{"message":"API key not valid"}}' }]);
    const r = await callGemini("https://x", {}, { backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(false);
    expect(r.errorText).toContain("API key not valid");
  });

  it("falls through to the next model on 503, keeps the working one", async () => {
    const seen: string[] = [];
    const fetchFn = (async (url: unknown) => {
      seen.push(String(url));
      if (String(url).includes("model-a")) {
        return { ok: false, status: 503, json: async () => ({}), text: async () => "busy" };
      }
      return { ok: true, status: 200, json: async () => ({ ok: true }), text: async () => "" };
    }) as unknown as typeof fetch;
    const r = await generateWithModelFallback(
      (m) => `https://x/${m}`,
      {},
      ["model-a", "model-b"],
      { attempts: 1, backoffMs: 1 },
      fetchFn,
    );
    expect(r.ok).toBe(true);
    expect(r.model).toBe("model-b");
    expect(seen.some((u) => u.includes("model-a"))).toBe(true);
  });

  it("stops the chain on quota (429) instead of burning all models", async () => {
    let calls = 0;
    const fetchFn = (async () => {
      calls++;
      return { ok: false, status: 429, json: async () => ({}), text: async () => "quota" };
    }) as unknown as typeof fetch;
    const r = await generateWithModelFallback((m) => `https://x/${m}`, {}, ["a", "b", "c"], { attempts: 1, backoffMs: 1 }, fetchFn);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(429);
    expect(calls).toBe(1);
  });
});
