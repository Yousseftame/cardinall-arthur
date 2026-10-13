import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export interface SubmitPaidCustomerInput {
  name: string;
  email: string;
  phone: string;
}

export interface PaidCustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

const PAID_CUSTOMERS_COLLECTION = "paid_customers";
const PAID_CUSTOMERS_STORAGE_KEY = "cardinall_paid_customers_store";

function getLocalPaidCustomers(): PaidCustomerRecord[] {
  try {
    const raw = localStorage.getItem(PAID_CUSTOMERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: item.id,
          name: item.name || 'Customer',
          email: item.email || '',
          phone: item.phone || '',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn("Could not read local paid customers store:", e);
  }
  return [];
}

function saveLocalPaidCustomers(records: PaidCustomerRecord[]) {
  try {
    localStorage.setItem(PAID_CUSTOMERS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("Could not save to local paid customers store:", e);
  }
}

/**
 * Saves a paid checkout customer (name, email, phone only)
 */
export const savePaidCustomer = async (data: SubmitPaidCustomerInput): Promise<string> => {
  const localRecord: PaidCustomerRecord = {
    id: `pc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name?.trim() || 'Customer',
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalPaidCustomers();
  saveLocalPaidCustomers([localRecord, ...existing]);

  try {
    const docRef = await addDoc(collection(db, PAID_CUSTOMERS_COLLECTION), {
      ...localRecord,
      type: 'paid_checkout_customer',
      _serverTimestamp: serverTimestamp(),
    });
    
    if (docRef.id) {
      localRecord.id = docRef.id;
      const updated = getLocalPaidCustomers().map(item => 
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalPaidCustomers(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Paid customer saved to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches all paid customers from Firestore with local cache merge
 */
export const getPaidCustomers = async (): Promise<PaidCustomerRecord[]> => {
  const localList = getLocalPaidCustomers();

  try {
    const q = query(collection(db, PAID_CUSTOMERS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const remoteList: PaidCustomerRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name || 'Customer',
        email: d.email || '',
        phone: d.phone || '',
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });

    const idMap = new Map<string, PaidCustomerRecord>();
    remoteList.forEach(item => idMap.set(item.id, item));
    localList.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalPaidCustomers(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore paid customers read error, serving cached/local list:", error);
    return localList;
  }
};
