import ChangesList from '@/components/ChangesList';
import { getDummyChanges } from '@/data/dummy-changes';

export default function AllChangesScreen() {
  return <ChangesList data={getDummyChanges()} />;
}
