import type { ChangeType, RecentChange } from '@/types/recent-change';
import type { StreamChangeType, StreamRecentChangeEvent } from '@/types/stream-recent-change';

const STREAM_CHANGE_TYPES: Record<StreamChangeType, ChangeType> = {
  edit: 'edit',
  new: 'new',
  log: 'log',
  categorize: 'log',
};

export function mapStreamEvent(event: StreamRecentChangeEvent): RecentChange {
  return {
    rcid: event.id,
    title: event.title,
    user: event.user,
    type: STREAM_CHANGE_TYPES[event.type],
    namespace: event.namespace,
    timestamp: new Date(event.timestamp * 1000).toISOString(),
    pageUrl: event.title_url,
  };
}
