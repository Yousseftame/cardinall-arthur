/**
 * Shared React Query options for admin list pages.
 * Keeps reads cheap: no focus/reconnect refetch storms; stale cache reused until refresh.
 */
export const adminListQueryOptions = {
  staleTime: 1000 * 60 * 2,
  gcTime: 1000 * 60 * 10,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
  retry: 1,
};
