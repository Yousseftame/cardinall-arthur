import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { CheckoutSettings } from "../types/order";

const SETTINGS_COLLECTION = "settings";
const CHECKOUT_SETTINGS_DOC = "checkout";

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  standardShippingFee: 80,
  freeShippingThreshold: 2000,
  enableCod: true,
  enableCard: false,
  deliveryTimeEstimate: "1 to 3 business days",
  contactEmail: "support@cardinalarthur.com",
  contactPhone: "+20 10 11151366",
  orderNotesEnabled: true,
  governorates: [
    { id: 'cairo', name: 'Cairo', shippingFee: 60, active: true },
    { id: 'giza', name: 'Giza', shippingFee: 80, active: true },
    { id: 'alexandria', name: 'Alexandria', shippingFee: 90, active: true },
    { id: 'qalyubia', name: 'Qalyubia', shippingFee: 80, active: true },
    { id: 'sharqia', name: 'Sharqia', shippingFee: 90, active: true },
    { id: 'dakahlia', name: 'Dakahlia', shippingFee: 90, active: true },
    { id: 'red-sea', name: 'Red Sea', shippingFee: 130, active: true },
  ],
};

/**
 * Fetches checkout settings from Firestore
 * Falls back to DEFAULT_CHECKOUT_SETTINGS if document does not exist yet
 */
export const getCheckoutSettings = async (): Promise<CheckoutSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CHECKOUT_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...DEFAULT_CHECKOUT_SETTINGS,
        ...docSnap.data(),
      } as CheckoutSettings;
    }

    return DEFAULT_CHECKOUT_SETTINGS;
  } catch (error) {
    console.warn("Using default checkout settings due to fetch error:", error);
    return DEFAULT_CHECKOUT_SETTINGS;
  }
};

/**
 * Updates checkout settings in Firestore
 */
export const updateCheckoutSettings = async (settings: Partial<CheckoutSettings>): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CHECKOUT_SETTINGS_DOC);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
      _serverTimestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Failed to update checkout settings:", error);
    throw error;
  }
};
