import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  ADMIN_BADGE_EVENT_BY_STORE,
  countNewFromLocalStore,
} from '../lib/adminBadges';

/**
 * Sidebar badge for "new" items — live via Firestore + instant local updates.
 * No reload needed when a guest submits Feedback / Contact / Can't Find / Club.
 */
export function useAdminBadgeCount(storageKey: string, collectionName: string): number {
  const [count, setCount] = useState(() => countNewFromLocalStore(storageKey));

  useEffect(() => {
    const syncFromLocal = () => {
      setCount(countNewFromLocalStore(storageKey));
    };

    const q = query(collection(db, collectionName), where('status', '==', 'new'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setCount(snap.size);
      },
      (err) => {
        console.warn(`Admin badge listener (${collectionName}):`, err);
        syncFromLocal();
      }
    );

    const updateEvent = ADMIN_BADGE_EVENT_BY_STORE[storageKey];
    if (updateEvent) {
      window.addEventListener(updateEvent, syncFromLocal);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) syncFromLocal();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsub();
      if (updateEvent) {
        window.removeEventListener(updateEvent, syncFromLocal);
      }
      window.removeEventListener('storage', onStorage);
    };
  }, [collectionName, storageKey]);

  return count;
}
