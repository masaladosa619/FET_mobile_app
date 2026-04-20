fun analyzeText(text: String, allergens: List<String>): List<String> {
    val lowerText = text.lowercase()
    return allergens.filter { lowerText.contains(it.lowercase()) }
}

fun main() {
    val myAllergens = listOf("Peanut", "Dairy", "Gluten")
    val scannedIngredients = "Ingredients: Whole wheat flour, milk solids, salt, vegetable oil, traces of peanuts."
    
    val found = analyzeText(scannedIngredients, myAllergens)
    
    println("--- SCANNER TEST ---")
    println("Your Allergies: $myAllergens")
    println("Scanned Text: \"$scannedIngredients\"")
    println("--------------------")
    if (found.isNotEmpty()) {
        println("❌ DANGER: Found $found")
    } else {
        println("✅ SAFE: No allergens found.")
    }
}
