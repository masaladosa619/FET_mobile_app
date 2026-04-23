import { detectAllergens, ALLERGENS } from "./allergenData";

/**
 * Knowledge base of common dishes and their hidden allergens
 */
const DISH_KNOWLEDGE = {
  "butter chicken": {
    culprits: ["butter", "cream"],
    allergen: "Dairy",
    explanation: "Butter chicken is prepared with heavy cream and butter to give it its signature texture."
  },
  "cheese pizza": {
    culprits: ["mozzarella cheese", "wheat flour"],
    allergen: "Dairy, Gluten",
    explanation: "The base is made of wheat flour (Gluten) and the topping is heavy on mozzarella (Dairy)."
  },
  "pesto": {
    culprits: ["pine nuts", "parmesan cheese"],
    allergen: "Nuts, Dairy",
    explanation: "Traditional pesto uses pine nuts for crunch and parmesan for saltiness."
  },
  "soy sauce": {
    culprits: ["wheat"],
    allergen: "Gluten",
    explanation: "Most commercial soy sauces are brewed with wheat as a primary ingredient."
  },
  "pancakes": {
    culprits: ["milk", "flour", "butter"],
    allergen: "Dairy, Gluten",
    explanation: "The batter consists of milk and wheat flour, and they are often cooked in butter."
  },
  "bread": {
    culprits: ["wheat flour"],
    allergen: "Gluten",
    explanation: "Standard bread is made from wheat flour which contains high levels of gluten."
  },
  "muesli": {
    culprits: ["oats", "almonds", "hazelnuts"],
    allergen: "Gluten, Nuts",
    explanation: "Muesli typically contains a mix of grains (Gluten) and various tree nuts."
  }
};

/**
 * Barcode and Analysis logic
 */
export const getIngredientsByBarcode = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) return null;
    const data = await response.json();
    if (data.status === 1 && data.product && data.product.ingredients_text) {
      return {
        name: data.product.product_name || "Unknown Product",
        ingredients: data.product.ingredients_text,
        image: data.product.image_url
      };
    }
    return null;
  } catch (error) { return null; }
};

export const analyzeBarcodeResult = async (ingredients, selectedAllergies) => {
  const detected = detectAllergens(ingredients, selectedAllergies);
  return { isDanger: detected.length > 0, detectedAllergens: detected };
};

/**
 * SMART SWAPS
 */
const SWAP_DATABASE = {
  "Nuts": {
    alternative: "Sunflower Seed Butter or Soy Nut Butter",
    reason: "Provides the same creamy texture and high protein without the nut allergens."
  },
  "Dairy": {
    alternative: "Oat Milk or Coconut-based Cream",
    reason: "Offers a similar creamy consistency and is naturally lactose and casein-free."
  },
  "Gluten": {
    alternative: "Almond Flour or Quinoa-based Pasta",
    reason: "Provides a similar structural integrity in baking without the gluten protein."
  }
};

export const getSafeSwap = (detectedAllergens) => {
  if (!detectedAllergens || detectedAllergens.length === 0) return null;
  const mainAllergen = detectedAllergens[0];
  return SWAP_DATABASE[mainAllergen] || null;
};

/**
 * Hardcoded Chatbot Logic with Elaboration
 */
export const getChatResponse = async (userInput, selectedAllergies) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const inputLower = userInput.toLowerCase();
  let explanation = "";
  
  // Check for specific dishes in our knowledge base
  for (const [dish, data] of Object.entries(DISH_KNOWLEDGE)) {
    if (inputLower.includes(dish)) {
      const relevantAllergens = data.allergen.split(", ").filter(a => selectedAllergies.includes(a));
      
      if (relevantAllergens.length > 0) {
        return `⚠️ WARNING: This dish contains ${relevantAllergens.join(" and ")}. Specifically, the ${data.culprits.join(" and ")} in ${dish} causes allergies. ${data.explanation} Since you are allergic to these, it is harmful for you!`;
      }
    }
  }

  // Fallback to general keyword detection
  const detected = detectAllergens(userInput, selectedAllergies);
  if (detected.length > 0) {
    return `⚠️ WARNING: I detected ${detected.join(", ")} in your request. This matches your profile and is harmful for you!`;
  }
  
  return `Based on your request "${userInput}", I don't see any of your selected allergens (${selectedAllergies.join(", ") || "None"}). It appears safe to eat!`;
};
