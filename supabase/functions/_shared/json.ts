// Pure JSON extraction shared by Edge Functions (Deno) and vitest.
// No Deno / Node / DOM APIs here.

/** Extract the first balanced JSON object from model output, tolerating
 *  markdown fences (```json ... ```) that models add despite
 *  responseMimeType. Returns null when no parseable object exists. */
export function extractJsonObject(raw: string): unknown | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
