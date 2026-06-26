import type { FixtureEntry } from '../types.js';

export function encodeCursor(entry: FixtureEntry): string {
  return `${entry.timestamp}|${entry.rcid}`;
}

export function decodeCursor(cursor: string): { timestamp: string; rcid: number } | null {
  const separatorIndex = cursor.lastIndexOf('|');
  if (separatorIndex <= 0) {
    return null;
  }

  const timestamp = cursor.slice(0, separatorIndex);
  const rcid = Number(cursor.slice(separatorIndex + 1));

  if (!Number.isFinite(rcid)) {
    return null;
  }

  return { timestamp, rcid };
}

export function paginateEntries(
  entries: FixtureEntry[],
  limit: number,
  cursor?: string,
): { page: FixtureEntry[]; nextCursor?: string } {
  let startIndex = 0;

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const matchIndex = entries.findIndex((entry) => entry.rcid === decoded.rcid);
      startIndex = matchIndex >= 0 ? matchIndex + 1 : 0;
    }
  }

  const page = entries.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < entries.length;
  const lastEntry = page.at(-1);

  return {
    page,
    nextCursor: hasMore && lastEntry ? encodeCursor(lastEntry) : undefined,
  };
}

export function withDuplicateBoundary(entries: FixtureEntry[], limit: number): FixtureEntry[] {
  if (entries.length < 2) {
    return entries;
  }

  const page = entries.slice(0, limit);
  const duplicate = entries[limit - 1] ?? entries[0]!;

  return [...page, { ...duplicate }];
}
