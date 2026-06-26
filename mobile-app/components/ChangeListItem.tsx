import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { RecentChange } from '@/types/recent-change';

type ChangeListItemProps = {
  item: RecentChange;
  onPress: (item: RecentChange) => void;
};

const TYPE_LABELS: Record<RecentChange['type'], string> = {
  edit: 'Edit',
  new: 'New',
  log: 'Log',
};

const TYPE_COLOR_KEY: Record<RecentChange['type'], 'changeEdit' | 'changeNew' | 'changeLog'> = {
  edit: 'changeEdit',
  new: 'changeNew',
  log: 'changeLog',
};

export default function ChangeListItem({ item, onPress }: ChangeListItemProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const badgeColor = palette[TYPE_COLOR_KEY[item.type]];

  return (
    <Pressable onPress={() => onPress(item)}>
      {({ pressed }) => (
        <View
          style={[
            styles.container,
            { borderBottomColor: palette.border },
            pressed && styles.pressed,
          ]}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: `${badgeColor}18` }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {TYPE_LABELS[item.type]}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: palette.muted }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.user, { color: palette.muted }]}>{item.user}</Text>
        </View>
      )}
    </Pressable>
  );
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.75,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  user: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
});
