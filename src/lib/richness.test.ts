import { describe, it, expect } from "vitest";
import { localFoodNutrition } from "@/lib/offNutrition";

// Richness bar for text search: a result should carry real detail, not just
// macros — vitamins, minerals (with %DV), benefits and a real description.
describe("text search result richness", () => {
  const apple = localFoodNutrition("apple");

  it("provides a descriptive (non-stub) description", () => {
    expect(apple).not.toBeNull();
    expect(apple!.description.length).toBeGreaterThan(40);
  });

  it("includes vitamins with values and %DV", () => {
    expect(apple!.micronutrients.vitamins.length).toBeGreaterThanOrEqual(5);
    for (const v of apple!.micronutrients.vitamins) {
      expect(v.value).toBeGreaterThan(0);
      expect(v.dailyValue).toMatch(/%/);
    }
  });

  it("includes minerals with values and %DV", () => {
    expect(apple!.micronutrients.minerals.length).toBeGreaterThanOrEqual(5);
    for (const m of apple!.micronutrients.minerals) {
      expect(m.value).toBeGreaterThan(0);
      expect(m.dailyValue).toMatch(/%/);
    }
  });

  it("includes multiple health benefits", () => {
    expect(apple!.healthBenefits.length).toBeGreaterThanOrEqual(2);
  });

  it("every built-in food meets the richness bar", () => {
    const probes = ["banana", "dal", "paneer", "chicken", "rice", "spinach", "oats", "dosa", "milk", "egg"];
    for (const q of probes) {
      const d = localFoodNutrition(q);
      expect(d, q).not.toBeNull();
      expect(d!.micronutrients.vitamins.length, `${q} vitamins`).toBeGreaterThanOrEqual(2);
      expect(d!.micronutrients.minerals.length, `${q} minerals`).toBeGreaterThanOrEqual(2);
      expect(d!.healthBenefits.length, `${q} benefits`).toBeGreaterThanOrEqual(2);
    }
  });
});
