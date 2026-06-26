import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import type { RecentChange } from '@/types/recent-change';
import type { StreamRecentChangeEvent } from '@/types/stream-recent-change';

export function isGlobalStreamEvent(event: StreamRecentChangeEvent): boolean {
  if (event.meta?.domain === 'canary') {
    return false;
  }

  if (event.wiki !== 'enwiki') {
    return false;
  }

  return true;
}

export function matchesTabFilter(change: RecentChange, tab: ChangesTab): boolean {
  const filter = TAB_FILTERS[tab];

  if (filter.rcnamespace !== undefined && change.namespace !== filter.rcnamespace) {
    return false;
  }

  if (filter.rctype !== undefined && change.type !== filter.rctype) {
    return false;
  }

  return true;
}
