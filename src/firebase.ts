// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWI11gm4qabi2yW00FCKt2tcvkwgFkhic",
  authDomain: "arthur-c9566.firebaseapp.com",
  projectId: "arthur-c9566",
  storageBucket: "arthur-c9566.firebasestorage.app",
  messagingSenderId: "668800565608",
  appId: "1:668800565608:web:308e0ab6a2c6dfe46c96dd",
  measurementId: "G-YBERZ43F6F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
