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
import {
  DEFAULT_LATEST_PROJECT_IMAGE_KEY,
  isValidLatestProjectImageKey,
} from '../data/latestProjectImages';

export interface LatestProjectInput {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageKey: string;
}

export interface LatestProjectRecord {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageKey: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const LATEST_PROJECTS_COLLECTION = 'latest_projects';
const LATEST_PROJECTS_STORAGE_KEY = 'cardinall_latest_projects_store';

const DEFAULT_PROJECTS: Omit<LatestProjectRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'CRIMSON DUST',
    description:
      'A comprehensive brand strategy and visual identity exploring the boundaries of modern digital aesthetics and bold storytelling.',
    buttonText: 'View Case Study',
    buttonLink: '',
    imageKey: 'crimson-dust',
    sortOrder: 0,
  },
  {
    title: 'NOIR COLLECTION',
    description:
      'Elevating everyday luxury through minimalist design, meticulous craftsmanship, and striking visual contrasts.',
    buttonText: 'View Case Study',
    buttonLink: '',
    imageKey: 'noir-collection',
    sortOrder: 1,
  },
];

function mapToRecord(id: string, raw: unknown): LatestProjectRecord {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const imageKey = String(obj.imageKey ?? '').trim();
  return {
    id,
    title: String(obj.title ?? '').trim(),
    description: String(obj.description ?? '').trim(),
    buttonText: String(obj.buttonText ?? '').trim() || 'View Case Study',
    buttonLink: String(obj.buttonLink ?? '').trim(),
    imageKey: isValidLatestProjectImageKey(imageKey)
      ? imageKey
      : DEFAULT_LATEST_PROJECT_IMAGE_KEY,
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

function getLocalProjects(): LatestProjectRecord[] {
  try {
    const raw = localStorage.getItem(LATEST_PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: { id?: string } & Record<string, unknown>) =>
          mapToRecord(String(item.id || ''), item)
        );
      }
    }
  } catch (e) {
    console.warn('Could not read local Latest Projects store:', e);
  }
  return [];
}

function saveLocalProjects(records: LatestProjectRecord[]) {
  try {
    localStorage.setItem(LATEST_PROJECTS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_latest_projects_updated'));
  } catch (e) {
    console.warn('Could not save to local Latest Projects store:', e);
  }
}

function sortProjects(list: LatestProjectRecord[]): LatestProjectRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function seedDefaultProjects(): LatestProjectRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_PROJECTS.map((item, index) => ({
    ...item,
    id: `latest_project_seed_${index + 1}`,
    createdAt: now,
    updatedAt: now,
  }));
}

function validateInput(data: LatestProjectInput) {
  const title = data.title?.trim();
  const description = data.description?.trim();
  const buttonText = data.buttonText?.trim();
  const buttonLink = data.buttonLink?.trim() || '';
  const imageKey = data.imageKey?.trim();
  if (!title) throw new Error('Title is required.');
  if (!description) throw new Error('Description is required.');
  if (!buttonText) throw new Error('Button text is required.');
  if (!imageKey || !isValidLatestProjectImageKey(imageKey)) {
    throw new Error('Please choose an image.');
  }
  return { title, description, buttonText, buttonLink, imageKey };
}

/**
 * All Latest Projects in display order (home section + admin).
 */
export const getLatestProjects = async (): Promise<LatestProjectRecord[]> => {
  let localList = getLocalProjects();

  if (localList.length === 0) {
    localList = seedDefaultProjects();
    saveLocalProjects(localList);
  }

  try {
    const q = query(
      collection(db, LATEST_PROJECTS_COLLECTION),
      orderBy('sortOrder', 'asc')
    );
    const querySnapshot = await getDocs(q);

    const remoteList: LatestProjectRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0) {
      return sortProjects(localList);
    }

    const idMap = new Map<string, LatestProjectRecord>();
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

    const merged = sortProjects(Array.from(idMap.values()));
    saveLocalProjects(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore Latest Projects read error, serving cached/local list:', error);
    return sortProjects(localList);
  }
};

export const createLatestProject = async (data: LatestProjectInput): Promise<string> => {
  const values = validateInput(data);
  const existing = getLocalProjects();
  const now = new Date().toISOString();
  const maxOrder = existing.reduce((max, p) => Math.max(max, p.sortOrder), -1);

  const localRecord: LatestProjectRecord = {
    id: `latest_project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...values,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalProjects([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, LATEST_PROJECTS_COLLECTION), {
      ...values,
      sortOrder: localRecord.sortOrder,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'latest_project',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalProjects().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalProjects(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Latest Project saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateLatestProject = async (id: string, data: LatestProjectInput): Promise<void> => {
  const values = validateInput(data);
  const existing = getLocalProjects();
  if (!existing.some((p) => p.id === id)) throw new Error('Project not found.');

  const updatedAt = new Date().toISOString();
  const patch = { ...values, updatedAt };

  saveLocalProjects(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    if (!id.startsWith('latest_project_seed_')) {
      await updateDoc(doc(db, LATEST_PROJECTS_COLLECTION, id), patch);
    }
  } catch (error) {
    console.warn('Firestore update Latest Project failed or restricted, updated locally:', error);
  }
};

export const moveLatestProject = async (id: string, direction: 'up' | 'down'): Promise<void> => {
  const list = sortProjects(getLocalProjects());
  const index = list.findIndex((p) => p.id === id);
  if (index < 0) throw new Error('Project not found.');

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const a = list[index];
  const b = list[swapWith];
  const updatedAt = new Date().toISOString();

  const next = [...list];
  next[index] = { ...b, sortOrder: a.sortOrder, updatedAt };
  next[swapWith] = { ...a, sortOrder: b.sortOrder, updatedAt };

  const normalized = sortProjects(next).map((item, i) => ({
    ...item,
    sortOrder: i,
    updatedAt,
  }));

  saveLocalProjects(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      if (item.id.startsWith('latest_project_seed_')) return;
      batch.update(doc(db, LATEST_PROJECTS_COLLECTION, item.id), {
        sortOrder: item.sortOrder,
        updatedAt,
      });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore reorder Latest Projects failed or restricted, updated locally:', error);
  }
};

export const deleteLatestProject = async (id: string): Promise<void> => {
  const remaining = sortProjects(getLocalProjects().filter((item) => item.id !== id)).map(
    (item, i) => ({ ...item, sortOrder: i })
  );

  saveLocalProjects(remaining);

  try {
    if (!id.startsWith('latest_project_seed_')) {
      await deleteDoc(doc(db, LATEST_PROJECTS_COLLECTION, id));
    }
  } catch (error) {
    console.warn('Firestore delete Latest Project failed or restricted, deleted locally:', error);
  }
};
