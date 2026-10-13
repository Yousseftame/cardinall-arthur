import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/products.service';
import { adminListQueryOptions } from '../lib/adminQuery';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
    ...adminListQueryOptions,
  });
};
