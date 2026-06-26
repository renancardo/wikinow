import Constants from 'expo-constants';

type EnvExtra = {
  apiBaseUrl?: string;
  streamBaseUrl?: string;
  userAgent?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as EnvExtra;

const DEFAULTS = {
  apiBaseUrl: 'https://en.wikipedia.org',
  streamBaseUrl: 'https://stream.wikimedia.org',
  userAgent: 'WikiNow/1.0 (learning project; contact: dev@example.com)',
} as const;

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? DEFAULTS.apiBaseUrl,
  streamBaseUrl:
    process.env.EXPO_PUBLIC_STREAM_BASE_URL ?? extra.streamBaseUrl ?? DEFAULTS.streamBaseUrl,
  userAgent: process.env.EXPO_PUBLIC_USER_AGENT ?? extra.userAgent ?? DEFAULTS.userAgent,
} as const;
