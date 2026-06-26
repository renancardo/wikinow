import type { Context } from 'hono';
import { stream } from 'hono/streaming';

import {
  createCanaryEvent,
  createLiveStreamEvent,
  createNonEnwikiEvent,
} from '../fixtures/generator.js';
import { formatSseData, formatSseKeepalive } from '../lib/sse-format.js';
import { registerSseClient, unregisterSseClient } from '../lib/sse-clients.js';
import { getNextLiveEventId, getScenarioState } from '../lib/scenarios.js';
import type { StreamRecentChangeEvent } from '../types.js';

const KEEPALIVE_MS = 15_000;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function duplicateSequence(baseUrl: string): StreamRecentChangeEvent[] {
  const ids = [105, 103, 105, 101];

  return ids.map((id) =>
    createLiveStreamEvent(id, baseUrl, {
      title: `Duplicate Mock Page ${id}`,
    }),
  );
}

async function runStreamLoop(
  write: (chunk: string) => void,
  baseUrl: string,
  signal: AbortSignal,
): Promise<void> {
  let emittedCount = 0;
  let burstSent = false;

  const emit = (events: StreamRecentChangeEvent[]) => {
    for (const event of events) {
      if (signal.aborted) {
        return;
      }

      write(formatSseData(event));
      emittedCount += 1;

      const scenario = getScenarioState();
      if (scenario.sseDropAfterEvents !== null && emittedCount >= scenario.sseDropAfterEvents) {
        throw new DOMException('Dropped by mock scenario', 'AbortError');
      }
    }
  };

  const keepaliveTimer = setInterval(() => {
    if (!signal.aborted) {
      write(formatSseKeepalive());
    }
  }, KEEPALIVE_MS);

  try {
    while (!signal.aborted) {
      const scenario = getScenarioState();

      if (scenario.sseMode === 'burst' && !burstSent) {
        const events = Array.from({ length: scenario.sseBurstCount }, () =>
          createLiveStreamEvent(getNextLiveEventId(), baseUrl),
        );
        emit(events);
        burstSent = true;
      }

      if (scenario.sseMode === 'duplicate') {
        emit(duplicateSequence(baseUrl));
        await sleep(2000, signal);
        continue;
      }

      if (scenario.sseMode === 'canary') {
        emit([
          createLiveStreamEvent(getNextLiveEventId(), baseUrl),
          createCanaryEvent(baseUrl),
          createNonEnwikiEvent(baseUrl),
        ]);
        await sleep(2000, signal);
        continue;
      }

      if (scenario.sseMode === 'steady' || scenario.sseMode === 'burst') {
        emit([createLiveStreamEvent(getNextLiveEventId(), baseUrl)]);
        await sleep(scenario.sseSteadyIntervalMs, signal);
        continue;
      }

      await sleep(1000, signal);
    }
  } finally {
    clearInterval(keepaliveTimer);
  }
}

export function handleRecentChangeStream(c: Context, baseUrl: string) {
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  return stream(c, async (streamWriter) => {
    const clientId = crypto.randomUUID();
    const abortController = new AbortController();

    const write = (chunk: string) => {
      streamWriter.write(chunk);
    };

    const close = () => {
      abortController.abort();
    };

    registerSseClient({ id: clientId, write, close });

    c.req.raw.signal.addEventListener(
      'abort',
      () => {
        close();
        unregisterSseClient(clientId);
      },
      { once: true },
    );

    write(formatSseKeepalive());

    try {
      await runStreamLoop(write, baseUrl, abortController.signal);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        throw error;
      }
    } finally {
      unregisterSseClient(clientId);
    }
  });
}
