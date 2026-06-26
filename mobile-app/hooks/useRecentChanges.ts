import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { fetchRecentChanges } from '@/api/recent-changes';
import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { flattenRecentChangesPages } from '@/lib/recent-changes/flatten-pages';
import { createFeedFreshness } from '@/types/feed-freshness';

type UseRecentChangesOptions = {
  refetchInterval?: number | false;
  liveMode?: boolean;
};

export function useRecentChanges(
  tab: ChangesTab,
  options: UseRecentChangesOptions = {},
) {
  const { config } = useAppConfig();
  const queryClient = useQueryClient();
  const filter = TAB_FILTERS[tab];
  const isOnline = useOnlineStatus();
  const liveMode = options.liveMode ?? false;
  const queryKey = ['recentchanges', tab, filter, config.pageSize] as const;
  const hasRestCache = queryClient.getQueryData(queryKey) != null;
  const pollingInterval =
    options.refetchInterval !== undefined
      ? options.refetchInterval
      : config.refetchIntervalMs;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchRecentChanges({
        filter,
        cursor: pageParam,
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
    enabled: !liveMode || hasRestCache,
    refetchInterval: liveMode ? false : isOnline ? pollingInterval : false,
    refetchOnWindowFocus: !liveMode,
    refetchOnMount: !liveMode,
    staleTime: liveMode ? Infinity : undefined,
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
