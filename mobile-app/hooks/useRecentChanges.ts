import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { fetchRecentChanges } from '@/api/recent-changes';
import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { flattenRecentChangesPages } from '@/lib/recent-changes';
import { createFeedFreshness } from '@/types/feed-freshness';

type UseRecentChangesOptions = {
  refetchInterval?: number | false;
};

export function useRecentChanges(
  tab: ChangesTab,
  options: UseRecentChangesOptions = {},
) {
  const { config } = useAppConfig();
  const filter = TAB_FILTERS[tab];
  const isOnline = useOnlineStatus();
  const pollingInterval =
    options.refetchInterval !== undefined
      ? options.refetchInterval
      : config.refetchIntervalMs;

  const query = useInfiniteQuery({
    queryKey: ['recentchanges', tab, filter, config.pageSize],
    queryFn: ({ pageParam, signal }) =>
      fetchRecentChanges({
        filter,
        cursor: pageParam,
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
    refetchInterval: isOnline ? pollingInterval : false,
    refetchIntervalInBackground: false,
  });

  const changes = flattenRecentChangesPages(query.data?.pages ?? []);

  const hasCachedData = changes.length > 0;
  const freshnessSource = !isOnline && hasCachedData ? 'cache' : 'api';
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
