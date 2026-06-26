import { EXTERNAL_CHANGE_TYPES } from '@/lib/utils/change-type';
import type { RecentChange } from '@/types/recent-change';
import type { StreamRecentChangeEvent } from '@/types/stream-recent-change';

export function isGlobalStreamEvent(event: StreamRecentChangeEvent): boolean {
  if (event.meta?.domain === 'canary') {
    return false;
  }

  if (event.wiki !== 'enwiki') {
    return false;
  }

  return true;
}

export function mapStreamEvent(event: StreamRecentChangeEvent): RecentChange {
  return {
    rcid: event.id,
    title: event.title,
    user: event.user,
    type: EXTERNAL_CHANGE_TYPES[event.type],
    namespace: event.namespace,
    timestamp: new Date(event.timestamp * 1000).toISOString(),
    pageUrl: event.title_url,
  };
}
