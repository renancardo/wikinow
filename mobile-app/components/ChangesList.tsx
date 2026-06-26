import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import ChangeListItem from '@/components/ChangeListItem';
import ChangesListHeader from '@/components/ChangesListHeader';
import OfflineBanner from '@/components/OfflineBanner';
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
    loadedCount,
    freshness,
    isOnline,
    hasCachedData,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isShowingPlaceholder,
  } = useRecentChanges(tab);

  const isUpdating =
    isOnline && isFetching && !isFetchingNextPage && !isPending;
  const isOffline = !isOnline;

  const handlePress = (item: (typeof changes)[number]) => {
    router.push({
      pathname: '/detail',
      params: {
        url: item.pageUrl,
        title: item.title,
      },
    });
  };

  if (isPending && !hasCachedData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (isOffline && !hasCachedData) {
    return (
      <View style={styles.container}>
        <OfflineBanner lastUpdatedAt={freshness.lastUpdatedAt} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {emptyMessage ?? TAB_EMPTY_MESSAGES[tab]}
          </Text>
          <Text style={styles.offlineHint}>Connect to the internet to load recent changes.</Text>
        </View>
      </View>
    );
  }

  if (isError && !hasCachedData) {
    return (
      <View style={styles.container}>
        {isOffline ? <OfflineBanner lastUpdatedAt={freshness.lastUpdatedAt} /> : null}
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load changes</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: tint }]}
            onPress={() => refetch()}
            disabled={isOffline}>
            <Text style={styles.retryText}>{isOffline ? 'Offline' : 'Retry'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (changes.length === 0) {
    return (
      <View style={styles.container}>
        {isOffline ? <OfflineBanner lastUpdatedAt={freshness.lastUpdatedAt} /> : null}
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{emptyMessage ?? TAB_EMPTY_MESSAGES[tab]}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: tint }]}
            onPress={() => refetch()}
            disabled={isOffline}>
            <Text style={styles.retryText}>{isOffline ? 'Offline' : 'Refresh'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline ? <OfflineBanner lastUpdatedAt={freshness.lastUpdatedAt} /> : null}
      <FlashList
        data={changes}
        keyExtractor={(item) => String(item.rcid)}
        maintainVisibleContentPosition={
          hasCachedData
            ? {
                autoscrollToTopThreshold: 20,
              }
            : undefined
        }
        ListHeaderComponent={
          <ChangesListHeader
            count={loadedCount}
            hasMore={hasNextPage ?? false}
            lastUpdatedAt={freshness.lastUpdatedAt}
            source={freshness.source}
            isUpdating={isUpdating || isShowingPlaceholder}
          />
        }
        renderItem={({ item }) => <ChangeListItem item={item} onPress={handlePress} />}
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={refetch}
            tintColor={tint}
            enabled={isOnline}
          />
        }
        onEndReached={() => {
          if (isOnline && hasNextPage && !isFetchingNextPage) {
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
    marginBottom: 8,
  },
  offlineHint: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
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
    marginTop: 8,
  },
  retryText: {
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
