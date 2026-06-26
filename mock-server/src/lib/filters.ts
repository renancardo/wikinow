import type { FixtureEntry, StreamChangeType } from '../types.js';

export type RecentChangesFilter = {
  rcnamespace?: number;
  rctype?: StreamChangeType;
};

export function filterEntries(
  entries: FixtureEntry[],
  filter: RecentChangesFilter,
): FixtureEntry[] {
  return entries.filter((entry) => matchesFilter(entry, filter));
}

export function matchesFilter(entry: FixtureEntry, filter: RecentChangesFilter): boolean {
  if (filter.rcnamespace !== undefined && entry.ns !== filter.rcnamespace) {
    return false;
  }

  if (filter.rctype !== undefined && entry.type !== filter.rctype) {
    return false;
  }

  return true;
}
