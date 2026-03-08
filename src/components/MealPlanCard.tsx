import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Flame, Beef, Wheat, Droplets } from "lucide-react";
import type { MealPlan } from "@/hooks/useMealPlans";

interface MealPlanCardProps {
  plan: MealPlan;
  isSelected: boolean;
  onSelect: () => void;
}

const goalLabels: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  health: "Health Boost",
};

const dietLabels: Record<string, string> = {
  keto: "Keto",
  mediterranean: "Mediterranean",
  vegan: "Vegan",
  paleo: "Paleo",
  balanced: "Balanced",
};

const dietColors: Record<string, string> = {
  keto: "bg-destructive/10 text-destructive border-destructive/30",
  mediterranean: "bg-primary/10 text-primary border-primary/30",
  vegan: "bg-accent text-accent-foreground border-accent-foreground/30",
  paleo: "bg-secondary/10 text-secondary border-secondary/30",
  balanced: "bg-muted text-muted-foreground border-border",
};

const MealPlanCard = ({ plan, isSelected, onSelect }: MealPlanCardProps) => {
  return (
    <Card className={`border-border/50 transition-all hover:shadow-lg cursor-pointer ${isSelected ? 'ring-2 ring-primary border-primary/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-serif">{plan.name}</CardTitle>
            <CardDescription className="mt-1 text-sm">{plan.description}</CardDescription>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className={dietColors[plan.diet_type] || ""}>
            {dietLabels[plan.diet_type] || plan.diet_type}
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Target className="w-3 h-3 mr-1" />
            {goalLabels[plan.goal] || plan.goal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-destructive">
            <Flame className="w-3.5 h-3.5" />
            <span>{plan.daily_calories} cal/day</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Beef className="w-3.5 h-3.5" />
            <span>{Math.round(plan.protein_ratio * 100)}% protein</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <Wheat className="w-3.5 h-3.5" />
            <span>{Math.round(plan.carbs_ratio * 100)}% carbs</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'hsl(var(--golden))' }}>
            <Droplets className="w-3.5 h-3.5" />
            <span>{Math.round(plan.fat_ratio * 100)}% fat</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {plan.meals_per_day} meals/day · {plan.foods.length} foods
        </div>
        <Button
          className="w-full"
          variant={isSelected ? "secondary" : "default"}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          {isSelected ? "Currently Active" : "Select This Plan"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealPlanCard;
