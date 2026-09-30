import { describe, it, expect } from "vitest";
import { calculateBMR, calculateCalorieTarget } from "@/hooks/useMealPlans";
import { calculateAge, calcStreak, kgToLb, lbToKg } from "@/lib/health";

describe("calculateBMR", () => {
  it("uses real age instead of hardcoded 30", () => {
    const young = calculateBMR(70, 170, "male", 20);
    const old = calculateBMR(70, 170, "male", 60);
    expect(young).toBeGreaterThan(old);
  });
});

describe("calculateCalorieTarget", () => {
  it("scales with activity level", () => {
    const bmr = 1600;
    const sedentary = calculateCalorieTarget(bmr, "maintenance", "sedentary");
    const active = calculateCalorieTarget(bmr, "maintenance", "active");
    expect(active).toBeGreaterThan(sedentary);
  });

  it("creates deficit for weight loss", () => {
    const bmr = 1600;
    expect(calculateCalorieTarget(bmr, "weight_loss", "light")).toBeLessThan(
      calculateCalorieTarget(bmr, "maintenance", "light")
    );
  });
});

describe("calculateAge", () => {
  it("returns null for missing input", () => {
    expect(calculateAge(null)).toBeNull();
    expect(calculateAge("not-a-date")).toBeNull();
  });
});

describe("units", () => {
  it("round-trips kg/lb", () => {
    expect(lbToKg(kgToLb(70))).toBeCloseTo(70, 0);
  });
});

describe("calcStreak", () => {
  it("counts consecutive days ending today or yesterday", () => {
    const today = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    expect(calcStreak([fmt(today), fmt(y)])).toBe(2);
    expect(calcStreak([])).toBe(0);
  });
});
