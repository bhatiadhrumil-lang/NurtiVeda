import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Leaf, AlertTriangle, FlaskConical, Utensils } from "lucide-react";
import type { AyurvedaFood } from "./AyurvedaFoodData";
import type { LucideIcon } from "lucide-react";

interface AyurvedaFoodExplorerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  foods: AyurvedaFood[];
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

const AyurvedaFoodExplorer = ({
  open,
  onOpenChange,
  title,
  description,
  foods,
  icon: Icon,
  iconColor,
  iconBg,
}: AyurvedaFoodExplorerProps) => {
  const [selectedFood, setSelectedFood] = useState<AyurvedaFood | null>(null);

  const handleClose = () => {
    setSelectedFood(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          {selectedFood ? (
            /* Food Detail View */
            <div className="p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFood(null)}
                className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to list
              </Button>

              <DialogHeader className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">{selectedFood.category}</Badge>
                </div>
                <DialogTitle className="font-serif text-2xl">{selectedFood.name}</DialogTitle>
                <DialogDescription className="text-base">{selectedFood.description}</DialogDescription>
              </DialogHeader>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                  <Leaf className="w-4 h-4 text-primary" />
                  Key Benefits
                </h4>
                <ul className="space-y-2">
                  {selectedFood.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* How to Consume */}
              <div className="mb-6 p-4 rounded-xl bg-accent/50 border border-border/50">
                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  How to Consume
                </h4>
                <p className="text-sm text-muted-foreground">{selectedFood.howToConsume}</p>
              </div>

              {/* Daily Intake Limit */}
              <div className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Daily Intake Limit
                </h4>
                <p className="text-sm text-muted-foreground">{selectedFood.dailyIntakeLimit}</p>
              </div>

              {/* Scientific Note */}
              {selectedFood.scientificNote && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <FlaskConical className="w-4 h-4 text-primary" />
                    Scientific Evidence
                  </h4>
                  <p className="text-sm text-muted-foreground italic">{selectedFood.scientificNote}</p>
                </div>
              )}
            </div>
          ) : (
            /* Food List View */
            <div className="p-6">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foods.map((food) => (
                  <button
                    key={food.name}
                    onClick={() => setSelectedFood(food)}
                    className="text-left p-4 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/60 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {food.name}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{food.shortBenefit}</p>
                    <Badge variant="outline" className="text-[10px]">{food.category}</Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AyurvedaFoodExplorer;
