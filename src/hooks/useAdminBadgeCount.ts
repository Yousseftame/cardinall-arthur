import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { countNewFromLocalStore } from '../lib/adminBadges';

type StatusItem = { status?: string };

/**
 * Sidebar badge count with ZERO Firestore cost.
 * - Peeks localStorage for an instant hint
 * - Live-updates when the matching page's React Query cache changes
 * - Never calls Firebase itself
 */
export function useAdminBadgeCount(queryKeyRoot: string, storageKey: string): number {
  const queryClient = useQueryClient();
  const queryKey = [queryKeyRoot];

  const [count, setCount] = useState(() => {
    const cached = queryClient.getQueryData<StatusItem[]>(queryKey);
    if (cached) {
      return cached.filter((item) => item.status === 'new').length;
    }
    return countNewFromLocalStore(storageKey);
  });

  useEffect(() => {
    const sync = () => {
      const cached = queryClient.getQueryData<StatusItem[]>([queryKeyRoot]);
      if (cached) {
        setCount(cached.filter((item) => item.status === 'new').length);
        return;
      }
      setCount(countNewFromLocalStore(storageKey));
    };

    sync();

    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === queryKeyRoot) {
        sync();
      }
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) sync();
    };

    window.addEventListener('storage', onStorage);
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, [queryClient, queryKeyRoot, storageKey]);

  return count;
}
