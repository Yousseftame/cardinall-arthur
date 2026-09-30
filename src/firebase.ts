// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHXVM-uZjj2aaGhA5kL1b684aqR7OIUz0",
  authDomain: "cardinall-arthur.firebaseapp.com",
  projectId: "cardinall-arthur",
  storageBucket: "cardinall-arthur.firebasestorage.app",
  messagingSenderId: "469582058851",
  appId: "1:469582058851:web:c8f6f66834a8b98101af56",
  measurementId: "G-6BQT9B8WQK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
