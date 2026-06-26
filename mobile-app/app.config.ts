import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'WikiNow',
  slug: config.slug ?? 'WikiNow',
  extra: {
    ...(typeof config.extra === 'object' && config.extra !== null ? config.extra : {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    streamBaseUrl: process.env.EXPO_PUBLIC_STREAM_BASE_URL,
    userAgent: process.env.EXPO_PUBLIC_USER_AGENT,
  },
});
