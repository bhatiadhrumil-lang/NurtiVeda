import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MealLog {
  id: string;
  meal_name: string;
  meal_type: string;
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  notes: string;
  logged_at: string;
}

const LOCAL_KEY = "nutriveda_meal_logs";

const getLocalLogs = (): MealLog[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLocalLogs = (logs: MealLog[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(logs));
};

export const useMealLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    if (user) {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .order("logged_at", { ascending: false });
      if (error) {
        toast({ title: "Error loading meals", description: error.message, variant: "destructive" });
      } else {
        setLogs(
          (data || []).map((d: any) => ({
            id: d.id,
            meal_name: d.meal_name,
            meal_type: d.meal_type,
            food_items: Array.isArray(d.food_items) ? d.food_items : [],
            calories: Number(d.calories),
            protein: Number(d.protein),
            carbs: Number(d.carbs),
            fat: Number(d.fat),
            fiber: Number(d.fiber),
            notes: d.notes || "",
            logged_at: d.logged_at,
          }))
        );
      }
    } else {
      setLogs(getLocalLogs());
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = async (meal: Omit<MealLog, "id">) => {
    if (user) {
      const { error } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        meal_name: meal.meal_name,
        meal_type: meal.meal_type,
        food_items: meal.food_items as any,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        notes: meal.notes,
        logged_at: meal.logged_at,
      });
      if (error) {
        toast({ title: "Error saving meal", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const newLog: MealLog = { ...meal, id: crypto.randomUUID() };
      const updated = [newLog, ...getLocalLogs()];
      saveLocalLogs(updated);
    }
    toast({ title: "Meal logged!", description: `${meal.meal_name} has been recorded.` });
    fetchLogs();
  };

  const deleteLog = async (id: string) => {
    if (user) {
      const { error } = await supabase.from("meal_logs").delete().eq("id", id);
      if (error) {
        toast({ title: "Error deleting meal", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      saveLocalLogs(getLocalLogs().filter((l) => l.id !== id));
    }
    toast({ title: "Meal deleted" });
    fetchLogs();
  };

  return { logs, isLoading, addLog, deleteLog, fetchLogs };
};
