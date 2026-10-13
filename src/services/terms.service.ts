import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { TERMS_SECTIONS as DEFAULT_TERMS } from '../data/terms';

export interface TermInput {
  title: string;
  description: string;
}

export interface TermRecord {
  id: string;
  title: string;
  description: string;
  /** Lower = earlier in list. */
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const TERMS_COLLECTION = 'terms';
const TERMS_STORAGE_KEY = 'cardinall_terms_store';

function mapToRecord(id: string, raw: any): TermRecord {
  return {
    id,
    title: String(raw?.title || '').trim(),
    description: String(raw?.description || '').trim(),
    sortOrder: typeof raw?.sortOrder === 'number' ? raw.sortOrder : 0,
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString(),
  };
}

function getLocalTerms(): TermRecord[] {
  try {
    const raw = localStorage.getItem(TERMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => mapToRecord(item.id, item));
      }
    }
  } catch (e) {
    console.warn('Could not read local Terms store:', e);
  }
  return [];
}

function saveLocalTerms(records: TermRecord[]) {
  try {
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_terms_updated'));
  } catch (e) {
    console.warn('Could not save to local Terms store:', e);
  }
}

function sortTerms(list: TermRecord[]): TermRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function seedDefaultTerms(): TermRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_TERMS.map((item, index) => ({
    id: `term_seed_${index + 1}`,
    title: item.title,
    description: item.paragraphs.join('\n\n'),
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Split description into paragraphs for storefront display.
 */
export function splitTermParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * All terms sections in display order.
 */
export const getTerms = async (): Promise<TermRecord[]> => {
  let localList = getLocalTerms();

  if (localList.length === 0) {
    localList = seedDefaultTerms();
    saveLocalTerms(localList);
  }

  try {
    const q = query(collection(db, TERMS_COLLECTION), orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: TermRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0 && localList.length > 0) {
      return sortTerms(localList);
    }

    const idMap = new Map<string, TermRecord>();
    remoteList.forEach((item) => idMap.set(item.id, item));
    localList.forEach((item) => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        const remote = idMap.get(item.id)!;
        if (item.updatedAt > remote.updatedAt) {
          idMap.set(item.id, { ...remote, ...item });
        }
      }
    });

    const merged = sortTerms(Array.from(idMap.values()));
    saveLocalTerms(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore Terms read error, serving cached/local list:', error);
    return sortTerms(localList);
  }
};

export const createTerm = async (data: TermInput): Promise<string> => {
  const title = data.title?.trim();
  const description = data.description?.trim();
  if (!title) throw new Error('Title is required.');
  if (!description) throw new Error('Description is required.');

  const existing = getLocalTerms();
  const now = new Date().toISOString();
  const maxOrder = existing.reduce((max, t) => Math.max(max, t.sortOrder), -1);

  const localRecord: TermRecord = {
    id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    description,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalTerms([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, TERMS_COLLECTION), {
      title: localRecord.title,
      description: localRecord.description,
      sortOrder: localRecord.sortOrder,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'term',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalTerms().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalTerms(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Term saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateTerm = async (id: string, data: TermInput): Promise<void> => {
  const title = data.title?.trim();
  const description = data.description?.trim();
  if (!title) throw new Error('Title is required.');
  if (!description) throw new Error('Description is required.');

  const existing = getLocalTerms();
  const current = existing.find((t) => t.id === id);
  if (!current) throw new Error('Term section not found.');

  const updatedAt = new Date().toISOString();
  const patch = { title, description, updatedAt };

  saveLocalTerms(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    await updateDoc(doc(db, TERMS_COLLECTION, id), patch);
  } catch (error) {
    console.warn('Firestore updateDoc Term failed or restricted, updated locally:', error);
  }
};

/**
 * Move term section up/down in the ordered list.
 */
export const moveTerm = async (id: string, direction: 'up' | 'down'): Promise<void> => {
  const list = sortTerms(getLocalTerms());
  const index = list.findIndex((t) => t.id === id);
  if (index < 0) throw new Error('Term section not found.');

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const a = list[index];
  const b = list[swapWith];
  const orderA = a.sortOrder;
  const orderB = b.sortOrder;
  const updatedAt = new Date().toISOString();

  const next = [...list];
  next[index] = { ...b, sortOrder: orderA, updatedAt };
  next[swapWith] = { ...a, sortOrder: orderB, updatedAt };

  const normalized = sortTerms(next).map((item, i) => ({
    ...item,
    sortOrder: i,
    updatedAt,
  }));

  saveLocalTerms(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      if (item.id.startsWith('term_seed_')) return;
      batch.update(doc(db, TERMS_COLLECTION, item.id), {
        sortOrder: item.sortOrder,
        updatedAt,
      });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore reorder Terms failed or restricted, updated locally:', error);
  }
};

export const deleteTerm = async (id: string): Promise<void> => {
  const remaining = getLocalTerms()
    .filter((item) => item.id !== id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, i) => ({ ...item, sortOrder: i }));

  saveLocalTerms(remaining);

  try {
    if (!id.startsWith('term_seed_')) {
      await deleteDoc(doc(db, TERMS_COLLECTION, id));
    }
  } catch (error) {
    console.warn('Firestore delete Term failed or restricted, deleted locally:', error);
  }
};
