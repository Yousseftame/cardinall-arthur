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
  DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY,
  isValidMarketplaceBannerImageKey,
} from '../data/marketplaceBannerImages';

export interface BannerInput {
  name: string;
  heading: string;
  description: string;
  imageKey: string;
}

export interface BannerRecord {
  id: string;
  name: string;
  heading: string;
  description: string;
  imageKey: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const BANNERS_COLLECTION = 'banners';
const BANNERS_STORAGE_KEY = 'cardinall_banners_store';

/** Seeds match the current Marketplace carousel design exactly. */
const DEFAULT_BANNERS: Omit<BannerRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Cardinal Arthur',
    heading: 'CARDINAL\nARTHUR\nCOLLECTION',
    description:
      'Crafted with exquisite intention. The absolute finest selection of our heritage legacy. Welcome to the Marketplace.',
    imageKey: 'marketplace-2',
    sortOrder: 0,
  },
  {
    name: 'New Arrivals',
    heading: 'AUTUMN\nWINTER\nESSENTIALS',
    description:
      'Discover the dark elegance of the new season. Perfectly tailored for those who dare to lead.',
    imageKey: 'banner-2',
    sortOrder: 1,
  },
];

function mapToRecord(id: string, raw: unknown): BannerRecord {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const imageKey = String(obj.imageKey ?? '').trim();
  return {
    id,
    name: String(obj.name ?? '').trim(),
    heading: String(obj.heading ?? '').trim(),
    description: String(obj.description ?? '').trim(),
    imageKey: isValidMarketplaceBannerImageKey(imageKey)
      ? imageKey
      : DEFAULT_MARKETPLACE_BANNER_IMAGE_KEY,
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

function getLocalBanners(): BannerRecord[] {
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: { id?: string } & Record<string, unknown>) =>
          mapToRecord(String(item.id || ''), item)
        );
      }
    }
  } catch (e) {
    console.warn('Could not read local Banners store:', e);
  }
  return [];
}

function saveLocalBanners(records: BannerRecord[]) {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_banners_updated'));
  } catch (e) {
    console.warn('Could not save to local Banners store:', e);
  }
}

function sortBanners(list: BannerRecord[]): BannerRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function seedDefaultBanners(): BannerRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_BANNERS.map((item, index) => ({
    ...item,
    id: `banner_seed_${index + 1}`,
    createdAt: now,
    updatedAt: now,
  }));
}

function validateInput(data: BannerInput) {
  const name = data.name?.trim();
  const heading = data.heading?.trim();
  const description = data.description?.trim();
  const imageKey = data.imageKey?.trim();
  if (!name) throw new Error('Name is required.');
  if (!heading) throw new Error('Heading is required.');
  if (!description) throw new Error('Description is required.');
  if (!imageKey || !isValidMarketplaceBannerImageKey(imageKey)) {
    throw new Error('Please choose an image.');
  }
  return { name, heading, description, imageKey };
}

/** Marketplace banners in display order — fetched only where needed. */
export const getBanners = async (): Promise<BannerRecord[]> => {
  let localList = getLocalBanners();

  if (localList.length === 0) {
    localList = seedDefaultBanners();
    saveLocalBanners(localList);
  }

  try {
    const q = query(collection(db, BANNERS_COLLECTION), orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: BannerRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0) {
      return sortBanners(localList);
    }

    const idMap = new Map<string, BannerRecord>();
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

    const merged = sortBanners(Array.from(idMap.values()));
    saveLocalBanners(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore Banners read error, serving cached/local list:', error);
    return sortBanners(localList);
  }
};

export const createBanner = async (data: BannerInput): Promise<string> => {
  const values = validateInput(data);
  const existing = getLocalBanners();
  const now = new Date().toISOString();
  const maxOrder = existing.reduce((max, p) => Math.max(max, p.sortOrder), -1);

  const localRecord: BannerRecord = {
    id: `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...values,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalBanners([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, BANNERS_COLLECTION), {
      ...values,
      sortOrder: localRecord.sortOrder,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'marketplace_banner',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalBanners().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalBanners(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Banner saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateBanner = async (id: string, data: BannerInput): Promise<void> => {
  const values = validateInput(data);
  const existing = getLocalBanners();
  if (!existing.some((p) => p.id === id)) throw new Error('Banner not found.');

  const updatedAt = new Date().toISOString();
  const patch = { ...values, updatedAt };

  saveLocalBanners(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    if (!id.startsWith('banner_seed_')) {
      await updateDoc(doc(db, BANNERS_COLLECTION, id), patch);
    }
  } catch (error) {
    console.warn('Firestore update Banner failed or restricted, updated locally:', error);
  }
};

export const moveBanner = async (id: string, direction: 'up' | 'down'): Promise<void> => {
  const list = sortBanners(getLocalBanners());
  const index = list.findIndex((p) => p.id === id);
  if (index < 0) throw new Error('Banner not found.');

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const a = list[index];
  const b = list[swapWith];
  const updatedAt = new Date().toISOString();

  const next = [...list];
  next[index] = { ...b, sortOrder: a.sortOrder, updatedAt };
  next[swapWith] = { ...a, sortOrder: b.sortOrder, updatedAt };

  const normalized = sortBanners(next).map((item, i) => ({
    ...item,
    sortOrder: i,
    updatedAt,
  }));

  saveLocalBanners(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      if (item.id.startsWith('banner_seed_')) return;
      batch.update(doc(db, BANNERS_COLLECTION, item.id), {
        sortOrder: item.sortOrder,
        updatedAt,
      });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore reorder Banners failed or restricted, updated locally:', error);
  }
};

export const deleteBanner = async (id: string): Promise<void> => {
  const remaining = sortBanners(getLocalBanners().filter((item) => item.id !== id)).map(
    (item, i) => ({ ...item, sortOrder: i })
  );

  saveLocalBanners(remaining);

  try {
    if (!id.startsWith('banner_seed_')) {
      await deleteDoc(doc(db, BANNERS_COLLECTION, id));
    }
  } catch (error) {
    console.warn('Firestore delete Banner failed or restricted, deleted locally:', error);
  }
};
