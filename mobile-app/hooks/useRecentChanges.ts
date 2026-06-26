import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { fetchRecentChanges } from '@/api/recent-changes';
import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { flattenRecentChangesPages } from '@/lib/recent-changes';
import { createFeedFreshness } from '@/types/feed-freshness';

const REFETCH_INTERVAL_MS = 90_000;

export function useRecentChanges(tab: ChangesTab) {
  const filter = TAB_FILTERS[tab];
  const isOnline = useOnlineStatus();

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
    placeholderData: keepPreviousData,
    refetchInterval: isOnline ? REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });

  const changes = flattenRecentChangesPages(query.data?.pages ?? []);

  const hasCachedData = changes.length > 0;
  const freshnessSource = !isOnline && hasCachedData ? 'cache' : 'api';

  // API polling today; merge with stream timestamps via mergeFeedFreshness when live mode lands.
  const freshness = createFeedFreshness(query.dataUpdatedAt, freshnessSource);

  return {
    ...query,
    changes,
    loadedCount: changes.length,
    freshness,
    lastUpdatedAt: freshness.lastUpdatedAt,
    isOnline,
    hasCachedData,
    isShowingPlaceholder: query.isPlaceholderData,
  };
}
