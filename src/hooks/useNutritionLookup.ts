import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMockNutrition } from "@/lib/mockNutrition";
import { getSearchHistory, pushSearchHistory } from "@/lib/health";
import { hasMeaningfulMacros, localFoodNutrition, lookupOffFood, offProductNutrition } from "@/lib/offNutrition";

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
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());
  const { toast } = useToast();

  const lookupNutrition = async (foodQuery: string) => {
    if (!foodQuery.trim()) {
      toast({
        title: "Please enter a food item",
        description: "Type the name of a food to search for its nutrition information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNutritionData(null);
    pushSearchHistory(foodQuery.trim());
    setHistory(getSearchHistory());

    const TIMEOUT_MS = 30_000;

    // Resilient chain — text search must work with proper details even when
    // the Edge Function is down, undeployed, or returns empty (all-zero) data:
    // 1. Edge AI lookup (richest: full micros + benefits + ayurveda)
    // 2. Built-in reference database (curated macros + micros + ayurveda)
    // 3. Open Food Facts direct (real packaged-food data, no key needed)
    // 4. Clearly-labeled demo fallback (last resort only)
    try {
      try {
        const result = await Promise.race([
          supabase.functions.invoke("nutrition-lookup", {
            body: { foodQuery: foodQuery.trim() },
          }),
          new Promise<{ data: null; error: Error }>((_, reject) =>
            setTimeout(() => reject(new Error("Response timed out.")), TIMEOUT_MS)
          ),
        ]);
        const { data, error } = result as { data: unknown; error: unknown };

        if (!error && (data as { success?: boolean; data?: NutritionData } | null)?.success) {
          const candidate = (data as { data: NutritionData }).data;
          if (hasMeaningfulMacros(candidate)) {
            setNutritionData(candidate);
            toast({
              title: "Nutrition data found!",
              description: `Showing nutrition information for ${candidate.foodName}`,
            });
            return;
          }
          console.warn("Edge lookup returned empty macros; trying other sources.");
        } else if (error instanceof FunctionsHttpError) {
          console.warn("Edge lookup failed; trying other sources:", error.status);
        } else if (error) {
          console.warn("Edge lookup unreachable; trying other sources.");
        }
      } catch (edgeError) {
        console.warn("Edge lookup threw; trying other sources.", edgeError);
      }

      const localData = localFoodNutrition(foodQuery);
      if (localData) {
        setNutritionData(localData);
        toast({
          title: "Nutrition data found!",
          description: `Reference values for ${localData.foodName}.`,
        });
        return;
      }

      const offData = await lookupOffFood(foodQuery);
      if (offData) {
        setNutritionData(offData);
        toast({
          title: "Nutrition data found!",
          description: `Live product data for ${offData.foodName} (Open Food Facts).`,
        });
        return;
      }

      const fallback = getMockNutrition(foodQuery);
      setNutritionData(fallback);
      toast({
        title: "Showing sample nutrition data",
        description:
          "Live sources are unreachable right now — these are clearly-labeled demo values for " +
          fallback.foodName +
          ".",
      });
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
    history,
    lookupNutrition,
    lookupByBarcode,
    clearNutritionData,
  };
};
