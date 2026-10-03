// Built-in nutrition knowledge: lets text search return proper details
// WITHOUT depending on the nutrition-lookup Edge Function.
// Values are approximate per-100g references (USDA-style averages).
import { isFoodNameMatch } from "../../supabase/functions/_shared/verify.ts";

export interface LocalMacros {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  sugar: number;
  fat: number;
  satFat: number;
}

export interface AyurvedaProps {
  dosha: string;
  taste: string;
  energy: string;
  postDigestive: string;
}

export interface MicroEntry {
  name: string;
  value: number;
  unit: string;
}

interface LocalFood {
  /** keywords that match this food (lowercase, substring) */
  match: string[];
  name: string;
  description: string;
  macros: LocalMacros;
  /** approximate per-100g micronutrients (USDA-style averages) */
  vitamins: MicroEntry[];
  minerals: MicroEntry[];
  benefits: string[];
  ayurveda: AyurvedaProps;
}

/** Reference daily values used to compute %DV labels. */
const DAILY_VALUES: Record<string, { dv: number; unit: string }> = {
  "Vitamin A": { dv: 900, unit: "mcg" },
  "Vitamin C": { dv: 90, unit: "mg" },
  "Vitamin D": { dv: 15, unit: "mcg" },
  "Vitamin E": { dv: 15, unit: "mg" },
  "Vitamin K": { dv: 120, unit: "mcg" },
  "Vitamin B1": { dv: 1.2, unit: "mg" },
  "Vitamin B2": { dv: 1.3, unit: "mg" },
  "Vitamin B3": { dv: 16, unit: "mg" },
  "Vitamin B6": { dv: 1.7, unit: "mg" },
  "Folate": { dv: 400, unit: "mcg" },
  "Vitamin B12": { dv: 2.4, unit: "mcg" },
  "Calcium": { dv: 1000, unit: "mg" },
  "Iron": { dv: 18, unit: "mg" },
  "Magnesium": { dv: 400, unit: "mg" },
  "Phosphorus": { dv: 700, unit: "mg" },
  "Potassium": { dv: 3500, unit: "mg" },
  "Zinc": { dv: 11, unit: "mg" },
  "Manganese": { dv: 2.3, unit: "mg" },
  "Sodium": { dv: 2300, unit: "mg" },
  "Selenium": { dv: 55, unit: "mcg" },
  "Copper": { dv: 0.9, unit: "mg" },
};

export function dailyValue(name: string, value: number, unit: string): string {
  const ref = DAILY_VALUES[name];
  if (!ref || value <= 0) return "";
  let vMg = unit === "mcg" ? value / 1000 : value;
  let dvMg = ref.unit === "mcg" ? ref.dv / 1000 : ref.dv;
  if (unit === "g") vMg = value * 1000;
  if (ref.unit === "g") dvMg = ref.dv * 1000;
  const pct = Math.round((vMg / dvMg) * 100);
  return pct > 0 ? `${pct}%` : "";
}

const VATA_SOOTHE: AyurvedaProps = {
  dosha: "Pacifies Vata, balances Pitta in moderation",
  taste: "Sweet",
  energy: "Heating",
  postDigestive: "Sweet",
};

const PITTA_COOL: AyurvedaProps = {
  dosha: "Pacifies Pitta, balances Vata",
  taste: "Sweet",
  energy: "Cooling",
  postDigestive: "Sweet",
};

const KAPHA_LIGHT: AyurvedaProps = {
  dosha: "Pacifies Kapha, light for digestion",
  taste: "Pungent, Bitter",
  energy: "Heating",
  postDigestive: "Pungent",
};

const TRIDOSHA: AyurvedaProps = {
  dosha: "Balances all doshas in moderation",
  taste: "Mixed",
  energy: "Neutral",
  postDigestive: "Sweet",
};

export const DEFAULT_AYURVEDA: AyurvedaProps = TRIDOSHA;

export const DEFAULT_BENEFITS = [
  "Nutritious addition to a balanced diet.",
  "Best enjoyed as part of whole-food meals.",
  "Supports overall wellness and vitality.",
];

export function deriveBenefits(macros: LocalMacros, extra: string[] = []): string[] {
  const out = [...extra];
  if (macros.protein >= 10) out.push("High in protein — supports muscle maintenance and satiety.");
  else if (macros.protein >= 5) out.push("Good source of protein for everyday strength.");
  if (macros.fiber >= 6) out.push("Rich in fiber — supports digestion and gut health.");
  else if (macros.fiber >= 3) out.push("Contains fiber that aids healthy digestion.");
  if (macros.fat <= 3 && macros.calories < 150) out.push("Naturally light — fits weight-conscious meal plans.");
  if (macros.sugar >= 15) out.push("Naturally high in sugars — enjoy in moderate portions.");
  if (macros.satFat >= 8) out.push("High in saturated fat — best in small portions.");
  return out.length > 0 ? out.slice(0, 5) : [...DEFAULT_BENEFITS];
}

export function findAyurveda(query: string): AyurvedaProps {
  const q = query.toLowerCase();
  const hit = LOCAL_FOODS.find((f) => f.match.some((m) => q.includes(m)));
  return hit ? hit.ayurveda : DEFAULT_AYURVEDA;
}

/** Micronutrients of the closest built-in food (used to enrich packaged
 *  products that name a known food). Empty when nothing matches. */
export function findMicros(query: string): { vitamins: MicroEntry[]; minerals: MicroEntry[] } {
  const q = query.toLowerCase();
  const hit = LOCAL_FOODS.find((f) => f.match.some((m) => q.includes(m)));
  if (!hit) return { vitamins: [], minerals: [] };
  return { vitamins: hit.vitamins, minerals: hit.minerals };
}

const LOCAL_FOODS: LocalFood[] = [
  {
    match: ["apple"], name: "Apple",
    description: "Crisp, juicy temperate fruit eaten raw or cooked. Mildly sweet with a refreshing crunch.",
    macros: { calories: 52, protein: 0.3, carbs: 14, fiber: 2.4, sugar: 10, fat: 0.2, satFat: 0 },
    vitamins: [
      { name: "Vitamin C", value: 4.6, unit: "mg" },
      { name: "Vitamin K", value: 2.2, unit: "mcg" },
      { name: "Vitamin B6", value: 0.04, unit: "mg" },
      { name: "Vitamin E", value: 0.18, unit: "mg" },
      { name: "Vitamin B1", value: 0.02, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 107, unit: "mg" },
      { name: "Magnesium", value: 5, unit: "mg" },
      { name: "Manganese", value: 0.04, unit: "mg" },
      { name: "Calcium", value: 6, unit: "mg" },
      { name: "Phosphorus", value: 11, unit: "mg" },
    ],
    benefits: ["Rich in pectin fiber for digestion.", "Antioxidants support heart health."],
    ayurveda: { dosha: "Pacifies Pitta and Kapha; may aggravate Vata raw", taste: "Sweet, Astringent", energy: "Cooling", postDigestive: "Sweet" },
  },
  {
    match: ["banana"], name: "Banana",
    description: "Soft tropical fruit, a quick-energy staple eaten raw or in shakes.",
    macros: { calories: 89, protein: 1.1, carbs: 23, fiber: 2.6, sugar: 12, fat: 0.3, satFat: 0.1 },
    vitamins: [
      { name: "Vitamin C", value: 8.7, unit: "mg" },
      { name: "Vitamin B6", value: 0.37, unit: "mg" },
      { name: "Vitamin A", value: 3, unit: "mcg" },
      { name: "Folate", value: 20, unit: "mcg" },
      { name: "Vitamin B2", value: 0.07, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 358, unit: "mg" },
      { name: "Magnesium", value: 27, unit: "mg" },
      { name: "Manganese", value: 0.27, unit: "mg" },
      { name: "Iron", value: 0.26, unit: "mg" },
      { name: "Calcium", value: 5, unit: "mg" },
    ],
    benefits: ["Potassium supports healthy blood pressure.", "Quick natural energy for workouts."],
    ayurveda: PITTA_COOL,
  },
  {
    match: ["mango"], name: "Mango",
    description: "King of fruits — aromatic, juicy tropical pulp eaten ripe or as pickle/shake.",
    macros: { calories: 60, protein: 0.8, carbs: 15, fiber: 1.6, sugar: 14, fat: 0.4, satFat: 0.1 },
    vitamins: [
      { name: "Vitamin C", value: 36, unit: "mg" },
      { name: "Vitamin A", value: 54, unit: "mcg" },
      { name: "Folate", value: 43, unit: "mcg" },
    ],
    minerals: [
      { name: "Potassium", value: 168, unit: "mg" },
      { name: "Magnesium", value: 10, unit: "mg" },
      { name: "Calcium", value: 11, unit: "mg" },
    ],
    benefits: ["Vitamin A and C support immunity and skin.", "Natural sugars give quick energy."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["orange"], name: "Orange",
    description: "Citrus fruit with tangy segments, famous for vitamin C.",
    macros: { calories: 47, protein: 0.9, carbs: 12, fiber: 2.4, sugar: 9, fat: 0.1, satFat: 0 },
    vitamins: [
      { name: "Vitamin C", value: 53, unit: "mg" },
      { name: "Folate", value: 30, unit: "mcg" },
      { name: "Vitamin B1", value: 0.09, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 181, unit: "mg" },
      { name: "Calcium", value: 40, unit: "mg" },
      { name: "Magnesium", value: 10, unit: "mg" },
    ],
    benefits: ["Vitamin C supports immunity.", "Hydrating and low in calories."],
    ayurveda: PITTA_COOL,
  },
  {
    match: ["rice", "biryani", "pulao", "steamed rice"], name: "Cooked Rice",
    description: "Staple cereal grain — fluffy cooked rice forming the base of Indian meals.",
    macros: { calories: 130, protein: 2.7, carbs: 28, fiber: 0.4, sugar: 0.1, fat: 0.3, satFat: 0.1 },
    vitamins: [
      { name: "Vitamin B3", value: 0.8, unit: "mg" },
      { name: "Vitamin B1", value: 0.07, unit: "mg" },
      { name: "Vitamin B6", value: 0.09, unit: "mg" },
      { name: "Folate", value: 6, unit: "mcg" },
      { name: "Vitamin E", value: 0.02, unit: "mg" },
    ],
    minerals: [
      { name: "Manganese", value: 0.4, unit: "mg" },
      { name: "Phosphorus", value: 43, unit: "mg" },
      { name: "Magnesium", value: 12, unit: "mg" },
      { name: "Potassium", value: 35, unit: "mg" },
      { name: "Calcium", value: 10, unit: "mg" },
    ],
    benefits: ["Easily digestible staple energy source.", "Naturally gluten-free."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["roti", "chapati", "phulka", "paratha"], name: "Whole Wheat Roti",
    description: "Unleavened whole-wheat flatbread, the everyday bread of Indian meals.",
    macros: { calories: 265, protein: 9, carbs: 55, fiber: 9, sugar: 0.5, fat: 3, satFat: 0.5 },
    vitamins: [
      { name: "Vitamin B3", value: 4, unit: "mg" },
      { name: "Vitamin B1", value: 0.3, unit: "mg" },
      { name: "Folate", value: 30, unit: "mcg" },
      { name: "Vitamin B6", value: 0.2, unit: "mg" },
      { name: "Vitamin E", value: 0.5, unit: "mg" },
    ],
    minerals: [
      { name: "Magnesium", value: 90, unit: "mg" },
      { name: "Iron", value: 2.5, unit: "mg" },
      { name: "Zinc", value: 1.8, unit: "mg" },
      { name: "Potassium", value: 200, unit: "mg" },
      { name: "Phosphorus", value: 200, unit: "mg" },
    ],
    benefits: ["Whole-grain fiber keeps you full longer.", "Steady energy without spikes."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["dal", "lentil", "masoor", "toor", "moong", "chana dal", "sambar"], name: "Cooked Dal (Lentils)",
    description: "Protein-rich stewed lentils tempered with spices — India's everyday protein.",
    macros: { calories: 116, protein: 9, carbs: 20, fiber: 8, sugar: 0.7, fat: 0.4, satFat: 0.1 },
    vitamins: [
      { name: "Folate", value: 120, unit: "mcg" },
      { name: "Vitamin B1", value: 0.1, unit: "mg" },
      { name: "Vitamin B6", value: 0.1, unit: "mg" },
      { name: "Vitamin C", value: 1.5, unit: "mg" },
      { name: "Vitamin B3", value: 0.5, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 2, unit: "mg" },
      { name: "Potassium", value: 220, unit: "mg" },
      { name: "Magnesium", value: 25, unit: "mg" },
      { name: "Zinc", value: 1, unit: "mg" },
      { name: "Calcium", value: 20, unit: "mg" },
    ],
    benefits: ["Excellent plant protein and iron.", "High fiber supports gut health."],
    ayurveda: KAPHA_LIGHT,
  },
  {
    match: ["chicken", "murgh"], name: "Chicken Breast (cooked)",
    description: "Lean poultry meat — the benchmark lean protein, grilled or curried.",
    macros: { calories: 165, protein: 31, carbs: 0, fiber: 0, sugar: 0, fat: 3.6, satFat: 1 },
    vitamins: [
      { name: "Vitamin B3", value: 12, unit: "mg" },
      { name: "Vitamin B6", value: 0.6, unit: "mg" },
      { name: "Vitamin B12", value: 0.3, unit: "mcg" },
      { name: "Vitamin E", value: 0.3, unit: "mg" },
      { name: "Vitamin B1", value: 0.07, unit: "mg" },
    ],
    minerals: [
      { name: "Phosphorus", value: 200, unit: "mg" },
      { name: "Potassium", value: 250, unit: "mg" },
      { name: "Zinc", value: 1, unit: "mg" },
      { name: "Magnesium", value: 25, unit: "mg" },
      { name: "Iron", value: 0.7, unit: "mg" },
    ],
    benefits: ["Complete protein for muscle building.", "B vitamins support energy metabolism."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["egg", "anda", "omelette"], name: "Boiled Egg",
    description: "Complete-protein breakfast staple with yolk rich in choline.",
    macros: { calories: 155, protein: 13, carbs: 1.1, fiber: 0, sugar: 1.1, fat: 11, satFat: 3.3 },
    vitamins: [
      { name: "Vitamin A", value: 160, unit: "mcg" },
      { name: "Vitamin D", value: 2, unit: "mcg" },
      { name: "Vitamin B12", value: 0.9, unit: "mcg" },
      { name: "Vitamin B6", value: 0.17, unit: "mg" },
      { name: "Folate", value: 47, unit: "mcg" },
    ],
    minerals: [
      { name: "Phosphorus", value: 190, unit: "mg" },
      { name: "Iron", value: 1.2, unit: "mg" },
      { name: "Zinc", value: 1.3, unit: "mg" },
      { name: "Calcium", value: 56, unit: "mg" },
      { name: "Potassium", value: 138, unit: "mg" },
    ],
    benefits: ["Complete amino acid profile.", "Choline supports brain health."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["paneer", "cottage cheese"], name: "Paneer",
    description: "Fresh Indian cheese — soft cubes used in curries and tikkas.",
    macros: { calories: 265, protein: 18, carbs: 3.6, fiber: 0, sugar: 3.5, fat: 20, satFat: 12 },
    vitamins: [
      { name: "Vitamin A", value: 200, unit: "mcg" },
      { name: "Vitamin B12", value: 0.6, unit: "mcg" },
      { name: "Vitamin B2", value: 0.3, unit: "mg" },
      { name: "Folate", value: 10, unit: "mcg" },
      { name: "Vitamin E", value: 0.2, unit: "mg" },
    ],
    minerals: [
      { name: "Calcium", value: 480, unit: "mg" },
      { name: "Phosphorus", value: 380, unit: "mg" },
      { name: "Zinc", value: 1.5, unit: "mg" },
      { name: "Magnesium", value: 15, unit: "mg" },
      { name: "Potassium", value: 90, unit: "mg" },
    ],
    benefits: ["Dense vegetarian protein and calcium.", "Keeps you full for hours."],
    ayurveda: { dosha: "Pacifies Vata; heavy for Kapha in excess", taste: "Sweet", energy: "Cooling", postDigestive: "Sweet" },
  },
  {
    match: ["milk", "doodh"], name: "Cow Milk",
    description: "Whole cow milk — traditional source of calcium and protein.",
    macros: { calories: 61, protein: 3.2, carbs: 4.8, fiber: 0, sugar: 5, fat: 3.3, satFat: 1.9 },
    vitamins: [
      { name: "Vitamin A", value: 46, unit: "mcg" },
      { name: "Vitamin B12", value: 0.45, unit: "mcg" },
      { name: "Vitamin B2", value: 0.18, unit: "mg" },
      { name: "Folate", value: 5, unit: "mcg" },
      { name: "Vitamin B6", value: 0.04, unit: "mg" },
    ],
    minerals: [
      { name: "Calcium", value: 113, unit: "mg" },
      { name: "Potassium", value: 150, unit: "mg" },
      { name: "Phosphorus", value: 90, unit: "mg" },
      { name: "Magnesium", value: 11, unit: "mg" },
      { name: "Zinc", value: 0.4, unit: "mg" },
    ],
    benefits: ["Calcium and vitamin D for bones.", "Casein protein digests slowly overnight."],
    ayurveda: { dosha: "Deeply nourishing; pacifies Vata and Pitta", taste: "Sweet", energy: "Cooling", postDigestive: "Sweet" },
  },
  {
    match: ["curd", "yogurt", "dahi", "raita"], name: "Curd (Yogurt)",
    description: "Fermented milk — probiotic staple served plain or as raita.",
    macros: { calories: 61, protein: 3.5, carbs: 4.7, fiber: 0, sugar: 4.7, fat: 3.3, satFat: 2.1 },
    vitamins: [
      { name: "Vitamin B12", value: 0.4, unit: "mcg" },
      { name: "Vitamin B2", value: 0.14, unit: "mg" },
      { name: "Vitamin A", value: 30, unit: "mcg" },
    ],
    minerals: [
      { name: "Calcium", value: 110, unit: "mg" },
      { name: "Phosphorus", value: 85, unit: "mg" },
      { name: "Potassium", value: 140, unit: "mg" },
    ],
    benefits: ["Live cultures support gut flora.", "Calcium for bones and teeth."],
    ayurveda: { dosha: "Balances Vata; sour curd may aggravate Pitta/Kapha", taste: "Sour, Sweet", energy: "Heating", postDigestive: "Sour" },
  },
  {
    match: ["potato", "aloo"], name: "Boiled Potato",
    description: "Starchy tuber — versatile base for curries, mash and snacks.",
    macros: { calories: 87, protein: 1.9, carbs: 20, fiber: 1.8, sugar: 0.9, fat: 0.1, satFat: 0 },
    vitamins: [
      { name: "Vitamin C", value: 20, unit: "mg" },
      { name: "Vitamin B6", value: 0.3, unit: "mg" },
      { name: "Vitamin B3", value: 1, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 420, unit: "mg" },
      { name: "Magnesium", value: 21, unit: "mg" },
      { name: "Iron", value: 0.8, unit: "mg" },
    ],
    benefits: ["Potassium richer than banana per bite.", "Filling, low-fat energy."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["onion", "pyaz"], name: "Onion",
    description: "Pungent bulb forming the base of most Indian gravies.",
    macros: { calories: 40, protein: 1.1, carbs: 9.3, fiber: 1.7, sugar: 4.2, fat: 0.1, satFat: 0 },
    vitamins: [
      { name: "Vitamin C", value: 7.4, unit: "mg" },
      { name: "Vitamin B6", value: 0.12, unit: "mg" },
      { name: "Folate", value: 19, unit: "mcg" },
    ],
    minerals: [
      { name: "Potassium", value: 146, unit: "mg" },
      { name: "Manganese", value: 0.13, unit: "mg" },
      { name: "Calcium", value: 23, unit: "mg" },
    ],
    benefits: ["Prebiotic fiber feeds gut bacteria.", "Quercetin supports heart health."],
    ayurveda: KAPHA_LIGHT,
  },
  {
    match: ["tomato", "tamatar"], name: "Tomato",
    description: "Juicy red fruit-vegetable, base of curries and salads.",
    macros: { calories: 18, protein: 0.9, carbs: 3.9, fiber: 1.2, sugar: 2.6, fat: 0.2, satFat: 0 },
    vitamins: [
      { name: "Vitamin C", value: 13, unit: "mg" },
      { name: "Vitamin A", value: 42, unit: "mcg" },
      { name: "Vitamin K", value: 8, unit: "mcg" },
    ],
    minerals: [
      { name: "Potassium", value: 237, unit: "mg" },
      { name: "Manganese", value: 0.1, unit: "mg" },
      { name: "Magnesium", value: 11, unit: "mg" },
    ],
    benefits: ["Lycopene supports skin and heart.", "Very low calorie density."],
    ayurveda: PITTA_COOL,
  },
  {
    match: ["spinach", "palak", "saag"], name: "Spinach",
    description: "Iron-rich leafy green used in palak paneer, dal and salads.",
    macros: { calories: 23, protein: 2.9, carbs: 3.6, fiber: 2.2, sugar: 0.4, fat: 0.4, satFat: 0.1 },
    vitamins: [
      { name: "Vitamin A", value: 470, unit: "mcg" },
      { name: "Vitamin K", value: 480, unit: "mcg" },
      { name: "Folate", value: 194, unit: "mcg" },
      { name: "Vitamin C", value: 28, unit: "mg" },
      { name: "Vitamin B6", value: 0.2, unit: "mg" },
      { name: "Vitamin E", value: 2, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 2.7, unit: "mg" },
      { name: "Magnesium", value: 79, unit: "mg" },
      { name: "Potassium", value: 558, unit: "mg" },
      { name: "Calcium", value: 99, unit: "mg" },
      { name: "Zinc", value: 0.5, unit: "mg" },
    ],
    benefits: ["Iron and folate fight fatigue.", "Vitamin K for bone health."],
    ayurveda: KAPHA_LIGHT,
  },
  {
    match: ["almond", "badam"], name: "Almonds",
    description: "Nutrient-dense tree nut — soaked overnight in Ayurvedic tradition.",
    macros: { calories: 579, protein: 21, carbs: 22, fiber: 12, sugar: 4.4, fat: 50, satFat: 3.8 },
    vitamins: [
      { name: "Vitamin E", value: 26, unit: "mg" },
      { name: "Vitamin B2", value: 1.1, unit: "mg" },
      { name: "Folate", value: 44, unit: "mcg" },
    ],
    minerals: [
      { name: "Magnesium", value: 270, unit: "mg" },
      { name: "Calcium", value: 269, unit: "mg" },
      { name: "Iron", value: 3.7, unit: "mg" },
    ],
    benefits: ["Vitamin E for skin and brain.", "Healthy fats plus 21g protein."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["peanut", "groundnut", "moongfali"], name: "Peanuts",
    description: "Protein-packed legume eaten roasted or as butter/chikki.",
    macros: { calories: 567, protein: 26, carbs: 16, fiber: 8.5, sugar: 4.7, fat: 49, satFat: 6.8 },
    vitamins: [
      { name: "Vitamin E", value: 8, unit: "mg" },
      { name: "Vitamin B3", value: 12, unit: "mg" },
      { name: "Folate", value: 240, unit: "mcg" },
    ],
    minerals: [
      { name: "Magnesium", value: 168, unit: "mg" },
      { name: "Phosphorus", value: 376, unit: "mg" },
      { name: "Zinc", value: 3.3, unit: "mg" },
    ],
    benefits: ["26g plant protein per 100g.", "Niacin supports energy metabolism."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["oat", "oatmeal", "dalia"], name: "Oats",
    description: "Whole-grain porridge staple — slow-release morning energy.",
    macros: { calories: 389, protein: 16.9, carbs: 66, fiber: 10, sugar: 0.9, fat: 6.9, satFat: 1.2 },
    vitamins: [
      { name: "Vitamin B1", value: 0.76, unit: "mg" },
      { name: "Folate", value: 56, unit: "mcg" },
      { name: "Vitamin B6", value: 0.12, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 4.7, unit: "mg" },
      { name: "Magnesium", value: 177, unit: "mg" },
      { name: "Zinc", value: 4, unit: "mg" },
    ],
    benefits: ["Beta-glucan fiber lowers cholesterol.", "Keeps hunger away till lunch."],
    ayurveda: KAPHA_LIGHT,
  },
  {
    match: ["bread", "toast", "pav"], name: "Whole Wheat Bread",
    description: "Baked loaf slices — quick base for sandwiches and toast.",
    macros: { calories: 247, protein: 12, carbs: 43, fiber: 7, sugar: 5, fat: 3.4, satFat: 0.7 },
    vitamins: [
      { name: "Vitamin B3", value: 3, unit: "mg" },
      { name: "Vitamin B1", value: 0.25, unit: "mg" },
      { name: "Folate", value: 60, unit: "mcg" },
    ],
    minerals: [
      { name: "Iron", value: 2, unit: "mg" },
      { name: "Magnesium", value: 60, unit: "mg" },
      { name: "Zinc", value: 1.2, unit: "mg" },
    ],
    benefits: ["Fortified with B vitamins.", "Convenient portion-controlled energy."],
    ayurveda: TRIDOSHA,
  },
  {
    match: ["fish", "salmon", "rohu", "tuna", "machhi"], name: "Fish (cooked)",
    description: "Lean aquatic protein rich in omega-3s.",
    macros: { calories: 150, protein: 22, carbs: 0, fiber: 0, sugar: 0, fat: 6, satFat: 1.5 },
    vitamins: [
      { name: "Vitamin D", value: 5, unit: "mcg" },
      { name: "Vitamin B12", value: 2.5, unit: "mcg" },
      { name: "Vitamin B6", value: 0.3, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 350, unit: "mg" },
      { name: "Phosphorus", value: 220, unit: "mg" },
      { name: "Zinc", value: 0.5, unit: "mg" },
    ],
    benefits: ["Omega-3s support brain and heart.", "Easily digested complete protein."],
    ayurveda: VATA_SOOTHE,
  },
  {
    match: ["samosa"], name: "Samosa",
    description: "Crisp fried pastry with spiced potato filling — festive snack.",
    macros: { calories: 262, protein: 5, carbs: 30, fiber: 3, sugar: 2, fat: 14, satFat: 4 },
    vitamins: [
      { name: "Vitamin C", value: 5, unit: "mg" },
      { name: "Vitamin B6", value: 0.15, unit: "mg" },
      { name: "Vitamin B1", value: 0.1, unit: "mg" },
    ],
    minerals: [
      { name: "Potassium", value: 250, unit: "mg" },
      { name: "Iron", value: 1.2, unit: "mg" },
      { name: "Magnesium", value: 20, unit: "mg" },
    ],
    benefits: ["Festive treat — enjoy occasionally.", "Pairs well with mint chutney."],
    ayurveda: { dosha: "Heavy; aggravates Kapha in excess", taste: "Mixed", energy: "Heating", postDigestive: "Pungent" },
  },
  {
    match: ["dosa"], name: "Masala Dosa",
    description: "Fermented rice-lentil crepe with potato filling — South Indian classic.",
    macros: { calories: 168, protein: 4.4, carbs: 30, fiber: 1.5, sugar: 1, fat: 4.5, satFat: 1 },
    vitamins: [
      { name: "Vitamin B3", value: 1, unit: "mg" },
      { name: "Folate", value: 20, unit: "mcg" },
      { name: "Vitamin B1", value: 0.08, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 1, unit: "mg" },
      { name: "Magnesium", value: 20, unit: "mg" },
      { name: "Potassium", value: 100, unit: "mg" },
    ],
    benefits: ["Fermentation aids digestibility.", "Balanced carb-protein breakfast."],
    ayurveda: TRIDOSHA,
  },
  {
    match: ["idli"], name: "Idli",
    description: "Steamed fermented rice-lentil cakes — light and oil-free.",
    macros: { calories: 110, protein: 3.5, carbs: 24, fiber: 1, sugar: 0.5, fat: 0.5, satFat: 0.1 },
    vitamins: [
      { name: "Vitamin B3", value: 1, unit: "mg" },
      { name: "Folate", value: 15, unit: "mcg" },
      { name: "Vitamin B1", value: 0.05, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 0.8, unit: "mg" },
      { name: "Potassium", value: 90, unit: "mg" },
      { name: "Calcium", value: 20, unit: "mg" },
    ],
    benefits: ["Steamed, not fried — very light.", "Fermented for gut-friendly digestion."],
    ayurveda: TRIDOSHA,
  },
  {
    match: ["poha"], name: "Poha",
    description: "Flattened-rice breakfast tossed with peanuts, onion and lemon.",
    macros: { calories: 130, protein: 2.5, carbs: 27, fiber: 1.5, sugar: 1, fat: 1.5, satFat: 0.3 },
    vitamins: [
      { name: "Vitamin B1", value: 0.08, unit: "mg" },
      { name: "Folate", value: 12, unit: "mcg" },
      { name: "Vitamin B3", value: 0.8, unit: "mg" },
    ],
    minerals: [
      { name: "Iron", value: 2, unit: "mg" },
      { name: "Potassium", value: 120, unit: "mg" },
      { name: "Magnesium", value: 15, unit: "mg" },
    ],
    benefits: ["Light, iron-absorbing lemon combo.", "Gentle morning meal."],
    ayurveda: TRIDOSHA,
  },
];

export function lookupLocalFood(query: string): LocalFood | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return null;
  // Prefer longest keyword match so "chicken biryani" hits biryani/rice over chicken.
  let best: LocalFood | null = null;
  let bestLen = 0;
  for (const food of LOCAL_FOODS) {
    for (const m of food.match) {
      if (q.includes(m) && m.length > bestLen) {
        best = food;
        bestLen = m.length;
      }
    }
  }
  if (best) return best;
  // Single-word plural fallback: "apples" -> "apple"
  const singular = q.replace(/s$/, "");
  const pluralHit = LOCAL_FOODS.find((f) => f.match.some((m) => singular.includes(m)));
  if (pluralHit) return pluralHit;
  // Fuzzy fallback for misspellings ("bananna" -> Banana). Matching is
  // still verified — random strings match nothing and return null.
  return (
    LOCAL_FOODS.find(
      (f) => isFoodNameMatch(q, f.name) || f.match.some((m) => isFoodNameMatch(q, m)),
    ) ?? null
  );
}
