import { getAppConfig } from '@/lib/config/app-config-store';
import { liveLog } from '@/lib/live/log';
import { isGlobalStreamEvent, mapStreamEvent } from '@/lib/live/stream-events';
import { connectRecentChangeStream } from '@/lib/live/transport/connect';
import { mergeChanges } from '@/lib/recent-changes/merge-changes';
import type { RecentChange } from '@/types/recent-change';
import { experimental_streamedQuery } from '@tanstack/react-query';

export const LIVE_QUERY_KEY = ['recentchanges-live'] as const;

export const liveStreamQueryFn = experimental_streamedQuery({
  streamFn: ({ signal }) => connectRecentChangeStream(signal),
  reducer: (acc: RecentChange[], chunk) => {
    if (!isGlobalStreamEvent(chunk)) {
      return acc;
    }

    const mapped = mapStreamEvent(chunk);
    const merged = mergeChanges(acc, [mapped]);
    const streamBufferMax = getAppConfig().streamBufferMax;

    liveLog('accepted enwiki event', {
      rcid: mapped.rcid,
      title: mapped.title,
      bufferSize: merged.length,
    });

    if (merged.length <= streamBufferMax) {
      return merged;
    }

    return merged.slice(0, streamBufferMax);
  },
  initialValue: [] as RecentChange[],
});
