import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export type ClubAdvanceStatus = 'new' | 'seen';
export type ClubAdvancePaymentStatus =
  | 'pending'
  | 'received'
  | 'paid'
  | 'cancelled';

export const CLUB_PAYMENT_STATUSES: ClubAdvancePaymentStatus[] = [
  'pending',
  'received',
  'paid',
  'cancelled',
];

function normalizePaymentStatus(
  value: unknown
): ClubAdvancePaymentStatus {
  if (
    value === 'received' ||
    value === 'paid' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return 'pending';
}

export interface SubmitClubAdvanceInput {
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
}

export interface ClubAdvanceRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: ClubAdvanceStatus;
  paymentStatus: ClubAdvancePaymentStatus;
  priceEgp: number;
  createdAt: string;
}

export const CLUB_ADVANCE_COLLECTION = 'club_advance_requests';
export const CLUB_ADVANCE_STORAGE_KEY = 'cardinall_club_advance_store';
export const CLUB_ADVANCE_PRICE_EGP = 1000;

function getLocalClubAdvanceRequests(): ClubAdvanceRecord[] {
  try {
    const raw = localStorage.getItem(CLUB_ADVANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: Partial<ClubAdvanceRecord>) => ({
      id: item.id || `local_${Date.now()}`,
      name: item.name || 'Guest',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || '',
      notes: item.notes || '',
      status: item.status === 'seen' ? 'seen' : 'new',
      paymentStatus: normalizePaymentStatus(item.paymentStatus),
      priceEgp: item.priceEgp ?? CLUB_ADVANCE_PRICE_EGP,
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function saveLocalClubAdvanceRequests(records: ClubAdvanceRecord[]) {
  try {
    localStorage.setItem(CLUB_ADVANCE_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('cardinall_club_advance_updated'));
  } catch {
    // ignore quota / private mode
  }
}

function mapDoc(
  id: string,
  data: Record<string, unknown>
): ClubAdvanceRecord {
  return {
    id,
    name: (data.name as string) || 'Guest',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
    address: (data.address as string) || '',
    notes: (data.notes as string) || '',
    status: data.status === 'seen' ? 'seen' : 'new',
    paymentStatus: normalizePaymentStatus(data.paymentStatus),
    priceEgp:
      typeof data.priceEgp === 'number'
        ? data.priceEgp
        : CLUB_ADVANCE_PRICE_EGP,
    createdAt:
      (data.createdAt as string) || new Date().toISOString(),
  };
}

/** Guest submit from Club advance membership modal */
export async function submitClubAdvanceRequest(
  data: SubmitClubAdvanceInput
): Promise<string> {
  const payload = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    address: data.address.trim(),
    notes: data.notes?.trim() || '',
    status: 'new' as ClubAdvanceStatus,
    paymentStatus: 'pending' as ClubAdvancePaymentStatus,
    priceEgp: CLUB_ADVANCE_PRICE_EGP,
    type: 'advance_membership',
    createdAt: new Date().toISOString(),
  };

  const localRecord: ClubAdvanceRecord = {
    id: `ca_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...payload,
  };

  const existing = getLocalClubAdvanceRequests();
  saveLocalClubAdvanceRequests([localRecord, ...existing]);

  try {
    const docRef = await addDoc(collection(db, CLUB_ADVANCE_COLLECTION), {
      ...payload,
      _serverTimestamp: serverTimestamp(),
    });

    if (docRef.id) {
      const updated = getLocalClubAdvanceRequests().map((item) =>
        item.createdAt === localRecord.createdAt
          ? { ...item, id: docRef.id }
          : item
      );
      saveLocalClubAdvanceRequests(updated);
      return docRef.id;
    }
  } catch (err) {
    console.warn(
      'Club advance request saved locally (Firestore write failed or offline):',
      err
    );
  }

  return localRecord.id;
}

/** Admin list — fetched only when the Club Requests page mounts */
export async function getClubAdvanceRequests(): Promise<ClubAdvanceRecord[]> {
  const localList = getLocalClubAdvanceRequests();

  try {
    const q = query(
      collection(db, CLUB_ADVANCE_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const remoteList = snap.docs.map((d) => mapDoc(d.id, d.data()));

    const idMap = new Map<string, ClubAdvanceRecord>();
    remoteList.forEach((item) => idMap.set(item.id, item));
    localList.forEach((item) => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, item);
      } else {
        const remote = idMap.get(item.id)!;
        idMap.set(item.id, {
          ...remote,
          status: item.status === 'seen' ? 'seen' : remote.status,
          paymentStatus:
            item.paymentStatus !== 'pending'
              ? item.paymentStatus
              : remote.paymentStatus,
        });
      }
    });

    const merged = Array.from(idMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    saveLocalClubAdvanceRequests(merged);
    return merged;
  } catch (error) {
    console.warn(
      'Firestore club advance read failed, serving local cache:',
      error
    );
    return localList;
  }
}

export async function updateClubAdvanceStatus(
  id: string,
  status: ClubAdvanceStatus
): Promise<void> {
  const localList = getLocalClubAdvanceRequests().map((item) =>
    item.id === id ? { ...item, status } : item
  );
  saveLocalClubAdvanceRequests(localList);

  try {
    await updateDoc(doc(db, CLUB_ADVANCE_COLLECTION, id), { status });
  } catch (error) {
    console.warn('Firestore club advance status update failed:', error);
  }
}

export async function updateClubAdvancePaymentStatus(
  id: string,
  paymentStatus: ClubAdvancePaymentStatus
): Promise<void> {
  const localList = getLocalClubAdvanceRequests().map((item) =>
    item.id === id ? { ...item, paymentStatus } : item
  );
  saveLocalClubAdvanceRequests(localList);

  try {
    await updateDoc(doc(db, CLUB_ADVANCE_COLLECTION, id), { paymentStatus });
  } catch (error) {
    console.warn(
      'Firestore club advance payment status update failed:',
      error
    );
  }
}

export async function markAllClubAdvanceSeen(): Promise<void> {
  const localList = getLocalClubAdvanceRequests().map((item) => ({
    ...item,
    status: 'seen' as ClubAdvanceStatus,
  }));
  saveLocalClubAdvanceRequests(localList);

  try {
    await Promise.all(
      localList.map((item) =>
        updateDoc(doc(db, CLUB_ADVANCE_COLLECTION, item.id), {
          status: 'seen',
        }).catch(() => {})
      )
    );
  } catch {
    // background best-effort
  }
}

export async function deleteClubAdvanceRequest(id: string): Promise<void> {
  const localList = getLocalClubAdvanceRequests().filter(
    (item) => item.id !== id
  );
  saveLocalClubAdvanceRequests(localList);

  try {
    await deleteDoc(doc(db, CLUB_ADVANCE_COLLECTION, id));
  } catch (error) {
    console.warn('Firestore club advance delete failed:', error);
  }
}
