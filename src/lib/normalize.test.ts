import { describe, it, expect } from "vitest";
import { normalizeNutrition, num, normalizeHealthScore } from "../../supabase/functions/_shared/normalize.ts";

// Regression test: Gemini returns the exact nested { value, unit } shape the
// system prompt requests. The old normalizer only accepted plain numbers,
// so every macro silently became 0 ("every nutrition giving 0 values").
describe("normalizeNutrition", () => {
  const promptedShape = {
    foodName: "Apple",
    description: "A crisp fruit.",
    servingSize: "100g",
    macronutrients: {
      calories: { value: 52, unit: "kcal" },
      protein: { value: 0.3, unit: "g" },
      carbohydrates: { value: 14, unit: "g" },
      fiber: { value: 2.4, unit: "g" },
      sugar: { value: 10, unit: "g" },
      fat: { value: 0.2, unit: "g" },
      saturatedFat: { value: 0, unit: "g" },
      unsaturatedFat: { value: 0.1, unit: "g" },
    },
    micronutrients: {
      vitamins: [{ name: "Vitamin C", value: 4.6, unit: "mg", dailyValue: "5%" }],
      minerals: [{ name: "Potassium", value: 107, unit: "mg", dailyValue: "2%" }],
    },
    healthBenefits: ["Rich in fiber"],
    ayurvedicProperties: { dosha: "Balances", taste: "Sweet", energy: "Cooling", postDigestive: "Sweet" },
  };

  it("extracts macros from the nested { value, unit } shape", () => {
    const out = normalizeNutrition(promptedShape, "apple", null);
    expect(out.macronutrients.calories.value).toBe(52);
    expect(out.macronutrients.protein.value).toBeCloseTo(0.3);
    expect(out.macronutrients.carbohydrates.value).toBe(14);
    expect(out.macronutrients.fiber.value).toBeCloseTo(2.4);
    expect(out.macronutrients.fat.value).toBeCloseTo(0.2);
    expect(out.foodName).toBe("Apple");
  });

  it("still handles flat alternate shapes", () => {
    const out = normalizeNutrition(
      { food: "Oats", nutrients: { calories: 389, protein_g: 16.9, fat_g: 6.9 } },
      "oats",
      null,
    );
    expect(out.macronutrients.calories.value).toBe(389);
    expect(out.macronutrients.protein.value).toBeCloseTo(16.9);
    expect(out.macronutrients.fat.value).toBeCloseTo(6.9);
  });

  it("falls back to Open Food Facts seeds, then safe defaults", () => {
    const seed = { protein: { value: 10, unit: "g" } };
    const out = normalizeNutrition({ foodName: "Mystery" }, "mystery", seed as never);
    expect(out.macronutrients.protein.value).toBe(10);
    expect(out.macronutrients.calories.value).toBe(0);
    expect(out.healthBenefits.length).toBeGreaterThan(0);
  });

  it("num() unwraps numbers, strings and { value } objects", () => {
    expect(num(5)).toBe(5);
    expect(num("3.2")).toBeCloseTo(3.2);
    expect(num({ value: 7, unit: "g" })).toBe(7);
    expect(num(undefined)).toBe(0);
    expect(num("abc")).toBe(0);
  });
});

describe("normalizeHealthScore", () => {
  it("keeps 1-10 scores as-is", () => {
    expect(normalizeHealthScore(9)).toBe(9);
    expect(normalizeHealthScore(1)).toBe(1);
    expect(normalizeHealthScore(10)).toBe(10);
  });

  it("scales 0-100 scores down (the reported 95/10 bug)", () => {
    expect(normalizeHealthScore(95)).toBe(10);
    expect(normalizeHealthScore(83)).toBe(8);
    expect(normalizeHealthScore(72)).toBe(7);
  });

  it("clamps garbage to the valid range", () => {
    expect(normalizeHealthScore(0)).toBe(1);
    expect(normalizeHealthScore(-5)).toBe(1);
    expect(normalizeHealthScore(150)).toBe(10);
    expect(normalizeHealthScore(undefined)).toBe(1);
    expect(normalizeHealthScore("high" as never)).toBe(1);
  });
});
