import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Flame, Dumbbell, Wheat, Droplets, Leaf, Heart, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMealLogs } from "@/hooks/useMealLogs";

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
  const { addLog } = useMealLogs();
  const [mealType, setMealType] = useState("lunch");
  const [logged, setLogged] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    setLogging(true);
    await addLog({
      meal_name: data.foodName,
      meal_type: mealType,
      food_items: [data.foodName],
      calories: macros.calories.value,
      protein: macros.protein.value,
      carbs: macros.carbohydrates.value,
      fat: macros.fat.value,
      fiber: macros.fiber.value,
      notes: `Logged from search (${data.servingSize})`,
      logged_at: new Date().toISOString(),
    });
    setLogging(false);
    setLogged(true);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden" aria-describedby={undefined}>
        <DialogHeader className="sticky top-0 bg-card z-10 border-b border-border/50 p-6 pb-4 text-left">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-2xl font-serif capitalize">
                {data.foodName}
              </DialogTitle>
              <DialogDescription className="mt-1">{data.description}</DialogDescription>
              <Badge variant="secondary" className="mt-2">Per {data.servingSize}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close nutrition result">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 p-3 rounded-lg bg-accent/40 border border-border/50">
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleLog} disabled={logging || logged} size="sm" variant="hero">
              {logged ? <><Check className="w-4 h-4 mr-1" /> Logged!</> : <><Plus className="w-4 h-4 mr-1" /> {logging ? "Logging..." : "Log this meal"}</>}
            </Button>
            {logged && <span className="text-xs text-muted-foreground">Find it in Meal Log → History.</span>}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
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

          {data.micronutrients.vitamins.length + data.micronutrients.minerals.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {data.micronutrients.vitamins.length > 0 && (
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
                      {vitamin.dailyValue && (
                        <Badge variant="outline" className="text-xs">{vitamin.dailyValue}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {data.micronutrients.minerals.length > 0 && (
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
                      {mineral.dailyValue && (
                        <Badge variant="outline" className="text-xs">{mineral.dailyValue}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Detailed vitamin/mineral breakdown isn&apos;t available from this source — macros, benefits and Ayurvedic properties above are complete.
          </p>
          )}

          <Separator />

          {data.healthBenefits.length > 0 && (
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
          )}

          <Separator />

          <div className="bg-gradient-to-r from-terracotta/10 to-sage/10 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              Ayurvedic Properties
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NutritionResult;
