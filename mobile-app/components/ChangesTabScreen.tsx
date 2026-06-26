import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import ChangesList from '@/components/ChangesList';
import { ChangesScreenHeaderContainer } from '@/components/ChangesScreenHeader';
import { type ChangesTab } from '@/constants/tabs';
import { useRecentChangesWithLive } from '@/hooks/useRecentChangesWithLive';

type ChangesTabScreenProps = {
  tab: ChangesTab;
  emptyMessage?: string;
};

export default function ChangesTabScreen({ tab, emptyMessage }: ChangesTabScreenProps) {
  const navigation = useNavigation();
  const queryResult = useRecentChangesWithLive(tab);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <ChangesScreenHeaderContainer tab={tab} />,
    });
  }, [navigation, tab]);

  return (
    <ChangesList tab={tab} queryResult={queryResult} emptyMessage={emptyMessage} />
  );
}
