import { env } from '@/constants/env';
import { getAppConfig } from '@/lib/app-config-store';
import type { RecentChangesApiFilter } from '@/constants/tabs';
import {
  mapWikiChange,
  type RecentChangesPage,
  type WikiRecentChangesResponse,
} from '@/lib/recent-changes';

type FetchRecentChangesParams = {
  filter: RecentChangesApiFilter;
  cursor?: string;
  signal?: AbortSignal;
};

export async function fetchRecentChanges({
  filter,
  cursor,
  signal,
}: FetchRecentChangesParams): Promise<RecentChangesPage> {
  const url = buildRecentChangesUrl(filter, cursor);

  const response = await fetch(url, {
    signal,
    headers: {
      'User-Agent': env.userAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const json = (await response.json()) as WikiRecentChangesResponse;

  if (json.error) {
    throw new Error(json.error.info || json.error.code);
  }

  const rawChanges = json.query?.recentchanges ?? [];

  return {
    changes: rawChanges.map((item) => mapWikiChange(item, env.apiBaseUrl)),
    nextCursor: json.continue?.rccontinue,
  };
}

function buildRecentChangesUrl(filter: RecentChangesApiFilter, cursor?: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    list: 'recentchanges',
    rclimit: String(getAppConfig().pageSize),
    rcprop: 'title|user|timestamp|ids',
  });

  if (filter.rcnamespace !== undefined) {
    params.set('rcnamespace', String(filter.rcnamespace));
  }

  if (filter.rctype !== undefined) {
    params.set('rctype', filter.rctype);
  }

  if (cursor) {
    params.set('rccontinue', cursor);
  }

  return `${base}/w/api.php?${params.toString()}`;
}
