import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export interface SubmitNewsletterInput {
  email: string;
  source?: 'welcome' | 'footer';
}

export interface NewsletterRecord {
  id: string;
  email: string;
  createdAt: string;
}

const NEWSLETTER_COLLECTION = "newsletter_subscribers";
const NEWSLETTER_STORAGE_KEY = "cardinall_newsletter_store";

function getLocalSubscribers(): NewsletterRecord[] {
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: item.id,
          email: item.email || '',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn("Could not read local newsletter store:", e);
  }
  return [];
}

function saveLocalSubscribers(records: NewsletterRecord[]) {
  try {
    localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("Could not save to local newsletter store:", e);
  }
}

/**
 * Subscribes an email from welcome modal or footer
 */
export const subscribeNewsletter = async (data: SubmitNewsletterInput): Promise<string> => {
  const localRecord: NewsletterRecord = {
    id: `nl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: data.email?.trim().toLowerCase() || '',
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalSubscribers();
  saveLocalSubscribers([localRecord, ...existing]);

  try {
    const docRef = await addDoc(collection(db, NEWSLETTER_COLLECTION), {
      ...localRecord,
      source: data.source || 'unknown',
      type: 'newsletter_subscription',
      _serverTimestamp: serverTimestamp(),
    });
    
    if (docRef.id) {
      localRecord.id = docRef.id;
      const updated = getLocalSubscribers().map(item => 
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalSubscribers(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Newsletter subscription saved to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches all newsletter subscribers (email + date only for admin view)
 */
export const getNewsletterSubscribers = async (): Promise<NewsletterRecord[]> => {
  const localList = getLocalSubscribers();

  try {
    const q = query(collection(db, NEWSLETTER_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const remoteList: NewsletterRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        email: d.email || '',
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });

    const idMap = new Map<string, NewsletterRecord>();
    remoteList.forEach(item => idMap.set(item.id, item));
    localList.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalSubscribers(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore newsletter read error, serving cached/local list:", error);
    return localList;
  }
};
