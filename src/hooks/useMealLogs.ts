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
const MIGRATED_KEY = "nutriveda_meal_logs_migrated";

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
          (data || []).map((d: Record<string, unknown>) => ({
            id: String(d.id),
            meal_name: String(d.meal_name ?? ""),
            meal_type: String(d.meal_type ?? "snack"),
            food_items: Array.isArray(d.food_items) ? (d.food_items as string[]) : [],
            calories: Number(d.calories ?? 0),
            protein: Number(d.protein ?? 0),
            carbs: Number(d.carbs ?? 0),
            fat: Number(d.fat ?? 0),
            fiber: Number(d.fiber ?? 0),
            notes: typeof d.notes === "string" ? d.notes : "",
            logged_at: String(d.logged_at ?? new Date().toISOString()),
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

  // One-time migration: guest localStorage logs -> Supabase on first login.
  useEffect(() => {
    const migrate = async () => {
      if (!user) return;
      try {
        if (localStorage.getItem(MIGRATED_KEY)) return;
        const local = getLocalLogs();
        if (local.length === 0) {
          localStorage.setItem(MIGRATED_KEY, "1");
          return;
        }
        const rows = local.map((l) => ({
          user_id: user.id,
          meal_name: l.meal_name,
          meal_type: l.meal_type,
          food_items: l.food_items,
          calories: l.calories,
          protein: l.protein,
          carbs: l.carbs,
          fat: l.fat,
          fiber: l.fiber,
          notes: l.notes,
          logged_at: l.logged_at,
        }));
        const { error } = await supabase.from("meal_logs").insert(rows);
        if (!error) {
          localStorage.setItem(MIGRATED_KEY, "1");
          saveLocalLogs([]);
          fetchLogs();
          toast({ title: "Guest meals synced!", description: `${rows.length} offline meal(s) moved to your account.` });
        }
      } catch {
        /* ignore migration errors */
      }
    };
    migrate();
  }, [user]);

  const addLog = async (meal: Omit<MealLog, "id">) => {
    if (user) {
      const { error } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        meal_name: meal.meal_name,
        meal_type: meal.meal_type,
        food_items: meal.food_items,
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

  const updateLog = async (id: string, meal: Omit<MealLog, "id">) => {
    if (user) {
      const { error } = await supabase
        .from("meal_logs")
        .update({
          meal_name: meal.meal_name,
          meal_type: meal.meal_type,
          food_items: meal.food_items,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
          notes: meal.notes,
          logged_at: meal.logged_at,
        })
        .eq("id", id);
      if (error) {
        toast({ title: "Error updating meal", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      saveLocalLogs(getLocalLogs().map((l) => (l.id === id ? { ...meal, id } : l)));
    }
    toast({ title: "Meal updated!" });
    fetchLogs();
  };

  return { logs, isLoading, addLog, updateLog, deleteLog, fetchLogs };
};
