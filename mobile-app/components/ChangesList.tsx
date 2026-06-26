import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import ChangeListItem from '@/components/ChangeListItem';
import { Text, View } from '@/components/Themed';
import type { RecentChange } from '@/types/recent-change';

type ChangesListProps = {
  data: RecentChange[];
  emptyMessage?: string;
};

export default function ChangesList({ data, emptyMessage = 'No changes yet.' }: ChangesListProps) {
  const router = useRouter();

  const handlePress = (item: RecentChange) => {
    router.push({
      pathname: '/detail',
      params: {
        url: item.pageUrl,
        title: item.title,
      },
    });
  };

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        keyExtractor={(item) => String(item.rcid)}
        renderItem={({ item }) => <ChangeListItem item={item} onPress={handlePress} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});
