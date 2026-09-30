import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SampleMeal {
  meal: string;
  name: string;
  items: string[];
  calories: number;
  prep: string;
  portion: string;
}

export interface Substitution {
  original: string;
  substitute: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  diet_type: string;
  goal: string;
  daily_calories: number;
  protein_ratio: number;
  carbs_ratio: number;
  fat_ratio: number;
  meals_per_day: number;
  tips: string[];
  substitutions: Substitution[];
  foods: string[];
  sample_meals: SampleMeal[];
}

export interface UserMealPlan {
  id: string;
  user_id: string;
  meal_plan_id: string;
  daily_calorie_target: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  start_date: string;
  is_active: boolean;
  progress_notes: string[];
  meal_plan?: MealPlan;
}

export interface MealReminder {
  id: string;
  meal_type: string;
  reminder_time: string;
  is_enabled: boolean;
}

// Mifflin-St Jeor with real age + activity multiplier.
// BMR * activity = TDEE, then goal adjustment.
export const calculateBMR = (weight: number, height: number, gender: string, age?: number | null): number => {
  const a = age && age > 0 ? age : 30;
  if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * a - 161;
  }
  return 10 * weight + 6.25 * height - 5 * a + 5;
};

export const calculateCalorieTarget = (bmr: number, goal: string, activityLevel?: string | null): number => {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const activity = multipliers[activityLevel ?? ""] ?? 1.375;
  const tdee = bmr * activity;
  switch (goal) {
    case "weight_loss": return Math.round(tdee - 500);
    case "muscle_gain": return Math.round(tdee + 250);
    case "maintenance": return Math.round(tdee);
    case "health": return Math.round(tdee - 100);
    default: return Math.round(tdee);
  }
};

export const useMealPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<UserMealPlan | null>(null);
  const [reminders, setReminders] = useState<MealReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data } = await supabase.from("meal_plans").select("*");
    if (data) {
      setPlans(data.map((d: Record<string, unknown>) => ({
        id: String(d.id),
        name: String(d.name ?? ""),
        description: String(d.description ?? ""),
        diet_type: String(d.diet_type ?? ""),
        goal: String(d.goal ?? ""),
        daily_calories: Number(d.daily_calories ?? 0),
        protein_ratio: Number(d.protein_ratio ?? 0),
        carbs_ratio: Number(d.carbs_ratio ?? 0),
        fat_ratio: Number(d.fat_ratio ?? 0),
        meals_per_day: Number(d.meals_per_day ?? 3),
        tips: Array.isArray(d.tips) ? (d.tips as string[]) : [],
        substitutions: Array.isArray(d.substitutions) ? (d.substitutions as Substitution[]) : [],
        foods: Array.isArray(d.foods) ? (d.foods as string[]) : [],
        sample_meals: Array.isArray(d.sample_meals) ? (d.sample_meals as SampleMeal[]) : [],
      })));
    }
  }, []);

  const fetchActivePlan = useCallback(async () => {
    if (!user) { setActivePlan(null); return; }
    const { data } = await supabase
      .from("user_meal_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      // Fetch the associated meal plan
      const { data: planData } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("id", data.meal_plan_id)
        .single();

      setActivePlan({
        ...data,
        progress_notes: data.progress_notes || [],
        meal_plan: planData ? {
          id: planData.id,
          name: planData.name,
          description: planData.description,
          diet_type: planData.diet_type,
          goal: planData.goal,
          daily_calories: planData.daily_calories,
          protein_ratio: planData.protein_ratio,
          carbs_ratio: planData.carbs_ratio,
          fat_ratio: planData.fat_ratio,
          meals_per_day: planData.meals_per_day,
          tips: planData.tips || [],
          substitutions: Array.isArray(planData.substitutions) ? planData.substitutions : [],
          foods: Array.isArray(planData.foods) ? planData.foods : [],
          sample_meals: Array.isArray(planData.sample_meals) ? planData.sample_meals : [],
        } : undefined,
      } as unknown as UserMealPlan);
    } else {
      setActivePlan(null);
    }
  }, [user]);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("meal_reminders")
      .select("*")
      .eq("user_id", user.id);
    if (data) {
      setReminders(data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        meal_type: String(r.meal_type ?? "snack"),
        reminder_time: String(r.reminder_time ?? ""),
        is_enabled: Boolean(r.is_enabled),
      })));
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlans(), fetchActivePlan(), fetchReminders()]);
      setIsLoading(false);
    };
    load();
  }, [fetchPlans, fetchActivePlan, fetchReminders]);

  const selectPlan = async (planId: string, weight: number, height: number, gender: string, age?: number | null, activityLevel?: string | null) => {
    if (!user) { toast.error("Please sign in first"); return; }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Deactivate existing plan
    await supabase
      .from("user_meal_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const bmr = calculateBMR(weight, height, gender, age);
    const calorieTarget = calculateCalorieTarget(bmr, plan.goal, activityLevel);
    const proteinGrams = Math.round((calorieTarget * plan.protein_ratio) / 4);
    const carbsGrams = Math.round((calorieTarget * plan.carbs_ratio) / 4);
    const fatGrams = Math.round((calorieTarget * plan.fat_ratio) / 9);

    const { error } = await supabase.from("user_meal_plans").insert({
      user_id: user.id,
      meal_plan_id: planId,
      daily_calorie_target: calorieTarget,
      protein_grams: proteinGrams,
      carbs_grams: carbsGrams,
      fat_grams: fatGrams,
    });

    if (error) {
      toast.error("Failed to select meal plan");
    } else {
      toast.success(`${plan.name} plan activated!`);
      await fetchActivePlan();
    }
  };

  const deactivatePlan = async () => {
    if (!user || !activePlan) return;
    await supabase
      .from("user_meal_plans")
      .update({ is_active: false })
      .eq("id", activePlan.id);
    setActivePlan(null);
    toast.success("Meal plan deactivated");
  };

  const addReminder = async (mealType: string, time: string) => {
    if (!user) return;
    const { error } = await supabase.from("meal_reminders").insert({
      user_id: user.id,
      meal_type: mealType,
      reminder_time: time,
    });
    if (!error) {
      toast.success("Reminder added");
      fetchReminders();
    }
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    await supabase.from("meal_reminders").update({ is_enabled: enabled }).eq("id", id);
    fetchReminders();
  };

  const deleteReminder = async (id: string) => {
    await supabase.from("meal_reminders").delete().eq("id", id);
    fetchReminders();
  };

  return {
    plans, activePlan, reminders, isLoading,
    selectPlan, deactivatePlan,
    addReminder, toggleReminder, deleteReminder,
  };
};
