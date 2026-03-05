import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Droplets, Heart, Flame } from "lucide-react";
import { stressReliefFoods, bloodPressureFoods, bloodSugarFoods, antiSwellingFoods } from "./AyurvedaFoodData";
import AyurvedaFoodExplorer from "./AyurvedaFoodExplorer";
import type { AyurvedaFood } from "./AyurvedaFoodData";
import type { LucideIcon } from "lucide-react";

interface CategoryConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
  foods: AyurvedaFood[];
}

const ayurvedicCategories: CategoryConfig[] = [
  {
    id: "stress",
    title: "Stress Relief",
    description: "Calm your mind and reduce anxiety with these soothing foods",
    icon: Brain,
    gradient: "from-sage/20 to-sage/5",
    iconBg: "bg-sage/20",
    iconColor: "text-sage",
    foods: stressReliefFoods,
  },
  {
    id: "bp",
    title: "Blood Pressure",
    description: "Natural foods to help maintain healthy blood pressure levels",
    icon: Heart,
    gradient: "from-terracotta/20 to-terracotta/5",
    iconBg: "bg-terracotta/20",
    iconColor: "text-terracotta",
    foods: bloodPressureFoods,
  },
  {
    id: "diabetes",
    title: "Blood Sugar",
    description: "Balance your blood sugar naturally with these powerful foods",
    icon: Droplets,
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    foods: bloodSugarFoods,
  },
  {
    id: "inflammation",
    title: "Anti-Swelling",
    description: "Reduce inflammation and promote healing with these foods",
    icon: Flame,
    gradient: "from-golden/20 to-golden/5",
    iconBg: "bg-golden/20",
    iconColor: "text-golden",
    foods: antiSwellingFoods,
  },
];

const AyurvedaSection = () => {
  const [explorerCategory, setExplorerCategory] = useState<CategoryConfig | null>(null);
  const navigate = useNavigate();

  return (
    <section id="ayurveda" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sage-light/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta-light/20 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/10 text-sage text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-sage animate-pulse-soft" />
            Ayurvedic Wisdom
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Healing Foods from <span className="text-primary">Ancient India</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover traditional Ayurvedic foods that have been used for thousands of years to treat various health conditions naturally
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ayurvedicCategories.map((category, index) => (
            <div
              key={category.id}
              className={`rounded-3xl p-8 bg-gradient-to-br ${category.gradient} border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${category.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-1">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {category.foods.slice(0, 6).map((food) => (
                  <div
                    key={food.name}
                    className="bg-background/60 backdrop-blur-sm rounded-xl p-4 hover:bg-background/80 transition-colors cursor-pointer group"
                    onClick={() => setExplorerCategory(category)}
                  >
                    <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {food.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {food.shortBenefit}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full group"
                onClick={() => setExplorerCategory(category)}
              >
                Explore All {category.title} Foods ({category.foods.length})
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Want personalized Ayurvedic recommendations based on your body type?
          </p>
          <Button variant="hero" size="xl">
            Take Dosha Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {explorerCategory && (
        <AyurvedaFoodExplorer
          open={!!explorerCategory}
          onOpenChange={(open) => !open && setExplorerCategory(null)}
          title={explorerCategory.title}
          description={explorerCategory.description}
          foods={explorerCategory.foods}
          icon={explorerCategory.icon}
          iconColor={explorerCategory.iconColor}
          iconBg={explorerCategory.iconBg}
        />
      )}
    </section>
  );
};

export default AyurvedaSection;
