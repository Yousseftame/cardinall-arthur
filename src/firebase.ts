import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cardinal Arthur — Firebase web app config
const firebaseConfig = {
  apiKey: "AIzaSyBZAmDLR2yK5GiNr9aN-XSbc-crfKigRFQ",
  authDomain: "cardinal-arthur.firebaseapp.com",
  projectId: "cardinal-arthur",
  storageBucket: "cardinal-arthur.firebasestorage.app",
  messagingSenderId: "16373253332",
  appId: "1:16373253332:web:275eea5925f677435e2741",
  measurementId: "G-2WHLR947W1",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Analytics only in the browser when supported (avoids init issues in some environments). */
export const analyticsPromise = isSupported().then((ok) =>
  ok ? getAnalytics(app) : null
);
