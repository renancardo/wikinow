import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import type { RecentChange } from '@/types/recent-change';

type ChangeListItemProps = {
  item: RecentChange;
  onPress: (item: RecentChange) => void;
};

const TYPE_LABELS: Record<RecentChange['type'], string> = {
  edit: 'Edit',
  new: 'New page',
  log: 'Log',
};

export default function ChangeListItem({ item, onPress }: ChangeListItemProps) {
  return (
    <Pressable onPress={() => onPress(item)}>
      {({ pressed }) => (
        <View style={[styles.container, pressed && styles.pressed]}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {TYPE_LABELS[item.type]} · {item.user}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      )}
    </Pressable>
  );
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
});
