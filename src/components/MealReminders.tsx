import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Trash2, Plus } from "lucide-react";
import type { MealReminder } from "@/hooks/useMealPlans";

interface MealRemindersProps {
  reminders: MealReminder[];
  onAdd: (mealType: string, time: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

const MealReminders = ({ reminders, onAdd, onToggle, onDelete }: MealRemindersProps) => {
  const [newMealType, setNewMealType] = useState("breakfast");
  const [newTime, setNewTime] = useState("08:00");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    onAdd(newMealType, newTime);
    setShowAdd(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Meal Reminders
            </CardTitle>
            <CardDescription>Set reminders to stay on track</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="flex gap-2 items-end p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex-1">
              <Select value={newMealType} onValueChange={setNewMealType}>
                <SelectTrigger className="h-9">
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
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-32 h-9"
            />
            <Button size="sm" onClick={handleAdd}>Save</Button>
          </div>
        )}
        {reminders.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground text-center py-4">No reminders set. Add one to stay on track!</p>
        )}
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {r.meal_type === "breakfast" ? "🌅" : r.meal_type === "lunch" ? "☀️" : r.meal_type === "dinner" ? "🌙" : "🍎"}
              </span>
              <div>
                <p className="text-sm font-medium capitalize">{r.meal_type}</p>
                <p className="text-xs text-muted-foreground">{r.reminder_time?.slice(0, 5)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_enabled} onCheckedChange={(v) => onToggle(r.id, v)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(r.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MealReminders;
