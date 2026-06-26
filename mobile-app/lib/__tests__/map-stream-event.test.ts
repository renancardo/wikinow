import { mapStreamEvent } from '@/lib/map-stream-event';
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

describe('mapStreamEvent', () => {
  it('maps stream fields to RecentChange', () => {
    const mapped = mapStreamEvent(streamEvent());

    expect(mapped).toEqual({
      rcid: 42,
      title: 'Test Page',
      user: 'TestUser',
      type: 'edit',
      namespace: 0,
      timestamp: new Date(1_700_000_000 * 1000).toISOString(),
      pageUrl: 'https://en.wikipedia.org/wiki/Test_Page',
    });
  });

  it('maps categorize events to log type', () => {
    const mapped = mapStreamEvent(streamEvent({ type: 'categorize' }));

    expect(mapped.type).toBe('log');
  });
});
