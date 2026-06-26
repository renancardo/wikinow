import type { RecentChange } from '@/types/recent-change';

export type MergeMode = 'prepend' | 'append';

/**
 * Merge two change lists for a shifting recent-changes feed.
 *
 * - `prepend`: head refresh — incoming is a newer API page
 * - `append`: pagination — incoming is an older API page
 *
 * Incoming wins on duplicate rcid. Result is sorted newest-first (descending rcid).
 */
export function mergeChanges(
  existing: RecentChange[],
  incoming: RecentChange[],
  _mode: MergeMode = 'append',
): RecentChange[] {
  if (incoming.length === 0) {
    return sortByRcidDesc(existing);
  }

  if (existing.length === 0) {
    return sortByRcidDesc(incoming);
  }

  const byRcid = new Map<number, RecentChange>();

  for (const change of existing) {
    byRcid.set(change.rcid, change);
  }

  for (const change of incoming) {
    byRcid.set(change.rcid, change);
  }

  return sortByRcidDesc(Array.from(byRcid.values()));
}

function sortByRcidDesc(changes: RecentChange[]): RecentChange[] {
  return [...changes].sort((a, b) => b.rcid - a.rcid);
}
