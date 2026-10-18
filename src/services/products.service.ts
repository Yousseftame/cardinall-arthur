import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  DEFAULT_PRODUCT_IMAGE_KEY,
  isValidProductImageKey,
  MAX_PRODUCT_GALLERY_IMAGES,
  resolveProductGallery,
  resolveProductImage,
} from '../data/productImages';
import { MAX_PRODUCT_NOTES, normalizePerfumeNoteIds } from '../data/perfumeNotes';

/** Bottle size is fixed for all Cardinal Arthur perfume products. */
export const PRODUCT_BOTTLE_SIZE = '50ml' as const;
export type ProductBottleSize = typeof PRODUCT_BOTTLE_SIZE;

export type ProductStatus = 'active' | 'inactive';

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  /**
   * Ordered gallery of static asset keys (1–N).
   * First image is the primary / list thumbnail.
   */
  imageKeys: string[];
  /** Catalog scent note ids (from perfumeNotes). */
  notes: string[];
  status?: ProductStatus;
  /** Optional override; auto-generated from name when omitted. */
  slug?: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Numeric EGP amount (e.g. 2111). */
  price: number;
  /** Always `50ml` — perfume bottle size. */
  bottleSize: ProductBottleSize;
  stock: number;
  status: ProductStatus;
  /** Firestore category document id. */
  categoryId: string;
  /** Denormalized category label for filters / admin table. */
  categoryName: string;
  /**
   * Ordered gallery keys into static `PRODUCT_IMAGES` (not remote URLs).
   * Length can be 1, 4, etc. First key = primary image.
   */
  imageKeys: string[];
  /** Catalog scent note ids. */
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

const PRODUCTS_COLLECTION = 'products';
const PRODUCTS_STORAGE_KEY = 'cardinall_products_store';

export function slugifyProductName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'product'
  );
}

export function formatProductPrice(price: number): string {
  const safe = Number.isFinite(price) ? Math.max(0, price) : 0;
  return `${Math.round(safe).toLocaleString('en-US')} EGP`;
}

/** Share / detail path — stable slug-based URL. */
export function getProductSharePath(product: Pick<ProductRecord, 'slug'>): string {
  return `/product/${product.slug}`;
}

/** Primary image (first gallery item) — lists, cards, share previews. */
export function getProductImageSrc(product: Pick<ProductRecord, 'imageKeys'>): string {
  return resolveProductImage(product.imageKeys?.[0]);
}

/** Full gallery URLs for product detail / modal carousels. */
export function getProductGallerySrcs(product: Pick<ProductRecord, 'imageKeys'>): string[] {
  return resolveProductGallery(product.imageKeys);
}

/** Second image when present (legacy hover), else primary. */
export function getProductHoverImageSrc(product: Pick<ProductRecord, 'imageKeys'>): string {
  const keys = product.imageKeys || [];
  return resolveProductImage(keys[1] || keys[0]);
}

function normalizeStatus(status: unknown): ProductStatus {
  return status === 'inactive' ? 'inactive' : 'active';
}

function normalizePrice(price: unknown): number {
  const n = typeof price === 'number' ? price : parseFloat(String(price ?? '').replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function normalizeStock(stock: unknown): number {
  const n = typeof stock === 'number' ? stock : parseInt(String(stock ?? '0'), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function normalizeImageKeys(raw: any): string[] {
  const fromArray = Array.isArray(raw?.imageKeys)
    ? raw.imageKeys.map((k: unknown) => String(k || '').trim()).filter(isValidProductImageKey)
    : [];

  if (fromArray.length > 0) {
    return fromArray.slice(0, MAX_PRODUCT_GALLERY_IMAGES);
  }

  // Migrate legacy thumbnail + hover fields into a gallery
  const legacy: string[] = [];
  const main = String(raw?.imageKey || '').trim();
  const hover = String(raw?.hoverImageKey || '').trim();
  if (isValidProductImageKey(main)) legacy.push(main);
  if (isValidProductImageKey(hover) && hover !== main) legacy.push(hover);

  if (legacy.length > 0) return legacy;
  return [DEFAULT_PRODUCT_IMAGE_KEY];
}

function mapToRecord(id: string, raw: any): ProductRecord {
  const name = String(raw?.name || '').trim();
  return {
    id,
    name,
    slug: String(raw?.slug || '').trim() || slugifyProductName(name || 'product'),
    description: String(raw?.description || '').trim(),
    price: normalizePrice(raw?.price),
    bottleSize: PRODUCT_BOTTLE_SIZE,
    stock: normalizeStock(raw?.stock),
    status: normalizeStatus(raw?.status),
    categoryId: String(raw?.categoryId || '').trim(),
    categoryName: String(raw?.categoryName || '').trim(),
    imageKeys: normalizeImageKeys(raw),
    notes: normalizePerfumeNoteIds(raw?.notes, MAX_PRODUCT_NOTES),
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString(),
  };
}

function getLocalProducts(): ProductRecord[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => mapToRecord(item.id, item));
      }
    }
  } catch (e) {
    console.warn('Could not read local products store:', e);
  }
  return [];
}

function saveLocalProducts(records: ProductRecord[]) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_products_updated'));
  } catch (e) {
    console.warn('Could not save to local products store:', e);
  }
}

function ensureUniqueSlug(baseSlug: string, excludeId?: string): string {
  const existing = getLocalProducts();
  let slug = baseSlug;
  let i = 2;
  while (existing.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${baseSlug}-${i}`;
    i += 1;
  }
  return slug;
}

function validateInput(data: ProductInput): {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageKeys: string[];
  notes: string[];
  status: ProductStatus;
  slugBase: string;
} {
  const name = data.name?.trim();
  if (!name) throw new Error('Product name is required.');

  const description = data.description?.trim();
  if (!description) throw new Error('Product description is required.');

  const price = normalizePrice(data.price);
  if (price <= 0) throw new Error('Price must be greater than 0.');

  const stock = normalizeStock(data.stock);
  if (stock < 0) throw new Error('Stock cannot be negative.');

  const categoryId = data.categoryId?.trim();
  if (!categoryId) throw new Error('Category is required.');

  const categoryName = data.categoryName?.trim() || '';
  const imageKeys = (Array.isArray(data.imageKeys) ? data.imageKeys : [])
    .map((k) => String(k || '').trim())
    .filter(isValidProductImageKey)
    .slice(0, MAX_PRODUCT_GALLERY_IMAGES);

  if (imageKeys.length === 0) {
    throw new Error('Add at least one gallery image.');
  }

  const notes = normalizePerfumeNoteIds(data.notes, MAX_PRODUCT_NOTES);
  if (notes.length === 0) {
    throw new Error('Select at least one scent note.');
  }

  const status = normalizeStatus(data.status);
  const slugBase = slugifyProductName(data.slug?.trim() || name);

  return {
    name,
    description,
    price,
    stock,
    categoryId,
    categoryName,
    imageKeys,
    notes,
    status,
    slugBase,
  };
}

/**
 * Creates a marketplace product (local-first, then Firestore).
 */
export const createProduct = async (data: ProductInput): Promise<string> => {
  const v = validateInput(data);
  const now = new Date().toISOString();
  const slug = ensureUniqueSlug(v.slugBase);

  const localRecord: ProductRecord = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: v.name,
    slug,
    description: v.description,
    price: v.price,
    bottleSize: PRODUCT_BOTTLE_SIZE,
    stock: v.stock,
    status: v.status,
    categoryId: v.categoryId,
    categoryName: v.categoryName,
    imageKeys: v.imageKeys,
    notes: v.notes,
    createdAt: now,
    updatedAt: now,
  };

  const existing = getLocalProducts();
  saveLocalProducts([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name: localRecord.name,
      slug: localRecord.slug,
      description: localRecord.description,
      price: localRecord.price,
      bottleSize: PRODUCT_BOTTLE_SIZE,
      stock: localRecord.stock,
      status: localRecord.status,
      categoryId: localRecord.categoryId,
      categoryName: localRecord.categoryName,
      imageKeys: localRecord.imageKeys,
      notes: localRecord.notes,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'marketplace_product',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalProducts().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalProducts(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Product saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

/**
 * Fetches products (oldest first for stable catalog order).
 */
export const getProducts = async (): Promise<ProductRecord[]> => {
  const localList = getLocalProducts();

  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: ProductRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    const idMap = new Map<string, ProductRecord>();
    remoteList.forEach((item) => idMap.set(item.id, item));
    localList.forEach((item) => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        const remote = idMap.get(item.id)!;
        if (item.updatedAt > remote.updatedAt) {
          idMap.set(item.id, { ...remote, ...item, bottleSize: PRODUCT_BOTTLE_SIZE });
        }
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    saveLocalProducts(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore products read error, serving cached/local list:', error);
    return localList.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
};

/**
 * Updates a product.
 */
export const updateProduct = async (id: string, data: ProductInput): Promise<void> => {
  const v = validateInput(data);
  const slug = ensureUniqueSlug(v.slugBase, id);
  const updatedAt = new Date().toISOString();

  const patch = {
    name: v.name,
    slug,
    description: v.description,
    price: v.price,
    bottleSize: PRODUCT_BOTTLE_SIZE as ProductBottleSize,
    stock: v.stock,
    status: v.status,
    categoryId: v.categoryId,
    categoryName: v.categoryName,
    imageKeys: v.imageKeys,
    notes: v.notes,
    updatedAt,
  };

  const localList = getLocalProducts().map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );
  saveLocalProducts(localList);

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, patch);
  } catch (error) {
    console.warn('Firestore updateDoc product failed or restricted, updated locally:', error);
  }
};

/**
 * Toggles / sets product status only.
 */
export const updateProductStatus = async (id: string, status: ProductStatus): Promise<void> => {
  const updatedAt = new Date().toISOString();

  const localList = getLocalProducts().map((item) =>
    item.id === id ? { ...item, status, updatedAt } : item
  );
  saveLocalProducts(localList);

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, { status, updatedAt });
  } catch (error) {
    console.warn('Firestore updateDoc product status failed or restricted, updated locally:', error);
  }
};

/**
 * Deletes a product.
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const localList = getLocalProducts().filter((item) => item.id !== id);
  saveLocalProducts(localList);

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete product failed or restricted, deleted locally:', error);
  }
};
