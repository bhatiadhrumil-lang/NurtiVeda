import type { NutritionData } from "@/hooks/useNutritionLookup";

// Sample nutrition data used as a fallback when the Supabase edge function
// (nutrition-lookup) is not deployed or unreachable. This keeps the UI usable
// for demos without a backend. Values are approximate per 100g.

type PartialNutrition = Omit<NutritionData, "foodName" | "servingSize">;

const COMMON: Record<string, PartialNutrition> = {
  apple: {
    description: "A crisp, sweet-tart pomaceous fruit cultivated worldwide. Apples are celebrated for their high soluble fiber (pectin), polyphenol antioxidants, and refreshing juiciness. Commonly eaten raw, baked into desserts, pressed into cider, or added to salads for crunch.",
    macronutrients: {
      calories: { value: 52, unit: "kcal" },
      protein: { value: 0.3, unit: "g" },
      carbohydrates: { value: 14, unit: "g" },
      fiber: { value: 2.4, unit: "g" },
      sugar: { value: 10.3, unit: "g" },
      fat: { value: 0.2, unit: "g" },
      saturatedFat: { value: 0.03, unit: "g" },
      unsaturatedFat: { value: 0.07, unit: "g" },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin C", value: 4.6, unit: "mg", dailyValue: "5%" },
        { name: "Vitamin K", value: 2.2, unit: "mcg", dailyValue: "3%" },
        { name: "Vitamin B6", value: 0.04, unit: "mg", dailyValue: "2%" },
        { name: "Vitamin E", value: 0.18, unit: "mg", dailyValue: "1%" },
        { name: "Folate", value: 3, unit: "mcg", dailyValue: "1%" },
        { name: "Riboflavin (B2)", value: 0.026, unit: "mg", dailyValue: "2%" },
      ],
      minerals: [
        { name: "Potassium", value: 107, unit: "mg", dailyValue: "2%" },
        { name: "Magnesium", value: 5, unit: "mg", dailyValue: "1%" },
        { name: "Phosphorus", value: 11, unit: "mg", dailyValue: "1%" },
        { name: "Calcium", value: 6, unit: "mg", dailyValue: "1%" },
        { name: "Copper", value: 0.027, unit: "mg", dailyValue: "3%" },
        { name: "Manganese", value: 0.035, unit: "mg", dailyValue: "2%" },
      ],
    },
    healthBenefits: [
      "Supports heart health with soluble fiber (pectin)",
      "Rich in antioxidants like quercetin and catechin",
      "Helps regulate blood sugar response",
      "Aids digestive health through fiber content",
      "Provides hydration and low-calorie satiety",
    ],
    ayurvedicProperties: {
      dosha: "Vata and Kapha balancing",
      taste: "Sweet, Sour",
      energy: "Cooling",
      postDigestive: "Sweet",
    },
  },
  banana: {
    description: "Soft, sweet fruit high in potassium and fast energy.",
    macronutrients: {
      calories: { value: 89, unit: "kcal" },
      protein: { value: 1.1, unit: "g" },
      carbohydrates: { value: 23, unit: "g" },
      fiber: { value: 2.6, unit: "g" },
      sugar: { value: 12, unit: "g" },
      fat: { value: 0.3, unit: "g" },
      saturatedFat: { value: 0.1, unit: "g" },
      unsaturatedFat: { value: 0.05, unit: "g" },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin C", value: 8.7, unit: "mg", dailyValue: "10%" },
        { name: "Vitamin B6", value: 0.4, unit: "mg", dailyValue: "24%" },
        { name: "Folate", value: 20, unit: "mcg", dailyValue: "5%" },
      ],
      minerals: [
        { name: "Potassium", value: 358, unit: "mg", dailyValue: "8%" },
        { name: "Magnesium", value: 27, unit: "mg", dailyValue: "6%" },
        { name: "Manganese", value: 0.3, unit: "mg", dailyValue: "13%" },
      ],
    },
    healthBenefits: [
      "Supports healthy blood pressure",
      "Good source of prebiotic fiber",
      "Quick natural energy boost",
    ],
    ayurvedicProperties: {
      dosha: "Pitta balancing, increases Kapha",
      taste: "Sweet, Astringent",
      energy: "Cooling",
      postDigestive: "Sweet",
    },
  },
  chicken: {
    description: "Lean poultry, an excellent source of complete protein.",
    macronutrients: {
      calories: { value: 165, unit: "kcal" },
      protein: { value: 31, unit: "g" },
      carbohydrates: { value: 0, unit: "g" },
      fiber: { value: 0, unit: "g" },
      sugar: { value: 0, unit: "g" },
      fat: { value: 3.6, unit: "g" },
      saturatedFat: { value: 1, unit: "g" },
      unsaturatedFat: { value: 1.7, unit: "g" },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin B3 (Niacin)", value: 13.5, unit: "mg", dailyValue: "85%" },
        { name: "Vitamin B6", value: 0.5, unit: "mg", dailyValue: "29%" },
        { name: "Vitamin B12", value: 0.3, unit: "mcg", dailyValue: "13%" },
      ],
      minerals: [
        { name: "Selenium", value: 24, unit: "mcg", dailyValue: "44%" },
        { name: "Phosphorus", value: 196, unit: "mg", dailyValue: "16%" },
        { name: "Zinc", value: 1, unit: "mg", dailyValue: "9%" },
      ],
    },
    healthBenefits: [
      "Builds and repairs muscle tissue",
      "Supports immune function",
      "Rich in essential B vitamins",
    ],
    ayurvedicProperties: {
      dosha: "Increases Pitta, balances Vata",
      taste: "Sweet",
      energy: "Heating",
      postDigestive: "Sweet",
    },
  },
  rice: {
    description: "Staple grain providing easily digested carbohydrates.",
    macronutrients: {
      calories: { value: 130, unit: "kcal" },
      protein: { value: 2.7, unit: "g" },
      carbohydrates: { value: 28, unit: "g" },
      fiber: { value: 0.4, unit: "g" },
      sugar: { value: 0.1, unit: "g" },
      fat: { value: 0.3, unit: "g" },
      saturatedFat: { value: 0.1, unit: "g" },
      unsaturatedFat: { value: 0.1, unit: "g" },
    },
    micronutrients: {
      vitamins: [
        { name: "Folate", value: 58, unit: "mcg", dailyValue: "15%" },
        { name: "Thiamin (B1)", value: 0.07, unit: "mg", dailyValue: "6%" },
        { name: "Niacin (B3)", value: 1.6, unit: "mg", dailyValue: "10%" },
      ],
      minerals: [
        { name: "Manganese", value: 0.5, unit: "mg", dailyValue: "22%" },
        { name: "Magnesium", value: 12, unit: "mg", dailyValue: "3%" },
        { name: "Phosphorus", value: 43, unit: "mg", dailyValue: "3%" },
      ],
    },
    healthBenefits: [
      "Steady source of energy",
      "Easy to digest for sensitive stomachs",
      "Gluten-free staple",
    ],
    ayurvedicProperties: {
      dosha: "Balances Vata and Pitta",
      taste: "Sweet",
      energy: "Cooling",
      postDigestive: "Sweet",
    },
  },
  egg: {
    description: "Nutrient-dense whole food with high-quality protein.",
    macronutrients: {
      calories: { value: 143, unit: "kcal" },
      protein: { value: 13, unit: "g" },
      carbohydrates: { value: 1.1, unit: "g" },
      fiber: { value: 0, unit: "g" },
      sugar: { value: 1.1, unit: "g" },
      fat: { value: 9.5, unit: "g" },
      saturatedFat: { value: 3.1, unit: "g" },
      unsaturatedFat: { value: 4.3, unit: "g" },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin B12", value: 0.9, unit: "mcg", dailyValue: "38%" },
        { name: "Vitamin D", value: 2, unit: "mcg", dailyValue: "10%" },
        { name: "Vitamin A", value: 160, unit: "mcg", dailyValue: "18%" },
      ],
      minerals: [
        { name: "Selenium", value: 30, unit: "mcg", dailyValue: "55%" },
        { name: "Phosphorus", value: 198, unit: "mg", dailyValue: "16%" },
        { name: "Iron", value: 1.8, unit: "mg", dailyValue: "10%" },
      ],
    },
    healthBenefits: [
      "Complete protein with all essential amino acids",
      "Supports eye health (lutein, zeaxanthin)",
      "Promotes satiety and weight management",
    ],
    ayurvedicProperties: {
      dosha: "Balances all doshas in moderation",
      taste: "Sweet, Astringent",
      energy: "Heating",
      postDigestive: "Sweet",
    },
  },
};

const GENERIC: PartialNutrition = {
  description: "Full nutrition estimate per 100g covering macro- and micronutrient profiles. This sample includes calories, protein, carbohydrates, fiber, sugar, total and broken-down fats, key vitamins (C, A, Folate, B6, D, E), and essential minerals (Potassium, Magnesium, Iron, Calcium, Zinc, Phosphorus). Health benefits span heart health, immune support, digestive wellness, bone strength, and energy metabolism.",
  macronutrients: {
    calories: { value: 120, unit: "kcal" },
    protein: { value: 4, unit: "g" },
    carbohydrates: { value: 18, unit: "g" },
    fiber: { value: 3, unit: "g" },
    sugar: { value: 6, unit: "g" },
    fat: { value: 3, unit: "g" },
    saturatedFat: { value: 0.8, unit: "g" },
    unsaturatedFat: { value: 1.8, unit: "g" },
  },
  micronutrients: {
    vitamins: [
      { name: "Vitamin C", value: 12, unit: "mg", dailyValue: "13%" },
      { name: "Vitamin A", value: 90, unit: "mcg", dailyValue: "10%" },
      { name: "Folate", value: 30, unit: "mcg", dailyValue: "8%" },
      { name: "Vitamin B6", value: 0.2, unit: "mg", dailyValue: "12%" },
      { name: "Vitamin D", value: 1.5, unit: "mcg", dailyValue: "8%" },
      { name: "Vitamin E", value: 0.9, unit: "mg", dailyValue: "6%" },
    ],
    minerals: [
      { name: "Potassium", value: 250, unit: "mg", dailyValue: "5%" },
      { name: "Magnesium", value: 20, unit: "mg", dailyValue: "5%" },
      { name: "Calcium", value: 40, unit: "mg", dailyValue: "3%" },
      { name: "Iron", value: 1.5, unit: "mg", dailyValue: "8%" },
      { name: "Zinc", value: 0.4, unit: "mg", dailyValue: "4%" },
      { name: "Phosphorus", value: 55, unit: "mg", dailyValue: "4%" },
    ],
  },
  healthBenefits: [
    "Part of a balanced, varied diet",
    "Provides essential macro- and micronutrients",
    "Best enjoyed as part of whole-food meals",
    "Supports immune function and energy metabolism",
    "Contributes to bone and cardiovascular health",
  ],
  ayurvedicProperties: {
    dosha: "Varies by preparation",
    taste: "Mixed",
    energy: "Neutral",
    postDigestive: "Sweet",
  },
};

export function getMockNutrition(query: string): NutritionData {
  const key = query.trim().toLowerCase();
  const base = COMMON[key] ?? GENERIC;
  const foodName = key ? key.charAt(0).toUpperCase() + key.slice(1) : "Food";
  return {
    foodName,
    servingSize: "100g",
    ...base,
  };
}
