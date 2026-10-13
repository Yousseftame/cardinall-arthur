import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export type CategoryStatus = 'active' | 'inactive';

export interface CategoryInput {
  name: string;
  status?: CategoryStatus;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES_COLLECTION = "categories";
const CATEGORIES_STORAGE_KEY = "cardinall_categories_store";

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'category';
}

function normalizeStatus(status: unknown): CategoryStatus {
  return status === 'inactive' ? 'inactive' : 'active';
}

function getLocalCategories(): CategoryRecord[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          slug: item.slug || slugifyCategoryName(item.name || ''),
          status: normalizeStatus(item.status),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn("Could not read local categories store:", e);
  }
  return [];
}

function saveLocalCategories(records: CategoryRecord[]) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_categories_updated'));
  } catch (e) {
    console.warn("Could not save to local categories store:", e);
  }
}

/**
 * Creates a marketplace category
 */
export const createCategory = async (data: CategoryInput): Promise<string> => {
  const name = data.name?.trim();
  if (!name) throw new Error('Category name is required.');

  const now = new Date().toISOString();
  const localRecord: CategoryRecord = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    slug: slugifyCategoryName(name),
    status: normalizeStatus(data.status),
    createdAt: now,
    updatedAt: now,
  };

  const existing = getLocalCategories();
  saveLocalCategories([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      name: localRecord.name,
      slug: localRecord.slug,
      status: localRecord.status,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'marketplace_category',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalCategories().map(item =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalCategories(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn("Category saved to local store (Firestore write restricted or offline):", err);
  }

  return localRecord.id;
};

/**
 * Fetches marketplace categories (oldest first for stable nav order)
 */
export const getCategories = async (): Promise<CategoryRecord[]> => {
  const localList = getLocalCategories();

  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);

    const remoteList: CategoryRecord[] = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name || '',
        slug: d.slug || slugifyCategoryName(d.name || ''),
        status: normalizeStatus(d.status),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
      };
    });

    const idMap = new Map<string, CategoryRecord>();
    remoteList.forEach(item => idMap.set(item.id, item));
    localList.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        // Prefer local status if recently toggled offline
        const remote = idMap.get(item.id)!;
        if (item.updatedAt > remote.updatedAt) {
          idMap.set(item.id, { ...remote, ...item });
        }
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    saveLocalCategories(merged);
    return merged;
  } catch (error) {
    console.warn("Firestore categories read error, serving cached/local list:", error);
    return localList.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
};

/**
 * Updates a category name and/or status
 */
export const updateCategory = async (id: string, data: CategoryInput): Promise<void> => {
  const name = data.name?.trim();
  if (!name) throw new Error('Category name is required.');

  const slug = slugifyCategoryName(name);
  const status = normalizeStatus(data.status);
  const updatedAt = new Date().toISOString();

  const localList = getLocalCategories().map(item =>
    item.id === id ? { ...item, name, slug, status, updatedAt } : item
  );
  saveLocalCategories(localList);

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, { name, slug, status, updatedAt });
  } catch (error) {
    console.warn("Firestore updateDoc category failed or restricted, updated locally:", error);
  }
};

/**
 * Toggles / sets category status only
 */
export const updateCategoryStatus = async (id: string, status: CategoryStatus): Promise<void> => {
  const updatedAt = new Date().toISOString();

  const localList = getLocalCategories().map(item =>
    item.id === id ? { ...item, status, updatedAt } : item
  );
  saveLocalCategories(localList);

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, { status, updatedAt });
  } catch (error) {
    console.warn("Firestore updateDoc category status failed or restricted, updated locally:", error);
  }
};

/**
 * Deletes a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  const localList = getLocalCategories().filter(item => item.id !== id);
  saveLocalCategories(localList);

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore delete category failed or restricted, deleted locally:", error);
  }
};
