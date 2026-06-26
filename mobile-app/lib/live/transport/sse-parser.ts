import { liveLog } from '@/lib/live/log';
import type { StreamRecentChangeEvent } from '@/types/stream-recent-change';

/**
 * Parse incremental SSE text chunks into JSON payloads from `data:` lines.
 * Keeps an incomplete trailing line in `pending.buffer`.
 */
export function extractSseDataPayloads(
  chunk: string,
  pending: { buffer: string },
): string[] {
  pending.buffer += chunk;
  const lines = pending.buffer.split('\n');
  pending.buffer = lines.pop() ?? '';

  const payloads: string[] = [];

  for (const line of lines) {
    if (!line.startsWith('data: ')) {
      continue;
    }

    const payload = line.slice(6).trim();
    if (payload) {
      payloads.push(payload);
    }
  }

  return payloads;
}

function logStreamEvent(event: StreamRecentChangeEvent, rawEventCount: number) {
  if (rawEventCount <= 3 || rawEventCount % 50 === 0) {
    liveLog('stream event', {
      rawEventCount,
      wiki: event.wiki,
      id: event.id,
      type: event.type,
      domain: event.meta?.domain,
    });
  }
}

export function parseStreamPayloads(
  payloads: string[],
  rawEventCountRef: { count: number },
  isActive: () => boolean,
): StreamRecentChangeEvent[] {
  if (!isActive()) {
    return [];
  }

  const events: StreamRecentChangeEvent[] = [];

  for (const payload of payloads) {
    if (!isActive()) {
      break;
    }

    rawEventCountRef.count += 1;
    const event = JSON.parse(payload) as StreamRecentChangeEvent;
    logStreamEvent(event, rawEventCountRef.count);
    events.push(event);
  }

  return events;
}
