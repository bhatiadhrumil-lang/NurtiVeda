import { describe, it, expect } from "vitest";
import { hasMeaningfulMacros, localFoodNutrition } from "@/lib/offNutrition";

// Execution sweep over the text-search path (edge-independent layers):
// every everyday query must resolve to a rich, non-zero card.
const QUERIES = [
  "apple",
  "banana",
  "mango",
  "orange",
  "rice",
  "chicken biryani",
  "roti",
  "dal",
  "masala dosa",
  "idli",
  "poha",
  "paneer",
  "curd",
  "milk",
  "egg",
  "potato",
  "spinach",
  "almonds",
  "oats",
  "fish",
  "samosa",
  "bread",
  "APPLE",
  "  paneer tikka  ",
];

describe("text search execution sweep", () => {
  for (const q of QUERIES) {
    it(`"${q}" resolves to a rich non-zero card`, () => {
      const d = localFoodNutrition(q);
      expect(d, `no result for "${q}"`).not.toBeNull();
      expect(hasMeaningfulMacros(d), `zero macros for "${q}"`).toBe(true);
      expect(d!.micronutrients.vitamins.length, `vitamins for "${q}"`).toBeGreaterThanOrEqual(2);
      expect(d!.micronutrients.minerals.length, `minerals for "${q}"`).toBeGreaterThanOrEqual(2);
      expect(d!.healthBenefits.length, `benefits for "${q}"`).toBeGreaterThanOrEqual(2);
      expect(d!.ayurvedicProperties.dosha.length, `ayurveda for "${q}"`).toBeGreaterThan(0);
    });
  }

  it("unknown foods resolve to null (chain falls through honestly)", () => {
    expect(localFoodNutrition("xyzabc123")).toBeNull();
    expect(localFoodNutrition("")).toBeNull();
  });
});
