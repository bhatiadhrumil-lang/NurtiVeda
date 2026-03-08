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

// Calculate BMR using Mifflin-St Jeor
export const calculateBMR = (weight: number, height: number, gender: string): number => {
  if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * 30 - 161; // Assume age 30
  }
  return 10 * weight + 6.25 * height - 5 * 30 + 5;
};

export const calculateCalorieTarget = (bmr: number, goal: string): number => {
  switch (goal) {
    case "weight_loss": return Math.round(bmr * 1.2 - 500);
    case "muscle_gain": return Math.round(bmr * 1.5);
    case "maintenance": return Math.round(bmr * 1.3);
    case "health": return Math.round(bmr * 1.25);
    default: return Math.round(bmr * 1.3);
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
      setPlans(data.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        diet_type: d.diet_type,
        goal: d.goal,
        daily_calories: d.daily_calories,
        protein_ratio: d.protein_ratio,
        carbs_ratio: d.carbs_ratio,
        fat_ratio: d.fat_ratio,
        meals_per_day: d.meals_per_day,
        tips: d.tips || [],
        substitutions: Array.isArray(d.substitutions) ? d.substitutions : [],
        foods: Array.isArray(d.foods) ? d.foods : [],
        sample_meals: Array.isArray(d.sample_meals) ? d.sample_meals : [],
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
      } as UserMealPlan);
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
      setReminders(data.map((r: any) => ({
        id: r.id,
        meal_type: r.meal_type,
        reminder_time: r.reminder_time,
        is_enabled: r.is_enabled,
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

  const selectPlan = async (planId: string, weight: number, height: number, gender: string) => {
    if (!user) { toast.error("Please sign in first"); return; }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Deactivate existing plan
    await supabase
      .from("user_meal_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const bmr = calculateBMR(weight, height, gender);
    const calorieTarget = calculateCalorieTarget(bmr, plan.goal);
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
