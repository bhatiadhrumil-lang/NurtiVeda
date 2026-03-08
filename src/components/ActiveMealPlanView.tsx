import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplets, ChefHat, Lightbulb, ArrowLeftRight, Clock, X } from "lucide-react";
import type { UserMealPlan, SampleMeal } from "@/hooks/useMealPlans";

interface ActiveMealPlanViewProps {
  userPlan: UserMealPlan;
  onDeactivate: () => void;
}

const mealIcons: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "🍎",
};

const ActiveMealPlanView = ({ userPlan, onDeactivate }: ActiveMealPlanViewProps) => {
  const plan = userPlan.meal_plan;
  if (!plan) return null;

  const totalCal = userPlan.daily_calorie_target;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
              <CardDescription className="mt-1">{plan.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={onDeactivate}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium mb-3 text-foreground">Your Personalized Daily Targets</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-background border border-border/50">
              <Flame className="w-5 h-5 mx-auto text-destructive mb-1" />
              <p className="text-lg font-bold text-foreground">{totalCal}</p>
              <p className="text-[10px] text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border/50">
              <Beef className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{userPlan.protein_grams}g</p>
              <p className="text-[10px] text-muted-foreground">Protein</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border/50">
              <Wheat className="w-5 h-5 mx-auto text-secondary mb-1" />
              <p className="text-lg font-bold text-foreground">{userPlan.carbs_grams}g</p>
              <p className="text-[10px] text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background border border-border/50">
              <Droplets className="w-5 h-5 mx-auto mb-1" style={{ color: 'hsl(var(--golden))' }} />
              <p className="text-lg font-bold text-foreground">{userPlan.fat_grams}g</p>
              <p className="text-[10px] text-muted-foreground">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample meals */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            Daily Meal Schedule
          </CardTitle>
          <CardDescription>Step-by-step meal ideas with preparation instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {plan.sample_meals.map((meal: SampleMeal, i: number) => (
              <AccordionItem key={i} value={`meal-${i}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-xl">{mealIcons[meal.meal] || "🍽️"}</span>
                    <div>
                      <p className="font-semibold text-sm">{meal.name}</p>
                      <p className="text-xs text-muted-foreground">{meal.meal} · {meal.calories} cal · {meal.portion}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ingredients</p>
                    <div className="flex flex-wrap gap-1">
                      {meal.items.map((item, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Preparation</p>
                    <p className="text-sm text-foreground">{meal.prep}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Portion: {meal.portion}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{meal.calories} cal</span>
                  </div>
                  {/* Calorie contribution bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Calorie contribution</span>
                      <span>{Math.round((meal.calories / totalCal) * 100)}% of daily target</span>
                    </div>
                    <Progress value={(meal.calories / totalCal) * 100} className="h-1.5" />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: 'hsl(var(--golden))' }} />
              Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Substitutions */}
      {plan.substitutions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-secondary" />
              Food Substitutions
            </CardTitle>
            <CardDescription>Swap ingredients without breaking your plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.substitutions.map((sub, i) => (
                <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                  <Badge variant="outline">{sub.original}</Badge>
                  <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Badge variant="secondary">{sub.substitute}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allowed foods */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Allowed Foods</CardTitle>
          <CardDescription>Choose freely from these options to build your meals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {plan.foods.map((food, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-accent/50">{food}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveMealPlanView;
