# SAFEPLATE 🛡️
**Your Intelligent Food Safety & Allergen Companion**

SAFEPLATE is a high-performance React Native application designed to protect individuals with food allergies. It combines real-time data, AI-driven analysis, and emergency protocols into a single, intuitive interface to make dining and shopping safe for everyone.

---

## 🚀 Core Features

### 1. Smart Barcode Scanner
*   **Real-time Analysis:** Uses the device camera to scan product barcodes and fetch ingredient data via the OpenFoodFacts API.
*   **Safety Matching:** Instantly cross-references ingredients against your specific allergy profile.
*   **Smart Swaps:** If a product is flagged as dangerous, the app suggests safe alternatives (e.g., "Sunflower Seed Butter" instead of Peanut Butter).

### 2. Intelligent Safety Chatbot
*   **Culprit Detection:** Type any dish (e.g., "Can I have butter chicken?"), and the bot explains exactly which ingredients cause the risk (e.g., "Contains heavy cream and butter").
*   **Hardcoded Knowledge Base:** Pre-loaded with detailed data on complex dishes like Pesto, Soy Sauce, Pancakes, and more to ensure offline reliability.
*   **Brief & Focused:** Provides instant, actionable warnings or safety confirmations.

### 3. Biological Profile Dashboard
*   **Dynamic Monitoring:** Set your active allergens (Nuts, Dairy, Gluten) with a single tap.
*   **Live Analytics:** Tracks your "Total Scans" and "Alerts" (dangerous detections) in real-time.
*   **Global Risk Alerts:** A scrolling feed of real-time safety notices, product recalls, and policy updates (e.g., "Sesame added as major allergen").

### 4. International Safety Passport
*   **Translation Engine:** Generates translated allergy warnings in **Japanese, French, Spanish, German, and Hindi**.
*   **Staff Communication:** Show your digital "Passport" to waiters abroad to ensure they understand the severity of your allergy and avoid cross-contamination.
*   **Digital Medical ID:** A high-visibility emergency card containing your allergy list and action plan.

### 5. Emergency SOS Dashboard
*   **One-Tap Emergency:** Dedicated button to trigger a 911 (Ambulance) call immediately.
*   **Medical Mapping:** Integration with Google Maps to find the nearest Hospitals and Pharmacies.
*   **EpiPen Tracker:** Specifically highlights pharmacies that keep EpiPens in stock.

---

## 🛠️ Tech Stack

*   **Frontend:** React Native (Expo)
*   **Styling:** StyleSheet with a premium, modern UI kit approach.
*   **Icons:** Lucide-react-native
*   **Data Source:** OpenFoodFacts API
*   **Navigation:** React Navigation (Stack)
*   **State Management:** React Hooks (useState, useEffect, useCallback)

---

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fet_app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```

4.  **Run on your device:**
    Scan the QR code with the **Expo Go** app (Android) or the default Camera app (iOS).

---

## 🔒 Security
*   **Distorted Captcha:** The login screen features a custom-built character distortion engine and noise-line generator to prevent automated bot access.
*   **Local Processing:** User allergy profiles and scan histories are handled locally on the device for maximum privacy.

---

## 📄 License
This project is for educational/portfolio purposes. Built with ❤️ for food safety.
