import { TAB_FILTERS, type ChangesTab } from '@/constants/tabs';
import type { RecentChange } from '@/types/recent-change';

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
