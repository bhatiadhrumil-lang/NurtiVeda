import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodQuery } = await req.json();

    if (!foodQuery) {
      return new Response(
        JSON.stringify({ error: 'Food query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Looking up nutrition for:", foodQuery);

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Provide detailed nutritional information for: ${foodQuery}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get nutrition data" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "No nutrition data received" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let nutritionData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      nutritionData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse nutrition data:", parseError);
      console.log("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse nutrition data", rawContent: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Successfully retrieved nutrition data for:", foodQuery);

    return new Response(
      JSON.stringify({ success: true, data: nutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in nutrition-lookup function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
