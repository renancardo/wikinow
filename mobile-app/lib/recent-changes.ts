import type { ChangeType, RecentChange } from '@/types/recent-change';

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
  const seen = new Set<number>();
  const result: RecentChange[] = [];

  for (const page of pages) {
    for (const change of page.changes) {
      if (seen.has(change.rcid)) {
        continue;
      }
      seen.add(change.rcid);
      result.push(change);
    }
  }

  return result;
}
