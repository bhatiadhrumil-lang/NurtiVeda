import { X, Star, Utensils, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface FoodItem {
  name: string;
  estimatedPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PhotoAnalysisData {
  foods: FoodItem[];
  totalEstimate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  summary: string;
  healthScore: number;
  suggestions: string[];
}

interface PhotoAnalysisResultProps {
  data: PhotoAnalysisData;
  imageUrl: string;
  onClose: () => void;
}

const PhotoAnalysisResult = ({ data, imageUrl, onClose }: PhotoAnalysisResultProps) => {
  const maxCalPerFood = Math.max(...data.foods.map(f => f.calories), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-elevated border border-border animate-fade-in-up">
        {/* Header with image */}
        <div className="relative">
          <img src={imageUrl} alt="Analyzed food" className="w-full h-48 object-cover rounded-t-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent rounded-t-2xl" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm hover:bg-background/80 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Health Score: {data.healthScore}/10
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed">{data.summary}</p>

          {/* Total Macros */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Calories", value: `${data.totalEstimate.calories}`, unit: "kcal", color: "bg-primary" },
              { label: "Protein", value: `${data.totalEstimate.protein}`, unit: "g", color: "bg-chart-1" },
              { label: "Carbs", value: `${data.totalEstimate.carbs}`, unit: "g", color: "bg-chart-2" },
              { label: "Fat", value: `${data.totalEstimate.fat}`, unit: "g", color: "bg-chart-3" },
            ].map((macro) => (
              <div key={macro.label} className="bg-accent/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-foreground">{macro.value}</div>
                <div className="text-xs text-muted-foreground">{macro.unit} {macro.label}</div>
              </div>
            ))}
          </div>

          {/* Identified Foods */}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
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
      </div>
    </div>
  );
};

export default PhotoAnalysisResult;
