import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppConfigOptional } from '@/providers/AppConfigProvider';

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const configContext = useAppConfigOptional();
  const preference = configContext?.config.colorScheme ?? 'system';

  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}
