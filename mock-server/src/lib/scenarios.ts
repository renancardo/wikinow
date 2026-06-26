import { closeAllSseClients } from './sse-clients.js';

export type ScenarioName =
  | 'normal'
  | 'steady'
  | 'steady-5'
  | 'steady-10'
  | 'burst'
  | 'error-500'
  | 'drop'
  | 'duplicate'
  | 'empty'
  | 'canary';

export type ScenarioState = {
  name: ScenarioName;
  label: string;
  restErrorRemaining: number;
  restEmpty: boolean;
  restDuplicateBoundary: boolean;
  sseMode: 'idle' | 'steady' | 'burst' | 'duplicate' | 'canary';
  sseDropAfterEvents: number | null;
  sseBurstCount: number;
  sseSteadyIntervalMs: number;
};

const DEFAULT_STATE: ScenarioState = {
  name: 'normal',
  label: 'Normal',
  restErrorRemaining: 0,
  restEmpty: false,
  restDuplicateBoundary: false,
  sseMode: 'idle',
  sseDropAfterEvents: null,
  sseBurstCount: 10,
  sseSteadyIntervalMs: 1000,
};

let state: ScenarioState = { ...DEFAULT_STATE };
let nextLiveEventId = 10_000;

export function getScenarioState(): ScenarioState {
  return state;
}

export function getNextLiveEventId(): number {
  nextLiveEventId += 1;
  return nextLiveEventId;
}

export function resetLiveEventIds(start = 10_000): void {
  nextLiveEventId = start;
}

export function applyScenario(name: ScenarioName): ScenarioState {
  switch (name) {
    case 'normal':
      state = { ...DEFAULT_STATE };
      break;
    case 'steady':
      state = {
        ...DEFAULT_STATE,
        name,
        label: '1/sec steady',
        sseMode: 'steady',
      };
      break;
    case 'steady-5':
      state = {
        ...DEFAULT_STATE,
        name,
        label: '5/sec steady',
        sseMode: 'steady',
        sseSteadyIntervalMs: 200,
      };
      break;
    case 'steady-10':
      state = {
        ...DEFAULT_STATE,
        name,
        label: '10/sec steady',
        sseMode: 'steady',
        sseSteadyIntervalMs: 100,
      };
      break;
    case 'burst':
      state = {
        ...DEFAULT_STATE,
        name,
        label: 'Burst',
        sseMode: 'burst',
      };
      break;
    case 'error-500':
      state = {
        ...DEFAULT_STATE,
        name,
        label: '500 error',
        restErrorRemaining: 3,
      };
      break;
    case 'drop':
      state = {
        ...DEFAULT_STATE,
        name,
        label: 'Drop connection',
        sseMode: 'steady',
        sseDropAfterEvents: 3,
      };
      break;
    case 'duplicate':
      state = {
        ...DEFAULT_STATE,
        name,
        label: 'Duplicate / out-of-order',
        restDuplicateBoundary: true,
        sseMode: 'duplicate',
      };
      resetLiveEventIds(105);
      break;
    case 'empty':
      state = {
        ...DEFAULT_STATE,
        name,
        label: 'Empty',
        restEmpty: true,
      };
      break;
    case 'canary':
      state = {
        ...DEFAULT_STATE,
        name,
        label: 'Canary / non-enwiki',
        sseMode: 'canary',
      };
      break;
    default:
      state = { ...DEFAULT_STATE };
  }

  return state;
}

export function consumeRestError(): boolean {
  if (state.restErrorRemaining <= 0) {
    return false;
  }

  state.restErrorRemaining -= 1;
  return true;
}

export function triggerDropAllConnections(): void {
  closeAllSseClients();
}

export const SCENARIO_OPTIONS: Array<{ name: ScenarioName; label: string; description: string }> =
  [
    { name: 'normal', label: 'Normal', description: 'Default paginated REST and idle SSE.' },
    { name: 'steady', label: '1/sec steady', description: 'Emit one enwiki SSE event per second.' },
    {
      name: 'steady-5',
      label: '5/sec steady',
      description: 'Emit five enwiki SSE events per second.',
    },
    {
      name: 'steady-10',
      label: '10/sec steady',
      description: 'Emit ten enwiki SSE events per second.',
    },
    { name: 'burst', label: 'Burst', description: 'Emit 10 SSE events immediately on connect.' },
    { name: 'error-500', label: '500 error', description: 'Next 3 REST requests return HTTP 500.' },
    { name: 'drop', label: 'Drop connection', description: 'Close SSE after 3 events.' },
    {
      name: 'duplicate',
      label: 'Duplicate / out-of-order',
      description: 'REST pages overlap rcids; SSE emits out-of-order ids.',
    },
    { name: 'empty', label: 'Empty', description: 'REST always returns an empty list.' },
    {
      name: 'canary',
      label: 'Canary / non-enwiki',
      description: 'SSE mixes filtered canary and non-enwiki events.',
    },
  ];
