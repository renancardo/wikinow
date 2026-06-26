import { EXTERNAL_CHANGE_TYPES } from '@/lib/utils/change-type';
import type { RecentChange } from '@/types/recent-change';
import type { WikiRecentChangeRaw } from '@/types/wiki-recent-change';

export function mapWikiChange(raw: WikiRecentChangeRaw, apiBaseUrl: string): RecentChange {
  return {
    rcid: raw.rcid,
    title: raw.title,
    user: raw.user,
    type: EXTERNAL_CHANGE_TYPES[raw.type],
    namespace: raw.ns,
    timestamp: raw.timestamp,
    pageUrl: buildPageUrl(apiBaseUrl, raw.title),
  };
}

export function buildPageUrl(apiBaseUrl: string, title: string): string {
  const base = apiBaseUrl.replace(/\/$/, '');
  const wikiTitle = title.replace(/ /g, '_');
  return `${base}/wiki/${encodeURIComponent(wikiTitle)}`;
}
