import { useState } from "react";
import { Star, Utensils, Lightbulb, TrendingUp, Plus, Check, X, Leaf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMealLogs } from "@/hooks/useMealLogs";

export interface FoodItem {
  name: string;
  estimatedPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface MicroEntry {
  name: string;
  value: number;
  unit: string;
  dailyValue: string;
}

export interface PhotoAnalysisData {
  foods: FoodItem[];
  totalEstimate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar?: number;
    saturatedFat?: number;
  };
  summary: string;
  healthScore: number;
  suggestions: string[];
  vitamins?: MicroEntry[];
  minerals?: MicroEntry[];
  healthBenefits?: string[];
}

interface PhotoAnalysisResultProps {
  data: PhotoAnalysisData;
  imageUrl: string;
  onClose: () => void;
}

const PhotoAnalysisResult = ({ data, imageUrl, onClose }: PhotoAnalysisResultProps) => {
  const maxCalPerFood = Math.max(...data.foods.map((f) => f.calories), 1);
  // Server normalizes to 1-10; clamp at display too for older responses.
  const healthScore = Math.min(10, Math.max(1, Math.round(data.healthScore > 10 ? data.healthScore / 10 : data.healthScore)));
  const { addLog } = useMealLogs();
  const [mealType, setMealType] = useState("lunch");
  const [logged, setLogged] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    setLogging(true);
    await addLog({
      meal_name: data.foods.map((f) => f.name).slice(0, 3).join(", ") || "Photo meal",
      meal_type: mealType,
      food_items: data.foods.map((f) => `${f.name} (${f.estimatedPortion})`),
      calories: data.totalEstimate.calories,
      protein: data.totalEstimate.protein,
      carbs: data.totalEstimate.carbs,
      fat: data.totalEstimate.fat,
      fiber: data.totalEstimate.fiber,
      notes: data.summary.slice(0, 280),
      logged_at: new Date().toISOString(),
    });
    setLogging(false);
    setLogged(true);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      {/* Hide Radix's built-in close button (direct-child button) — this
          dialog provides its own styled close over the photo. Without this
          two X buttons render stacked top-right. */}
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        <div className="relative">
          <img src={imageUrl} alt="Analyzed food" className="w-full h-64 sm:h-72 object-cover rounded-t-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent rounded-t-lg" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close photo analysis"
            className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm hover:bg-background/80 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Health Score: {healthScore}/10
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DialogTitle className="sr-only">Photo analysis result</DialogTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">{data.summary}</p>

          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-accent/40 border border-border/50">
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
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: "Calories", value: `${data.totalEstimate.calories}`, unit: "kcal" },
              { label: "Protein", value: `${data.totalEstimate.protein}`, unit: "g" },
              { label: "Carbs", value: `${data.totalEstimate.carbs}`, unit: "g" },
              { label: "Fat", value: `${data.totalEstimate.fat}`, unit: "g" },
              { label: "Fiber", value: `${data.totalEstimate.fiber}`, unit: "g" },
              ...(data.totalEstimate.sugar != null
                ? [{ label: "Sugar", value: `${data.totalEstimate.sugar}`, unit: "g" }]
                : []),
              ...(data.totalEstimate.saturatedFat != null
                ? [{ label: "Sat Fat", value: `${data.totalEstimate.saturatedFat}`, unit: "g" }]
                : []),
            ].map((macro) => (
              <div key={macro.label} className="bg-accent/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-foreground">{macro.value}</div>
                <div className="text-xs text-muted-foreground">{macro.unit} {macro.label}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-primary" />
              Identified Food Items
            </h3>
            <div className="space-y-2">
              {data.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{food.name}</span>
                      <Badge variant="outline" className="text-xs">{food.estimatedPortion}</Badge>
                    </div>
                    <div className="mt-1.5">
                      <Progress value={(food.calories / maxCalPerFood) * 100} className="h-1.5" />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-foreground">{food.calories} kcal</div>
                    <div className="text-xs text-muted-foreground">
                      P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                      {food.fiber != null && food.fiber > 0 ? ` Fib:${food.fiber}g` : ""}
                      {food.sugar != null && food.sugar > 0 ? ` S:${food.sugar}g` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {((data.vitamins?.length ?? 0) + (data.minerals?.length ?? 0) > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {(data.vitamins?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-sage" />
                    Vitamins
                  </h3>
                  <div className="space-y-2">
                    {data.vitamins!.map((v) => (
                      <div key={v.name} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                        <span className="text-sm text-foreground">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{v.value}{v.unit}</span>
                          {v.dailyValue && <Badge variant="outline" className="text-xs">{v.dailyValue}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(data.minerals?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-terracotta" />
                    Minerals
                  </h3>
                  <div className="space-y-2">
                    {data.minerals!.map((m) => (
                      <div key={m.name} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                        <span className="text-sm text-foreground">{m.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{m.value}{m.unit}</span>
                          {m.dailyValue && <Badge variant="outline" className="text-xs">{m.dailyValue}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(data.healthBenefits?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Health Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {data.healthBenefits!.map((b, i) => (
                  <Badge key={i} variant="secondary" className="bg-sage/20 text-sage-foreground">{b}</Badge>
                ))}
              </div>
            </div>
          )}

          {data.suggestions && data.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                Suggestions
              </h3>
              <div className="space-y-2">
                {data.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoAnalysisResult;
