import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import Colors from '@/constants/Colors';

export function getNavigationTheme(scheme: 'light' | 'dark'): Theme {
  const palette = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: scheme === 'dark',
    colors: {
      ...base.colors,
      primary: palette.tint,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
      notification: palette.tint,
    },
  };
}
