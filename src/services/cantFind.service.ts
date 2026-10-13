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

export type CantFindStatus = 'new' | 'seen';

export interface SubmitCantFindInput {
  name: string;
  email: string;
  desiredNotes: string;
  designerInspiration?: string;
  details: string;
}

export interface CantFindRecord {
  id: string;
  name: string;
  email: string;
  desiredNotes: string;
  designerInspiration: string;
  details: string;
  status: CantFindStatus;
  createdAt: string;
}

const CANT_FIND_COLLECTION = "cant_find_requests";
const CANT_FIND_STORAGE_KEY = "cardinall_cant_find_store";

function getLocalCantFindRequests(): CantFindRecord[] {
  try {
    const raw = localStorage.getItem(CANT_FIND_STORAGE_KEY);
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
    console.warn("Could not read local can't-find store:", e);
  }
  return [];
}

function saveLocalCantFindRequests(records: CantFindRecord[]) {
  try {
    localStorage.setItem(CANT_FIND_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_cant_find_updated'));
  } catch (e) {
    console.warn("Could not save to local can't-find store:", e);
  }
}

/**
 * Submits a community scent request from the Can't Find It page
 */
export const submitCantFindRequest = async (data: SubmitCantFindInput): Promise<string> => {
  const localRecord: CantFindRecord = {
    id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name?.trim() || 'Guest',
    email: data.email?.trim() || '',
    desiredNotes: data.desiredNotes?.trim() || '',
    designerInspiration: data.designerInspiration?.trim() || '',
    details: data.details?.trim() || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalCantFindRequests();
  saveLocalCantFindRequests([localRecord, ...existing]);

  try {
    const docRef = await addDoc(collection(db, CANT_FIND_COLLECTION), {
      ...localRecord,
      type: 'community_request',
      _serverTimestamp: serverTimestamp(),
    });
    
    if (docRef.id) {
      localRecord.id = docRef.id;
      const updated = getLocalCantFindRequests().map(item => 
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalCantFindRequests(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Can't-find request submitted to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches all can't-find requests from Firestore with local cache merge
 */
export const getCantFindRequests = async (): Promise<CantFindRecord[]> => {
  const localList = getLocalCantFindRequests();

  try {
    const q = query(collection(db, CANT_FIND_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const remoteList: CantFindRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name || 'Guest',
        email: d.email || '',
        desiredNotes: d.desiredNotes || '',
        designerInspiration: d.designerInspiration || '',
        details: d.details || '',
        status: (d.status === 'seen' ? 'seen' : 'new') as CantFindStatus,
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });

    const idMap = new Map<string, CantFindRecord>();
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

    saveLocalCantFindRequests(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore can't-find read error, serving cached/local requests:", error);
    return localList;
  }
};

/**
 * Updates a can't-find request status to 'new' or 'seen'
 */
export const updateCantFindStatus = async (id: string, status: CantFindStatus): Promise<void> => {
  const localList = getLocalCantFindRequests().map(item => 
    item.id === id ? { ...item, status } : item
  );
  saveLocalCantFindRequests(localList);

  try {
    const docRef = doc(db, CANT_FIND_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn("Firestore updateDoc can't-find status failed or restricted, updated locally:", error);
  }
};

/**
 * Marks all can't-find requests as 'seen'
 */
export const markAllCantFindSeen = async (): Promise<void> => {
  const localList = getLocalCantFindRequests().map(item => ({ ...item, status: 'seen' as CantFindStatus }));
  saveLocalCantFindRequests(localList);

  try {
    for (const item of localList) {
      const docRef = doc(db, CANT_FIND_COLLECTION, item.id);
      updateDoc(docRef, { status: 'seen' }).catch(() => {});
    }
  } catch (e) {
    // Ignore firestore background errors
  }
};

/**
 * Deletes a can't-find request
 */
export const deleteCantFindRequest = async (id: string): Promise<void> => {
  const localList = getLocalCantFindRequests().filter(item => item.id !== id);
  saveLocalCantFindRequests(localList);

  try {
    const docRef = doc(db, CANT_FIND_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore delete can't-find failed or restricted, deleted locally:", error);
  }
};
