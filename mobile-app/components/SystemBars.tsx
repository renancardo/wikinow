import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SystemBars() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.background);

    if (Platform.OS !== 'android') {
      return;
    }

    void NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    NavigationBar.setStyle(isDark ? 'dark' : 'light');
  }, [isDark, palette.background]);

  return (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      backgroundColor={palette.background}
      translucent={false}
    />
  );
}
