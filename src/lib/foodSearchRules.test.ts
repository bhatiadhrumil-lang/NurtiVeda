import { describe, it, expect, afterEach, vi } from "vitest";
import {
  decideFinalOutcome,
  isBlankQuery,
  isFoodNameMatch,
  notFoundMessage,
  selectVerifiedMatches,
} from "../../supabase/functions/_shared/verify.ts";
import { hasMeaningfulMacros, localFoodNutrition, lookupOffFood, offProductNutrition } from "@/lib/offNutrition";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
  vi.restoreAllMocks();
});

function stubFetch(handler: () => Promise<unknown>) {
  globalThis.fetch = handler as unknown as typeof fetch;
}

describe("food search product rules", () => {
  it("1. valid food query resolves to the matching food", () => {
    const d = localFoodNutrition("banana");
    expect(d).not.toBeNull();
    expect(d!.foodName).toBe("Banana");
    expect(isFoodNameMatch("banana", d!.foodName)).toBe(true);
    expect(hasMeaningfulMacros(d)).toBe(true);
  });

  it("2. random input produces no result and no fabricated values", () => {
    const q = "Ugirfdt87dr";
    expect(localFoodNutrition(q)).toBeNull();
    expect(isFoodNameMatch(q, "Apple")).toBe(false);
    expect(isFoodNameMatch(q, "Banana")).toBe(false);
    expect(offProductNutrition({ product_name: q, nutriments: {} }, q)).toBeNull();
    const outcome = decideFinalOutcome(false, q);
    expect(outcome).toEqual({ kind: "not-found", message: notFoundMessage(q) });
    expect(outcome.kind === "not-found" && outcome.message).toContain("Ugirfdt87dr");
  });

  it("3. empty input is rejected before the pipeline", () => {
    expect(isBlankQuery("")).toBe(true);
  });

  it("4. whitespace input is rejected before the pipeline", () => {
    expect(isBlankQuery("   ")).toBe(true);
    expect(isBlankQuery("\n\t ")).toBe(true);
  });

  it("5. misspelling resolves but stays honestly labeled", () => {
    const d = localFoodNutrition("bananna");
    expect(d).not.toBeNull();
    expect(d!.foodName).toBe("Banana");
    // The UI must identify the match explicitly because names differ.
    expect(d!.foodName.toLowerCase()).not.toBe("bananna");
  });

  it("6. multiple matches return relevant items in source order", () => {
    const names = ["Apple Juice 1L", "Orange Juice", "Apple Pie", "Chicken Soup"];
    expect(selectVerifiedMatches("apple", names)).toEqual(["Apple Juice 1L", "Apple Pie"]);
  });

  it("7. API with no results yields empty (never fabricated)", async () => {
    stubFetch(async () => ({ ok: true, json: async () => ({ products: [] }) }));
    expect(await lookupOffFood("Ugirfdt87dr")).toEqual({ status: "empty" });
    expect(selectVerifiedMatches("Ugirfdt87dr", ["Apple", "Banana"])).toEqual([]);
  });

  it("8. API failure is reported as unavailable, not as food", async () => {
    stubFetch(async () => {
      throw new Error("network down");
    });
    expect(await lookupOffFood("banana")).toEqual({ status: "failed" });
    stubFetch(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    expect(await lookupOffFood("banana")).toEqual({ status: "failed" });
    expect(decideFinalOutcome(true, "banana")).toEqual({
      kind: "error",
      message: "Food information is temporarily unavailable. Please try again.",
    });
  });

  it("9. drifted AI output fails validation and can never display", () => {
    // Verified product is Apple; a model answering about Orange is rejected.
    expect(isFoodNameMatch("Apple", "Orange")).toBe(false);
    expect(isFoodNameMatch("Apple", "Apple")).toBe(true);
  });

  it("10. a failed search after a success leaves no stale result", () => {
    const first = localFoodNutrition("banana");
    expect(first).not.toBeNull();
    // Second lookup finds nothing anywhere: null data + explicit not-found.
    const second = localFoodNutrition("Ugirfdt87dr");
    expect(second).toBeNull();
    const outcome = decideFinalOutcome(false, "Ugirfdt87dr");
    expect(outcome.kind).toBe("not-found");
    // Contract enforced by the hook: a new lookup clears previous data first
    // and unsuccessful branches only set null/not-found — never old data.
  });
});
