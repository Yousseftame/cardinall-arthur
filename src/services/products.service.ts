import { getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import type { Product } from "../types";

// Initialize Firestore
const _db = getFirestore(app);

// Services isolate your Firebase logic. This keeps your React components clean 
// and makes it easier to update logic without changing UI.
export const getProducts = async (): Promise<Product[]> => {
  try {
    // Uncomment when you have data in firestore
    // const q = query(collection(db, "products"), limit(20));
    // const snapshot = await getDocs(q);
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    // Returning dummy data for now to test the UI
    return [
      { id: "1", name: "Midnight Rose", description: "A dark floral scent", price: 120, imageUrl: "", stock: 10 },
      { id: "2", name: "Oud Wood", description: "Rich and smoky", price: 200, imageUrl: "", stock: 5 },
    ];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
