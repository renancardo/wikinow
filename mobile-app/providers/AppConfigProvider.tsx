import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  APP_CONFIG_FIELDS,
  APP_CONFIG_STORAGE_KEY,
  DEFAULT_APP_CONFIG,
  sanitizeAppConfig,
  type AppConfig,
  type AppConfigFieldMeta,
} from '@/constants/app-config';
import { mergeRuntimeAppConfig, setRuntimeAppConfig } from '@/lib/app-config-store';

type AppConfigContextValue = {
  config: AppConfig;
  fields: AppConfigFieldMeta[];
  isReady: boolean;
  setConfigValue: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  resetConfig: () => void;
};

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

async function loadStoredConfig(): Promise<AppConfig> {
  try {
    const raw = await AsyncStorage.getItem(APP_CONFIG_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_CONFIG;
    }

    return sanitizeAppConfig(JSON.parse(raw) as Partial<AppConfig>);
  } catch {
    return DEFAULT_APP_CONFIG;
  }
}

async function persistConfig(config: AppConfig): Promise<void> {
  await AsyncStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadStoredConfig().then((stored) => {
      if (cancelled) {
        return;
      }

      setRuntimeAppConfig(stored);
      setConfig(stored);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setConfigValue = useCallback(<K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    const next = mergeRuntimeAppConfig({ [key]: value });
    setConfig(next);
    persistConfig(next);
  }, []);

  const resetConfig = useCallback(() => {
    const next = sanitizeAppConfig(DEFAULT_APP_CONFIG);
    setRuntimeAppConfig(next);
    setConfig(next);
    persistConfig(next);
  }, []);

  const value = useMemo<AppConfigContextValue>(
    () => ({
      config,
      fields: APP_CONFIG_FIELDS,
      isReady,
      setConfigValue,
      resetConfig,
    }),
    [config, isReady, setConfigValue, resetConfig],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }

  return context;
}

export function useAppConfigOptional() {
  return useContext(AppConfigContext);
}
