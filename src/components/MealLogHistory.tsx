import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { format } from "date-fns";
import type { MealLog } from "@/hooks/useMealLogs";

interface MealLogHistoryProps {
  logs: MealLog[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const mealTypeColors: Record<string, string> = {
  breakfast: "bg-golden/20 text-golden border-golden/30",
  lunch: "bg-primary/10 text-primary border-primary/30",
  dinner: "bg-secondary/10 text-secondary border-secondary/30",
  snack: "bg-muted text-muted-foreground border-border",
};

const MealLogHistory = ({ logs, onDelete, isLoading }: MealLogHistoryProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">Loading meals...</CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-serif">No meals logged yet</p>
          <p className="text-sm mt-1">Start by logging your first meal above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <Card key={log.id} className="border-border/50 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-foreground truncate">{log.meal_name}</h3>
                  <Badge variant="outline" className={mealTypeColors[log.meal_type] || ""}>
                    {log.meal_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  {format(new Date(log.logged_at), "MMM d, yyyy · h:mm a")}
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1 text-destructive"><Flame className="w-3 h-3" />{log.calories} cal</span>
                  <span className="flex items-center gap-1 text-primary"><Beef className="w-3 h-3" />{log.protein}g protein</span>
                  <span className="flex items-center gap-1 text-secondary"><Wheat className="w-3 h-3" />{log.carbs}g carbs</span>
                  <span className="flex items-center gap-1 text-golden"><Droplets className="w-3 h-3" />{log.fat}g fat</span>
                </div>
                {log.food_items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {log.food_items.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{item}</Badge>
                    ))}
                  </div>
                )}
                {log.notes && <p className="text-xs text-muted-foreground mt-2 italic">{log.notes}</p>}
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(log.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MealLogHistory;
