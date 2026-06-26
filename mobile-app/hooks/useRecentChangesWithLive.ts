import { useRecentChanges } from '@/hooks/useRecentChanges';
import { matchesTabFilter } from '@/lib/recent-changes/matches-tab-filter';
import { mergeChanges } from '@/lib/recent-changes/merge-changes';
import { useLiveMode } from '@/providers/LiveModeProvider';
import { useAppConfig } from '@/providers/AppConfigProvider';
import type { ChangesTab } from '@/constants/tabs';
import {
  createFeedFreshness,
  mergeFeedFreshness,
  type FeedFreshness,
} from '@/types/feed-freshness';

function capListItems<T>(items: T[], maxListItems: number): T[] {
  if (items.length <= maxListItems) {
    return items;
  }

  return items.slice(0, maxListItems);
}

export function useRecentChangesWithLive(tab: ChangesTab) {
  const { config } = useAppConfig();
  const {
    isLiveEnabled,
    streamChanges,
    streamLastEventAt,
  } = useLiveMode();

  const queryResult = useRecentChanges(tab, {
    refetchInterval: isLiveEnabled ? false : config.refetchIntervalMs,
    liveMode: isLiveEnabled,
  });

  const tabStreamChanges = isLiveEnabled
    ? streamChanges.filter((change) => matchesTabFilter(change, tab))
    : [];

  const mergedChanges =
    tabStreamChanges.length > 0
      ? mergeChanges(queryResult.changes, tabStreamChanges)
      : queryResult.changes;

  const changes = capListItems(mergedChanges, config.maxListItems);
  const hasCachedData = changes.length > 0;

  let freshness: FeedFreshness = queryResult.freshness;

  if (isLiveEnabled && streamLastEventAt) {
    freshness = mergeFeedFreshness(
      freshness,
      createFeedFreshness(streamLastEventAt, 'stream'),
    );
  }

  const isRestUpdating =
    queryResult.isOnline &&
    queryResult.isFetching &&
    !queryResult.isFetchingNextPage &&
    !queryResult.isPending;

  const isUpdating = isLiveEnabled
    ? queryResult.isFetching && queryResult.isRefetching && !queryResult.isFetchingNextPage
    : isRestUpdating;

  return {
    ...queryResult,
    changes,
    loadedCount: changes.length,
    freshness,
    lastUpdatedAt: freshness.lastUpdatedAt,
    isLiveEnabled,
    hasCachedData,
    isUpdating,
    isShowingPlaceholder: queryResult.isShowingPlaceholder && !isLiveEnabled,
  };
}
