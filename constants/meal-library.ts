import { Macros } from "@/types/diet";

export interface LibraryMeal {
  id: string;
  name: string;
  cuisine: string;
  mealCategory: string;
  calories: number;
  macros: Macros;
  prepTime: number;
  portion: string;
  tags: string[];
}

export interface MealCategory {
  id: string;
  name: string;
  cuisine: string;
  meals: LibraryMeal[];
}

export interface CuisineGroup {
  id: string;
  name: string;
  categories: MealCategory[];
}

const mealLibrary: CuisineGroup[] = [
  {
    id: "south-indian",
    name: "South Indian",
    categories: [
      {
        id: "south-breakfast",
        name: "Breakfast",
        cuisine: "South Indian",
        meals: [
          { id: "idli-sambar", name: "Idli Sambar with Coconut Chutney", cuisine: "South Indian", mealCategory: "Breakfast", calories: 320, macros: { protein: 12, carbs: 58, fat: 6 }, prepTime: 25, portion: "4 idlis with 1 cup sambar", tags: ["Fermented", "High Protein", "Light"] },
          { id: "dosa-chutney", name: "Dosa with Peanut Chutney", cuisine: "South Indian", mealCategory: "Breakfast", calories: 310, macros: { protein: 10, carbs: 52, fat: 8 }, prepTime: 20, portion: "2 dosas", tags: ["Fermented", "Crispy"] },
          { id: "upma", name: "Rava Upma", cuisine: "South Indian", mealCategory: "Breakfast", calories: 280, macros: { protein: 8, carbs: 48, fat: 7 }, prepTime: 15, portion: "1 bowl", tags: ["Quick", "Traditional"] },
          { id: "medu-vada", name: "Medu Vada", cuisine: "South Indian", mealCategory: "Breakfast", calories: 350, macros: { protein: 14, carbs: 42, fat: 15 }, prepTime: 30, portion: "3 vadas", tags: ["Crispy", "Protein-Rich"] },
          { id: "pongal", name: "Ven Pongal", cuisine: "South Indian", mealCategory: "Breakfast", calories: 340, macros: { protein: 12, carbs: 56, fat: 8 }, prepTime: 25, portion: "1 bowl", tags: ["Comfort", "Filling"] },
          { id: "pesarattu", name: "Pesarattu", cuisine: "South Indian", mealCategory: "Breakfast", calories: 300, macros: { protein: 16, carbs: 46, fat: 7 }, prepTime: 20, portion: "2 dosas", tags: ["High Protein", "Green Gram"] },
          { id: "uttapam", name: "Vegetable Uttapam", cuisine: "South Indian", mealCategory: "Breakfast", calories: 290, macros: { protein: 11, carbs: 48, fat: 7 }, prepTime: 20, portion: "2 pieces", tags: ["Veggie Loaded", "Fermented"] },
          { id: "appam-stew", name: "Appam with Vegetable Stew", cuisine: "South Indian", mealCategory: "Breakfast", calories: 350, macros: { protein: 10, carbs: 58, fat: 9 }, prepTime: 30, portion: "3 appams + stew", tags: ["Kerala Style", "Coconut"] },
          { id: "puttu-kadala", name: "Puttu with Kadala Curry", cuisine: "South Indian", mealCategory: "Breakfast", calories: 360, macros: { protein: 14, carbs: 62, fat: 7 }, prepTime: 25, portion: "2 puttu + curry", tags: ["Steamed", "Protein-Rich"] },
        ],
      },
      {
        id: "south-lunch-dinner",
        name: "Lunch & Dinner",
        cuisine: "South Indian",
        meals: [
          { id: "meals-plate", name: "South Indian Meals Plate", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 520, macros: { protein: 18, carbs: 82, fat: 12 }, prepTime: 40, portion: "Full plate", tags: ["Traditional", "Complete Meal"] },
          { id: "sambar-rice", name: "Sambar Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 380, macros: { protein: 14, carbs: 68, fat: 6 }, prepTime: 30, portion: "1 bowl", tags: ["Protein-Rich", "Comfort"] },
          { id: "curd-rice", name: "Curd Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 280, macros: { protein: 10, carbs: 52, fat: 4 }, prepTime: 10, portion: "1 bowl", tags: ["Cooling", "Easy Digest"] },
          { id: "bisi-bele-bath", name: "Bisi Bele Bath", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 420, macros: { protein: 15, carbs: 72, fat: 9 }, prepTime: 35, portion: "1 bowl", tags: ["Spicy", "One Pot"] },
          { id: "lemon-rice", name: "Lemon Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 320, macros: { protein: 8, carbs: 58, fat: 8 }, prepTime: 15, portion: "1 bowl", tags: ["Tangy", "Quick"] },
          { id: "tamarind-rice", name: "Tamarind Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 340, macros: { protein: 9, carbs: 62, fat: 7 }, prepTime: 20, portion: "1 bowl", tags: ["Tangy", "Traditional"] },
          { id: "coconut-rice", name: "Coconut Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 380, macros: { protein: 10, carbs: 64, fat: 10 }, prepTime: 20, portion: "1 bowl", tags: ["Aromatic", "Coconut"] },
          { id: "avial-rice", name: "Avial with Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 360, macros: { protein: 12, carbs: 60, fat: 8 }, prepTime: 30, portion: "1 bowl", tags: ["Kerala Style", "Veggie Rich"] },
          { id: "rasam-rice", name: "Rasam Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 300, macros: { protein: 8, carbs: 56, fat: 5 }, prepTime: 20, portion: "1 bowl", tags: ["Light", "Comfort"] },
          { id: "fish-curry-rice", name: "Fish Curry with Rice", cuisine: "South Indian", mealCategory: "Lunch & Dinner", calories: 480, macros: { protein: 32, carbs: 58, fat: 12 }, prepTime: 35, portion: "1 bowl", tags: ["High Protein", "Coastal"] },
        ],
      },
      {
        id: "south-snacks",
        name: "Snacks",
        cuisine: "South Indian",
        meals: [
          { id: "masala-vada", name: "Masala Vada", cuisine: "South Indian", mealCategory: "Snacks", calories: 180, macros: { protein: 8, carbs: 24, fat: 6 }, prepTime: 20, portion: "2 pieces", tags: ["Crispy", "Evening"] },
          { id: "bonda", name: "Bonda", cuisine: "South Indian", mealCategory: "Snacks", calories: 220, macros: { protein: 6, carbs: 32, fat: 8 }, prepTime: 20, portion: "2 pieces", tags: ["Fried", "Traditional"] },
          { id: "murukku", name: "Murukku", cuisine: "South Indian", mealCategory: "Snacks", calories: 150, macros: { protein: 4, carbs: 20, fat: 6 }, prepTime: 30, portion: "Handful", tags: ["Crunchy", "Tea Time"] },
          { id: "banana-bajji", name: "Banana Bajji", cuisine: "South Indian", mealCategory: "Snacks", calories: 190, macros: { protein: 5, carbs: 30, fat: 6 }, prepTime: 15, portion: "3 pieces", tags: ["Sweet & Savory", "Crispy"] },
          { id: "paniyaram", name: "Paniyaram", cuisine: "South Indian", mealCategory: "Snacks", calories: 160, macros: { protein: 6, carbs: 26, fat: 4 }, prepTime: 20, portion: "6 pieces", tags: ["Healthy", "Fermented"] },
          { id: "sundal", name: "Masala Sundal", cuisine: "South Indian", mealCategory: "Snacks", calories: 140, macros: { protein: 9, carbs: 22, fat: 3 }, prepTime: 10, portion: "1 cup", tags: ["Protein-Rich", "Light"] },
        ],
      },
    ],
  },
  {
    id: "north-indian",
    name: "North Indian",
    categories: [
      {
        id: "north-breakfast",
        name: "Breakfast",
        cuisine: "North Indian",
        meals: [
          { id: "moong-dal-cheela", name: "Moong Dal Cheela with Mint Chutney", cuisine: "North Indian", mealCategory: "Breakfast", calories: 280, macros: { protein: 18, carbs: 35, fat: 8 }, prepTime: 15, portion: "2 cheelas", tags: ["High Protein", "Quick", "Vegetarian"] },
          { id: "paratha-curd", name: "Aloo Paratha with Curd", cuisine: "North Indian", mealCategory: "Breakfast", calories: 420, macros: { protein: 12, carbs: 62, fat: 14 }, prepTime: 25, portion: "2 parathas", tags: ["Filling", "Traditional"] },
          { id: "poha", name: "Poha with Peanuts", cuisine: "North Indian", mealCategory: "Breakfast", calories: 260, macros: { protein: 8, carbs: 42, fat: 8 }, prepTime: 12, portion: "1 bowl", tags: ["Quick", "Light"] },
          { id: "besan-cheela", name: "Besan Cheela", cuisine: "North Indian", mealCategory: "Breakfast", calories: 240, macros: { protein: 12, carbs: 28, fat: 9 }, prepTime: 15, portion: "2 cheelas", tags: ["Protein-Rich", "Gluten-Free"] },
          { id: "chole-bhature-breakfast", name: "Chole Puri", cuisine: "North Indian", mealCategory: "Breakfast", calories: 480, macros: { protein: 16, carbs: 68, fat: 16 }, prepTime: 30, portion: "2 puris + chole", tags: ["Indulgent", "Popular"] },
          { id: "methi-paratha", name: "Methi Paratha", cuisine: "North Indian", mealCategory: "Breakfast", calories: 320, macros: { protein: 10, carbs: 48, fat: 10 }, prepTime: 20, portion: "2 parathas", tags: ["Nutritious", "Iron-Rich"] },
          { id: "paneer-paratha", name: "Paneer Paratha", cuisine: "North Indian", mealCategory: "Breakfast", calories: 460, macros: { protein: 18, carbs: 56, fat: 18 }, prepTime: 25, portion: "2 parathas", tags: ["High Protein", "Filling"] },
          { id: "bread-pakora", name: "Bread Pakora", cuisine: "North Indian", mealCategory: "Breakfast", calories: 340, macros: { protein: 10, carbs: 44, fat: 14 }, prepTime: 15, portion: "3 pieces", tags: ["Crispy", "Tea Time"] },
        ],
      },
      {
        id: "north-lunch-dinner",
        name: "Lunch & Dinner",
        cuisine: "North Indian",
        meals: [
          { id: "dal-tadka-roti", name: "Dal Tadka with Roti", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 380, macros: { protein: 16, carbs: 58, fat: 10 }, prepTime: 30, portion: "1 bowl dal + 2 rotis", tags: ["Protein-Rich", "Comfort"] },
          { id: "rajma-rice", name: "Rajma Chawal", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 450, macros: { protein: 18, carbs: 72, fat: 10 }, prepTime: 40, portion: "1 bowl", tags: ["Protein-Rich", "Filling"] },
          { id: "chole-bhature", name: "Chole Bhature", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 620, macros: { protein: 20, carbs: 88, fat: 22 }, prepTime: 45, portion: "2 bhature + chole", tags: ["Indulgent", "Weekend"] },
          { id: "paneer-curry", name: "Paneer Curry with Rice", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 520, macros: { protein: 24, carbs: 62, fat: 20 }, prepTime: 35, portion: "1 bowl curry + rice", tags: ["High Protein", "Creamy"] },
          { id: "kadhi-pakora", name: "Kadhi Pakora", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 380, macros: { protein: 14, carbs: 48, fat: 16 }, prepTime: 35, portion: "1 bowl", tags: ["Tangy", "Comfort"] },
          { id: "palak-paneer", name: "Palak Paneer with Roti", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 440, macros: { protein: 22, carbs: 48, fat: 18 }, prepTime: 30, portion: "1 bowl + 2 rotis", tags: ["High Protein", "Iron-Rich"] },
          { id: "aloo-gobi", name: "Aloo Gobi with Roti", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 360, macros: { protein: 10, carbs: 58, fat: 10 }, prepTime: 25, portion: "1 bowl + 2 rotis", tags: ["Traditional", "Dry Curry"] },
          { id: "matar-paneer", name: "Matar Paneer with Rice", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 480, macros: { protein: 20, carbs: 60, fat: 18 }, prepTime: 30, portion: "1 bowl", tags: ["High Protein", "Creamy"] },
          { id: "bhindi-masala", name: "Bhindi Masala with Roti", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 340, macros: { protein: 9, carbs: 52, fat: 11 }, prepTime: 25, portion: "1 bowl + 2 rotis", tags: ["Fiber-Rich", "Dry Curry"] },
          { id: "dal-makhani", name: "Dal Makhani with Rice", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 460, macros: { protein: 18, carbs: 64, fat: 14 }, prepTime: 45, portion: "1 bowl", tags: ["Rich", "Protein-Rich"] },
          { id: "baingan-bharta", name: "Baingan Bharta with Roti", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 320, macros: { protein: 8, carbs: 48, fat: 11 }, prepTime: 30, portion: "1 bowl + 2 rotis", tags: ["Smoky", "Traditional"] },
          { id: "jeera-rice-dal", name: "Jeera Rice with Dal", cuisine: "North Indian", mealCategory: "Lunch & Dinner", calories: 400, macros: { protein: 14, carbs: 68, fat: 8 }, prepTime: 25, portion: "1 plate", tags: ["Comfort", "Simple"] },
        ],
      },
      {
        id: "north-snacks",
        name: "Snacks",
        cuisine: "North Indian",
        meals: [
          { id: "samosa", name: "Samosa", cuisine: "North Indian", mealCategory: "Snacks", calories: 262, macros: { protein: 6, carbs: 38, fat: 10 }, prepTime: 30, portion: "2 pieces", tags: ["Crispy", "Popular"] },
          { id: "pakora", name: "Mixed Pakora", cuisine: "North Indian", mealCategory: "Snacks", calories: 220, macros: { protein: 7, carbs: 28, fat: 9 }, prepTime: 20, portion: "Bowl", tags: ["Fried", "Monsoon"] },
          { id: "kachori", name: "Dal Kachori", cuisine: "North Indian", mealCategory: "Snacks", calories: 280, macros: { protein: 8, carbs: 36, fat: 12 }, prepTime: 30, portion: "2 pieces", tags: ["Crispy", "Spicy"] },
          { id: "aloo-tikki", name: "Aloo Tikki", cuisine: "North Indian", mealCategory: "Snacks", calories: 240, macros: { protein: 6, carbs: 34, fat: 9 }, prepTime: 20, portion: "2 pieces", tags: ["Crispy", "Street Food"] },
          { id: "momos", name: "Veg Momos", cuisine: "North Indian", mealCategory: "Snacks", calories: 260, macros: { protein: 8, carbs: 42, fat: 7 }, prepTime: 25, portion: "6 pieces", tags: ["Steamed", "Popular"] },
          { id: "bhel-puri", name: "Bhel Puri", cuisine: "North Indian", mealCategory: "Snacks", calories: 180, macros: { protein: 5, carbs: 32, fat: 4 }, prepTime: 10, portion: "1 bowl", tags: ["Tangy", "Light"] },
        ],
      },
    ],
  },
  {
    id: "protein-rich",
    name: "High Protein",
    categories: [
      {
        id: "protein-meals",
        name: "Protein Meals",
        cuisine: "High Protein",
        meals: [
          { id: "paneer-tikka-bowl", name: "Paneer Tikka Bowl", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 420, macros: { protein: 32, carbs: 28, fat: 22 }, prepTime: 30, portion: "200g paneer + veggies", tags: ["High Protein", "Grilled"] },
          { id: "dal-khichdi", name: "Moong Dal Khichdi", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 340, macros: { protein: 16, carbs: 56, fat: 6 }, prepTime: 25, portion: "1 bowl", tags: ["Protein-Rich", "Easy Digest"] },
          { id: "chickpea-curry", name: "Chickpea Curry with Quinoa", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 410, macros: { protein: 20, carbs: 58, fat: 12 }, prepTime: 30, portion: "1 bowl", tags: ["Vegan", "Protein-Rich"] },
          { id: "sprouts-salad", name: "Mixed Sprouts Salad", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 280, macros: { protein: 18, carbs: 36, fat: 8 }, prepTime: 10, portion: "Large bowl", tags: ["Fresh", "High Protein", "Light"] },
          { id: "egg-bhurji", name: "Egg Bhurji with Roti", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 380, macros: { protein: 24, carbs: 36, fat: 16 }, prepTime: 15, portion: "3 eggs + 2 rotis", tags: ["Quick", "High Protein"] },
          { id: "grilled-paneer-salad", name: "Grilled Paneer Salad", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 360, macros: { protein: 28, carbs: 24, fat: 18 }, prepTime: 15, portion: "Large bowl", tags: ["Fresh", "High Protein", "Low Carb"] },
          { id: "chicken-tikka", name: "Chicken Tikka with Mint Chutney", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 320, macros: { protein: 38, carbs: 12, fat: 14 }, prepTime: 30, portion: "200g chicken", tags: ["Grilled", "High Protein", "Low Carb"] },
          { id: "boiled-egg-bowl", name: "Boiled Egg & Veggie Bowl", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 280, macros: { protein: 20, carbs: 26, fat: 12 }, prepTime: 15, portion: "3 eggs + veggies", tags: ["Quick", "High Protein"] },
          { id: "soya-chunks-curry", name: "Soya Chunks Curry", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 340, macros: { protein: 26, carbs: 38, fat: 10 }, prepTime: 25, portion: "1 bowl", tags: ["Vegan", "High Protein"] },
          { id: "lentil-soup", name: "Mixed Lentil Soup", cuisine: "High Protein", mealCategory: "Protein Meals", calories: 260, macros: { protein: 18, carbs: 40, fat: 4 }, prepTime: 30, portion: "Large bowl", tags: ["Comforting", "Protein-Rich"] },
        ],
      },
    ],
  },
  {
    id: "healthy-bowl",
    name: "Healthy Bowls",
    categories: [
      {
        id: "salad-bowls",
        name: "Salad Bowls",
        cuisine: "Healthy Bowls",
        meals: [
          { id: "chickpea-salad", name: "Chickpea Salad Bowl", cuisine: "Healthy Bowls", mealCategory: "Salad Bowls", calories: 350, macros: { protein: 16, carbs: 48, fat: 12 }, prepTime: 10, portion: "Large bowl", tags: ["Quick", "Fresh", "Protein-Rich"] },
          { id: "quinoa-bowl", name: "Quinoa Buddha Bowl", cuisine: "Healthy Bowls", mealCategory: "Salad Bowls", calories: 420, macros: { protein: 18, carbs: 54, fat: 16 }, prepTime: 20, portion: "Large bowl", tags: ["Complete Meal", "Vegan"] },
          { id: "greek-salad", name: "Greek Salad with Paneer", cuisine: "Healthy Bowls", mealCategory: "Salad Bowls", calories: 320, macros: { protein: 18, carbs: 20, fat: 18 }, prepTime: 10, portion: "Bowl", tags: ["Low Carb", "Fresh"] },
        ],
      },
      {
        id: "grain-bowls",
        name: "Grain Bowls",
        cuisine: "Healthy Bowls",
        meals: [
          { id: "brown-rice-bowl", name: "Brown Rice & Veggie Bowl", cuisine: "Healthy Bowls", mealCategory: "Grain Bowls", calories: 380, macros: { protein: 14, carbs: 62, fat: 10 }, prepTime: 25, portion: "Bowl", tags: ["Fiber-Rich", "Wholesome"] },
          { id: "millet-bowl", name: "Millet Power Bowl", cuisine: "Healthy Bowls", mealCategory: "Grain Bowls", calories: 360, macros: { protein: 12, carbs: 58, fat: 9 }, prepTime: 30, portion: "Bowl", tags: ["Ancient Grain", "Healthy"] },
        ],
      },
    ],
  },
  {
    id: "quick-meals",
    name: "Quick Meals",
    categories: [
      {
        id: "under-15",
        name: "Under 15 Minutes",
        cuisine: "Quick Meals",
        meals: [
          { id: "masala-oats", name: "Masala Oats", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 240, macros: { protein: 10, carbs: 38, fat: 6 }, prepTime: 8, portion: "1 bowl", tags: ["Quick", "Fiber-Rich", "Healthy"] },
          { id: "bread-omelette", name: "Bread Omelette", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 320, macros: { protein: 18, carbs: 32, fat: 14 }, prepTime: 10, portion: "2 eggs + 2 bread", tags: ["Quick", "Protein-Rich"] },
          { id: "instant-upma", name: "Instant Vermicelli Upma", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 280, macros: { protein: 8, carbs: 52, fat: 6 }, prepTime: 12, portion: "1 bowl", tags: ["Quick", "Easy"] },
          { id: "paneer-sandwich", name: "Grilled Paneer Sandwich", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 380, macros: { protein: 18, carbs: 42, fat: 16 }, prepTime: 10, portion: "2 sandwiches", tags: ["Quick", "Protein-Rich"] },
          { id: "veggie-wrap", name: "Veggie & Hummus Wrap", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 320, macros: { protein: 12, carbs: 48, fat: 10 }, prepTime: 8, portion: "1 wrap", tags: ["Quick", "Fresh"] },
          { id: "dal-tadka-quick", name: "Quick Dal Tadka", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 240, macros: { protein: 14, carbs: 38, fat: 4 }, prepTime: 12, portion: "1 bowl", tags: ["Quick", "Protein-Rich"] },
          { id: "maggi-healthy", name: "Loaded Veggie Maggi", cuisine: "Quick Meals", mealCategory: "Under 15 Minutes", calories: 300, macros: { protein: 10, carbs: 52, fat: 6 }, prepTime: 10, portion: "1 bowl", tags: ["Quick", "Veggie Loaded"] },
        ],
      },
    ],
  },
  {
    id: "ayurvedic",
    name: "Ayurvedic",
    categories: [
      {
        id: "ayurvedic-meals",
        name: "Ayurvedic Meals",
        cuisine: "Ayurvedic",
        meals: [
          { id: "khichdi-ghee", name: "Khichdi with Ghee", cuisine: "Ayurvedic", mealCategory: "Ayurvedic Meals", calories: 330, macros: { protein: 14, carbs: 54, fat: 8 }, prepTime: 25, portion: "1 bowl", tags: ["Healing", "Comfort", "Easy Digest"] },
          { id: "kitchari", name: "Mung Dal Kitchari", cuisine: "Ayurvedic", mealCategory: "Ayurvedic Meals", calories: 310, macros: { protein: 16, carbs: 50, fat: 6 }, prepTime: 30, portion: "1 bowl", tags: ["Detox", "Balancing"] },
          { id: "golden-milk-bowl", name: "Golden Milk Oatmeal", cuisine: "Ayurvedic", mealCategory: "Ayurvedic Meals", calories: 280, macros: { protein: 10, carbs: 44, fat: 8 }, prepTime: 10, portion: "1 bowl", tags: ["Anti-inflammatory", "Warming"] },
        ],
      },
    ],
  },
  {
    id: "vegan",
    name: "Vegan",
    categories: [
      {
        id: "vegan-meals",
        name: "Vegan Meals",
        cuisine: "Vegan",
        meals: [
          { id: "tofu-curry", name: "Tofu Curry with Rice", cuisine: "Vegan", mealCategory: "Vegan Meals", calories: 420, macros: { protein: 22, carbs: 58, fat: 14 }, prepTime: 30, portion: "1 bowl", tags: ["High Protein", "Vegan"] },
          { id: "chana-masala", name: "Chana Masala", cuisine: "Vegan", mealCategory: "Vegan Meals", calories: 380, macros: { protein: 16, carbs: 62, fat: 8 }, prepTime: 30, portion: "1 bowl", tags: ["Protein-Rich", "Spicy"] },
          { id: "veg-pulao", name: "Vegetable Pulao", cuisine: "Vegan", mealCategory: "Vegan Meals", calories: 340, macros: { protein: 10, carbs: 58, fat: 8 }, prepTime: 25, portion: "1 bowl", tags: ["One Pot", "Aromatic"] },
          { id: "quinoa-upma", name: "Quinoa Upma", cuisine: "Vegan", mealCategory: "Vegan Meals", calories: 290, macros: { protein: 12, carbs: 44, fat: 8 }, prepTime: 15, portion: "1 bowl", tags: ["Protein-Rich", "Gluten-Free"] },
        ],
      },
    ],
  },
  {
    id: "snacks",
    name: "Healthy Snacks",
    categories: [
      {
        id: "light-snacks",
        name: "Light Snacks",
        cuisine: "Healthy Snacks",
        meals: [
          { id: "roasted-chana", name: "Roasted Chana", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 180, macros: { protein: 10, carbs: 28, fat: 3 }, prepTime: 5, portion: "Handful", tags: ["Crunchy", "Protein-Rich"] },
          { id: "makhana", name: "Roasted Makhana", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 120, macros: { protein: 4, carbs: 18, fat: 4 }, prepTime: 5, portion: "Bowl", tags: ["Light", "Low Calorie"] },
          { id: "fruit-yogurt", name: "Fruit & Yogurt Bowl", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 200, macros: { protein: 8, carbs: 36, fat: 4 }, prepTime: 5, portion: "Bowl", tags: ["Fresh", "Probiotic"] },
          { id: "trail-mix", name: "Nuts & Seeds Trail Mix", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 220, macros: { protein: 8, carbs: 16, fat: 16 }, prepTime: 2, portion: "Handful", tags: ["Energy Boost", "Healthy Fats"] },
          { id: "peanut-butter-toast", name: "Peanut Butter Toast", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 240, macros: { protein: 10, carbs: 28, fat: 10 }, prepTime: 5, portion: "2 slices", tags: ["Quick", "Protein-Rich"] },
          { id: "cucumber-hummus", name: "Cucumber & Hummus", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 140, macros: { protein: 6, carbs: 18, fat: 5 }, prepTime: 5, portion: "1 cup", tags: ["Fresh", "Low Calorie"] },
          { id: "banana-oats", name: "Banana Oat Smoothie", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 280, macros: { protein: 10, carbs: 48, fat: 6 }, prepTime: 5, portion: "1 glass", tags: ["Quick", "Energizing"] },
          { id: "sprout-chaat", name: "Sprout Chaat", cuisine: "Healthy Snacks", mealCategory: "Light Snacks", calories: 160, macros: { protein: 10, carbs: 24, fat: 3 }, prepTime: 10, portion: "1 bowl", tags: ["Protein-Rich", "Tangy"] },
        ],
      },
    ],
  },
  {
    id: "west-indian",
    name: "West Indian",
    categories: [
      {
        id: "west-breakfast",
        name: "Breakfast",
        cuisine: "West Indian",
        meals: [
          { id: "thepla", name: "Methi Thepla with Curd", cuisine: "West Indian", mealCategory: "Breakfast", calories: 320, macros: { protein: 10, carbs: 52, fat: 8 }, prepTime: 20, portion: "3 theplas", tags: ["Gujarati", "Travel Friendly"] },
          { id: "misal-pav", name: "Misal Pav", cuisine: "West Indian", mealCategory: "Breakfast", calories: 420, macros: { protein: 16, carbs: 62, fat: 12 }, prepTime: 30, portion: "1 bowl + 2 pav", tags: ["Spicy", "Maharashtra"] },
          { id: "sabudana-khichdi", name: "Sabudana Khichdi", cuisine: "West Indian", mealCategory: "Breakfast", calories: 340, macros: { protein: 6, carbs: 62, fat: 8 }, prepTime: 20, portion: "1 bowl", tags: ["Fasting", "Energy Boost"] },
          { id: "dhokla", name: "Khaman Dhokla", cuisine: "West Indian", mealCategory: "Breakfast", calories: 240, macros: { protein: 10, carbs: 42, fat: 4 }, prepTime: 25, portion: "4 pieces", tags: ["Steamed", "Light"] },
        ],
      },
      {
        id: "west-lunch-dinner",
        name: "Lunch & Dinner",
        cuisine: "West Indian",
        meals: [
          { id: "gujarati-thali", name: "Gujarati Thali", cuisine: "West Indian", mealCategory: "Lunch & Dinner", calories: 580, macros: { protein: 18, carbs: 92, fat: 16 }, prepTime: 50, portion: "Full plate", tags: ["Complete Meal", "Traditional"] },
          { id: "dal-baati", name: "Dal Baati Churma", cuisine: "West Indian", mealCategory: "Lunch & Dinner", calories: 680, macros: { protein: 20, carbs: 98, fat: 24 }, prepTime: 60, portion: "Full plate", tags: ["Rajasthani", "Indulgent"] },
          { id: "pav-bhaji", name: "Pav Bhaji", cuisine: "West Indian", mealCategory: "Lunch & Dinner", calories: 520, macros: { protein: 14, carbs: 76, fat: 18 }, prepTime: 30, portion: "3 pav + bhaji", tags: ["Street Food", "Popular"] },
          { id: "undhiyu", name: "Undhiyu with Puri", cuisine: "West Indian", mealCategory: "Lunch & Dinner", calories: 480, macros: { protein: 14, carbs: 68, fat: 18 }, prepTime: 45, portion: "1 bowl + 2 puris", tags: ["Traditional", "Winter Special"] },
        ],
      },
      {
        id: "west-snacks",
        name: "Snacks",
        cuisine: "West Indian",
        meals: [
          { id: "khandvi", name: "Khandvi", cuisine: "West Indian", mealCategory: "Snacks", calories: 160, macros: { protein: 8, carbs: 22, fat: 5 }, prepTime: 25, portion: "6 rolls", tags: ["Light", "Delicate"] },
          { id: "fafda", name: "Fafda with Chutney", cuisine: "West Indian", mealCategory: "Snacks", calories: 220, macros: { protein: 6, carbs: 32, fat: 8 }, prepTime: 30, portion: "4 pieces", tags: ["Crispy", "Traditional"] },
          { id: "vada-pav", name: "Vada Pav", cuisine: "West Indian", mealCategory: "Snacks", calories: 320, macros: { protein: 8, carbs: 48, fat: 11 }, prepTime: 20, portion: "1 piece", tags: ["Street Food", "Iconic"] },
        ],
      },
    ],
  },
  {
    id: "east-indian",
    name: "East Indian",
    categories: [
      {
        id: "east-breakfast",
        name: "Breakfast",
        cuisine: "East Indian",
        meals: [
          { id: "luchi-aloo-dum", name: "Luchi with Aloo Dum", cuisine: "East Indian", mealCategory: "Breakfast", calories: 420, macros: { protein: 10, carbs: 64, fat: 14 }, prepTime: 30, portion: "3 luchis + curry", tags: ["Bengali", "Festive"] },
          { id: "ghugni", name: "Ghugni Chaat", cuisine: "East Indian", mealCategory: "Breakfast", calories: 280, macros: { protein: 12, carbs: 46, fat: 6 }, prepTime: 20, portion: "1 bowl", tags: ["Protein-Rich", "Street Food"] },
          { id: "dalia", name: "Vegetable Dalia", cuisine: "East Indian", mealCategory: "Breakfast", calories: 260, macros: { protein: 10, carbs: 48, fat: 4 }, prepTime: 15, portion: "1 bowl", tags: ["Healthy", "Fiber-Rich"] },
        ],
      },
      {
        id: "east-lunch-dinner",
        name: "Lunch & Dinner",
        cuisine: "East Indian",
        meals: [
          { id: "bengali-thali", name: "Bengali Thali", cuisine: "East Indian", mealCategory: "Lunch & Dinner", calories: 540, macros: { protein: 22, carbs: 78, fat: 14 }, prepTime: 50, portion: "Full plate", tags: ["Complete Meal", "Traditional"] },
          { id: "macher-jhol", name: "Macher Jhol with Rice", cuisine: "East Indian", mealCategory: "Lunch & Dinner", calories: 420, macros: { protein: 28, carbs: 56, fat: 10 }, prepTime: 30, portion: "1 bowl", tags: ["Fish", "Light Curry"] },
          { id: "cholar-dal", name: "Cholar Dal with Luchi", cuisine: "East Indian", mealCategory: "Lunch & Dinner", calories: 460, macros: { protein: 16, carbs: 68, fat: 14 }, prepTime: 35, portion: "1 bowl + 3 luchis", tags: ["Bengali", "Slightly Sweet"] },
          { id: "aloo-posto", name: "Aloo Posto with Rice", cuisine: "East Indian", mealCategory: "Lunch & Dinner", calories: 380, macros: { protein: 10, carbs: 64, fat: 10 }, prepTime: 25, portion: "1 bowl", tags: ["Poppy Seeds", "Traditional"] },
        ],
      },
      {
        id: "east-snacks",
        name: "Snacks",
        cuisine: "East Indian",
        meals: [
          { id: "jhalmuri", name: "Jhalmuri", cuisine: "East Indian", mealCategory: "Snacks", calories: 140, macros: { protein: 4, carbs: 26, fat: 3 }, prepTime: 5, portion: "1 bowl", tags: ["Light", "Tangy"] },
          { id: "puchka", name: "Puchka (Pani Puri)", cuisine: "East Indian", mealCategory: "Snacks", calories: 160, macros: { protein: 5, carbs: 30, fat: 3 }, prepTime: 20, portion: "6 pieces", tags: ["Street Food", "Tangy"] },
          { id: "telebhaja", name: "Telebhaja (Mixed Fritters)", cuisine: "East Indian", mealCategory: "Snacks", calories: 200, macros: { protein: 6, carbs: 28, fat: 8 }, prepTime: 20, portion: "Bowl", tags: ["Crispy", "Monsoon"] },
        ],
      },
    ],
  },
  {
    id: "fusion-modern",
    name: "Fusion & Modern",
    categories: [
      {
        id: "fusion-meals",
        name: "Fusion Meals",
        cuisine: "Fusion & Modern",
        meals: [
          { id: "paneer-burrito", name: "Paneer Tikka Burrito", cuisine: "Fusion & Modern", mealCategory: "Fusion Meals", calories: 480, macros: { protein: 24, carbs: 56, fat: 18 }, prepTime: 20, portion: "1 burrito", tags: ["Fusion", "High Protein"] },
          { id: "dosa-pizza", name: "Dosa Pizza", cuisine: "Fusion & Modern", mealCategory: "Fusion Meals", calories: 420, macros: { protein: 16, carbs: 52, fat: 16 }, prepTime: 25, portion: "1 dosa", tags: ["Creative", "Fun"] },
          { id: "tandoori-bowl", name: "Tandoori Chicken Bowl", cuisine: "Fusion & Modern", mealCategory: "Fusion Meals", calories: 460, macros: { protein: 36, carbs: 48, fat: 14 }, prepTime: 25, portion: "Bowl", tags: ["High Protein", "Balanced"] },
          { id: "masala-pasta", name: "Masala Pasta", cuisine: "Fusion & Modern", mealCategory: "Fusion Meals", calories: 400, macros: { protein: 14, carbs: 62, fat: 12 }, prepTime: 20, portion: "1 bowl", tags: ["Fusion", "Popular"] },
          { id: "chickpea-tacos", name: "Spiced Chickpea Tacos", cuisine: "Fusion & Modern", mealCategory: "Fusion Meals", calories: 380, macros: { protein: 16, carbs: 54, fat: 12 }, prepTime: 15, portion: "3 tacos", tags: ["Fusion", "Protein-Rich"] },
        ],
      },
    ],
  },
];

export default mealLibrary;
