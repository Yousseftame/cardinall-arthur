import { useQuery } from '@tanstack/react-query';
import { getBanners } from '../services/banners.service';
import { adminListQueryOptions } from '../lib/adminQuery';

/** Marketplace page banners — fetched only where the carousel renders */
export const MARKETPLACE_BANNERS_QUERY_KEY = ['marketplace-banners'] as const;

/** Admin Banners page — separate key, fetched only on /admin/banners */
export const ADMIN_BANNERS_QUERY_KEY = ['admin-banners'] as const;

export function useMarketplaceBanners() {
  return useQuery({
    queryKey: MARKETPLACE_BANNERS_QUERY_KEY,
    queryFn: getBanners,
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 5,
  });
}
