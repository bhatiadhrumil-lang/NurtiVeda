export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: {
    text: string;
    dosha: "vata" | "pitta" | "kapha";
  }[];
}

export const doshaQuestions: QuizQuestion[] = [
  {
    id: 1,
    category: "Body Frame",
    question: "How would you describe your body frame?",
    options: [
      { text: "Thin, light, and lean with narrow shoulders", dosha: "vata" },
      { text: "Medium build with moderate muscle tone", dosha: "pitta" },
      { text: "Broad, sturdy, and naturally strong", dosha: "kapha" },
    ],
  },
  {
    id: 2,
    category: "Skin",
    question: "What best describes your skin?",
    options: [
      { text: "Dry, rough, or cool to the touch", dosha: "vata" },
      { text: "Warm, oily, prone to redness or acne", dosha: "pitta" },
      { text: "Smooth, thick, and naturally moisturized", dosha: "kapha" },
    ],
  },
  {
    id: 3,
    category: "Digestion",
    question: "How is your digestion generally?",
    options: [
      { text: "Irregular — sometimes good, sometimes bloated or gassy", dosha: "vata" },
      { text: "Strong — I get very hungry and irritable if I skip meals", dosha: "pitta" },
      { text: "Slow — I can skip meals easily and feel heavy after eating", dosha: "kapha" },
    ],
  },
  {
    id: 4,
    category: "Sleep",
    question: "How would you describe your sleep pattern?",
    options: [
      { text: "Light sleeper, wake up easily, sometimes restless", dosha: "vata" },
      { text: "Moderate sleeper, can fall asleep but wake early", dosha: "pitta" },
      { text: "Deep and heavy sleeper, hard to wake up", dosha: "kapha" },
    ],
  },
  {
    id: 5,
    category: "Energy",
    question: "How does your energy fluctuate throughout the day?",
    options: [
      { text: "Comes in bursts — quick to start but tire easily", dosha: "vata" },
      { text: "Steady and intense — focused until I burn out", dosha: "pitta" },
      { text: "Slow and sustained — takes time to start but lasts long", dosha: "kapha" },
    ],
  },
  {
    id: 6,
    category: "Stress Response",
    question: "When you're stressed, how do you typically react?",
    options: [
      { text: "I become anxious, worried, or fearful", dosha: "vata" },
      { text: "I become irritable, angry, or competitive", dosha: "pitta" },
      { text: "I withdraw, become lethargic, or comfort-eat", dosha: "kapha" },
    ],
  },
  {
    id: 7,
    category: "Climate Preference",
    question: "What type of weather do you dislike the most?",
    options: [
      { text: "Cold, windy, or dry weather", dosha: "vata" },
      { text: "Hot, humid, or sunny weather", dosha: "pitta" },
      { text: "Cool, damp, or cloudy weather", dosha: "kapha" },
    ],
  },
  {
    id: 8,
    category: "Mind",
    question: "How would you describe your thinking style?",
    options: [
      { text: "Quick, creative, but sometimes scattered", dosha: "vata" },
      { text: "Sharp, focused, analytical, and decisive", dosha: "pitta" },
      { text: "Calm, steady, methodical, and thoughtful", dosha: "kapha" },
    ],
  },
  {
    id: 9,
    category: "Weight",
    question: "How does your weight tend to change?",
    options: [
      { text: "I find it hard to gain weight", dosha: "vata" },
      { text: "I can gain or lose weight fairly easily", dosha: "pitta" },
      { text: "I gain weight easily and find it hard to lose", dosha: "kapha" },
    ],
  },
  {
    id: 10,
    category: "Lifestyle",
    question: "What activity do you gravitate toward naturally?",
    options: [
      { text: "Creative arts, dancing, or quick activities", dosha: "vata" },
      { text: "Competitive sports, debates, or leadership roles", dosha: "pitta" },
      { text: "Relaxing, cooking, gardening, or nurturing others", dosha: "kapha" },
    ],
  },
];

export interface DoshaInfo {
  name: string;
  element: string;
  qualities: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  dietTips: string[];
  bestFoods: string[];
  avoidFoods: string[];
  lifestyle: string[];
  color: string;
  gradient: string;
}

export const doshaDetails: Record<string, DoshaInfo> = {
  vata: {
    name: "Vata",
    element: "Air + Ether",
    qualities: ["Light", "Dry", "Cold", "Mobile", "Subtle"],
    description:
      "Vata governs movement in the body — breathing, blinking, heartbeat, and all muscle and tissue movement. When balanced, Vata promotes creativity and vitality. Out of balance, it produces fear and anxiety.",
    strengths: [
      "Creative and imaginative",
      "Quick learner",
      "Flexible and adaptable",
      "Enthusiastic and lively",
    ],
    challenges: [
      "Prone to anxiety and worry",
      "Irregular digestion and appetite",
      "Tendency toward dry skin and joints",
      "Difficulty maintaining routine",
    ],
    dietTips: [
      "Favor warm, cooked, and nourishing foods",
      "Eat regular meals at consistent times",
      "Include healthy fats like ghee and sesame oil",
      "Drink warm water and herbal teas",
    ],
    bestFoods: [
      "Sweet potatoes",
      "Warm soups and stews",
      "Ghee and healthy oils",
      "Ripe bananas and avocados",
      "Warm milk with turmeric",
      "Cooked grains like rice and oats",
    ],
    avoidFoods: [
      "Raw, cold, or dry foods",
      "Carbonated beverages",
      "Excess caffeine",
      "Bitter and astringent foods",
    ],
    lifestyle: [
      "Follow a regular daily routine",
      "Practice gentle yoga and meditation",
      "Keep warm and avoid cold wind",
      "Get adequate rest and sleep",
    ],
    color: "text-purple-600",
    gradient: "from-purple-500/20 to-indigo-500/10",
  },
  pitta: {
    name: "Pitta",
    element: "Fire + Water",
    qualities: ["Hot", "Sharp", "Light", "Oily", "Intense"],
    description:
      "Pitta governs digestion, metabolism, and energy production. When balanced, Pitta promotes understanding and intelligence. Out of balance, it arouses anger, jealousy, and inflammation.",
    strengths: [
      "Strong digestion and metabolism",
      "Natural leaders and decision-makers",
      "Courageous and focused",
      "Warm and passionate personality",
    ],
    challenges: [
      "Prone to inflammation and acidity",
      "Can become overly competitive",
      "Sensitive to heat and sun",
      "Tendency toward skin rashes",
    ],
    dietTips: [
      "Favor cooling and refreshing foods",
      "Avoid excessively spicy or fried foods",
      "Include sweet, bitter, and astringent tastes",
      "Stay hydrated with cool water and mint tea",
    ],
    bestFoods: [
      "Cucumbers and melons",
      "Coconut water and milk",
      "Leafy greens and salads",
      "Sweet fruits like grapes and pears",
      "Cooling herbs like coriander and mint",
      "Basmati rice and wheat",
    ],
    avoidFoods: [
      "Very spicy or fermented foods",
      "Excessive sour or salty foods",
      "Red meat and fried foods",
      "Alcohol and coffee",
    ],
    lifestyle: [
      "Spend time in nature and near water",
      "Practice cooling exercises like swimming",
      "Avoid midday sun exposure",
      "Practice moderation in work and exercise",
    ],
    color: "text-terracotta",
    gradient: "from-terracotta/20 to-orange-500/10",
  },
  kapha: {
    name: "Kapha",
    element: "Earth + Water",
    qualities: ["Heavy", "Slow", "Steady", "Solid", "Cool"],
    description:
      "Kapha governs structure, lubrication, and fluid balance. When balanced, Kapha is expressed as love, calmness, and forgiveness. Out of balance, it leads to attachment, greed, and congestion.",
    strengths: [
      "Strong immunity and endurance",
      "Calm and compassionate nature",
      "Excellent long-term memory",
      "Loyal and supportive relationships",
    ],
    challenges: [
      "Prone to weight gain and sluggishness",
      "Can become possessive or attached",
      "Tendency toward congestion and mucus",
      "Difficulty with change and motivation",
    ],
    dietTips: [
      "Favor light, warm, and spicy foods",
      "Eat the largest meal at lunch",
      "Include pungent, bitter, and astringent tastes",
      "Avoid heavy, oily, and sweet foods",
    ],
    bestFoods: [
      "Light grains like millet and barley",
      "Spicy foods with ginger and pepper",
      "Leafy greens and cruciferous vegetables",
      "Honey (in small amounts)",
      "Legumes and lentils",
      "Apples and pomegranates",
    ],
    avoidFoods: [
      "Dairy products (especially cold)",
      "Excess sweets and fried foods",
      "Heavy grains like wheat",
      "Cold beverages and ice cream",
    ],
    lifestyle: [
      "Exercise vigorously and regularly",
      "Wake up early and stay active",
      "Embrace new experiences and change",
      "Practice stimulating breathing exercises",
    ],
    color: "text-sage",
    gradient: "from-sage/20 to-emerald-500/10",
  },
};
