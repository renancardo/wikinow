import { QueryClient } from '@tanstack/react-query';

import { TAB_FILTERS } from '@/constants/tabs';
import { commitStreamBufferToRestCache } from '@/lib/recent-changes/commit-stream-to-rest-cache';
import { LIVE_QUERY_KEY } from '@/lib/live/stream-query';
import type { RecentChange } from '@/types/recent-change';
import type { RecentChangesPage } from '@/types/wiki-recent-change';

function change(rcid: number, namespace = 0, type: RecentChange['type'] = 'edit'): RecentChange {
  return {
    rcid,
    title: `Page ${rcid}`,
    user: 'TestUser',
    type,
    namespace,
    timestamp: '2026-06-26T12:00:00Z',
    pageUrl: `https://en.wikipedia.org/wiki/Page_${rcid}`,
  };
}

describe('commitStreamBufferToRestCache', () => {
  it('merges stream buffer into the head REST page for each tab', () => {
    const queryClient = new QueryClient();
    const pageSize = 10;

    queryClient.setQueryData<RecentChange[]>(LIVE_QUERY_KEY, [
      change(105, 0, 'edit'),
      change(104, 0, 'new'),
      change(103, 14, 'log'),
    ]);

    queryClient.setQueryData(
      ['recentchanges', 'all', TAB_FILTERS.all, pageSize],
      {
        pages: [{ changes: [change(100), change(99)] }],
        pageParams: [undefined],
      },
    );

    queryClient.setQueryData(
      ['recentchanges', 'articles', TAB_FILTERS.articles, pageSize],
      {
        pages: [{ changes: [change(100)] }],
        pageParams: [undefined],
      },
    );

    queryClient.setQueryData(
      ['recentchanges', 'new-pages', TAB_FILTERS['new-pages'], pageSize],
      {
        pages: [{ changes: [change(98, 0, 'edit')] }],
        pageParams: [undefined],
      },
    );

    commitStreamBufferToRestCache(queryClient);

    const allData = queryClient.getQueryData<{ pages: RecentChangesPage[] }>([
      'recentchanges',
      'all',
      TAB_FILTERS.all,
      pageSize,
    ]);
    expect(allData?.pages[0].changes.map((item) => item.rcid)).toEqual([105, 104, 103, 100, 99]);

    const articlesData = queryClient.getQueryData<{ pages: RecentChangesPage[] }>([
      'recentchanges',
      'articles',
      TAB_FILTERS.articles,
      pageSize,
    ]);
    expect(articlesData?.pages[0].changes.map((item) => item.rcid)).toEqual([105, 104, 100]);

    const newPagesData = queryClient.getQueryData<{ pages: RecentChangesPage[] }>([
      'recentchanges',
      'new-pages',
      TAB_FILTERS['new-pages'],
      pageSize,
    ]);
    expect(newPagesData?.pages[0].changes.map((item) => item.rcid)).toEqual([104, 98]);
  });

  it('creates a REST page from stream data when no REST cache exists', () => {
    const queryClient = new QueryClient();
    const pageSize = 10;

    queryClient.setQueryData<RecentChange[]>(LIVE_QUERY_KEY, [change(200)]);

    commitStreamBufferToRestCache(queryClient);

    const allData = queryClient.getQueryData<{ pages: RecentChangesPage[] }>([
      'recentchanges',
      'all',
      TAB_FILTERS.all,
      pageSize,
    ]);
    expect(allData?.pages[0].changes.map((item) => item.rcid)).toEqual([200]);
  });

  it('no-ops when the live buffer is empty', () => {
    const queryClient = new QueryClient();
    const pageSize = 10;

    queryClient.setQueryData(
      ['recentchanges', 'all', TAB_FILTERS.all, pageSize],
      {
        pages: [{ changes: [change(50)] }],
        pageParams: [undefined],
      },
    );

    commitStreamBufferToRestCache(queryClient);

    const allData = queryClient.getQueryData<{ pages: RecentChangesPage[] }>([
      'recentchanges',
      'all',
      TAB_FILTERS.all,
      pageSize,
    ]);
    expect(allData?.pages[0].changes.map((item) => item.rcid)).toEqual([50]);
  });
});
