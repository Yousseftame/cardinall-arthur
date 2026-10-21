import { useQuery } from '@tanstack/react-query';
import { getLatestProjects } from '../services/latestProjects.service';
import { adminListQueryOptions } from '../lib/adminQuery';

/** Home Latest Projects — fetched only where the section renders */
export const LATEST_PROJECTS_QUERY_KEY = ['latest-projects'] as const;

/** Admin Latest Projects page — separate key, fetched only on /admin/projects */
export const ADMIN_LATEST_PROJECTS_QUERY_KEY = ['admin-latest-projects'] as const;

export function useLatestProjects() {
  return useQuery({
    queryKey: LATEST_PROJECTS_QUERY_KEY,
    queryFn: getLatestProjects,
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 5,
  });
}
