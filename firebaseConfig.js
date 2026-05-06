import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW5ulBzB_3Uj8O6PlUJ3Da6FDOYNVoQv8",
  authDomain: "fet-app-3037b.firebaseapp.com",
  projectId: "fet-app-3037b",
  storageBucket: "fet-app-3037b.firebasestorage.app",
  messagingSenderId: "783823167737",
  appId: "1:783823167737:web:f76a39e3889ae8d76c0228"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
