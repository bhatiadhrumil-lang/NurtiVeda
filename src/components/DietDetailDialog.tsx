import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Flame, Droplets, Wheat, Beef, Pill, Apple } from "lucide-react";

export interface DietNutrition {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  foods: string[];
  dailyCalories: number;
  macronutrients: {
    protein: { grams: number; percentage: number };
    carbohydrates: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
    fiber: { grams: number };
    sugar: { grams: number };
    saturatedFat: { grams: number };
  };
  micronutrients: {
    vitamins: Array<{ name: string; amount: string; dailyValue: number }>;
    minerals: Array<{ name: string; amount: string; dailyValue: number }>;
  };
  benefits: string[];
}

interface DietDetailDialogProps {
  diet: DietNutrition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DietDetailDialog = ({ diet, open, onOpenChange }: DietDetailDialogProps) => {
  if (!diet) return null;

  const getColorClasses = (color: string) => {
    switch (color) {
      case "terracotta":
        return "bg-terracotta/10 text-terracotta";
      case "sage":
        return "bg-sage/10 text-sage";
      case "golden":
        return "bg-golden/10 text-golden";
      case "forest":
        return "bg-forest/10 text-forest";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getColorClasses(diet.color)}`}>
              <diet.icon className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="font-serif text-2xl">{diet.name} Diet</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{diet.description}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Daily Calories */}
        <div className="bg-gradient-to-r from-primary/10 to-sage/10 rounded-xl p-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-terracotta" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Calories</p>
                <p className="text-3xl font-bold text-foreground">{diet.dailyCalories} kcal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="mt-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Beef className="w-5 h-5 text-primary" />
            Macronutrients
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-terracotta" />
                <span className="text-sm font-medium">Protein</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{diet.macronutrients.protein.grams}g</p>
              <Progress value={diet.macronutrients.protein.percentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{diet.macronutrients.protein.percentage}% of calories</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-golden" />
                <span className="text-sm font-medium">Carbs</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{diet.macronutrients.carbohydrates.grams}g</p>
              <Progress value={diet.macronutrients.carbohydrates.percentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{diet.macronutrients.carbohydrates.percentage}% of calories</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-sage" />
                <span className="text-sm font-medium">Fat</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{diet.macronutrients.fat.grams}g</p>
              <Progress value={diet.macronutrients.fat.percentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{diet.macronutrients.fat.percentage}% of calories</p>
            </div>
          </div>

          {/* Additional Macros */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{diet.macronutrients.fiber.grams}g</p>
              <p className="text-xs text-muted-foreground">Fiber</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{diet.macronutrients.sugar.grams}g</p>
              <p className="text-xs text-muted-foreground">Sugar</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{diet.macronutrients.saturatedFat.grams}g</p>
              <p className="text-xs text-muted-foreground">Saturated Fat</p>
            </div>
          </div>
        </div>

        {/* Micronutrients */}
        <div className="mt-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Micronutrients
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vitamins */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Apple className="w-4 h-4" />
                Vitamins
              </h4>
              <div className="space-y-3">
                {diet.micronutrients.vitamins.map((vitamin) => (
                  <div key={vitamin.name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{vitamin.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{vitamin.amount}</span>
                      <span className="text-xs text-muted-foreground">({vitamin.dailyValue}% DV)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minerals */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Minerals
              </h4>
              <div className="space-y-3">
                {diet.micronutrients.minerals.map((mineral) => (
                  <div key={mineral.name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{mineral.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{mineral.amount}</span>
                      <span className="text-xs text-muted-foreground">({mineral.dailyValue}% DV)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-primary" />
            Key Benefits
          </h3>
          <div className="flex flex-wrap gap-2">
            {diet.benefits.map((benefit) => (
              <span
                key={benefit}
                className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Foods */}
        <div className="mt-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Recommended Foods</h3>
          <div className="flex flex-wrap gap-2">
            {diet.foods.map((food) => (
              <span
                key={food}
                className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-foreground"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DietDetailDialog;
