import { describe, it, expect } from "vitest";
import { extractJsonObject } from "../../supabase/functions/_shared/json.ts";

// Simulates exactly what Gemini returns for a meal photo (and food text)
// under different formatting quirks. This is the executable check of the
// image-analysis response path: upload -> edge -> parse -> result card.
const PHOTO_PAYLOAD = {
  foods: [
    { name: "Masala Dosa", estimatedPortion: "1 piece (150g)", calories: 250, protein: 6, carbs: 45, fat: 7 },
    { name: "Coconut Chutney", estimatedPortion: "30g", calories: 80, protein: 1, carbs: 3, fat: 8 },
  ],
  totalEstimate: { calories: 330, protein: 7, carbs: 48, fat: 15, fiber: 3 },
  summary: "A South Indian breakfast plate.",
  healthScore: 7,
  suggestions: ["Add sambar for protein.", "Use less oil for the dosa."],
};

describe("photo/text model-output parsing", () => {
  it("parses clean JSON", () => {
    const out = extractJsonObject(JSON.stringify(PHOTO_PAYLOAD)) as typeof PHOTO_PAYLOAD;
    expect(out.totalEstimate.calories).toBe(330);
    expect(out.foods).toHaveLength(2);
    expect(out.healthScore).toBe(7);
  });

  it("strips ```json fences", () => {
    const out = extractJsonObject("```json\n" + JSON.stringify(PHOTO_PAYLOAD) + "\n```") as typeof PHOTO_PAYLOAD;
    expect(out?.foods?.[0]?.name).toBe("Masala Dosa");
  });

  it("strips bare ``` fences", () => {
    const out = extractJsonObject("```\n" + JSON.stringify(PHOTO_PAYLOAD) + "\n```") as typeof PHOTO_PAYLOAD;
    expect(out?.totalEstimate?.protein).toBe(7);
  });

  it("ignores leading prose before the JSON", () => {
    const out = extractJsonObject(
      'Here is your analysis:\n' + JSON.stringify(PHOTO_PAYLOAD),
    ) as typeof PHOTO_PAYLOAD;
    expect(out?.summary).toContain("South Indian");
  });

  it("handles braces and escaped quotes inside strings", () => {
    const tricky = { summary: 'Rice {steamed} and "dal" delight', totalEstimate: { calories: 200 } };
    const out = extractJsonObject(JSON.stringify(tricky)) as typeof tricky;
    expect(out?.summary).toBe('Rice {steamed} and "dal" delight');
  });

  it("returns null for truncated JSON instead of crashing", () => {
    expect(extractJsonObject('{"foods": [{"name": "Dosa"')).toBeNull();
  });

  it("returns null when there is no JSON at all", () => {
    expect(extractJsonObject("Sorry, I cannot see any food.")).toBeNull();
    expect(extractJsonObject("")).toBeNull();
  });

  it("extracts the extended photo shape (micros, sugar, benefits)", () => {
    const extended = {
      ...PHOTO_PAYLOAD,
      foods: [{ name: "Oats", estimatedPortion: "50g", calories: 190, protein: 8, carbs: 33, fat: 3.5, fiber: 5, sugar: 0.5 }],
      totalEstimate: { calories: 190, protein: 8, carbs: 33, fat: 3.5, fiber: 5, sugar: 0.5, saturatedFat: 0.6 },
      vitamins: [{ name: "Vitamin B1", value: 0.4, unit: "mg", dailyValue: "33%" }],
      minerals: [{ name: "Iron", value: 2.4, unit: "mg", dailyValue: "13%" }],
      healthBenefits: ["Beta-glucan fiber lowers cholesterol."],
    };
    const out = extractJsonObject("```json\n" + JSON.stringify(extended) + "\n```") as typeof extended;
    expect(out?.totalEstimate?.sugar).toBe(0.5);
    expect(out?.foods?.[0]?.fiber).toBe(5);
    expect(out?.vitamins?.[0]?.dailyValue).toBe("33%");
    expect(out?.healthBenefits).toHaveLength(1);
  });
});
