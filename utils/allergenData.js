export const ALLERGENS = {
  Nuts: [
    'peanut', 'peanuts', 'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 
    'hazelnut', 'hazelnuts', 'pistachio', 'pistachios', 'macadamia', 'pecan', 'pecans', 
    'brazil nut', 'nut', 'nuts', 'mung bean', 'lupin', 'chestnut', 'filbert', 'pine nut'
  ],
  Dairy: [
    'milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'yogurt', 'curd',
    'ghee', 'lactose', 'milk powder', 'nonfat milk', 'skim milk', 'condensed milk',
    'evaporated milk', 'buttermilk', 'custard', 'pudding'
  ],
  Gluten: [
    'wheat', 'barley', 'rye', 'spelt', 'semolina', 'couscous', 'bulgur',
    'malt', 'oats', 'gluten', 'flour', 'all-purpose flour', 'bread flour',
    'durum', 'farina', 'graham flour', 'kamut', 'seitan', 'triticale'
  ],
};

export const detectAllergens = (text, selectedAllergens) => {
  const normalizedText = text.toLowerCase();
  const detected = new Set();

  selectedAllergens.forEach((allergen) => {
    const keywords = ALLERGENS[allergen] || [];
    const hasMatch = keywords.some((keyword) => {
      // Use word boundaries to prevent partial matches.
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      
      // Specific fix for "cocoa butter" which is dairy-free
      if (keyword === 'butter' && normalizedText.includes('cocoa butter')) {
        // Only return true if there is a "butter" that is NOT part of "cocoa butter"
        const matches = [...normalizedText.matchAll(/\bbutter\b/gi)];
        return matches.some(m => {
          const beforeMatch = normalizedText.substring(0, m.index);
          return !beforeMatch.endsWith('cocoa ');
        });
      }

      return regex.test(normalizedText);
    });
    
    if (hasMatch) {
      detected.add(allergen);
    }
  });

  return Array.from(detected);
};
