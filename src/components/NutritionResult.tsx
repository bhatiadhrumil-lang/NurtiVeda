import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Flame, Dumbbell, Wheat, Droplets, Leaf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NutrientValue {
  value: number;
  unit: string;
}

interface Micronutrient {
  name: string;
  value: number;
  unit: string;
  dailyValue: string;
}

interface NutritionData {
  foodName: string;
  description: string;
  servingSize: string;
  macronutrients: {
    calories: NutrientValue;
    protein: NutrientValue;
    carbohydrates: NutrientValue;
    fiber: NutrientValue;
    sugar: NutrientValue;
    fat: NutrientValue;
    saturatedFat: NutrientValue;
    unsaturatedFat: NutrientValue;
  };
  micronutrients: {
    vitamins: Micronutrient[];
    minerals: Micronutrient[];
  };
  healthBenefits: string[];
  ayurvedicProperties: {
    dosha: string;
    taste: string;
    energy: string;
    postDigestive: string;
  };
}

interface NutritionResultProps {
  data: NutritionData;
  onClose: () => void;
}

const NutritionResult = ({ data, onClose }: NutritionResultProps) => {
  const macros = data.macronutrients;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-border/50">
        <CardHeader className="sticky top-0 bg-card z-10 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif text-foreground capitalize">
                {data.foodName}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
              <Badge variant="secondary" className="mt-2">Per {data.servingSize}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Macronutrients */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Macronutrients
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{macros.calories.value}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Dumbbell className="w-4 h-4 text-terracotta" />
                  <span className="text-2xl font-bold text-foreground">{macros.protein.value}g</span>
                </div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Wheat className="w-4 h-4 text-sage" />
                  <span className="text-2xl font-bold text-foreground">{macros.carbohydrates.value}g</span>
                </div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div className="bg-accent/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Droplets className="w-4 h-4 text-yellow-600" />
                  <span className="text-2xl font-bold text-foreground">{macros.fat.value}g</span>
                </div>
                <div className="text-sm text-muted-foreground">Fat</div>
              </div>
            </div>

            {/* Additional Macros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-foreground">{macros.fiber.value}g</div>
                <div className="text-xs text-muted-foreground">Fiber</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-foreground">{macros.sugar.value}g</div>
                <div className="text-xs text-muted-foreground">Sugar</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-foreground">{macros.saturatedFat.value}g</div>
                <div className="text-xs text-muted-foreground">Saturated Fat</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-foreground">{macros.unsaturatedFat.value}g</div>
                <div className="text-xs text-muted-foreground">Unsaturated Fat</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Micronutrients */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vitamins */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-sage" />
                Vitamins
              </h3>
              <div className="space-y-2">
                {data.micronutrients.vitamins.map((vitamin) => (
                  <div key={vitamin.name} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                    <span className="text-sm text-foreground">{vitamin.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {vitamin.value}{vitamin.unit}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {vitamin.dailyValue}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minerals */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-terracotta" />
                Minerals
              </h3>
              <div className="space-y-2">
                {data.micronutrients.minerals.map((mineral) => (
                  <div key={mineral.name} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                    <span className="text-sm text-foreground">{mineral.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {mineral.value}{mineral.unit}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {mineral.dailyValue}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Health Benefits */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Health Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {data.healthBenefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="bg-sage/20 text-sage-foreground">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ayurvedic Properties */}
          <div className="bg-gradient-to-r from-terracotta/10 to-sage/10 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              🕉️ Ayurvedic Properties
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Dosha Balance</div>
                <div className="text-sm font-medium text-foreground mt-1">{data.ayurvedicProperties.dosha}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Taste (Rasa)</div>
                <div className="text-sm font-medium text-foreground mt-1">{data.ayurvedicProperties.taste}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Energy (Virya)</div>
                <div className="text-sm font-medium text-foreground mt-1">{data.ayurvedicProperties.energy}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Post-Digestive (Vipaka)</div>
                <div className="text-sm font-medium text-foreground mt-1">{data.ayurvedicProperties.postDigestive}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionResult;
