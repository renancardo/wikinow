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
