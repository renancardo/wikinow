export type ColorSchemePreference = 'system' | 'light' | 'dark';

export type AppConfig = {
  /** App color theme. `system` follows the device setting. */
  colorScheme: ColorSchemePreference;
  /** Max enwiki events retained in the live SSE query buffer. */
  streamBufferMax: number;
  /** Recent changes fetched per REST page (`rclimit`). */
  pageSize: number;
  /** REST polling interval while online and live mode is off (ms). */
  refetchIntervalMs: number;
  /** How often relative-time labels refresh (ms). */
  tickMs: number;
  /** Print `[WikiNow:Live]` debug logs to the console. */
  liveLogEnabled: boolean;
  /** Max items shown in the combined list (REST + live stream). */
  maxListItems: number;
};

export type AppConfigNumberKey = {
  [K in keyof AppConfig]: AppConfig[K] extends number ? K : never;
}[keyof AppConfig];

export type AppConfigBooleanKey = {
  [K in keyof AppConfig]: AppConfig[K] extends boolean ? K : never;
}[keyof AppConfig];

export type AppConfigChoiceKey = {
  [K in keyof AppConfig]: AppConfig[K] extends ColorSchemePreference ? K : never;
}[keyof AppConfig];

export type AppConfigChoiceOption<T extends string = string> = {
  value: T;
  label: string;
};

export type AppConfigFieldMeta =
  | {
      key: AppConfigChoiceKey;
      label: string;
      summary: string;
      type: 'choice';
      options: readonly AppConfigChoiceOption<ColorSchemePreference>[];
    }
  | {
      key: AppConfigNumberKey;
      label: string;
      summary: string;
      type: 'number';
      min: number;
      max: number;
      unit?: string;
    }
  | {
      key: AppConfigBooleanKey;
      label: string;
      summary: string;
      type: 'boolean';
    };

export const DEFAULT_APP_CONFIG: AppConfig = {
  colorScheme: 'system',
  streamBufferMax: 100,
  pageSize: 10,
  refetchIntervalMs: 90_000,
  tickMs: 10_000,
  liveLogEnabled: __DEV__,
  maxListItems: 200,
};

export const APP_CONFIG_STORAGE_KEY = 'wikinow-app-config';

export const APP_CONFIG_FIELDS: AppConfigFieldMeta[] = [
  {
    key: 'colorScheme',
    label: 'Theme',
    summary: 'App appearance. System follows your device light or dark setting.',
    type: 'choice',
    options: [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  {
    key: 'streamBufferMax',
    label: 'Stream buffer max',
    summary:
      'Caps how many enwiki live-stream events are kept in memory. Older stream-only rows drop out of the buffer.',
    type: 'number',
    min: 10,
    max: 500,
    unit: 'events',
  },
  {
    key: 'pageSize',
    label: 'Page size',
    summary: 'Number of recent changes requested per REST page (`rclimit`). Affects initial load and pagination.',
    type: 'number',
    min: 10,
    max: 100,
    unit: 'items',
  },
  {
    key: 'refetchIntervalMs',
    label: 'Refetch interval',
    summary:
      'How often the REST feed polls for updates while online and live mode is off. Live mode pauses polling.',
    type: 'number',
    min: 15_000,
    max: 600_000,
    unit: 'ms',
  },
  {
    key: 'tickMs',
    label: 'Relative time tick',
    summary: 'How often “updated 2m ago” style labels refresh in the list header.',
    type: 'number',
    min: 1_000,
    max: 60_000,
    unit: 'ms',
  },
  {
    key: 'liveLogEnabled',
    label: 'Live debug logs',
    summary: 'Emit `[WikiNow:Live]` console logs for stream connect, events, and live-mode state.',
    type: 'boolean',
  },
  {
    key: 'maxListItems',
    label: 'Max list items',
    summary:
      'Maximum rows shown in the FlashList after merging REST pages and live stream events (newest first).',
    type: 'number',
    min: 50,
    max: 1_000,
    unit: 'items',
  },
];

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function sanitizeAppConfig(input: Partial<AppConfig> | null | undefined): AppConfig {
  const merged = { ...DEFAULT_APP_CONFIG, ...input };

  return {
    colorScheme:
      merged.colorScheme === 'light' || merged.colorScheme === 'dark'
        ? merged.colorScheme
        : 'system',
    streamBufferMax: clampNumber(merged.streamBufferMax, 10, 500),
    pageSize: clampNumber(merged.pageSize, 10, 100),
    refetchIntervalMs: clampNumber(merged.refetchIntervalMs, 15_000, 600_000),
    tickMs: clampNumber(merged.tickMs, 1_000, 60_000),
    liveLogEnabled: Boolean(merged.liveLogEnabled),
    maxListItems: clampNumber(merged.maxListItems, 50, 1_000),
  };
}
