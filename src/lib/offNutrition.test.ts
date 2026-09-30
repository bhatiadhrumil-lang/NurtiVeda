import { describe, it, expect } from "vitest";
import {
  hasMeaningfulMacros,
  localFoodNutrition,
  offProductNutrition,
} from "@/lib/offNutrition";
import { lookupLocalFood, deriveBenefits } from "@/lib/foodKnowledge";
import type { NutritionData } from "@/hooks/useNutritionLookup";

const zeros = (): NutritionData => ({
  foodName: "Empty",
  description: "",
  servingSize: "100g",
  macronutrients: {
    calories: { value: 0, unit: "kcal" },
    protein: { value: 0, unit: "g" },
    carbohydrates: { value: 0, unit: "g" },
    fiber: { value: 0, unit: "g" },
    sugar: { value: 0, unit: "g" },
    fat: { value: 0, unit: "g" },
    saturatedFat: { value: 0, unit: "g" },
    unsaturatedFat: { value: 0, unit: "g" },
  },
  micronutrients: { vitamins: [], minerals: [] },
  healthBenefits: [],
  ayurvedicProperties: { dosha: "", taste: "", energy: "", postDigestive: "" },
});

describe("hasMeaningfulMacros", () => {
  it("rejects all-zero responses (the reported bug)", () => {
    expect(hasMeaningfulMacros(zeros())).toBe(false);
    expect(hasMeaningfulMacros(null)).toBe(false);
  });

  it("accepts real data", () => {
    const d = zeros();
    d.macronutrients.calories.value = 52;
    expect(hasMeaningfulMacros(d)).toBe(true);
  });
});

describe("lookupLocalFood", () => {
  it("matches common foods and prefers longest keyword", () => {
    expect(lookupLocalFood("apple")?.name).toBe("Apple");
    expect(lookupLocalFood("  MASALA DOSA ")?.name).toBe("Masala Dosa");
    // longest-match: biryani beats chicken
    expect(lookupLocalFood("chicken biryani")?.name).toBe("Cooked Rice");
  });

  it("returns null for unknown foods", () => {
    expect(lookupLocalFood("xyzabc")).toBeNull();
    expect(lookupLocalFood("")).toBeNull();
  });
});

describe("localFoodNutrition", () => {
  it("builds a complete card with real macros", () => {
    const d = localFoodNutrition("paneer");
    expect(d).not.toBeNull();
    expect(d!.macronutrients.protein.value).toBeGreaterThan(0);
    expect(d!.healthBenefits.length).toBeGreaterThan(0);
    expect(d!.ayurvedicProperties.dosha.length).toBeGreaterThan(0);
    expect(hasMeaningfulMacros(d)).toBe(true);
  });
});

describe("offProductNutrition", () => {
  it("maps OFF nutriments to the app shape", () => {
    const d = offProductNutrition(
      {
        product_name: "Test Biscuits",
        nutriments: {
          "energy-kcal_100g": 450,
          proteins_100g: 7,
          carbohydrates_100g: 65,
          fat_100g: 18,
          fiber_100g: 3,
          sugars_100g: 20,
          "saturated-fat_100g": 8,
          salt_100g: 1,
          calcium_100g: 100,
          iron_100g: 2,
          "vitamin-c_100g": 12,
          "vitamin-b12_100g": 0.5,
        },
      },
      "biscuits",
    );
    expect(d).not.toBeNull();
    expect(d!.foodName).toBe("Test Biscuits");
    expect(d!.macronutrients.calories.value).toBe(450);
    expect(d!.macronutrients.protein.value).toBe(7);
    const vitNames = d!.micronutrients.vitamins.map((v) => v.name);
    expect(vitNames).toContain("Vitamin C");
    expect(vitNames).toContain("Vitamin B12");
    const minNames = d!.micronutrients.minerals.map((m) => m.name);
    expect(minNames).toContain("Calcium");
    expect(minNames).toContain("Iron");
    // salt 1g -> sodium 400mg with %DV
    const sodium = d!.micronutrients.minerals.find((m) => m.name === "Sodium");
    expect(sodium?.value).toBe(400);
    expect(sodium?.dailyValue).toMatch(/%/);
  });

  it("returns null when OFF has no macros (lets chain fall through)", () => {
    expect(offProductNutrition({ product_name: "Mystery", nutriments: {} }, "mystery")).toBeNull();
  });
});

describe("deriveBenefits", () => {
  it("derives protein/fiber claims, defaults otherwise", () => {
    const high = deriveBenefits({ calories: 165, protein: 31, carbs: 0, fiber: 0, sugar: 0, fat: 3.6, satFat: 1 });
    expect(high.some((b) => b.toLowerCase().includes("protein"))).toBe(true);
    const empty = deriveBenefits({ calories: 0, protein: 0, carbs: 0, fiber: 0, sugar: 0, fat: 0, satFat: 0 });
    expect(empty.length).toBeGreaterThan(0);
  });
});
