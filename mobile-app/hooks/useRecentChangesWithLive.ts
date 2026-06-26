import { useRecentChanges } from '@/hooks/useRecentChanges';
import { matchesTabFilter } from '@/lib/filter-stream-event';
import { mergeChanges } from '@/lib/merge-changes';
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
  });

  const tabStreamChanges = isLiveEnabled
    ? streamChanges.filter((change) => matchesTabFilter(change, tab))
    : [];

  const mergedChanges =
    tabStreamChanges.length > 0
      ? mergeChanges(queryResult.changes, tabStreamChanges, 'prepend')
      : queryResult.changes;

  const changes = capListItems(mergedChanges, config.maxListItems);

  let freshness: FeedFreshness = queryResult.freshness;

  if (isLiveEnabled && streamLastEventAt) {
    freshness = mergeFeedFreshness(
      freshness,
      createFeedFreshness(streamLastEventAt, 'stream'),
    );
  }

  return {
    ...queryResult,
    changes,
    loadedCount: changes.length,
    freshness,
    lastUpdatedAt: freshness.lastUpdatedAt,
    isLiveEnabled,
  };
}
