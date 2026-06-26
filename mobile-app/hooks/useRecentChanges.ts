import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchRecentChanges } from '@/api/recent-changes';
import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import { flattenRecentChangesPages } from '@/lib/recent-changes';

const REFETCH_INTERVAL_MS = 20_000;

export function useRecentChanges(tab: ChangesTab) {
  const filter = TAB_FILTERS[tab];

  const query = useInfiniteQuery({
    queryKey: ['recentchanges', tab, filter],
    queryFn: ({ pageParam, signal }) =>
      fetchRecentChanges({
        filter,
        cursor: pageParam,
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const changes = flattenRecentChangesPages(query.data?.pages ?? []);

  return {
    ...query,
    changes,
  };
}
