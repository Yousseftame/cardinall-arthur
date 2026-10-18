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

export interface TimelineInput {
  year: string;
  title: string;
  description: string;
}

export interface TimelineRecord {
  id: string;
  /** Year / milestone number shown on the right of the title row, e.g. "1997" */
  year: string;
  title: string;
  description: string;
  /** Lower = earlier in the journey (top of timeline) */
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const TIMELINE_COLLECTION = 'timeline';
const TIMELINE_STORAGE_KEY = 'cardinall_timeline_store';

const DEFAULT_TIMELINE: Omit<TimelineRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    year: '1997',
    title: 'Where It Began.',
    description:
      'What started as a small design studio grew from a shared fascination with form, material, and balance. Every early piece carried the idea that simplicity could feel profound.',
    sortOrder: 0,
  },
  {
    year: '2004',
    title: 'Defining a Vision.',
    description:
      'Our approach evolved into more than aesthetics, it became a mindset. Precision, restraint, and purpose began to shape not just our designs, but our way of working.',
    sortOrder: 1,
  },
  {
    year: '2012',
    title: 'Craft Refined.',
    description:
      'We built deeper partnerships with artisans and ateliers, mastering new techniques. This era marked a shift towards creating pieces that endure across generations.',
    sortOrder: 2,
  },
];

function mapToRecord(id: string, raw: unknown): TimelineRecord {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id,
    year: String(obj.year ?? '').trim(),
    title: String(obj.title ?? '').trim(),
    description: String(obj.description ?? '').trim(),
    sortOrder: typeof obj.sortOrder === 'number' ? obj.sortOrder : 0,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt:
      typeof obj.updatedAt === 'string'
        ? obj.updatedAt
        : typeof obj.createdAt === 'string'
          ? obj.createdAt
          : new Date().toISOString(),
  };
}

function getLocalTimeline(): TimelineRecord[] {
  try {
    const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: { id?: string } & Record<string, unknown>) =>
          mapToRecord(String(item.id || ''), item)
        );
      }
    }
  } catch (e) {
    console.warn('Could not read local Timeline store:', e);
  }
  return [];
}

function saveLocalTimeline(records: TimelineRecord[]) {
  try {
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_timeline_updated'));
  } catch (e) {
    console.warn('Could not save to local Timeline store:', e);
  }
}

function sortTimeline(list: TimelineRecord[]): TimelineRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function seedDefaultTimeline(): TimelineRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_TIMELINE.map((item, index) => ({
    id: `timeline_seed_${index + 1}`,
    year: item.year,
    title: item.title,
    description: item.description,
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Side of the central axis for storefront layout.
 * Even index → right, odd → left (matches original design).
 */
export function getTimelineAlign(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'right' : 'left';
}

/**
 * All timeline milestones in display order.
 */
export const getTimeline = async (): Promise<TimelineRecord[]> => {
  let localList = getLocalTimeline();

  if (localList.length === 0) {
    localList = seedDefaultTimeline();
    saveLocalTimeline(localList);
  }

  try {
    const q = query(collection(db, TIMELINE_COLLECTION), orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: TimelineRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0 && localList.length > 0) {
      return sortTimeline(localList);
    }

    const idMap = new Map<string, TimelineRecord>();
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

    const merged = sortTimeline(Array.from(idMap.values()));
    saveLocalTimeline(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore Timeline read error, serving cached/local list:', error);
    return sortTimeline(localList);
  }
};

export const createTimelineEntry = async (data: TimelineInput): Promise<string> => {
  const year = data.year?.trim();
  const title = data.title?.trim();
  const description = data.description?.trim();
  if (!year) throw new Error('Year is required.');
  if (!title) throw new Error('Title is required.');
  if (!description) throw new Error('Description is required.');

  const existing = getLocalTimeline();
  const now = new Date().toISOString();
  const maxOrder = existing.reduce((max, t) => Math.max(max, t.sortOrder), -1);

  const localRecord: TimelineRecord = {
    id: `timeline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    year,
    title,
    description,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalTimeline([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, TIMELINE_COLLECTION), {
      year: localRecord.year,
      title: localRecord.title,
      description: localRecord.description,
      sortOrder: localRecord.sortOrder,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'timeline',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalTimeline().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalTimeline(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Timeline entry saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateTimelineEntry = async (id: string, data: TimelineInput): Promise<void> => {
  const year = data.year?.trim();
  const title = data.title?.trim();
  const description = data.description?.trim();
  if (!year) throw new Error('Year is required.');
  if (!title) throw new Error('Title is required.');
  if (!description) throw new Error('Description is required.');

  const existing = getLocalTimeline();
  const current = existing.find((t) => t.id === id);
  if (!current) throw new Error('Timeline entry not found.');

  const updatedAt = new Date().toISOString();
  const patch = { year, title, description, updatedAt };

  saveLocalTimeline(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    if (!id.startsWith('timeline_seed_')) {
      await updateDoc(doc(db, TIMELINE_COLLECTION, id), patch);
    }
  } catch (error) {
    console.warn('Firestore updateDoc Timeline failed or restricted, updated locally:', error);
  }
};

export const moveTimelineEntry = async (id: string, direction: 'up' | 'down'): Promise<void> => {
  const list = sortTimeline(getLocalTimeline());
  const index = list.findIndex((t) => t.id === id);
  if (index < 0) throw new Error('Timeline entry not found.');

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

  const normalized = sortTimeline(next).map((item, i) => ({
    ...item,
    sortOrder: i,
    updatedAt,
  }));

  saveLocalTimeline(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      if (item.id.startsWith('timeline_seed_')) return;
      batch.update(doc(db, TIMELINE_COLLECTION, item.id), {
        sortOrder: item.sortOrder,
        updatedAt,
      });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore reorder Timeline failed or restricted, updated locally:', error);
  }
};

export const deleteTimelineEntry = async (id: string): Promise<void> => {
  const remaining = getLocalTimeline()
    .filter((item) => item.id !== id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, i) => ({ ...item, sortOrder: i }));

  saveLocalTimeline(remaining);

  try {
    if (!id.startsWith('timeline_seed_')) {
      await deleteDoc(doc(db, TIMELINE_COLLECTION, id));
    }
  } catch (error) {
    console.warn('Firestore delete Timeline failed or restricted, deleted locally:', error);
  }
};
