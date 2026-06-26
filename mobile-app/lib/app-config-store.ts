import {
  DEFAULT_APP_CONFIG,
  sanitizeAppConfig,
  type AppConfig,
} from '@/constants/app-config';

let runtimeConfig: AppConfig = { ...DEFAULT_APP_CONFIG };

export function getAppConfig(): AppConfig {
  return runtimeConfig;
}

export function setRuntimeAppConfig(config: AppConfig): void {
  runtimeConfig = config;
}

export function resetRuntimeAppConfig(): void {
  runtimeConfig = { ...DEFAULT_APP_CONFIG };
}

export function mergeRuntimeAppConfig(patch: Partial<AppConfig>): AppConfig {
  const next = sanitizeAppConfig({ ...runtimeConfig, ...patch });
  runtimeConfig = next;
  return next;
}
