import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { countNewFromLocalStore } from '../lib/adminBadges';

/**
 * Sidebar badge for "new" items — live via Firestore.
 * Instant localStorage hint, then realtime count (no reload / click needed).
 */
export function useAdminBadgeCount(storageKey: string, collectionName: string): number {
  const [count, setCount] = useState(() => countNewFromLocalStore(storageKey));

  useEffect(() => {
    const q = query(collection(db, collectionName), where('status', '==', 'new'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setCount(snap.size);
      },
      (err) => {
        console.warn(`Admin badge listener (${collectionName}):`, err);
        setCount(countNewFromLocalStore(storageKey));
      }
    );

    return () => unsub();
  }, [collectionName, storageKey]);

  return count;
}
