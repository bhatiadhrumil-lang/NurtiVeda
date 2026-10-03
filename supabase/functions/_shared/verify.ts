// Food identity verification shared by the nutrition-lookup Edge Function
// (Deno), the browser fallback chain, and vitest.
// This is the mandatory gate: a query must match a trusted food/product
// name before AI analysis or result display. No Deno / Node / DOM APIs here.

/** Blank (empty / whitespace-only) queries must never reach the pipeline. */
export function isBlankQuery(query: string): boolean {
  return query.trim().length === 0;
}

export function normalizeFoodName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singular(token: string): string {
  return token.length > 3 && token.endsWith("s") && !token.endsWith("ss")
    ? token.slice(0, -1)
    : token;
}

const STOPWORDS = new Set(["with", "and", "the", "fresh", "from", "for", "a", "an", "of", "per"]);

function foodTokens(value: string): string[] {
  return normalizeFoodName(value)
    .split(" ")
    .filter(Boolean)
    .map(singular)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = temp;
    }
  }
  return prev[b.length];
}

/** True only when the candidate name refers to the queried food:
 *  exact match, full token containment either way (covers branded products
 *  like "Apple Juice 1L" for query "apple"), or a close misspelling
 *  (edit distance <= 2 on single-token names, e.g. "bananna").
 *  Random strings such as "Ugirfdt87dr" never match a real food name. */
export function isFoodNameMatch(query: string, name: string): boolean {
  const q = normalizeFoodName(query);
  const n = normalizeFoodName(name);
  if (!q || !n) return false;
  if (q === n || singular(q) === singular(n)) return true;
  const qt = foodTokens(q);
  const nt = foodTokens(n);
  if (qt.length > 0 && nt.length > 0) {
    if (qt.every((t) => nt.includes(t))) return true;
    if (nt.every((t) => qt.includes(t))) return true;
  }
  if (qt.length === 1 && nt.length === 1 && q.length >= 5 && n.length >= 5) {
    return levenshtein(qt[0], nt[0]) <= 2;
  }
  return false;
}

/** Keep only names that verify against the query, preserving source order
 *  (never re-rank an unrelated item to the top). Empty when nothing matches. */
export function selectVerifiedMatches(query: string, names: string[], limit = 5): string[] {
  const out: string[] = [];
  for (const name of names) {
    if (typeof name === "string" && isFoodNameMatch(query, name)) {
      out.push(name);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function notFoundMessage(query: string): string {
  const q = query.trim();
  return `No food found for '${q}'. Please check the spelling and try again.`;
}

export type SearchOutcome =
  | { kind: "result" }
  | { kind: "not-found"; message: string }
  | { kind: "error"; message: string };

/** Final outcome of a lookup with no usable result. API/source failures
 *  (network, timeouts, 5xx) are reported as temporary unavailability and
 *  must never fabricate data; clean misses become "not found". */
export function decideFinalOutcome(sourceFailed: boolean, query: string): SearchOutcome {
  if (sourceFailed) {
    return { kind: "error", message: "Food information is temporarily unavailable. Please try again." };
  }
  return { kind: "not-found", message: notFoundMessage(query) };
}
