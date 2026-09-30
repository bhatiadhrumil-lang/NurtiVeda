export function calculateAge(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

export const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary (little exercise)", multiplier: 1.2 },
  { value: "light", label: "Light (1–3 days/week)", multiplier: 1.375 },
  { value: "moderate", label: "Moderate (3–5 days/week)", multiplier: 1.55 },
  { value: "active", label: "Active (6–7 days/week)", multiplier: 1.725 },
] as const;

export type ActivityLevel = (typeof ACTIVITY_OPTIONS)[number]["value"];

export function activityMultiplier(level?: string | null): number {
  return ACTIVITY_OPTIONS.find((o) => o.value === level)?.multiplier ?? 1.375;
}

const SEARCH_KEY = "nutriveda_search_history";
const ACTIVITY_KEY = "nutriveda_activity_level";

export function getSearchHistory(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SEARCH_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function pushSearchHistory(query: string) {
  const q = query.trim();
  if (!q) return;
  try {
    const prev = getSearchHistory().filter((x) => x.toLowerCase() !== q.toLowerCase());
    localStorage.setItem(SEARCH_KEY, JSON.stringify([q, ...prev].slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function getActivityLevel(): string {
  try {
    return localStorage.getItem(ACTIVITY_KEY) || "light";
  } catch {
    return "light";
  }
}

export function setActivityLevel(level: string) {
  try {
    localStorage.setItem(ACTIVITY_KEY, level);
  } catch {
    /* ignore */
  }
}

// kg/cm <-> lb/in helpers
export const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
export const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;
export const cmToIn = (cm: number) => Math.round(cm / 2.54 * 10) / 10;
export const inToCm = (inch: number) => Math.round(inch * 2.54 * 10) / 10;

export function dayKey(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function calcStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) return 0;
  const set = new Set(dayKeys);
  let streak = 0;
  const cursor = new Date();
  // allow today missing -> start from yesterday
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
