import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZOmK0pgr8y49YTIusnVOREFjzcDdv2Ag",
  authDomain: "healthconnect-6b838.firebaseapp.com",
  projectId: "healthconnect-6b838",
  storageBucket: "healthconnect-6b838.appspot.com",
  messagingSenderId: "996319029824",
  appId: "1:996319029824:web:f4c2a6d344966a6efacda5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };