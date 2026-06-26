import type { FixtureEntry, StreamRecentChangeEvent } from '../types.js';

export function toStreamEvent(
  entry: FixtureEntry,
  baseUrl: string,
  overrides: Partial<StreamRecentChangeEvent> = {},
): StreamRecentChangeEvent {
  const wikiTitle = entry.title.replace(/ /g, '_');

  return {
    meta: { domain: 'en.wikipedia.org' },
    wiki: 'enwiki',
    type: entry.type,
    namespace: entry.ns,
    title: entry.title,
    title_url: `${baseUrl.replace(/\/$/, '')}/wiki/${encodeURIComponent(wikiTitle)}`,
    user: entry.user,
    timestamp: Math.floor(new Date(entry.timestamp).getTime() / 1000),
    id: entry.rcid,
    ...overrides,
  };
}

export function createLiveStreamEvent(
  id: number,
  baseUrl: string,
  overrides: Partial<StreamRecentChangeEvent> = {},
): StreamRecentChangeEvent {
  const now = Math.floor(Date.now() / 1000);

  return {
    meta: { domain: 'en.wikipedia.org' },
    wiki: 'enwiki',
    type: 'edit',
    namespace: 0,
    title: `Live Mock Page ${id}`,
    title_url: `${baseUrl.replace(/\/$/, '')}/wiki/Live_Mock_Page_${id}`,
    user: 'LiveMockUser',
    timestamp: now,
    id,
    ...overrides,
  };
}

export function createCanaryEvent(baseUrl: string): StreamRecentChangeEvent {
  return createLiveStreamEvent(-1, baseUrl, {
    meta: { domain: 'canary' },
    title: 'Canary Event',
    id: -1,
  });
}

export function createNonEnwikiEvent(baseUrl: string): StreamRecentChangeEvent {
  return createLiveStreamEvent(-2, baseUrl, {
    wiki: 'dewiki',
    meta: { domain: 'de.wikipedia.org' },
    title: 'Deutsch Artikel',
    id: -2,
  });
}
