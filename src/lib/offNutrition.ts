// Open Food Facts direct lookup (browser -> OFF, no key, CORS-open) plus
// builders that turn any macro source into the app's NutritionData shape.
import type { NutritionData } from "@/hooks/useNutritionLookup";
import {
  dailyValue,
  deriveBenefits,
  findAyurveda,
  lookupLocalFood,
  DEFAULT_BENEFITS,
  type LocalMacros,
  type MicroEntry,
} from "@/lib/foodKnowledge";

function toNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  if (v && typeof v === "object") {
    const val = (v as Record<string, unknown>).value;
    return toNum(val);
  }
  return 0;
}

/** A response counts as real data only if at least one macro is non-zero.
 *  This guards against the all-zeros failure mode regardless of source. */
export function hasMeaningfulMacros(data: NutritionData | null | undefined): boolean {
  if (!data) return false;
  const m = data.macronutrients;
  if (!m) return false;
  return (
    toNum(m.calories?.value) +
      toNum(m.protein?.value) +
      toNum(m.carbohydrates?.value) +
      toNum(m.fat?.value) +
      toNum(m.fiber?.value) +
      toNum(m.sugar?.value) >
    0
  );
}

function withDaily(name: string, value: number, unit: string) {
  return { name, value, unit, dailyValue: dailyValue(name, value, unit) };
}

function buildNutrition(args: {
  foodName: string;
  description: string;
  macros: LocalMacros;
  vitamins: MicroEntry[];
  minerals: MicroEntry[];
  benefits?: string[];
  sourceNote: string;
}): NutritionData {
  const { foodName, description, macros, vitamins, minerals, benefits, sourceNote } = args;
  const ay = findAyurveda(foodName);
  const unsat = Math.max(0, macros.fat - macros.satFat);
  return {
    foodName,
    description: `${description} ${sourceNote}`.trim(),
    servingSize: "100g",
    macronutrients: {
      calories: { value: macros.calories, unit: "kcal" },
      protein: { value: macros.protein, unit: "g" },
      carbohydrates: { value: macros.carbs, unit: "g" },
      fiber: { value: macros.fiber, unit: "g" },
      sugar: { value: macros.sugar, unit: "g" },
      fat: { value: macros.fat, unit: "g" },
      saturatedFat: { value: macros.satFat, unit: "g" },
      unsaturatedFat: { value: Math.round(unsat * 10) / 10, unit: "g" },
    },
    micronutrients: {
      vitamins: vitamins.filter((v) => v.value > 0).map((v) => withDaily(v.name, v.value, v.unit)),
      minerals: minerals.filter((m) => m.value > 0).map((m) => withDaily(m.name, m.value, m.unit)),
    },
    healthBenefits: deriveBenefits(macros, benefits),
    ayurvedicProperties: {
      dosha: ay.dosha,
      taste: ay.taste,
      energy: ay.energy,
      postDigestive: ay.postDigestive,
    },
  };
}

export function localFoodNutrition(query: string): NutritionData | null {
  const hit = lookupLocalFood(query);
  if (!hit) return null;
  return buildNutrition({
    foodName: hit.name,
    description: hit.description,
    macros: hit.macros,
    vitamins: hit.vitamins,
    minerals: hit.minerals,
    benefits: hit.benefits,
    sourceNote: "(reference values).",
  });
}

interface OffProduct {
  product_name?: string;
  product_name_en?: string;
  nutriments?: Record<string, unknown>;
}

function pickNum(nut: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const n = toNum(nut[k]);
    if (n) return n;
  }
  return 0;
}

// Vitamins/minerals occasionally present in OFF nutriments (per 100g).
const OFF_VITAMINS: Array<{ name: string; unit: string; keys: string[] }> = [
  { name: "Vitamin A", unit: "mcg", keys: ["vitamin-a_100g", "vitamin_a_100g", "retinol_100g"] },
  { name: "Vitamin C", unit: "mg", keys: ["vitamin-c_100g", "vitamin_c_100g", "ascorbic-acid_100g"] },
  { name: "Vitamin D", unit: "mcg", keys: ["vitamin-d_100g", "vitamin_d_100g"] },
  { name: "Vitamin E", unit: "mg", keys: ["vitamin-e_100g", "tocopherol_100g"] },
  { name: "Vitamin K", unit: "mcg", keys: ["vitamin-k_100g"] },
  { name: "Vitamin B1", unit: "mg", keys: ["thiamin_100g", "thiamine_100g", "vitamin-b1_100g"] },
  { name: "Vitamin B2", unit: "mg", keys: ["riboflavin_100g", "vitamin-b2_100g"] },
  { name: "Vitamin B3", unit: "mg", keys: ["niacin_100g", "vitamin-b3_100g", "vitamin-pp_100g"] },
  { name: "Vitamin B6", unit: "mg", keys: ["vitamin-b6_100g", "pyridoxine_100g"] },
  { name: "Folate", unit: "mcg", keys: ["folates_100g", "folic-acid_100g", "vitamin-b9_100g"] },
  { name: "Vitamin B12", unit: "mcg", keys: ["vitamin-b12_100g", "cobalamin_100g"] },
];

const OFF_MINERALS: Array<{ name: string; unit: string; keys: string[] }> = [
  { name: "Calcium", unit: "mg", keys: ["calcium_100g"] },
  { name: "Iron", unit: "mg", keys: ["iron_100g"] },
  { name: "Magnesium", unit: "mg", keys: ["magnesium_100g"] },
  { name: "Potassium", unit: "mg", keys: ["potassium_100g"] },
  { name: "Sodium", unit: "mg", keys: ["sodium_100g"] },
  { name: "Zinc", unit: "mg", keys: ["zinc_100g"] },
  { name: "Phosphorus", unit: "mg", keys: ["phosphorus_100g"] },
  { name: "Manganese", unit: "mg", keys: ["manganese_100g"] },
  { name: "Selenium", unit: "mcg", keys: ["selenium_100g"] },
  { name: "Copper", unit: "mg", keys: ["copper_100g"] },
];

// OFF reports salt, not sodium — convert (sodium = salt / 2.5) when needed.
function pickSodium(nut: Record<string, unknown>): number {
  const direct = pickNum(nut, ["sodium_100g"]);
  if (direct > 0) return Math.round(direct * 100) / 100;
  const salt = pickNum(nut, ["salt_100g", "salt"]);
  return salt > 0 ? Math.round((salt / 2.5) * 1000 * 100) / 100 : 0;
}

function extractOffMicros(
  nut: Record<string, unknown>,
  table: Array<{ name: string; unit: string; keys: string[] }>,
): MicroEntry[] {
  const out: MicroEntry[] = [];
  for (const row of table) {
    const v = pickNum(nut, row.keys);
    if (v > 0) out.push({ name: row.name, value: Math.round(v * 100) / 100, unit: row.unit });
  }
  return out;
}

export function offProductNutrition(product: OffProduct, query: string): NutritionData | null {
  const nut = product.nutriments ?? {};
  const name = product.product_name_en || product.product_name || query.trim();
  const macros: LocalMacros = {
    calories: pickNum(nut, ["energy-kcal_100g", "energy-kcal", "calories_100g"]),
    protein: pickNum(nut, ["proteins_100g", "proteins", "protein_100g"]),
    carbs: pickNum(nut, ["carbohydrates_100g", "carbohydrates", "carbs_100g"]),
    fiber: pickNum(nut, ["fiber_100g", "fiber", "dietary_fiber_100g"]),
    sugar: pickNum(nut, ["sugars_100g", "sugars", "sugar_100g"]),
    fat: pickNum(nut, ["fat_100g", "fat"]),
    satFat: pickNum(nut, ["saturated-fat_100g", "saturated-fat", "saturated_fat_100g"]),
  };
  const minerals = extractOffMicros(nut, OFF_MINERALS);
  const sodium = pickSodium(nut);
  if (sodium > 0 && !minerals.some((m) => m.name === "Sodium")) {
    minerals.push({ name: "Sodium", value: sodium, unit: "mg" });
  }
  const out = buildNutrition({
    foodName: name,
    description: `Packaged product data for "${name}"`,
    macros,
    vitamins: extractOffMicros(nut, OFF_VITAMINS),
    minerals,
    sourceNote: "(Open Food Facts, per 100g).",
  });
  // OFF entries without any macro are useless — let the chain fall through.
  if (!hasMeaningfulMacros(out)) {
    // Still useful if it at least names the product? No — zeros mislead. Skip.
    return null;
  }
  return out;
}

/** Direct browser query to Open Food Facts. No API key, CORS-open. */
export async function lookupOffFood(query: string, timeoutMs = 12_000): Promise<NutritionData | null> {
  const q = query.trim();
  if (!q) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url =
      `https://world.openfoodfacts.org/api/v2/search?search_simple=1` +
      `&search_terms=${encodeURIComponent(q)}&page_size=5` +
      `&fields=product_name,product_name_en,nutriments`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as { products?: OffProduct[] };
    for (const product of json.products ?? []) {
      const mapped = offProductNutrition(product, q);
      if (mapped) return mapped;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export { DEFAULT_BENEFITS };
