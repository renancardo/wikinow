import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import SystemBars from '@/components/SystemBars';
import { getNavigationTheme } from '@/constants/navigation-theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import QueryProvider from '@/providers/QueryProvider';
import { AppConfigProvider } from '@/providers/AppConfigProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <QueryProvider>
      <AppConfigProvider>
        <ThemedNavigation />
      </AppConfigProvider>
    </QueryProvider>
  );
}

function ThemedNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={getNavigationTheme(colorScheme ?? 'light')}>
      <SystemBars />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            // Avoid iOS showing "(tabs)" as the back button label on pushed screens.
            title: 'Changes',
          }}
        />
        <Stack.Screen
          name="detail"
          options={({ route }) => ({
            title: (route.params as { title?: string })?.title ?? 'Page',
            headerLargeTitle: false,
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitleVisible: false,
          })}
        />
      </Stack>
    </ThemeProvider>
  );
}
