import { mergeChanges } from '@/lib/recent-changes/merge-changes';
import type { RecentChange } from '@/types/recent-change';
import type { RecentChangesPage } from '@/types/wiki-recent-change';

export function flattenRecentChangesPages(pages: RecentChangesPage[]): RecentChange[] {
  return pages.reduce(
    (accumulated, page) => mergeChanges(accumulated, page.changes),
    [] as RecentChange[],
  );
}
