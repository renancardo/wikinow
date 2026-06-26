import {
  isGlobalStreamEvent,
  matchesTabFilter,
} from '@/lib/filter-stream-event';
import type { RecentChange } from '@/types/recent-change';
import type { StreamRecentChangeEvent } from '@/types/stream-recent-change';

function streamEvent(
  overrides: Partial<StreamRecentChangeEvent> = {},
): StreamRecentChangeEvent {
  return {
    meta: { domain: 'en.wikipedia.org' },
    wiki: 'enwiki',
    type: 'edit',
    namespace: 0,
    title: 'Test Page',
    title_url: 'https://en.wikipedia.org/wiki/Test_Page',
    user: 'TestUser',
    timestamp: 1_700_000_000,
    id: 42,
    ...overrides,
  };
}

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

describe('isGlobalStreamEvent', () => {
  it('accepts enwiki events', () => {
    expect(isGlobalStreamEvent(streamEvent())).toBe(true);
  });

  it('rejects canary events', () => {
    expect(isGlobalStreamEvent(streamEvent({ meta: { domain: 'canary' } }))).toBe(false);
  });

  it('rejects non-enwiki events', () => {
    expect(isGlobalStreamEvent(streamEvent({ wiki: 'wikidatawiki' }))).toBe(false);
  });
});

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
