import ChangesList from '@/components/ChangesList';
import { getDummyChanges } from '@/data/dummy-changes';

export default function ArticlesScreen() {
  return (
    <ChangesList
      data={getDummyChanges({ namespace: 0 })}
      emptyMessage="No article changes in this tab."
    />
  );
}
