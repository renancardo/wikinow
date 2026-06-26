import type { RecentChange } from '@/types/recent-change';

import { flattenRecentChangesPages, type RecentChangesPage } from '@/lib/recent-changes';

function change(rcid: number): RecentChange {
  return {
    rcid,
    title: `Page ${rcid}`,
    user: 'TestUser',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-26T12:00:00Z',
    pageUrl: `https://en.wikipedia.org/wiki/Page_${rcid}`,
  };
}

describe('flattenRecentChangesPages', () => {
  it('merges infinite-query pages in order with dedupe', () => {
    const pages: RecentChangesPage[] = [
      { changes: [change(30), change(29), change(28)], nextCursor: 'a' },
      { changes: [change(27), change(26), change(29)], nextCursor: 'b' },
    ];

    expect(flattenRecentChangesPages(pages).map((item) => item.rcid)).toEqual([
      30, 29, 28, 27, 26,
    ]);
  });
});
