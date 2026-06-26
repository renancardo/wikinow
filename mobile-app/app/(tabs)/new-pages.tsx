import ChangesList from '@/components/ChangesList';
import { getDummyChanges } from '@/data/dummy-changes';

export default function NewPagesScreen() {
  return (
    <ChangesList
      data={getDummyChanges({ type: 'new' })}
      emptyMessage="No new pages in this tab."
    />
  );
}
