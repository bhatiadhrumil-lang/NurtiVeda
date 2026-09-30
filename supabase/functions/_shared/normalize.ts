// Pure, runtime-agnostic nutrition normalization shared by the
// nutrition-lookup Edge Function (Deno) and the vitest regression suite.
// No Deno / Node / DOM APIs here.

export type Loose = Record<string, unknown>;

/** Normalize a 1-10 health score. Models sometimes return 0-100 despite
 *  instructions (e.g. 95 instead of 10) — scale down, then clamp. */
export function normalizeHealthScore(score: unknown): number {
  const n = typeof score === "number" && Number.isFinite(score) ? score : 0;
  const scaled = n > 10 ? Math.round(n / 10) : Math.round(n);
  return Math.min(10, Math.max(1, scaled));
}

export interface MacroSeed {
  value: number;
  unit: string;
}

/** Extract a number from the shapes Gemini actually returns:
 *  plain numbers, numeric strings, or { value, unit } objects. */
export function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if ("value" in obj) return num(obj.value);
    if ("val" in obj) return num(obj.val);
  }
  return 0;
}

export function raw(o: unknown, ...keys: string[]): number {
  if (!o || typeof o !== "object") return 0;
  const obj = o as Loose;
  for (const k of keys) {
    const n = num(obj[k]);
    if (n) return n;
  }
  return 0;
}

export interface NormalizedNutrition {
  foodName: string;
  description: string;
  servingSize: string;
  macronutrients: Record<string, MacroSeed>;
  micronutrients: { vitamins: unknown[]; minerals: unknown[] };
  healthBenefits: string[];
  ayurvedicProperties: { dosha: string; taste: string; energy: string; postDigestive: string };
}

/** Normalize Gemini's varying output into the exact NutritionData shape
 *  the frontend expects. Handles BOTH the prompted nested shape
 *  ({ macronutrients: { calories: { value, unit } } }) and flat
 *  alternates ({ nutrients: { protein_g } }), with Open Food Facts
 *  seeds as the last resort before 0. */
export function normalizeNutrition(
  data: Loose,
  normalizedQuery: string,
  openFoodMacros: Record<string, MacroSeed> | null,
): NormalizedNutrition {
  const d = data;
  const seedMacro = (key: string) => openFoodMacros?.[key]?.value ?? 0;
  const macro = (d.macronutrients ?? {}) as Loose;
  const nutrients = (d.nutrients ?? d.nutritional_value_per_100g ?? {}) as Loose;

  const calories = raw(macro, "calories") || raw(d, "calories") || raw(nutrients, "calories", "calories_kcal") || seedMacro("calories");
  const protein = raw(macro, "protein") || raw(nutrients, "protein_g", "protein") || seedMacro("protein");
  const carbs = raw(macro, "carbohydrates", "carbs") || raw(nutrients, "carbohydrates_g", "carbs") || seedMacro("carbohydrates");
  const fiber = raw(macro, "fiber") || raw(nutrients, "dietary_fiber_g", "fiber") || seedMacro("fiber");
  const sugar = raw(macro, "sugar") || raw(nutrients, "sugars_g", "sugar") || seedMacro("sugar");
  const fat = raw(macro, "fat") || raw(nutrients, "fat_g", "fat") || seedMacro("fat");
  const satFat = raw(macro, "saturatedFat", "saturated_fat") || raw(nutrients, "saturated_fat_g") || seedMacro("saturatedFat");
  const unsatRaw = raw(macro, "unsaturatedFat", "unsaturated_fat") || raw(nutrients, "unsaturated_fat_g") || seedMacro("unsaturatedFat");
  const unsatFat = Math.max(0, unsatRaw || Math.max(0, fat - satFat));

  const mkVit = (name: string, value: number, unit: string) => ({ name, value, unit, dailyValue: "" });
  const micro = (d.micronutrients ?? {}) as Loose;
  const vitaminsArr = Array.isArray(micro.vitamins)
    ? (micro.vitamins as Loose[]).slice(0, 6)
    : [
        mkVit("Vitamin C", raw(nutrients, "vitamin_c_mg"), "mg"),
        mkVit("Vitamin B6", raw(nutrients, "vitamin_b6_mg"), "mg"),
        mkVit("Vitamin A", raw(nutrients, "vitamin_a_mcg"), "mcg"),
        mkVit("Vitamin D", raw(nutrients, "vitamin_d_mcg"), "mcg"),
        mkVit("Folate", raw(nutrients, "folate_mcg"), "mcg"),
        mkVit("Vitamin K", raw(nutrients, "vitamin_k_mcg"), "mcg"),
      ];
  const mineralsArr = Array.isArray(micro.minerals)
    ? (micro.minerals as Loose[]).slice(0, 6)
    : [
        mkVit("Potassium", raw(nutrients, "potassium_mg"), "mg"),
        mkVit("Magnesium", raw(nutrients, "magnesium_mg"), "mg"),
        mkVit("Iron", raw(nutrients, "iron_mg"), "mg"),
        mkVit("Calcium", raw(nutrients, "calcium_mg"), "mg"),
        mkVit("Zinc", raw(nutrients, "zinc_mg"), "mg"),
        mkVit("Phosphorus", raw(nutrients, "phosphorus_mg"), "mg"),
      ];

  return {
    foodName: String(d.foodName ?? d.food ?? d.name ?? normalizedQuery),
    description: String(d.description ?? d.category ?? "Full nutrition estimate per 100g with macro- and micronutrient details."),
    servingSize: String(d.servingSize ?? "100g"),
    macronutrients: {
      calories: { value: calories, unit: "kcal" },
      protein: { value: protein, unit: "g" },
      carbohydrates: { value: carbs, unit: "g" },
      fiber: { value: fiber, unit: "g" },
      sugar: { value: sugar, unit: "g" },
      fat: { value: fat, unit: "g" },
      saturatedFat: { value: satFat, unit: "g" },
      unsaturatedFat: { value: unsatFat, unit: "g" },
    },
    micronutrients: {
      vitamins: vitaminsArr,
      minerals: mineralsArr,
    },
    healthBenefits: Array.isArray(d.healthBenefits)
      ? (d.healthBenefits as unknown[]).slice(0, 5).map(String)
      : Array.isArray(d.health_benefits)
        ? (d.health_benefits as unknown[]).slice(0, 5).map(String)
        : [
            "Nutritious addition to a balanced diet.",
            "Source of essential macro- and micronutrients.",
            "Best enjoyed as part of whole-food meals.",
            "Supports overall wellness and vitality.",
          ],
    ayurvedicProperties: (d.ayurvedicProperties ?? {
      dosha: "Balances all doshas in moderation",
      taste: "Mixed",
      energy: "Neutral",
      postDigestive: "Sweet",
    }) as NormalizedNutrition["ayurvedicProperties"],
  };
}
