import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface VisionRecord {
  text: string;
  updatedAt: string;
}

export type VisionInput = {
  text: string;
};

const SETTINGS_COLLECTION = 'settings';
const VISION_DOC = 'aboutVision';
const VISION_STORAGE_KEY = 'cardinall_about_vision';

export const DEFAULT_VISION: VisionRecord = {
  text: 'CARDINALL ARTHUR — BUILT BEYOND IDENTITY. VISION DEFINED. BRAND SHAPED. SYSTEMS DESIGNED. PERFORMANCE ENGINEERED. WE CREATE STRUCTURE WHERE THERE IS NOISE, CLARITY WHERE THERE IS COMPLEXITY, AND DIRECTION WHERE THERE IS FRICTION. EVERYTHING MOVES TOGETHER. NOTHING STANDS ALONE. A UNIFIED SYSTEM, CRAFTED WITH PRECISION. BUILT TO SCALE. BUILT TO ENDURE.',
  updatedAt: new Date(0).toISOString(),
};

function normalizeRecord(raw: unknown): VisionRecord {
  const base = DEFAULT_VISION;
  if (!raw || typeof raw !== 'object') {
    return { text: base.text, updatedAt: base.updatedAt };
  }

  const obj = raw as Record<string, unknown>;

  // Prefer `text`; migrate older primary+secondary docs if present
  let text = String(obj.text ?? '').trim();
  if (!text) {
    const primary = String(obj.primaryText ?? '').trim();
    const secondary = String(obj.secondaryText ?? '').trim();
    text = [primary, secondary].filter(Boolean).join(' ').trim();
  }
  if (!text) text = base.text;

  return {
    text,
    updatedAt:
      typeof obj.updatedAt === 'string' && obj.updatedAt
        ? obj.updatedAt
        : new Date().toISOString(),
  };
}

function getLocalVision(): VisionRecord | null {
  try {
    const raw = localStorage.getItem(VISION_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRecord(JSON.parse(raw));
  } catch (e) {
    console.warn('Could not read local Vision store:', e);
    return null;
  }
}

function saveLocalVision(record: VisionRecord) {
  try {
    localStorage.setItem(VISION_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event('cardinall_about_vision_updated'));
  } catch (e) {
    console.warn('Could not save local Vision store:', e);
  }
}

/**
 * Fetches About Vision copy from Firestore `settings/aboutVision`.
 */
export async function getVision(): Promise<VisionRecord> {
  const local = getLocalVision();

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, VISION_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const remote = normalizeRecord(snap.data());
      saveLocalVision(remote);
      return remote;
    }

    return local ?? normalizeRecord(DEFAULT_VISION);
  } catch (error) {
    console.warn('Using local/default Vision due to fetch error:', error);
    return local ?? normalizeRecord(DEFAULT_VISION);
  }
}

/**
 * Saves Vision copy to Firestore + local cache.
 */
export async function updateVision(input: VisionInput): Promise<VisionRecord> {
  const text = String(input.text ?? '').trim();
  if (!text) throw new Error('Vision text is required.');

  const now = new Date().toISOString();
  const record: VisionRecord = {
    text,
    updatedAt: now,
  };

  saveLocalVision(record);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, VISION_DOC);
    await setDoc(
      docRef,
      {
        text: record.text,
        updatedAt: record.updatedAt,
        _serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update Vision in Firestore:', error);
    throw error;
  }

  return record;
}
