import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, X, Sparkles } from "lucide-react";
import { useNutritionLookup } from "@/hooks/useNutritionLookup";
import type { MealLog } from "@/hooks/useMealLogs";

interface MealLogFormProps {
  onSubmit: (meal: Omit<MealLog, "id">) => Promise<void>;
  onUpdate?: (id: string, meal: Omit<MealLog, "id">) => Promise<void>;
  editing?: MealLog | null;
  onCancelEdit?: () => void;
}

function toDateInputValue(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

const MealLogForm = ({ onSubmit, onUpdate, editing, onCancelEdit }: MealLogFormProps) => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [foodItems, setFoodItems] = useState("");
  const [notes, setNotes] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lookupQuery, setLookupQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading: lookupLoading, lookupNutrition, nutritionData, clearNutritionData } = useNutritionLookup();

  useEffect(() => {
    if (editing) {
      setMealName(editing.meal_name);
      setMealType(editing.meal_type);
      setCalories(String(editing.calories || ""));
      setProtein(String(editing.protein || ""));
      setCarbs(String(editing.carbs || ""));
      setFat(String(editing.fat || ""));
      setFiber(String(editing.fiber || ""));
      setFoodItems(editing.food_items.join(", "));
      setNotes(editing.notes || "");
      setLogDate(toDateInputValue(editing.logged_at));
    }
  }, [editing]);

  useEffect(() => {
    if (nutritionData) {
      const m = nutritionData.macronutrients;
      if (!mealName) setMealName(nutritionData.foodName);
      setCalories(String(m.calories.value));
      setProtein(String(m.protein.value));
      setCarbs(String(m.carbohydrates.value));
      setFat(String(m.fat.value));
      setFiber(String(m.fiber.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutritionData]);

  const reset = () => {
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setFiber("");
    setFoodItems("");
    setNotes("");
    setLogDate(new Date().toISOString().slice(0, 10));
    setLookupQuery("");
    clearNutritionData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    setIsSubmitting(true);
    const payload = {
      meal_name: mealName.trim(),
      meal_type: mealType,
      food_items: foodItems.split(",").map((s) => s.trim()).filter(Boolean),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      notes: notes.trim(),
      logged_at: new Date(`${logDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString(),
    };
    if (editing && onUpdate) {
      await onUpdate(editing.id, payload);
      onCancelEdit?.();
    } else {
      await onSubmit(payload);
    }
    reset();
    setIsSubmitting(false);
  };

  return (
    <Card className="border-border/50 shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          {editing ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
          {editing ? "Edit Meal" : "Log a Meal"}
          {editing && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => { onCancelEdit?.(); reset(); }}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!editing && (
          <div className="flex gap-2 mb-4 p-3 rounded-lg bg-accent/40 border border-border/50">
            <Input
              placeholder="Autofill from AI: e.g. masala dosa"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookupNutrition(lookupQuery); } }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={lookupLoading || !lookupQuery.trim()}
              onClick={() => lookupNutrition(lookupQuery)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {lookupLoading ? "..." : "Autofill"}
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meal-name">Meal Name *</Label>
              <Input id="meal-name" placeholder="e.g. Grilled Chicken Salad" value={mealName} onChange={(e) => setMealName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-date">Date</Label>
              <Input id="log-date" type="date" max={new Date().toISOString().slice(0, 10)} value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="food-items">Food Items (comma separated)</Label>
            <Input id="food-items" placeholder="e.g. chicken breast, lettuce, tomato, olive oil" value={foodItems} onChange={(e) => setFoodItems(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label htmlFor="calories" className="text-xs">Calories</Label>
              <Input id="calories" type="number" min="0" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="protein" className="text-xs">Protein (g)</Label>
              <Input id="protein" type="number" min="0" step="0.1" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="carbs" className="text-xs">Carbs (g)</Label>
              <Input id="carbs" type="number" min="0" step="0.1" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fat" className="text-xs">Fat (g)</Label>
              <Input id="fat" type="number" min="0" step="0.1" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fiber" className="text-xs">Fiber (g)</Label>
              <Input id="fiber" type="number" min="0" step="0.1" placeholder="0" value={fiber} onChange={(e) => setFiber(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="How did you feel after this meal?" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (editing ? "Saving..." : "Logging...") : editing ? "Save Changes" : "Log Meal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealLogForm;
