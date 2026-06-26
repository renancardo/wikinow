import { connectRecentChangeStream } from '@/api/recent-change-stream';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppFocused } from '@/hooks/useAppFocused';
import { isGlobalStreamEvent } from '@/lib/filter-stream-event';
import { getAppConfig } from '@/lib/app-config-store';
import { liveLog } from '@/lib/live-mode-log';
import { mapStreamEvent } from '@/lib/map-stream-event';
import { mergeChanges } from '@/lib/merge-changes';
import type { RecentChange } from '@/types/recent-change';
import { experimental_streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const LIVE_QUERY_KEY = ['recentchanges-live'] as const;

type LiveModeContextValue = {
  isLiveEnabled: boolean;
  setLiveEnabled: (enabled: boolean) => void;
  toggleLive: () => void;
  streamActive: boolean;
  streamChanges: RecentChange[];
  streamLastEventAt: number | null;
  isStreamConnected: boolean;
  isStreamConnecting: boolean;
  isStreamError: boolean;
};

const LiveModeContext = createContext<LiveModeContextValue | null>(null);

const liveStreamQueryFn = experimental_streamedQuery({
  streamFn: ({ signal }) => connectRecentChangeStream(signal),
  reducer: (acc: RecentChange[], chunk) => {
    if (!isGlobalStreamEvent(chunk)) {
      return acc;
    }

    const mapped = mapStreamEvent(chunk);
    const merged = mergeChanges(acc, [mapped], 'prepend');
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

function stopLiveStream(queryClient: ReturnType<typeof useQueryClient>) {
  liveLog('stopping live stream');
  queryClient.cancelQueries({ queryKey: LIVE_QUERY_KEY });
  queryClient.removeQueries({ queryKey: LIVE_QUERY_KEY });
}

export function LiveModeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLiveEnabled, setLiveEnabled] = useState(false);
  const isOnline = useOnlineStatus();
  const isFocused = useAppFocused();
  const streamActive = isLiveEnabled && isOnline && isFocused;

  const streamQuery = useQuery({
    queryKey: LIVE_QUERY_KEY,
    queryFn: liveStreamQueryFn,
    enabled: streamActive,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const toggleLive = useCallback(() => {
    setLiveEnabled((current) => {
      const next = !current;
      liveLog('toggle live', { next });
      if (!next) {
        stopLiveStream(queryClient);
      }
      return next;
    });
  }, [queryClient]);

  useEffect(() => {
    if (!streamActive) {
      stopLiveStream(queryClient);
    }
  }, [streamActive, queryClient]);

  const streamBufferSize = streamQuery.data?.length ?? 0;

  // Never-ending SSE keeps fetchStatus "fetching"; isSuccess stays false until the stream ends.
  const isStreamConnected =
    streamActive &&
    !streamQuery.isError &&
    (streamQuery.fetchStatus === 'fetching' || streamBufferSize > 0);

  const isStreamConnecting =
    streamActive &&
    !streamQuery.isError &&
    !isStreamConnected &&
    streamQuery.fetchStatus !== 'idle';

  const streamLastEventAt =
    streamActive && streamQuery.dataUpdatedAt > 0 ? streamQuery.dataUpdatedAt : null;

  useEffect(() => {
    liveLog('state', {
      isLiveEnabled,
      isOnline,
      isFocused,
      streamActive,
      status: streamQuery.status,
      fetchStatus: streamQuery.fetchStatus,
      isPending: streamQuery.isPending,
      isSuccess: streamQuery.isSuccess,
      isError: streamQuery.isError,
      error: streamQuery.error instanceof Error ? streamQuery.error.message : streamQuery.error,
      streamBufferSize,
      isStreamConnected,
      isStreamConnecting,
      dataUpdatedAt: streamQuery.dataUpdatedAt,
    });
  }, [
    isLiveEnabled,
    isOnline,
    isFocused,
    streamActive,
    streamQuery.status,
    streamQuery.fetchStatus,
    streamQuery.isPending,
    streamQuery.isSuccess,
    streamQuery.isError,
    streamQuery.error,
    streamBufferSize,
    isStreamConnected,
    isStreamConnecting,
    streamQuery.dataUpdatedAt,
  ]);

  const value = useMemo<LiveModeContextValue>(
    () => ({
      isLiveEnabled,
      setLiveEnabled,
      toggleLive,
      streamActive,
      streamChanges: streamActive ? (streamQuery.data ?? []) : [],
      streamLastEventAt,
      isStreamConnected,
      isStreamConnecting,
      isStreamError: streamActive && streamQuery.isError,
    }),
    [
      isLiveEnabled,
      streamActive,
      streamQuery.data,
      streamQuery.dataUpdatedAt,
      streamQuery.isError,
      isStreamConnected,
      isStreamConnecting,
      toggleLive,
    ],
  );

  return <LiveModeContext.Provider value={value}>{children}</LiveModeContext.Provider>;
}

export function useLiveMode() {
  const context = useContext(LiveModeContext);

  if (!context) {
    throw new Error('useLiveMode must be used within LiveModeProvider');
  }

  return context;
}
