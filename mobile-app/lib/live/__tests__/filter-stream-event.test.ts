import { isGlobalStreamEvent } from '@/lib/live/filter-stream-event';
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
