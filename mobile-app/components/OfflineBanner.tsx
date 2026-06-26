import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

type OfflineBannerProps = {
  lastUpdatedAt: number | null;
};

export function formatOfflineBannerMessage(
  lastUpdatedAt: number | null,
): string {
  if (lastUpdatedAt) {
    return 'Offline — showing cached data';
  }

  return 'Offline — connect to load recent changes';
}

export default function OfflineBanner({ lastUpdatedAt }: OfflineBannerProps) {

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{formatOfflineBannerMessage(lastUpdatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 193, 7, 0.45)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
