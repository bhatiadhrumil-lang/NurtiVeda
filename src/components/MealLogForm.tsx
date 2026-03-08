import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { MealLog } from "@/hooks/useMealLogs";

interface MealLogFormProps {
  onSubmit: (meal: Omit<MealLog, "id">) => Promise<void>;
}

const MealLogForm = ({ onSubmit }: MealLogFormProps) => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [foodItems, setFoodItems] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    setIsSubmitting(true);
    await onSubmit({
      meal_name: mealName.trim(),
      meal_type: mealType,
      food_items: foodItems.split(",").map((s) => s.trim()).filter(Boolean),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      notes: notes.trim(),
      logged_at: new Date().toISOString(),
    });
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setFiber("");
    setFoodItems("");
    setNotes("");
    setIsSubmitting(false);
  };

  return (
    <Card className="border-border/50 shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Log a Meal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name *</Label>
              <Input id="meal-name" placeholder="e.g. Grilled Chicken Salad" value={mealName} onChange={(e) => setMealName(e.target.value)} required />
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
              <Input id="protein" type="number" min="0" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="carbs" className="text-xs">Carbs (g)</Label>
              <Input id="carbs" type="number" min="0" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fat" className="text-xs">Fat (g)</Label>
              <Input id="fat" type="number" min="0" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fiber" className="text-xs">Fiber (g)</Label>
              <Input id="fiber" type="number" min="0" placeholder="0" value={fiber} onChange={(e) => setFiber(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="How did you feel after this meal?" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging..." : "Log Meal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealLogForm;
