import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/products.service';

// Custom Hooks combine React Query with our services.
// TanStack Query is CRITICAL for saving Firebase costs because it caches data automatically!
// If a user navigates away and back, it won't re-fetch from Firebase if data is fresh.
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    // Stale time tells React Query how long the data is considered "fresh". 
    // Setting this to 5 minutes prevents unnecessary Firestore reads!
    staleTime: 1000 * 60 * 5, 
  });
};
