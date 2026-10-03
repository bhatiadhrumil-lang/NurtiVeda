import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSearchHistory, pushSearchHistory } from "@/lib/health";
import { hasMeaningfulMacros, localFoodNutrition, lookupOffFood, offProductNutrition } from "@/lib/offNutrition";
import {
  decideFinalOutcome,
  isBlankQuery,
  isFoodNameMatch,
} from "../../supabase/functions/_shared/verify.ts";

export interface NutritionData {
  foodName: string;
  description: string;
  servingSize: string;
  macronutrients: {
    calories: { value: number; unit: string };
    protein: { value: number; unit: string };
    carbohydrates: { value: number; unit: string };
    fiber: { value: number; unit: string };
    sugar: { value: number; unit: string };
    fat: { value: number; unit: string };
    saturatedFat: { value: number; unit: string };
    unsaturatedFat: { value: number; unit: string };
  };
  micronutrients: {
    vitamins: Array<{ name: string; value: number; unit: string; dailyValue: string }>;
    minerals: Array<{ name: string; value: number; unit: string; dailyValue: string }>;
  };
  healthBenefits: string[];
  ayurvedicProperties: {
    dosha: string;
    taste: string;
    energy: string;
    postDigestive: string;
  };
}

export const useNutritionLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [lastMatches, setLastMatches] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());
  const { toast } = useToast();

  const showResult = (data: NutritionData, query: string, matchedName: string, source: string) => {
    setNutritionData(data);
    setNotFound(null);
    toast({
      title: "Nutrition data found!",
      description:
        matchedName.toLowerCase() !== query.toLowerCase()
          ? `Showing ${source} for '${matchedName}' (you searched '${query}').`
          : `Showing ${source} for ${matchedName}.`,
    });
  };

  const lookupNutrition = async (foodQuery: string) => {
    const query = foodQuery.trim();
    if (isBlankQuery(query)) {
      toast({
        title: "Please enter a food item",
        description: "Type the name of a food to search for its nutrition information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // A new search always clears the previous result AND any previous
    // not-found state, so stale data can never pose as a fresh answer.
    setNutritionData(null);
    setNotFound(null);
    setLastMatches([]);
    pushSearchHistory(query);
    setHistory(getSearchHistory());

    const TIMEOUT_MS = 30_000;

    // Verified chain — every stage must prove the result matches the query:
    // 1. Edge AI lookup (verified match + validated AI output)
    // 2. Built-in reference database (curated keyword match)
    // 3. Open Food Facts direct (name-verified products only)
    // Misses everywhere become an explicit "not found" state; source
    // failures become "temporarily unavailable". Nothing is fabricated.
    let sourceFailed = false;
    try {
      try {
        const result = await Promise.race([
          supabase.functions.invoke("nutrition-lookup", {
            body: { foodQuery: query },
          }),
          new Promise<{ data: null; error: Error }>((_, reject) =>
            setTimeout(() => reject(new Error("Response timed out.")), TIMEOUT_MS)
          ),
        ]);
        const { data, error } = result as { data: unknown; error: unknown };

        if (!error) {
          const body = data as {
            success?: boolean;
            data?: NutritionData;
            match?: { name?: string };
            matches?: unknown;
          } | null;
          const candidate = body?.success ? body.data : undefined;
          const matchName = typeof body?.match?.name === "string" ? body.match.name : "";
          if (
            candidate?.foodName &&
            matchName &&
            isFoodNameMatch(query, matchName) &&
            hasMeaningfulMacros(candidate)
          ) {
            const others = Array.isArray(body?.matches)
              ? (body.matches as unknown[]).filter(
                  (m): m is string => typeof m === "string" && m.toLowerCase() !== matchName.toLowerCase(),
                ).slice(0, 4)
              : [];
            setLastMatches(others);
            showResult(candidate, query, matchName, "nutrition information");
            return;
          }
          console.warn("Edge result failed validation; trying other sources.");
        } else if (error instanceof FunctionsHttpError) {
          const status = (error as { status?: number }).status;
          const payload = await error.context.json().catch(() => null);
          if (status === 404 || (payload as { error?: string } | null)?.error === "NOT_FOUND") {
            console.warn("Edge lookup: no verified match; trying other sources.");
          } else {
            console.warn("Edge lookup failed; trying other sources:", status);
            sourceFailed = true;
          }
        } else if (error) {
          console.warn("Edge lookup unreachable; trying other sources.");
          sourceFailed = true;
        }
      } catch (edgeError) {
        console.warn("Edge lookup threw; trying other sources.", edgeError);
        sourceFailed = true;
      }

      const localData = localFoodNutrition(query);
      if (localData) {
        showResult(localData, query, localData.foodName, "reference values");
        return;
      }

      const off = await lookupOffFood(query);
      if (off.status === "found") {
        showResult(off.data, query, off.data.foodName, "live product data (Open Food Facts)");
        return;
      }
      if (off.status === "failed") sourceFailed = true;

      const outcome = decideFinalOutcome(sourceFailed, query);
      if (outcome.kind === "error") {
        toast({ title: "Search unavailable", description: outcome.message, variant: "destructive" });
      } else {
        setNotFound(query);
        toast({ title: "No food found", description: outcome.message });
      }
    } catch (error) {
      console.error("Error looking up nutrition:", error);
      toast({
        title: "Failed to get nutrition data",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearNutritionData = () => {
    setNutritionData(null);
    setNotFound(null);
    setLastMatches([]);
  };

  const lookupByBarcode = async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;
    setIsLoading(true);
    setNutritionData(null);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_en,nutriments`);
      const json = (await res.json()) as { status?: number; product?: { product_name?: string; product_name_en?: string; nutriments?: Record<string, unknown> } };
      if (json?.status !== 1 || !json.product) throw new Error("Product not found for this barcode.");
      const mapped = offProductNutrition(json.product, `Barcode ${code}`);
      if (!mapped) throw new Error("This product has no nutrition data on Open Food Facts.");
      setNutritionData(mapped);
      pushSearchHistory(mapped.foodName);
      setHistory(getSearchHistory());
      toast({ title: "Product found!", description: `Showing nutrition for ${mapped.foodName}` });
    } catch (error) {
      toast({
        title: "Barcode lookup failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    nutritionData,
    notFound,
    lastMatches,
    history,
    lookupNutrition,
    lookupByBarcode,
    clearNutritionData,
  };
};
