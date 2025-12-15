import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Heart, Leaf, Moon, Salad, Sun, Wheat } from "lucide-react";

const diets = [
  {
    name: "Keto",
    description: "High-fat, low-carb diet for metabolic health and weight management",
    icon: Flame,
    color: "terracotta",
    foods: ["Avocado", "Eggs", "Salmon", "Nuts"],
  },
  {
    name: "Mediterranean",
    description: "Heart-healthy diet rich in olive oil, fish, and fresh vegetables",
    icon: Heart,
    color: "sage",
    foods: ["Olive Oil", "Fish", "Tomatoes", "Legumes"],
  },
  {
    name: "Vegan",
    description: "Plant-based nutrition for ethical eating and environmental impact",
    icon: Leaf,
    color: "primary",
    foods: ["Tofu", "Quinoa", "Lentils", "Vegetables"],
  },
  {
    name: "Paleo",
    description: "Ancestral eating focusing on whole, unprocessed foods",
    icon: Sun,
    color: "golden",
    foods: ["Meat", "Seafood", "Vegetables", "Fruits"],
  },
  {
    name: "Intermittent Fasting",
    description: "Time-restricted eating for cellular renewal and weight control",
    icon: Moon,
    color: "forest",
    foods: ["Any foods", "During eating window", "Focus on nutrition", "Stay hydrated"],
  },
  {
    name: "Whole30",
    description: "30-day elimination diet to reset your metabolism and identify sensitivities",
    icon: Salad,
    color: "sage",
    foods: ["Vegetables", "Meat", "Seafood", "Fruits"],
  },
  {
    name: "Low-FODMAP",
    description: "Digestive-friendly diet for IBS and gut health optimization",
    icon: Wheat,
    color: "terracotta",
    foods: ["Rice", "Eggs", "Zucchini", "Carrots"],
  },
  {
    name: "DASH Diet",
    description: "Dietary approach to stop hypertension and improve heart health",
    icon: Heart,
    color: "primary",
    foods: ["Grains", "Vegetables", "Lean Protein", "Low Sodium"],
  },
];

const DietsSection = () => {
  return (
    <section id="diets" className="py-24 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Diet Plans
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect Diet
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore popular diet plans and discover foods that align with your health goals
          </p>
        </div>

        {/* Diet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {diets.map((diet, index) => (
            <div
              key={diet.name}
              className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in-up border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                diet.color === "terracotta" ? "bg-terracotta/10 text-terracotta group-hover:bg-terracotta group-hover:text-primary-foreground" :
                diet.color === "sage" ? "bg-sage/10 text-sage group-hover:bg-sage group-hover:text-primary-foreground" :
                diet.color === "golden" ? "bg-golden/10 text-golden group-hover:bg-golden group-hover:text-primary-foreground" :
                diet.color === "forest" ? "bg-forest/10 text-forest group-hover:bg-forest group-hover:text-primary-foreground" :
                "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              }`}>
                <diet.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {diet.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {diet.description}
              </p>

              {/* Foods */}
              <div className="flex flex-wrap gap-2 mb-4">
                {diet.foods.slice(0, 3).map((food) => (
                  <span
                    key={food}
                    className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                  >
                    {food}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Button variant="ghost" size="sm" className="w-full group-hover:text-primary">
                Explore Diet
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DietsSection;
