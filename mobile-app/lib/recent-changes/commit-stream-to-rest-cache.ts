import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import { getAppConfig } from '@/lib/config/app-config-store';
import { LIVE_QUERY_KEY } from '@/lib/live/stream-query';
import { liveLog } from '@/lib/live/log';
import { matchesTabFilter } from '@/lib/recent-changes/matches-tab-filter';
import { mergeChanges } from '@/lib/recent-changes/merge-changes';
import type { RecentChange } from '@/types/recent-change';
import type { RecentChangesPage } from '@/types/wiki-recent-change';

const CHANGES_TABS: ChangesTab[] = ['all', 'articles', 'new-pages'];

/**
 * Merge the live SSE buffer into each tab's REST infinite-query cache.
 * Call before tearing down the live stream query so toggling live off
 * keeps the newest stream events visible.
 */
export function commitStreamBufferToRestCache(queryClient: QueryClient): void {
  const streamChanges = queryClient.getQueryData<RecentChange[]>(LIVE_QUERY_KEY);
  if (!streamChanges?.length) {
    return;
  }

  const pageSize = getAppConfig().pageSize;

  for (const tab of CHANGES_TABS) {
    const filter = TAB_FILTERS[tab];
    const queryKey = ['recentchanges', tab, filter, pageSize];
    const tabStreamChanges = streamChanges.filter((change) => matchesTabFilter(change, tab));

    if (tabStreamChanges.length === 0) {
      continue;
    }

    queryClient.setQueryData<InfiniteData<RecentChangesPage>>(
      queryKey,
      (old) => mergeStreamIntoInfiniteQuery(old, tabStreamChanges),
    );

    liveLog('committed stream buffer to REST cache', {
      tab,
      streamCount: tabStreamChanges.length,
    });
  }
}

function mergeStreamIntoInfiniteQuery(
  old: InfiniteData<RecentChangesPage> | undefined,
  tabStreamChanges: RecentChange[],
): InfiniteData<RecentChangesPage> {
  if (!old?.pages?.length) {
    return {
      pages: [{ changes: tabStreamChanges }],
      pageParams: [undefined],
    };
  }

  const mergedHead = mergeChanges(old.pages[0].changes, tabStreamChanges);

  return {
    ...old,
    pages: [{ ...old.pages[0], changes: mergedHead }, ...old.pages.slice(1)],
  };
}
