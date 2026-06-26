import type { ChangeType, RecentChange } from '@/types/recent-change';

import { mergeChanges } from '@/lib/merge-changes';

type WikiChangeType = 'edit' | 'new' | 'log' | 'categorize';

export type WikiRecentChangeRaw = {
  type: WikiChangeType;
  ns: number;
  title: string;
  rcid: number;
  user: string;
  timestamp: string;
};

export type WikiRecentChangesResponse = {
  batchcomplete?: boolean;
  continue?: {
    rccontinue: string;
    continue: string;
  };
  query?: {
    recentchanges: WikiRecentChangeRaw[];
  };
  error?: {
    code: string;
    info: string;
  };
};

export type RecentChangesPage = {
  changes: RecentChange[];
  nextCursor?: string;
};

const WIKI_CHANGE_TYPES: Record<WikiChangeType, ChangeType> = {
  edit: 'edit',
  new: 'new',
  log: 'log',
  categorize: 'log',
};

export function mapWikiChange(raw: WikiRecentChangeRaw, apiBaseUrl: string): RecentChange {
  return {
    rcid: raw.rcid,
    title: raw.title,
    user: raw.user,
    type: WIKI_CHANGE_TYPES[raw.type],
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

export function flattenRecentChangesPages(pages: RecentChangesPage[]): RecentChange[] {
  return pages.reduce(
    (accumulated, page) => mergeChanges(accumulated, page.changes, 'append'),
    [] as RecentChange[],
  );
}
