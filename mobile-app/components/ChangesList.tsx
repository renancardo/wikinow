import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import ChangeListItem from '@/components/ChangeListItem';
import { Text, View } from '@/components/Themed';
import { TAB_EMPTY_MESSAGES, type ChangesTab } from '@/constants/tabs';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRecentChanges } from '@/hooks/useRecentChanges';

type ChangesListProps = {
  tab: ChangesTab;
  emptyMessage?: string;
};

export default function ChangesList({ tab, emptyMessage }: ChangesListProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const {
    changes,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecentChanges(tab);

  const handlePress = (item: (typeof changes)[number]) => {
    router.push({
      pathname: '/detail',
      params: {
        url: item.pageUrl,
        title: item.title,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load changes</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </Text>
        <Pressable style={[styles.retryButton, { backgroundColor: tint }]} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (changes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{emptyMessage ?? TAB_EMPTY_MESSAGES[tab]}</Text>
        <Pressable style={[styles.retryButton, { backgroundColor: tint }]} onPress={() => refetch()}>
          <Text style={styles.retryText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFetching && !isFetchingNextPage ? (
        <View style={styles.refreshBar}>
          <ActivityIndicator size="small" color={tint} />
          <Text style={styles.refreshText}>Updating…</Text>
        </View>
      ) : null}
      <FlashList
        data={changes}
        keyExtractor={(item) => String(item.rcid)}
        renderItem={({ item }) => <ChangeListItem item={item} onPress={handlePress} />}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isFetchingNextPage} onRefresh={refetch} tintColor={tint} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={tint} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: '600',
  },
  refreshBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 13,
    opacity: 0.6,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
