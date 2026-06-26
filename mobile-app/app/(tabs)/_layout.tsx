import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';
import { LiveModeProvider } from '@/providers/LiveModeProvider';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <LiveModeProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: palette.tint,
          tabBarInactiveTintColor: palette.tabIconDefault,
          tabBarStyle: {
            backgroundColor: palette.background,
            borderTopColor: palette.border,
          },
          headerStyle: {
            backgroundColor: palette.background,
          },
          headerTintColor: palette.text,
          headerShadowVisible: false,
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'All',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="articles"
          options={{
            title: 'Articles',
            tabBarIcon: ({ color }) => <TabBarIcon name="file-text-o" color={color} />,
          }}
        />
        <Tabs.Screen
          name="new-pages"
          options={{
            title: 'New pages',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-square-o" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Config',
            tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
            headerRight: () => null,
          }}
        />
      </Tabs>
    </LiveModeProvider>
  );
}
