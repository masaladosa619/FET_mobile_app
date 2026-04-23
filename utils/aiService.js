import { detectAllergens } from "./allergenData";

/**
 * Barcode and Analysis logic remains the same
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
 * SMART SWAPS: Provides safe alternatives for dangerous ingredients
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
  // Get the first detected allergen's swap
  const mainAllergen = detectedAllergens[0];
  return SWAP_DATABASE[mainAllergen] || null;
};

/**
 * Local AI Chatbot Logic
 */
export const getChatResponse = async (userInput, selectedAllergies) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const input = userInput.toLowerCase();
  const allergies = Array.isArray(selectedAllergies) ? selectedAllergies : [];
  
  if (detected.length > 0) {
    return `WARNING: I detected ${detected.join(", ")}. Matches your profile.`;
  }
  return `Analyzed "${userInput}". Appears safe based on common ingredients.`;
};
