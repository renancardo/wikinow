import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import type { FeedFreshnessSource } from '@/types/feed-freshness';

type ChangesListHeaderProps = {
  count: number;
  hasMore: boolean;
  lastUpdatedAt: number | null;
  source?: FeedFreshnessSource;
  isUpdating?: boolean;
  variant?: 'list' | 'header' | 'subheader';
};

export function formatLoadedCount(count: number, hasMore: boolean): string {
  const label = count === 1 ? '1 change' : `${count} changes`;
  return hasMore ? `${label} · scroll for more` : label;
}

function formatFreshnessLabel(
  relativeTime: string | null,
  source: FeedFreshnessSource,
  isUpdating: boolean,
  compact: boolean,
): string {
  if (isUpdating) {
    return 'Updating…';
  }

  if (!relativeTime) {
    return 'Not updated yet';
  }

  if (source === 'stream') {
    return compact ? relativeTime : `Live · updated ${relativeTime}`;
  }

  if (source === 'cache') {
    return compact ? `Cached ${relativeTime}` : `Cached · updated ${relativeTime}`;
  }

  return compact ? relativeTime : `Updated ${relativeTime}`;
}

export default function ChangesListHeader({
  count,
  hasMore,
  lastUpdatedAt,
  source = 'api',
  isUpdating = false,
  variant = 'list',
}: ChangesListHeaderProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const relativeTime = useRelativeTime(lastUpdatedAt);
  const compact = variant === 'subheader' || variant === 'header';
  const freshnessLabel = formatFreshnessLabel(relativeTime, source, isUpdating, compact);
  const isLive = source === 'stream' && !isUpdating;

  if (variant === 'subheader') {
    return (
      <View style={styles.subheader}>
        <View style={[styles.countPill, { backgroundColor: palette.subtle }]}>
          <Text style={[styles.countText, { color: palette.muted }]}>
            {count} loaded{hasMore ? '+' : ''}
          </Text>
        </View>
        <View style={styles.freshnessRow}>
          {isLive ? (
            <View style={[styles.liveDot, { backgroundColor: palette.live }]} />
          ) : null}
          <Text style={[styles.freshnessCompact, { color: palette.muted }]}>
            {freshnessLabel}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, variant === 'header' && styles.headerContainer]}>
      <Text style={[styles.text, variant === 'header' && styles.headerText]}>
        {formatLoadedCount(count, hasMore)}
      </Text>
      <Text style={[styles.freshness, variant === 'header' && styles.headerFreshness]}>
        {freshnessLabel}
      </Text>
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
  headerContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
    alignItems: 'center',
    maxWidth: 260,
  },
  subheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  freshnessCompact: {
    fontSize: 12,
    fontWeight: '500',
  },
  text: {
    fontSize: 13,
    opacity: 0.6,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
  },
  freshness: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  headerFreshness: {
    fontSize: 11,
    marginTop: 2,
  },
});
