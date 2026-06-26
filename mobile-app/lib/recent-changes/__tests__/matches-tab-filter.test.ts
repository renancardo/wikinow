import { matchesTabFilter } from '@/lib/recent-changes/matches-tab-filter';
import type { RecentChange } from '@/types/recent-change';

function change(overrides: Partial<RecentChange> = {}): RecentChange {
  return {
    rcid: 1,
    title: 'Test Page',
    user: 'TestUser',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-26T12:00:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Test_Page',
    ...overrides,
  };
}

describe('matchesTabFilter', () => {
  it('matches all tab for any change', () => {
    expect(matchesTabFilter(change({ namespace: 14, type: 'log' }), 'all')).toBe(true);
  });

  it('matches articles tab only for main namespace', () => {
    expect(matchesTabFilter(change({ namespace: 0 }), 'articles')).toBe(true);
    expect(matchesTabFilter(change({ namespace: 14 }), 'articles')).toBe(false);
  });

  it('matches new-pages tab only for new changes', () => {
    expect(matchesTabFilter(change({ type: 'new' }), 'new-pages')).toBe(true);
    expect(matchesTabFilter(change({ type: 'edit' }), 'new-pages')).toBe(false);
  });
});
