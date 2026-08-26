import { useState } from "react";
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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY. Add it to your environment variables.");
      }

      const systemPrompt = `You are a nutrition expert. When given a food item, provide detailed nutritional information per 100 grams in JSON format.

Always respond with valid JSON in this exact structure:
{
  "foodName": "the food name",
  "description": "brief description of the food",
  "servingSize": "100g",
  "macronutrients": {
    "calories": { "value": number, "unit": "kcal" },
    "protein": { "value": number, "unit": "g" },
    "carbohydrates": { "value": number, "unit": "g" },
    "fiber": { "value": number, "unit": "g" },
    "sugar": { "value": number, "unit": "g" },
    "fat": { "value": number, "unit": "g" },
    "saturatedFat": { "value": number, "unit": "g" },
    "unsaturatedFat": { "value": number, "unit": "g" }
  },
  "micronutrients": {
    "vitamins": [
      { "name": "Vitamin A", "value": number, "unit": "mcg", "dailyValue": "percentage" },
      { "name": "Vitamin C", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Vitamin D", "value": number, "unit": "mcg", "dailyValue": "percentage" },
      { "name": "Vitamin E", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Vitamin K", "value": number, "unit": "mcg", "dailyValue": "percentage" },
      { "name": "Vitamin B6", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Vitamin B12", "value": number, "unit": "mcg", "dailyValue": "percentage" }
    ],
    "minerals": [
      { "name": "Calcium", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Iron", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Magnesium", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Phosphorus", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Potassium", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Sodium", "value": number, "unit": "mg", "dailyValue": "percentage" },
      { "name": "Zinc", "value": number, "unit": "mg", "dailyValue": "percentage" }
    ]
  },
  "healthBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "ayurvedicProperties": {
    "dosha": "which doshas it balances (Vata/Pitta/Kapha)",
    "taste": "rasa (sweet/sour/salty/bitter/pungent/astringent)",
    "energy": "virya (heating/cooling)",
    "postDigestive": "vipaka effect"
  }
}

Use accurate nutritional data. If exact values are unknown, provide reasonable estimates based on similar foods. Include all vitamins and minerals listed above.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  { text: `Provide detailed nutritional information for: ${foodQuery.trim()}` },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`Failed to get nutrition data (HTTP ${response.status})`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error("No nutrition data received");
      }

      let nutritionData;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const jsonStr = jsonMatch[1].trim();
        nutritionData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse nutrition data:", parseError);
        console.log("Raw content:", content);
        throw new Error("Failed to parse nutrition data");
      }

      setNutritionData(nutritionData);
      toast({
        title: "Nutrition data found!",
        description: `Showing nutrition information for ${nutritionData.foodName}`,
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

  return {
    isLoading,
    nutritionData,
    lookupNutrition,
    clearNutritionData,
  };
};
