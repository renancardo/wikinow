import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChangesListHeader from '@/components/ChangesListHeader';
import LiveToggle from '@/components/LiveToggle';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { FeedFreshnessSource } from '@/types/feed-freshness';

type ChangesScreenHeaderProps = {
  title: string;
  count: number;
  hasMore: boolean;
  lastUpdatedAt: number | null;
  source: FeedFreshnessSource;
  isUpdating: boolean;
};

export default function ChangesScreenHeader({
  title,
  count,
  hasMore,
  lastUpdatedAt,
  source,
  isUpdating,
}: ChangesScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[styles.wrapper, { paddingTop: insets.top, borderBottomColor: palette.border }]}
      pointerEvents="box-none">
      <View style={styles.titleRow} pointerEvents="box-none">
        <Text style={styles.title} pointerEvents="none">
          {title}
        </Text>
        <View style={styles.toggleSlot} pointerEvents="auto">
          <LiveToggle />
        </View>
      </View>
      <ChangesListHeader
        variant="subheader"
        count={count}
        hasMore={hasMore}
        lastUpdatedAt={lastUpdatedAt}
        source={source}
        isUpdating={isUpdating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
    zIndex: 1,
  },
  toggleSlot: {
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
