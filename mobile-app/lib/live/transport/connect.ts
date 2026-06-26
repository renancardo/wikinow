import { Platform } from 'react-native';

import { env } from '@/constants/env';
import { liveLog } from '@/lib/live/log';
import {
  extractSseDataPayloads,
  parseStreamPayloads,
} from '@/lib/live/transport/sse-parser';
import type { StreamRecentChangeEvent } from '@/types/stream-recent-change';

const STREAM_PATH = '/v2/stream/recentchange';

export async function* connectRecentChangeStream(
  signal?: AbortSignal,
): AsyncGenerator<StreamRecentChangeEvent> {
  if (Platform.OS === 'web') {
    yield* connectViaFetch(signal);
    return;
  }

  yield* connectViaXhr(signal);
}

async function* connectViaFetch(
  signal?: AbortSignal,
): AsyncGenerator<StreamRecentChangeEvent> {
  const url = buildStreamUrl();
  liveLog('opening stream (fetch)', { url });

  const response = await fetch(url, {
    signal,
    headers: {
      'User-Agent': env.userAgent,
      Accept: 'text/event-stream',
    },
  });

  liveLog('stream response (fetch)', {
    ok: response.ok,
    status: response.status,
    hasBody: !!response.body,
  });

  if (!response.ok) {
    throw new Error(`Stream request failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    liveLog('stream body not readable — falling back is not available on web fetch path');
    throw new Error('Stream body is not readable');
  }

  const decoder = new TextDecoder();
  const pending = { buffer: '' };
  const rawEventCountRef = { count: 0 };
  const isActive = () => !signal?.aborted;

  try {
    while (isActive()) {
      const { done, value } = await reader.read();

      if (done) {
        if (isActive()) {
          throw new Error('Stream connection closed');
        }
        break;
      }

      if (!isActive()) {
        break;
      }

      const payloads = extractSseDataPayloads(decoder.decode(value, { stream: true }), pending);
      const events = parseStreamPayloads(payloads, rawEventCountRef, isActive);

      for (const event of events) {
        yield event;
      }
    }
  } catch (error) {
    if (!isAbortError(error)) {
      liveLog('stream read error (fetch)', error);
      throw error;
    }
  } finally {
    reader.releaseLock();
    liveLog('stream closed (fetch)', { rawEventCount: rawEventCountRef.count });
  }
}

async function* connectViaXhr(
  signal?: AbortSignal,
): AsyncGenerator<StreamRecentChangeEvent> {
  const url = buildStreamUrl();
  liveLog('opening stream (xhr)', { url });

  const queue: StreamRecentChangeEvent[] = [];
  let streamError: Error | null = null;
  let streamDone = false;
  let aborted = false;
  let waiters: Array<() => void> = [];

  const isActive = () => !aborted && !signal?.aborted;

  const notify = () => {
    for (const waiter of waiters) {
      waiter();
    }
    waiters = [];
  };

  const enqueue = (events: StreamRecentChangeEvent[]) => {
    if (!isActive() || events.length === 0) {
      return;
    }
    queue.push(...events);
    notify();
  };

  const wait = () =>
    new Promise<void>((resolve) => {
      waiters.push(resolve);
    });

  const xhr = new XMLHttpRequest();
  let lastIndex = 0;
  const pending = { buffer: '' };
  const rawEventCountRef = { count: 0 };
  let headersLogged = false;

  const stopXhr = () => {
    xhr.onreadystatechange = null;
    xhr.onprogress = null;
    xhr.onload = null;
    xhr.onerror = null;
    xhr.onabort = null;

    if (xhr.readyState !== XMLHttpRequest.UNSENT && xhr.readyState !== XMLHttpRequest.DONE) {
      xhr.abort();
    }
  };

  const processChunk = (chunk: string) => {
    if (!isActive()) {
      return;
    }

    const payloads = extractSseDataPayloads(chunk, pending);
    enqueue(parseStreamPayloads(payloads, rawEventCountRef, isActive));
  };

  xhr.open('GET', url);
  xhr.setRequestHeader('User-Agent', env.userAgent);
  xhr.setRequestHeader('Accept', 'text/event-stream');

  xhr.onreadystatechange = () => {
    if (!isActive() || xhr.readyState !== XMLHttpRequest.HEADERS_RECEIVED || headersLogged) {
      return;
    }

    headersLogged = true;
    liveLog('stream response (xhr)', { status: xhr.status });

    if (xhr.status < 200 || xhr.status >= 300) {
      streamError = new Error(`Stream request failed (${xhr.status})`);
      streamDone = true;
      notify();
    }
  };

  xhr.onprogress = () => {
    if (!isActive()) {
      return;
    }

    const chunk = xhr.responseText.slice(lastIndex);
    lastIndex = xhr.responseText.length;
    if (chunk) {
      processChunk(chunk);
    }
  };

  xhr.onload = () => {
    if (!isActive()) {
      return;
    }

    const chunk = xhr.responseText.slice(lastIndex);
    lastIndex = xhr.responseText.length;
    if (chunk) {
      processChunk(chunk);
    }
    streamDone = true;
    notify();
  };

  xhr.onerror = () => {
    if (!isActive()) {
      return;
    }

    streamError = new Error('Stream XHR request failed');
    streamDone = true;
    notify();
  };

  xhr.onabort = () => {
    streamDone = true;
    notify();
  };

  const shutdown = (reason: 'abort' | 'close') => {
    if (aborted) {
      return;
    }

    aborted = true;
    streamDone = true;

    if (reason === 'abort') {
      liveLog('stream xhr abort signal');
    }

    stopXhr();
    notify();
  };

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  signal?.addEventListener('abort', () => shutdown('abort'), { once: true });

  xhr.send();

  try {
    while (isActive()) {
      if (queue.length > 0) {
        yield queue.shift()!;
        continue;
      }

      if (streamError) {
        throw streamError;
      }

      if (streamDone) {
        if (isActive() && !streamError) {
          throw new Error('Stream connection closed');
        }
        break;
      }

      await wait();
    }
  } catch (error) {
    if (!isAbortError(error)) {
      liveLog('stream read error (xhr)', error);
      throw error;
    }
  } finally {
    shutdown('close');
    liveLog('stream closed (xhr)', { rawEventCount: rawEventCountRef.count });
  }
}

function buildStreamUrl(): string {
  const base = env.streamBaseUrl.replace(/\/$/, '');
  return `${base}${STREAM_PATH}`;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}
