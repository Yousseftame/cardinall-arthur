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
  SUGGESTED_PERFUME_NOTES,
  slugifyNoteLabel,
} from '../data/perfumeNotes';

export type NoteStatus = 'active' | 'inactive';

export interface NoteInput {
  label: string;
  status?: NoteStatus;
}

export interface NoteRecord {
  id: string;
  label: string;
  /** Stable slug used on products + storefront matching */
  slug: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

const NOTES_COLLECTION = 'perfume_notes';
const NOTES_STORAGE_KEY = 'cardinall_perfume_notes_store';

function normalizeStatus(status: unknown): NoteStatus {
  return status === 'inactive' ? 'inactive' : 'active';
}

function mapToRecord(id: string, raw: any): NoteRecord {
  const label = String(raw?.label || '').trim();
  return {
    id,
    label,
    slug: String(raw?.slug || '').trim() || slugifyNoteLabel(label || id),
    status: normalizeStatus(raw?.status),
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString(),
  };
}

function getLocalNotes(): NoteRecord[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => mapToRecord(item.id, item));
      }
    }
  } catch (e) {
    console.warn('Could not read local notes store:', e);
  }
  return [];
}

function saveLocalNotes(records: NoteRecord[]) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_notes_updated'));
  } catch (e) {
    console.warn('Could not save to local notes store:', e);
  }
}

function seedSuggestedNotes(): NoteRecord[] {
  const now = new Date().toISOString();
  const seeded: NoteRecord[] = SUGGESTED_PERFUME_NOTES.map((n, i) => ({
    id: `note_seed_${n.id}`,
    label: n.label,
    slug: n.id,
    status: 'active' as NoteStatus,
    createdAt: new Date(Date.now() - (SUGGESTED_PERFUME_NOTES.length - i) * 1000).toISOString(),
    updatedAt: now,
  }));
  saveLocalNotes(seeded);
  return seeded;
}

/**
 * Fetches scent notes. Seeds suggested catalog locally if store is empty.
 */
export const getNotes = async (): Promise<NoteRecord[]> => {
  let localList = getLocalNotes();
  if (localList.length === 0) {
    localList = seedSuggestedNotes();
  }

  try {
    const q = query(collection(db, NOTES_COLLECTION), orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const remoteList: NoteRecord[] = querySnapshot.docs.map((docSnap) =>
      mapToRecord(docSnap.id, docSnap.data())
    );

    if (remoteList.length === 0) {
      return localList.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    const idMap = new Map<string, NoteRecord>();
    remoteList.forEach((item) => idMap.set(item.id, item));
    localList.forEach((item) => {
      if (!idMap.has(item.id)) {
        // Prefer matching by slug if remote already has it
        const bySlug = Array.from(idMap.values()).find((r) => r.slug === item.slug);
        if (!bySlug) idMap.set(item.id, item);
      } else {
        const remote = idMap.get(item.id)!;
        if (item.updatedAt > remote.updatedAt) {
          idMap.set(item.id, { ...remote, ...item });
        }
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) => a.label.localeCompare(b.label)
    );
    saveLocalNotes(merged);
    return merged;
  } catch (error) {
    console.warn('Firestore notes read error, serving cached/local list:', error);
    return localList.sort((a, b) => a.label.localeCompare(b.label));
  }
};

/** Active notes for storefront pickers (id = slug for product matching). */
export function notesToPickerOptions(notes: NoteRecord[]): Array<{ id: string; label: string }> {
  return notes
    .filter((n) => n.status === 'active')
    .map((n) => ({ id: n.slug, label: n.label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const createNote = async (data: NoteInput): Promise<string> => {
  const label = data.label?.trim();
  if (!label) throw new Error('Note name is required.');
  if (label.length < 2) throw new Error('Note name is too short.');

  const slug = slugifyNoteLabel(label);
  const existing = getLocalNotes();
  if (existing.some((n) => n.slug === slug || n.label.toLowerCase() === label.toLowerCase())) {
    throw new Error('A note with this name already exists.');
  }

  const now = new Date().toISOString();
  const localRecord: NoteRecord = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    label,
    slug,
    status: normalizeStatus(data.status),
    createdAt: now,
    updatedAt: now,
  };

  saveLocalNotes([...existing, localRecord]);

  try {
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
      label: localRecord.label,
      slug: localRecord.slug,
      status: localRecord.status,
      createdAt: localRecord.createdAt,
      updatedAt: localRecord.updatedAt,
      type: 'perfume_note',
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalNotes().map((item) =>
        item.createdAt === localRecord.createdAt ? { ...item, id: docRef.id } : item
      );
      saveLocalNotes(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn('Note saved to local store (Firestore write restricted or offline):', err);
  }

  return localRecord.id;
};

export const updateNote = async (id: string, data: NoteInput): Promise<void> => {
  const label = data.label?.trim();
  if (!label) throw new Error('Note name is required.');

  const slug = slugifyNoteLabel(label);
  const existing = getLocalNotes();
  if (existing.some((n) => n.id !== id && (n.slug === slug || n.label.toLowerCase() === label.toLowerCase()))) {
    throw new Error('A note with this name already exists.');
  }

  const updatedAt = new Date().toISOString();
  const patch = {
    label,
    slug,
    status: normalizeStatus(data.status),
    updatedAt,
  };

  saveLocalNotes(existing.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  try {
    await updateDoc(doc(db, NOTES_COLLECTION, id), patch);
  } catch (error) {
    console.warn('Firestore updateDoc note failed or restricted, updated locally:', error);
  }
};

export const updateNoteStatus = async (id: string, status: NoteStatus): Promise<void> => {
  const updatedAt = new Date().toISOString();
  saveLocalNotes(
    getLocalNotes().map((item) => (item.id === id ? { ...item, status, updatedAt } : item))
  );

  try {
    await updateDoc(doc(db, NOTES_COLLECTION, id), { status, updatedAt });
  } catch (error) {
    console.warn('Firestore updateDoc note status failed or restricted, updated locally:', error);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  saveLocalNotes(getLocalNotes().filter((item) => item.id !== id));

  try {
    await deleteDoc(doc(db, NOTES_COLLECTION, id));
  } catch (error) {
    console.warn('Firestore delete note failed or restricted, deleted locally:', error);
  }
};

/** Ensure suggested notes exist (idempotent by slug). */
export const ensureSuggestedNotes = async (): Promise<number> => {
  const existing = await getNotes();
  const existingSlugs = new Set(existing.map((n) => n.slug));
  let added = 0;
  for (const suggestion of SUGGESTED_PERFUME_NOTES) {
    if (existingSlugs.has(suggestion.id)) continue;
    try {
      await createNote({ label: suggestion.label, status: 'active' });
      added += 1;
    } catch {
      // ignore duplicates
    }
  }
  return added;
};
