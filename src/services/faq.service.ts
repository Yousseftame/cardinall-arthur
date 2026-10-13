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
import { FAQS as DEFAULT_FAQS } from '../data/faq';

/** Max FAQs that can appear in embedded page sections. */
export const MAX_SECTION_FAQS = 5;

export interface FaqInput {
  question: string;
  answer: string;
  /** When true, FAQ appears in embedded sections (max 5). */
  featuredInSection?: boolean;
}

export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  /** Lower = earlier in list. */
  sortOrder: number;
  /** Show in FAQSection on storefront pages (not only /faq). */
  featuredInSection: boolean;
  createdAt: string;
  updatedAt: string;
}

const FAQ_COLLECTION = 'faqs';
const FAQ_STORAGE_KEY = 'cardinall_faqs_store';

function mapToRecord(id: string, raw: any): FaqRecord {
  return {
    id,
    question: String(raw?.question || '').trim(),
    answer: String(raw?.answer || '').trim(),
    sortOrder: typeof raw?.sortOrder === 'number' ? raw.sortOrder : 0,
    featuredInSection: Boolean(raw?.featuredInSection),
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString(),
  };
}

function getLocalFaqs(): FaqRecord[] {
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => mapToRecord(item.id, item));
      }
    }
  } catch (e) {
    console.warn('Could not read local FAQs store:', e);
  }
  return [];
}

function saveLocalFaqs(records: FaqRecord[]) {
  try {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_faqs_updated'));
  } catch (e) {
    console.warn('Could not save to local FAQs store:', e);
  }
}

function sortFaqs(list: FaqRecord[]): FaqRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function seedDefaultFaqs(): FaqRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_FAQS.map((item, index) => ({
    id: `faq_seed_${index + 1}`,
    question: item.question,
    answer: item.answer,
    sortOrder: index,
    featuredInSection: index < MAX_SECTION_FAQS,
    createdAt: now,
    updatedAt: now,
  }));
}

function countFeatured(list: FaqRecord[], excludeId?: string): number {
  return list.filter((f) => f.featuredInSection && f.id !== excludeId).length;
}

/**
 * All FAQs in display order (for /faq page + admin).
 */
export const getFaqs = async (): Promise<FaqRecord[]> => {
  let localList = getLocalFaqs();

  if (localList.length === 0) {
    localList = seedDefaultFaqs();
    saveLocalFaqs(localList);
  }

  try {
    const q = query(collection(db, FAQ_COLLECTION), orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: FaqRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0 && localList.length > 0) {
      return sortFaqs(localList);
    }

    const idMap = new Map<string, FaqRecord>();
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

    const merged = sortFaqs(Array.from(idMap.values()));
    saveLocalFaqs(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore FAQs read error, serving cached/local list:', error);
    return sortFaqs(localList);
  }
};

/**
 * FAQs marked for embedded sections (max 5), in order.
 */
export const getSectionFaqs = async (): Promise<FaqRecord[]> => {
  const all = await getFaqs();
  return all.filter((f) => f.featuredInSection).slice(0, MAX_SECTION_FAQS);
};

export const createFaq = async (data: FaqInput): Promise<string> => {
  const question = data.question?.trim();
  const answer = data.answer?.trim();
  if (!question) throw new Error('Question is required.');
  if (!answer) throw new Error('Answer is required.');

  const existing = getLocalFaqs();
  let featuredInSection = Boolean(data.featuredInSection);
  if (featuredInSection && countFeatured(existing) >= MAX_SECTION_FAQS) {
    throw new Error(`Only ${MAX_SECTION_FAQS} FAQs can be shown in page sections.`);
  }

  const now = new Date().toISOString();
  const maxOrder = existing.reduce((max, f) => Math.max(max, f.sortOrder), -1);

  const localRecord: FaqRecord = {
    id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    question,
    answer,
    sortOrder: maxOrder + 1,
    featuredInSection,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalFaqs([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, FAQ_COLLECTION), {
      question: localRecord.question,
      answer: localRecord.answer,
      sortOrder: localRecord.sortOrder,
      featuredInSection: localRecord.featuredInSection,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'faq',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalFaqs().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalFaqs(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('FAQ saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateFaq = async (id: string, data: FaqInput): Promise<void> => {
  const question = data.question?.trim();
  const answer = data.answer?.trim();
  if (!question) throw new Error('Question is required.');
  if (!answer) throw new Error('Answer is required.');

  const existing = getLocalFaqs();
  const current = existing.find((f) => f.id === id);
  if (!current) throw new Error('FAQ not found.');

  let featuredInSection =
    data.featuredInSection !== undefined
      ? Boolean(data.featuredInSection)
      : current.featuredInSection;

  if (
    featuredInSection &&
    !current.featuredInSection &&
    countFeatured(existing, id) >= MAX_SECTION_FAQS
  ) {
    throw new Error(`Only ${MAX_SECTION_FAQS} FAQs can be shown in page sections.`);
  }

  const updatedAt = new Date().toISOString();
  const patch = { question, answer, featuredInSection, updatedAt };

  saveLocalFaqs(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    await updateDoc(doc(db, FAQ_COLLECTION, id), patch);
  } catch (error) {
    console.warn('Firestore updateDoc FAQ failed or restricted, updated locally:', error);
  }
};

export const toggleFaqFeatured = async (id: string, featuredInSection: boolean): Promise<void> => {
  const existing = getLocalFaqs();
  const current = existing.find((f) => f.id === id);
  if (!current) throw new Error('FAQ not found.');

  if (featuredInSection && countFeatured(existing, id) >= MAX_SECTION_FAQS) {
    throw new Error(`Only ${MAX_SECTION_FAQS} FAQs can be shown in page sections.`);
  }

  const updatedAt = new Date().toISOString();
  saveLocalFaqs(
    existing.map((item) =>
      item.id === id ? { ...item, featuredInSection, updatedAt } : item
    )
  );

  try {
    await updateDoc(doc(db, FAQ_COLLECTION, id), { featuredInSection, updatedAt });
  } catch (error) {
    console.warn('Firestore toggle FAQ featured failed or restricted, updated locally:', error);
  }
};

/**
 * Move FAQ up/down in the ordered list.
 */
export const moveFaq = async (id: string, direction: 'up' | 'down'): Promise<void> => {
  const list = sortFaqs(getLocalFaqs());
  const index = list.findIndex((f) => f.id === id);
  if (index < 0) throw new Error('FAQ not found.');

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const a = list[index];
  const b = list[swapWith];
  const orderA = a.sortOrder;
  const orderB = b.sortOrder;
  const updatedAt = new Date().toISOString();

  // If sortOrders collide, reindex whole list
  const next = [...list];
  next[index] = { ...b, sortOrder: orderA, updatedAt };
  next[swapWith] = { ...a, sortOrder: orderB, updatedAt };

  // Normalize to 0..n-1 for stability
  const normalized = sortFaqs(next).map((item, i) => ({
    ...item,
    sortOrder: i,
    updatedAt,
  }));

  saveLocalFaqs(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      // Skip seed-only local ids that may not exist in Firestore yet
      if (item.id.startsWith('faq_seed_')) return;
      batch.update(doc(db, FAQ_COLLECTION, item.id), {
        sortOrder: item.sortOrder,
        updatedAt,
      });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore reorder FAQs failed or restricted, updated locally:', error);
  }
};

export const deleteFaq = async (id: string): Promise<void> => {
  const remaining = getLocalFaqs()
    .filter((item) => item.id !== id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, i) => ({ ...item, sortOrder: i }));

  saveLocalFaqs(remaining);

  try {
    if (!id.startsWith('faq_seed_')) {
      await deleteDoc(doc(db, FAQ_COLLECTION, id));
    }
  } catch (error) {
    console.warn('Firestore delete FAQ failed or restricted, deleted locally:', error);
  }
};
