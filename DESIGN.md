# Allergen OCR Shield: Design Document

## 1. Goal
Autonomously implement and deliver a visually appealing, functional Android prototype using Kotlin and Jetpack Compose. The application addresses the critical real-world problem of managing severe and complex dietary allergies by utilizing on-device Optical Character Recognition (OCR) to scan product ingredient lists in real-time, instantly cross-referencing them against a user's personalized allergy profile.

## 2. Core Features (Prototype Scope)
1. **Personalized Allergy Profile:** 
   - A configuration screen where users can define their specific allergens (e.g., Peanuts, Dairy, Gluten, Soy, specific preservatives).
2. **Live Camera OCR Scanner:**
   - A screen displaying a live camera preview.
   - Real-time text extraction from the camera feed.
3. **Instant Risk Analysis:**
   - The app matches the extracted text against the user's profile.
   - Immediate visual feedback: A distinct **Green (Safe)** or **Red (Danger)** alert, highlighting the specific allergen found.

## 3. Technical Architecture
- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (Material Design 3)
- **Camera Integration:** Android CameraX (for robust, lifecycle-aware camera management and image analysis).
- **OCR Engine:** Google ML Kit Text Recognition (On-device processing for privacy and speed, requiring no internet connection while shopping).
- **Architecture Pattern:** MVVM (Model-View-ViewModel) utilizing Kotlin Coroutines and `StateFlow` for reactive UI updates.
- **Local Storage:** Room Database or DataStore for persisting the user's allergy profile.

## 4. Visual & Aesthetic Design
- **Theme:** Clean, modern, high-contrast interface. Shopping environments can be chaotic; the UI must be immediately readable.
- **Interactions:** 
  - Smooth transitions between the Profile and Scanner screens.
  - A subtle animated overlay (scanning line or corner brackets) on the camera feed to indicate active scanning.
  - Haptic feedback (vibration) when an allergen is detected to provide non-visual confirmation.
- **Color Palette:** 
  - Neutral backgrounds (Dark/Light mode support).
  - Primary Action Color: A reassuring, accessible blue or teal.
  - Status Colors: Vivid Red for danger, calming Green for safe.

## 5. Development Phases
1. **Setup & Scaffolding:** Initialize the Android project, configure Gradle dependencies (Compose, CameraX, ML Kit).
2. **Data Layer:** Implement the profile management logic.
3. **UI - Profile:** Build the screens to add and remove allergens.
4. **Camera & OCR Integration:** Implement CameraX preview and hook up the ML Kit ImageAnalyzer.
5. **Matching Logic & Polish:** Write the text-matching algorithm (case-insensitive, handling common synonyms if possible) and build the animated results overlay.

## 6. Constraints & Assumptions
- The prototype will focus on exact string matching or basic substring matching for the initial build (e.g., finding "milk" in "buttermilk").
- We will target modern Android devices (API 24+) to ensure compatibility with CameraX and ML Kit.
