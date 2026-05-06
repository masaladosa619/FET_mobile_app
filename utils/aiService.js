import { detectAllergens, ALLERGENS } from "./allergenData";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Initialize Gemini AI (Only for Chatbot now)
const genAI = new GoogleGenerativeAI("AIzaSyChfyrxJPGDFvC6_r2UBzbMdJjZGabxT8c", "v1beta");

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

export const getIngredientsByBarcode = async (barcode) => {
  try {
    const productRef = doc(db, 'products', barcode);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { ...productSnap.data(), id: barcode, fromCache: true };
    }
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1 && data.product) {
      return {
        name: data.product.product_name || "Unknown Product",
        ingredients: data.product.ingredients_text || "",
        image: data.product.image_url,
        nativeAllergens: (data.product.allergens_tags || []).map(tag => 
          tag.replace('en:', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ),
        timestamp: new Date().toISOString(),
        id: barcode,
        fromCache: false
      };
    }
    return null;
  } catch (error) { 
    return null; 
  }
};

export const getSafeSwap = (detectedAllergens) => {
  if (!detectedAllergens || detectedAllergens.length === 0) return [];
  
  const SWAP_DATABASE = {
    "Nuts": { alternative: "Sunflower Seed Butter / Soy Butter", reason: "Provides a similar creamy texture and nutty flavor without tree nut or peanut allergens." },
    "Dairy": { alternative: "Oat Milk / Coconut Milk", reason: "Plant-based alternatives that are naturally lactose and casein-free with good consistency." },
    "Gluten": { alternative: "Almond Flour / Chickpea Flour", reason: "Excellent for baking and thickening without the inflammatory proteins found in wheat." },
    "Sesame": { alternative: "Pumpkin Seed Butter (Pepita)", reason: "Offers a similar earthy, nutty profile and rich texture suitable for dressings or spreads." },
    "Soy": { alternative: "Coconut Aminos", reason: "A perfect 1:1 replacement for soy sauce with a similar salty-savory profile but without soy." },
    "Eggs": { alternative: "Applesauce / Flax Meal", reason: "Effective binding agents for baking that replicate the moisture and structure of eggs." }
  };

  return detectedAllergens.map(allergen => {
    // Exact match or contains search
    const key = Object.keys(SWAP_DATABASE).find(k => 
      allergen.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(allergen.toLowerCase())
    );
    return key ? { allergen, ...SWAP_DATABASE[key] } : null;
  }).filter(swap => swap !== null);
};

export const getChatResponse = async (userInput, selectedAllergies) => {
  const inputLower = userInput.toLowerCase().trim();

  // Conversational Layer: Handle simple greetings smoothly
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo'];
  if (greetings.includes(inputLower)) {
    return `Hello! I'm your SafePlate AI. I see you're monitoring for ${selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'nothing yet'}. Ask me about any dish or ingredient safety!`;
  }

  for (const [dish, data] of Object.entries(DISH_KNOWLEDGE)) {
    if (inputLower.includes(dish)) {
      const matched = data.allergen.split(", ").filter(a => selectedAllergies.some(sa => sa.toLowerCase() === a.toLowerCase()));
      if (matched.length > 0) return `⚠️ WARNING: ${dish} contains ${matched.join(" and ")}. ${data.explanation}`;
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    const prompt = `You are the SafePlate AI, a tactical food safety assistant. 
    The user is allergic to: ${selectedAllergies.join(', ') || 'nothing'}. 
    User said: "${userInput}".
    If they are asking about food safety, evaluate it strictly. 
    If they are just chatting, respond politely but keep it brief and professional. 
    Always stay in your persona as a safety guardian. Be concise.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    const detected = detectAllergens(userInput, selectedAllergies);
    return detected.length > 0 ? `⚠️ WARNING: Detected ${detected.join(", ")} in your request.` : `I don't see any of your allergens in "${userInput}". Appears safe!`;
  }
};
