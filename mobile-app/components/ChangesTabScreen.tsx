import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import ChangesList from '@/components/ChangesList';
import ChangesScreenHeader from '@/components/ChangesScreenHeader';
import { TAB_LABELS, type ChangesTab } from '@/constants/tabs';
import { useRecentChangesWithLive } from '@/hooks/useRecentChangesWithLive';

type ChangesTabScreenProps = {
  tab: ChangesTab;
  emptyMessage?: string;
};

export default function ChangesTabScreen({ tab, emptyMessage }: ChangesTabScreenProps) {
  const navigation = useNavigation();
  const queryResult = useRecentChangesWithLive(tab);

  const isUpdating =
    queryResult.isOnline &&
    queryResult.isFetching &&
    !queryResult.isFetchingNextPage &&
    !queryResult.isPending;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <ChangesScreenHeader
          title={TAB_LABELS[tab]}
          count={queryResult.loadedCount}
          hasMore={queryResult.hasNextPage ?? false}
          lastUpdatedAt={queryResult.freshness.lastUpdatedAt}
          source={queryResult.freshness.source}
          isUpdating={isUpdating || queryResult.isShowingPlaceholder}
        />
      ),
    });
  }, [
    navigation,
    tab,
    queryResult.loadedCount,
    queryResult.hasNextPage,
    queryResult.freshness.lastUpdatedAt,
    queryResult.freshness.source,
    isUpdating,
    queryResult.isShowingPlaceholder,
  ]);

  return (
    <ChangesList tab={tab} queryResult={queryResult} emptyMessage={emptyMessage} />
  );
}
