import { BarChart3, Camera, Clock, Leaf, Sparkles, Utensils } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Photo Recognition",
    description: "Snap a photo of your meal and instantly identify foods with AI-powered image recognition",
  },
  {
    icon: BarChart3,
    title: "Detailed Nutrition",
    description: "Get comprehensive breakdown of calories, macros, vitamins, and minerals for any food",
  },
  {
    icon: Leaf,
    title: "Ayurvedic Insights",
    description: "Discover traditional healing properties and benefits based on ancient wisdom",
  },
  {
    icon: Utensils,
    title: "Diet Tracking",
    description: "Track your daily intake and get personalized recommendations for your diet plan",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    description: "Receive smart meal suggestions based on your nutritional needs and preferences",
  },
  {
    icon: Clock,
    title: "Meal History",
    description: "Keep a log of all your meals and track your nutritional progress over time",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools to understand your nutrition and make informed dietary choices
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-background rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

              {/* Icon */}
              <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3 relative">
                {feature.title}
              </h3>
              <p className="text-muted-foreground relative">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
