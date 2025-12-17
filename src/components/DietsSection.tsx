import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Heart, Leaf, Moon, Salad, Sun, Wheat } from "lucide-react";
import DietDetailDialog, { DietNutrition } from "./DietDetailDialog";

const diets: DietNutrition[] = [
  {
    name: "Keto",
    description: "High-fat, low-carb diet for metabolic health and weight management",
    icon: Flame,
    color: "terracotta",
    foods: [
      // Proteins
      "Eggs", "Salmon", "Beef", "Chicken", "Bacon", "Sardines",
      // Dairy
      "Cheese", "Butter", "Ghee", "Heavy Cream", "Paneer", "Cream Cheese",
      // Fats & Oils
      "Avocado", "Olive Oil", "Coconut Oil", "MCT Oil",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Macadamia", "Pecans", "Brazil Nuts", "Chia Seeds", "Flaxseeds",
      // Low-Carb Vegetables
      "Spinach", "Broccoli", "Cauliflower", "Zucchini", "Asparagus",
      // Limited Fruits
      "Berries", "Lemon", "Lime", "Coconut"
    ],
    dailyCalories: 1800,
    macronutrients: {
      protein: { grams: 90, percentage: 20 },
      carbohydrates: { grams: 25, percentage: 5 },
      fat: { grams: 150, percentage: 75 },
      fiber: { grams: 15 },
      sugar: { grams: 10 },
      saturatedFat: { grams: 45 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin A", amount: "900mcg", dailyValue: 100 },
        { name: "Vitamin D", amount: "20mcg", dailyValue: 100 },
        { name: "Vitamin E", amount: "15mg", dailyValue: 100 },
        { name: "Vitamin K", amount: "120mcg", dailyValue: 100 },
        { name: "Vitamin B12", amount: "2.4mcg", dailyValue: 100 },
      ],
      minerals: [
        { name: "Sodium", amount: "2000mg", dailyValue: 87 },
        { name: "Potassium", amount: "3500mg", dailyValue: 75 },
        { name: "Magnesium", amount: "400mg", dailyValue: 95 },
        { name: "Zinc", amount: "11mg", dailyValue: 100 },
        { name: "Iron", amount: "18mg", dailyValue: 100 },
      ],
    },
    benefits: ["Weight Loss", "Blood Sugar Control", "Mental Clarity", "Reduced Inflammation"],
  },
  {
    name: "Mediterranean",
    description: "Heart-healthy diet rich in olive oil, fish, and fresh vegetables",
    icon: Heart,
    color: "sage",
    foods: [
      // Proteins
      "Fish", "Chicken", "Eggs", "Legumes", "Lentils", "Chickpeas",
      // Dairy
      "Feta Cheese", "Greek Yogurt", "Goat Cheese", "Milk", "Buttermilk",
      // Fats & Oils
      "Olive Oil", "Red Wine",
      // Grains
      "Whole Grains", "Quinoa", "Brown Rice", "Oats", "Barley",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Pistachios", "Dates", "Figs", "Raisins", "Apricots",
      // Vegetables
      "Tomatoes", "Spinach", "Eggplant", "Artichokes", "Peppers",
      // Fruits
      "Oranges", "Grapes", "Pomegranate", "Olives", "Lemons", "Apples", "Pears"
    ],
    dailyCalories: 2000,
    macronutrients: {
      protein: { grams: 80, percentage: 16 },
      carbohydrates: { grams: 250, percentage: 50 },
      fat: { grams: 75, percentage: 34 },
      fiber: { grams: 35 },
      sugar: { grams: 45 },
      saturatedFat: { grams: 15 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin C", amount: "90mg", dailyValue: 100 },
        { name: "Vitamin E", amount: "20mg", dailyValue: 133 },
        { name: "Vitamin B6", amount: "1.7mg", dailyValue: 100 },
        { name: "Folate", amount: "400mcg", dailyValue: 100 },
        { name: "Vitamin K", amount: "150mcg", dailyValue: 125 },
      ],
      minerals: [
        { name: "Potassium", amount: "4700mg", dailyValue: 100 },
        { name: "Magnesium", amount: "420mg", dailyValue: 100 },
        { name: "Calcium", amount: "1000mg", dailyValue: 100 },
        { name: "Iron", amount: "15mg", dailyValue: 83 },
        { name: "Selenium", amount: "55mcg", dailyValue: 100 },
      ],
    },
    benefits: ["Heart Health", "Longevity", "Brain Function", "Antioxidant Rich"],
  },
  {
    name: "Vegan",
    description: "Plant-based nutrition for ethical eating and environmental impact",
    icon: Leaf,
    color: "primary",
    foods: [
      // Proteins
      "Tofu", "Tempeh", "Lentils", "Chickpeas", "Black Beans", "Edamame",
      // Plant-Based Dairy Alternatives
      "Almond Milk", "Oat Milk", "Coconut Yogurt", "Cashew Cheese", "Soy Milk",
      // Grains
      "Quinoa", "Brown Rice", "Oats", "Millet", "Amaranth",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Cashews", "Dates", "Raisins", "Dried Cranberries", "Prunes", "Chia Seeds", "Hemp Seeds", "Pumpkin Seeds",
      // Vegetables
      "Leafy Greens", "Broccoli", "Cauliflower", "Sweet Potato", "Carrots", "Beets",
      // Fruits
      "Bananas", "Apples", "Berries", "Mangoes", "Papaya", "Oranges", "Kiwi", "Avocado"
    ],
    dailyCalories: 1900,
    macronutrients: {
      protein: { grams: 70, percentage: 15 },
      carbohydrates: { grams: 285, percentage: 60 },
      fat: { grams: 55, percentage: 25 },
      fiber: { grams: 45 },
      sugar: { grams: 50 },
      saturatedFat: { grams: 10 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin C", amount: "120mg", dailyValue: 133 },
        { name: "Vitamin A", amount: "1200mcg", dailyValue: 133 },
        { name: "Vitamin K", amount: "200mcg", dailyValue: 167 },
        { name: "Folate", amount: "600mcg", dailyValue: 150 },
        { name: "Vitamin B12*", amount: "2.4mcg", dailyValue: 100 },
      ],
      minerals: [
        { name: "Iron", amount: "25mg", dailyValue: 139 },
        { name: "Magnesium", amount: "500mg", dailyValue: 119 },
        { name: "Potassium", amount: "5000mg", dailyValue: 106 },
        { name: "Zinc", amount: "12mg", dailyValue: 109 },
        { name: "Calcium*", amount: "1000mg", dailyValue: 100 },
      ],
    },
    benefits: ["Environmental", "Ethical", "High Fiber", "Antioxidants"],
  },
  {
    name: "Paleo",
    description: "Ancestral eating focusing on whole, unprocessed foods",
    icon: Sun,
    color: "golden",
    foods: [
      // Proteins
      "Grass-fed Beef", "Chicken", "Turkey", "Salmon", "Sardines", "Eggs", "Lamb",
      // Dairy (limited)
      "Ghee", "Grass-fed Butter",
      // Fats & Oils
      "Olive Oil", "Coconut Oil", "Avocado Oil",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Macadamia", "Cashews", "Dates", "Figs", "Raisins", "Dried Mango", "Sunflower Seeds", "Pumpkin Seeds",
      // Vegetables
      "Sweet Potato", "Broccoli", "Spinach", "Kale", "Carrots", "Beets", "Squash",
      // Fruits
      "Berries", "Apples", "Oranges", "Bananas", "Grapes", "Watermelon", "Peaches", "Pineapple"
    ],
    dailyCalories: 2100,
    macronutrients: {
      protein: { grams: 130, percentage: 25 },
      carbohydrates: { grams: 130, percentage: 25 },
      fat: { grams: 115, percentage: 50 },
      fiber: { grams: 40 },
      sugar: { grams: 35 },
      saturatedFat: { grams: 30 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin A", amount: "1500mcg", dailyValue: 167 },
        { name: "Vitamin C", amount: "150mg", dailyValue: 167 },
        { name: "Vitamin D", amount: "25mcg", dailyValue: 125 },
        { name: "Vitamin B12", amount: "5mcg", dailyValue: 208 },
        { name: "Vitamin E", amount: "18mg", dailyValue: 120 },
      ],
      minerals: [
        { name: "Iron", amount: "22mg", dailyValue: 122 },
        { name: "Zinc", amount: "15mg", dailyValue: 136 },
        { name: "Selenium", amount: "70mcg", dailyValue: 127 },
        { name: "Potassium", amount: "4500mg", dailyValue: 96 },
        { name: "Magnesium", amount: "380mg", dailyValue: 90 },
      ],
    },
    benefits: ["Whole Foods", "No Processed Foods", "Blood Sugar Stable", "Anti-Inflammatory"],
  },
  {
    name: "Intermittent Fasting",
    description: "Time-restricted eating for cellular renewal and weight control",
    icon: Moon,
    color: "forest",
    foods: [
      // Proteins
      "Eggs", "Chicken", "Fish", "Lean Beef", "Greek Yogurt", "Cottage Cheese",
      // Dairy
      "Milk", "Paneer", "Cheese", "Butter", "Ghee",
      // Grains & Carbs
      "Brown Rice", "Quinoa", "Oats", "Sweet Potato", "Whole Wheat Bread",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Cashews", "Dates", "Figs", "Raisins", "Prunes", "Apricots",
      // Vegetables
      "Spinach", "Broccoli", "Carrots", "Bell Peppers", "Tomatoes",
      // Fruits
      "Bananas", "Apples", "Berries", "Oranges", "Grapes", "Papaya", "Watermelon"
    ],
    dailyCalories: 1600,
    macronutrients: {
      protein: { grams: 80, percentage: 20 },
      carbohydrates: { grams: 180, percentage: 45 },
      fat: { grams: 60, percentage: 35 },
      fiber: { grams: 30 },
      sugar: { grams: 40 },
      saturatedFat: { grams: 18 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin D", amount: "20mcg", dailyValue: 100 },
        { name: "Vitamin B Complex", amount: "100%", dailyValue: 100 },
        { name: "Vitamin C", amount: "90mg", dailyValue: 100 },
        { name: "Vitamin A", amount: "900mcg", dailyValue: 100 },
        { name: "Vitamin E", amount: "15mg", dailyValue: 100 },
      ],
      minerals: [
        { name: "Sodium", amount: "2300mg", dailyValue: 100 },
        { name: "Electrolytes", amount: "Adequate", dailyValue: 100 },
        { name: "Magnesium", amount: "400mg", dailyValue: 95 },
        { name: "Potassium", amount: "4700mg", dailyValue: 100 },
        { name: "Calcium", amount: "1000mg", dailyValue: 100 },
      ],
    },
    benefits: ["Autophagy", "Weight Management", "Insulin Sensitivity", "Mental Clarity"],
  },
  {
    name: "Whole30",
    description: "30-day elimination diet to reset your metabolism and identify sensitivities",
    icon: Salad,
    color: "sage",
    foods: [
      // Proteins
      "Beef", "Chicken", "Turkey", "Salmon", "Shrimp", "Eggs", "Pork",
      // Dairy (only ghee allowed)
      "Ghee", "Clarified Butter",
      // Fats & Oils
      "Olive Oil", "Coconut Oil", "Avocado Oil",
      // Nuts & Dry Fruits
      "Almonds", "Cashews", "Walnuts", "Macadamia", "Dates", "Dried Coconut", "Sunflower Seeds",
      // Vegetables
      "Broccoli", "Cauliflower", "Sweet Potato", "Spinach", "Kale", "Zucchini", "Asparagus",
      // Fruits
      "Apples", "Bananas", "Berries", "Oranges", "Grapes", "Mango", "Pineapple", "Peaches"
    ],
    dailyCalories: 1800,
    macronutrients: {
      protein: { grams: 100, percentage: 22 },
      carbohydrates: { grams: 150, percentage: 33 },
      fat: { grams: 90, percentage: 45 },
      fiber: { grams: 35 },
      sugar: { grams: 30 },
      saturatedFat: { grams: 25 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin A", amount: "1200mcg", dailyValue: 133 },
        { name: "Vitamin C", amount: "120mg", dailyValue: 133 },
        { name: "Vitamin B6", amount: "2mg", dailyValue: 118 },
        { name: "Vitamin B12", amount: "4mcg", dailyValue: 167 },
        { name: "Vitamin D", amount: "20mcg", dailyValue: 100 },
      ],
      minerals: [
        { name: "Iron", amount: "20mg", dailyValue: 111 },
        { name: "Magnesium", amount: "450mg", dailyValue: 107 },
        { name: "Potassium", amount: "4200mg", dailyValue: 89 },
        { name: "Zinc", amount: "13mg", dailyValue: 118 },
        { name: "Selenium", amount: "60mcg", dailyValue: 109 },
      ],
    },
    benefits: ["Reset Metabolism", "Identify Sensitivities", "Reduce Cravings", "Improve Energy"],
  },
  {
    name: "Low-FODMAP",
    description: "Digestive-friendly diet for IBS and gut health optimization",
    icon: Wheat,
    color: "terracotta",
    foods: [
      // Proteins
      "Chicken", "Fish", "Eggs", "Tofu (firm)", "Beef", "Turkey",
      // Dairy (lactose-free)
      "Lactose-free Milk", "Lactose-free Yogurt", "Cheddar Cheese", "Brie", "Butter",
      // Grains
      "Rice", "Quinoa", "Oats", "Gluten-free Bread",
      // Nuts & Dry Fruits (limited)
      "Walnuts", "Macadamia", "Peanuts", "Pecans", "Chia Seeds",
      // Vegetables
      "Carrots", "Zucchini", "Cucumber", "Tomatoes", "Spinach", "Bell Peppers", "Eggplant",
      // Fruits
      "Oranges", "Grapes", "Strawberries", "Blueberries", "Kiwi", "Cantaloupe", "Pineapple"
    ],
    dailyCalories: 1700,
    macronutrients: {
      protein: { grams: 85, percentage: 20 },
      carbohydrates: { grams: 210, percentage: 50 },
      fat: { grams: 55, percentage: 30 },
      fiber: { grams: 25 },
      sugar: { grams: 35 },
      saturatedFat: { grams: 15 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin A", amount: "800mcg", dailyValue: 89 },
        { name: "Vitamin C", amount: "80mg", dailyValue: 89 },
        { name: "Vitamin B12", amount: "2.4mcg", dailyValue: 100 },
        { name: "Vitamin D", amount: "15mcg", dailyValue: 75 },
        { name: "Vitamin K", amount: "100mcg", dailyValue: 83 },
      ],
      minerals: [
        { name: "Calcium", amount: "900mg", dailyValue: 90 },
        { name: "Iron", amount: "16mg", dailyValue: 89 },
        { name: "Magnesium", amount: "350mg", dailyValue: 83 },
        { name: "Zinc", amount: "10mg", dailyValue: 91 },
        { name: "Potassium", amount: "4000mg", dailyValue: 85 },
      ],
    },
    benefits: ["Gut Health", "Reduce Bloating", "IBS Relief", "Better Digestion"],
  },
  {
    name: "DASH Diet",
    description: "Dietary approach to stop hypertension and improve heart health",
    icon: Heart,
    color: "primary",
    foods: [
      // Proteins
      "Lean Chicken", "Fish", "Turkey", "Eggs", "Legumes", "Beans",
      // Dairy
      "Low-fat Milk", "Buttermilk", "Greek Yogurt", "Low-fat Cheese", "Cottage Cheese", "Paneer",
      // Grains
      "Whole Grains", "Brown Rice", "Oats", "Quinoa", "Whole Wheat Bread",
      // Nuts & Dry Fruits
      "Almonds", "Walnuts", "Pistachios", "Flaxseeds", "Sunflower Seeds", "Raisins", "Dates", "Apricots",
      // Vegetables
      "Spinach", "Broccoli", "Carrots", "Tomatoes", "Sweet Potato", "Beets", "Leafy Greens",
      // Fruits
      "Bananas", "Oranges", "Apples", "Berries", "Grapes", "Pomegranate", "Watermelon", "Papaya"
    ],
    dailyCalories: 2000,
    macronutrients: {
      protein: { grams: 90, percentage: 18 },
      carbohydrates: { grams: 275, percentage: 55 },
      fat: { grams: 60, percentage: 27 },
      fiber: { grams: 30 },
      sugar: { grams: 50 },
      saturatedFat: { grams: 12 },
    },
    micronutrients: {
      vitamins: [
        { name: "Vitamin C", amount: "100mg", dailyValue: 111 },
        { name: "Vitamin A", amount: "1000mcg", dailyValue: 111 },
        { name: "Vitamin D", amount: "20mcg", dailyValue: 100 },
        { name: "Folate", amount: "450mcg", dailyValue: 113 },
        { name: "Vitamin B6", amount: "1.8mg", dailyValue: 106 },
      ],
      minerals: [
        { name: "Potassium", amount: "4700mg", dailyValue: 100 },
        { name: "Calcium", amount: "1250mg", dailyValue: 125 },
        { name: "Magnesium", amount: "500mg", dailyValue: 119 },
        { name: "Sodium", amount: "1500mg", dailyValue: 65 },
        { name: "Fiber", amount: "30g", dailyValue: 107 },
      ],
    },
    benefits: ["Lower Blood Pressure", "Heart Health", "Weight Management", "Reduce Sodium"],
  },
];

const DietsSection = () => {
  const [selectedDiet, setSelectedDiet] = useState<DietNutrition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDietClick = (diet: DietNutrition) => {
    setSelectedDiet(diet);
    setDialogOpen(true);
  };

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
              onClick={() => handleDietClick(diet)}
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
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {diet.description}
              </p>

              {/* Calories Preview */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Flame className="w-4 h-4 text-terracotta" />
                <span className="font-medium text-foreground">{diet.dailyCalories} kcal/day</span>
              </div>

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
                View Nutrition Details
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <DietDetailDialog
        diet={selectedDiet}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default DietsSection;
