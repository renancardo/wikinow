import {
  DEFAULT_APP_CONFIG,
  sanitizeAppConfig,
} from '@/constants/app-config';

describe('sanitizeAppConfig', () => {
  it('returns defaults for empty input', () => {
    expect(sanitizeAppConfig(null)).toEqual(DEFAULT_APP_CONFIG);
    expect(sanitizeAppConfig(null).colorScheme).toBe('system');
  });

  it('clamps numeric values to allowed ranges', () => {
    const config = sanitizeAppConfig({
      streamBufferMax: 5,
      pageSize: 200,
      refetchIntervalMs: 1,
      tickMs: 999_999,
      maxListItems: 10,
    });

    expect(config.streamBufferMax).toBe(10);
    expect(config.pageSize).toBe(100);
    expect(config.refetchIntervalMs).toBe(15_000);
    expect(config.tickMs).toBe(60_000);
    expect(config.maxListItems).toBe(50);
  });
});
