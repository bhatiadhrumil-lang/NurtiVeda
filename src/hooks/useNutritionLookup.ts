import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

    try {
      const { data, error } = await supabase.functions.invoke("nutrition-lookup", {
        body: { foodQuery: foodQuery.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.data) {
        setNutritionData(data.data);
        toast({
          title: "Nutrition data found!",
          description: `Showing nutrition information for ${data.data.foodName}`,
        });
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
  };

  return {
    isLoading,
    nutritionData,
    lookupNutrition,
    clearNutritionData,
  };
};
