import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export type FeedbackStatus = 'new' | 'seen';

export interface CheckoutFeedbackInput {
  orderNumber?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  rating: number;
  comment?: string;
}

export interface FeedbackRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  createdAt: string;
}

const FEEDBACK_COLLECTION = "feedbacks";
const FEEDBACK_STORAGE_KEY = "cardinall_feedbacks_store";

// Helper to get local cached feedbacks
function getLocalFeedbacks(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          status: item.status === 'seen' ? 'seen' : 'new',
        }));
      }
    }
  } catch (e) {
    console.warn("Could not read local feedback store:", e);
  }
  return [];
}

// Helper to save local cached feedbacks and notify any listeners
function saveLocalFeedbacks(records: FeedbackRecord[]) {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(records));
    // Dispatch window storage/custom event so reactive components update instantly
    window.dispatchEvent(new Event('cardinall_feedbacks_updated'));
  } catch (e) {
    console.warn("Could not save to local feedback store:", e);
  }
}

/**
 * Submits checkout experience feedback with default status 'new'
 */
export const submitCheckoutFeedback = async (data: CheckoutFeedbackInput): Promise<string> => {
  const localRecord: FeedbackRecord = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderNumber: data.orderNumber || 'GUEST',
    customerName: data.customerName || 'Valued Customer',
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    rating: Number(data.rating) || 5,
    comment: data.comment?.trim() || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  // Prepend to local storage immediately so it's instantly visible
  const existing = getLocalFeedbacks();
  saveLocalFeedbacks([localRecord, ...existing]);

  // Attempt Firestore persistence
  try {
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
      ...localRecord,
      type: 'checkout_experience',
      _serverTimestamp: serverTimestamp(),
    });
    
    if (docRef.id) {
      localRecord.id = docRef.id;
      const updated = getLocalFeedbacks().map(item => 
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalFeedbacks(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Feedback submitted to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches all customer feedback records from Firestore with local fallback & merge
 */
export const getFeedbacks = async (): Promise<FeedbackRecord[]> => {
  const localList = getLocalFeedbacks();

  try {
    const q = query(collection(db, FEEDBACK_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const remoteList: FeedbackRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        orderNumber: d.orderNumber || 'GUEST',
        customerName: d.customerName || 'Customer',
        email: d.email || '',
        phone: d.phone || '',
        rating: Number(d.rating) || 5,
        comment: d.comment || '',
        status: (d.status === 'seen' ? 'seen' : 'new') as FeedbackStatus,
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });

    // Merge remote and local by id, preserving latest status
    const idMap = new Map<string, FeedbackRecord>();
    remoteList.forEach(item => idMap.set(item.id, item));
    localList.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        // If locally marked seen, retain 'seen' status
        const remote = idMap.get(item.id)!;
        if (item.status === 'seen') {
          idMap.set(item.id, { ...remote, status: 'seen' });
        }
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalFeedbacks(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore feedback read error, serving cached/local feedbacks:", error);
    return localList;
  }
};

/**
 * Updates a feedback status to 'new' or 'seen'
 */
export const updateFeedbackStatus = async (id: string, status: FeedbackStatus): Promise<void> => {
  // Update local cache
  const localList = getLocalFeedbacks().map(item => 
    item.id === id ? { ...item, status } : item
  );
  saveLocalFeedbacks(localList);

  // Attempt Firestore update
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn("Firestore updateDoc status failed or restricted, updated locally:", error);
  }
};

/**
 * Marks all feedback records as 'seen'
 */
export const markAllFeedbacksSeen = async (): Promise<void> => {
  const localList = getLocalFeedbacks().map(item => ({ ...item, status: 'seen' as FeedbackStatus }));
  saveLocalFeedbacks(localList);

  // Attempt async batch updates in background if needed
  try {
    for (const item of localList) {
      const docRef = doc(db, FEEDBACK_COLLECTION, item.id);
      updateDoc(docRef, { status: 'seen' }).catch(() => {});
    }
  } catch (e) {
    // Ignore firestore background errors
  }
};

/**
 * Deletes a feedback record from Firestore and local cache
 */
export const deleteFeedback = async (id: string): Promise<void> => {
  // Remove from local cache immediately
  const localList = getLocalFeedbacks().filter(item => item.id !== id);
  saveLocalFeedbacks(localList);

  // Attempt Firestore delete
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore delete failed or restricted, deleted locally:", error);
  }
};
