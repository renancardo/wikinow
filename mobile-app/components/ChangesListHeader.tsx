import { StyleSheet } from 'react-native';

import { useRelativeTime } from '@/hooks/useRelativeTime';
import { Text, View } from '@/components/Themed';
import type { FeedFreshnessSource } from '@/types/feed-freshness';

type ChangesListHeaderProps = {
  count: number;
  hasMore: boolean;
  lastUpdatedAt: number | null;
  source?: FeedFreshnessSource;
  isUpdating?: boolean;
};

export function formatLoadedCount(count: number, hasMore: boolean): string {
  const label = count === 1 ? '1 change loaded' : `${count} changes loaded`;
  return hasMore ? `${label} · scroll for more` : label;
}

function formatFreshnessLabel(
  relativeTime: string | null,
  source: FeedFreshnessSource,
  isUpdating: boolean,
): string {
  if (isUpdating) {
    return 'Updating…';
  }

  if (!relativeTime) {
    return 'Not updated yet';
  }

  if (source === 'stream') {
    return `Live · updated ${relativeTime}`;
  }

  if (source === 'cache') {
    return `Cached · updated ${relativeTime}`;
  }

  return `Updated ${relativeTime}`;
}

export default function ChangesListHeader({
  count,
  hasMore,
  lastUpdatedAt,
  source = 'api',
  isUpdating = false,
}: ChangesListHeaderProps) {
  const relativeTime = useRelativeTime(lastUpdatedAt);
  const freshnessLabel = formatFreshnessLabel(relativeTime, source, isUpdating);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{formatLoadedCount(count, hasMore)}</Text>
      <Text style={styles.freshness}>{freshnessLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  text: {
    fontSize: 13,
    opacity: 0.6,
  },
  freshness: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
});
