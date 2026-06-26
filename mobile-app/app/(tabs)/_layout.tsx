import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import LiveToggle from '@/components/LiveToggle';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { LiveModeProvider } from '@/providers/LiveModeProvider';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <LiveModeProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'All',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
            headerRight: () => <LiveToggle />,
          }}
        />
        <Tabs.Screen
          name="articles"
          options={{
            title: 'Articles',
            tabBarIcon: ({ color }) => <TabBarIcon name="file-text-o" color={color} />,
            headerRight: () => <LiveToggle />,
          }}
        />
        <Tabs.Screen
          name="new-pages"
          options={{
            title: 'New pages',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-square-o" color={color} />,
            headerRight: () => <LiveToggle />,
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
