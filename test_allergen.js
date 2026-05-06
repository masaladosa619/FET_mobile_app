const ALLERGENS = {
  Vinegar: [
    'vinegar', 'distilled vinegar', 'apple cider vinegar', 'white vinegar', 'balsamic vinegar', 'red wine vinegar', 'malt vinegar', 'acetic acid'
  ],
};

const detectAllergens = (text, selectedAllergens) => {
  const normalizedText = text.toLowerCase();
  const detected = new Set();

  selectedAllergens.forEach((allergen) => {
    const keywords = ALLERGENS[allergen] || [];
    const hasMatch = keywords.some((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      const match = regex.test(normalizedText);
      console.log(`Checking "${keyword}" in "${text}": ${match}`);
      return match;
    });
    
    if (hasMatch) {
      detected.add(allergen);
    }
  });

  return Array.from(detected);
};

const testIngredients = [
  "Tomato Concentrate, Distilled Vinegar, High Fructose Corn Syrup",
  "Tomato concentrate from red ripe tomatoes, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring.",
  "Ingredients: Tomato concentrate, vinegar, sugar, salt, onion powder, spices, natural flavoring."
];

testIngredients.forEach(text => {
  console.log(`\nTesting: ${text}`);
  const result = detectAllergens(text, ["Vinegar"]);
  console.log(`Result: ${JSON.stringify(result)}`);
});
