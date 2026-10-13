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

export type ContactMessageStatus = 'new' | 'seen';

export interface SubmitContactInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}

const CONTACT_COLLECTION = "contact_messages";
const CONTACT_STORAGE_KEY = "cardinall_contact_store";

// Helper to get local cached contact messages
function getLocalContactMessages(): ContactMessageRecord[] {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
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
    console.warn("Could not read local contact store:", e);
  }
  return [];
}

// Helper to save local cached contact messages
function saveLocalContactMessages(records: ContactMessageRecord[]) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("Could not save to local contact store:", e);
  }
}

/**
 * Submits a new contact message from Let's Talk form
 */
export const submitContactMessage = async (data: SubmitContactInput): Promise<string> => {
  const localRecord: ContactMessageRecord = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name?.trim() || 'Visitor',
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    message: data.message?.trim() || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  // Prepend to local storage immediately
  const existing = getLocalContactMessages();
  saveLocalContactMessages([localRecord, ...existing]);

  // Attempt Firestore persistence
  try {
    const docRef = await addDoc(collection(db, CONTACT_COLLECTION), {
      ...localRecord,
      type: 'contact_form',
      _serverTimestamp: serverTimestamp(),
    });
    
    if (docRef.id) {
      localRecord.id = docRef.id;
      const updated = getLocalContactMessages().map(item => 
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalContactMessages(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Contact message submitted to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches all contact messages from Firestore with local cache merge
 */
export const getContactMessages = async (): Promise<ContactMessageRecord[]> => {
  const localList = getLocalContactMessages();

  try {
    const q = query(collection(db, CONTACT_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const remoteList: ContactMessageRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name || 'Visitor',
        email: d.email || '',
        phone: d.phone || '',
        message: d.message || '',
        status: (d.status === 'seen' ? 'seen' : 'new') as ContactMessageStatus,
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });

    // Merge remote and local preserving status
    const idMap = new Map<string, ContactMessageRecord>();
    remoteList.forEach(item => idMap.set(item.id, item));
    localList.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        const remote = idMap.get(item.id)!;
        if (item.status === 'seen') {
          idMap.set(item.id, { ...remote, status: 'seen' });
        }
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalContactMessages(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore contact messages read error, serving cached/local messages:", error);
    return localList;
  }
};

/**
 * Updates a contact message status to 'new' or 'seen'
 */
export const updateContactMessageStatus = async (id: string, status: ContactMessageStatus): Promise<void> => {
  // Update local cache
  const localList = getLocalContactMessages().map(item => 
    item.id === id ? { ...item, status } : item
  );
  saveLocalContactMessages(localList);

  // Attempt Firestore update
  try {
    const docRef = doc(db, CONTACT_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn("Firestore updateDoc contact status failed or restricted, updated locally:", error);
  }
};

/**
 * Marks all contact messages as 'seen'
 */
export const markAllContactMessagesSeen = async (): Promise<void> => {
  const localList = getLocalContactMessages().map(item => ({ ...item, status: 'seen' as ContactMessageStatus }));
  saveLocalContactMessages(localList);

  // Attempt async batch updates in background
  try {
    for (const item of localList) {
      const docRef = doc(db, CONTACT_COLLECTION, item.id);
      updateDoc(docRef, { status: 'seen' }).catch(() => {});
    }
  } catch (e) {
    // Ignore firestore background errors
  }
};

/**
 * Deletes a contact message record
 */
export const deleteContactMessage = async (id: string): Promise<void> => {
  // Remove from local cache immediately
  const localList = getLocalContactMessages().filter(item => item.id !== id);
  saveLocalContactMessages(localList);

  // Attempt Firestore delete
  try {
    const docRef = doc(db, CONTACT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore delete contact failed or restricted, deleted locally:", error);
  }
};
