import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config values from provisioned Applet Firebase setup
const firebaseConfig = {
  projectId: "gen-lang-client-0136725680",
  appId: "1:322969435553:web:915beec482d81b655e9fe0",
  apiKey: "AIzaSyCdkLVs-0_cvwKRI5V4_KlFdfbezjGkFnk",
  authDomain: "gen-lang-client-0136725680.firebaseapp.com",
  storageBucket: "gen-lang-client-0136725680.firebasestorage.app",
  messagingSenderId: "322969435553",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-kalhyaniedentalc-fb315757-5981-4312-8b1a-5f4c499358d7");

// Use a mock/simplified browser storage layer for files since physical Storage is simulated
export const storage = {
  uploadFile: async (path: string, file: File): Promise<string> => {
    // Generate an object URL or return simulated direct paths
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};

export default app;
