import { buildFixtureCatalog } from '../src/fixtures/catalog.js';
import { filterEntries } from '../src/lib/filters.js';
import { decodeCursor, encodeCursor, paginateEntries } from '../src/lib/pagination.js';

describe('paginateEntries', () => {
  const catalog = buildFixtureCatalog(20);

  it('returns the first page sorted by rcid descending', () => {
    const { page, nextCursor } = paginateEntries(catalog, 5);

    expect(page.map((entry) => entry.rcid)).toEqual([1000, 999, 998, 997, 996]);
    expect(nextCursor).toBe(encodeCursor(page[4]!));
  });

  it('continues from rccontinue cursor without duplicates', () => {
    const first = paginateEntries(catalog, 5);
    const second = paginateEntries(catalog, 5, first.nextCursor);

    expect(second.page.map((entry) => entry.rcid)).toEqual([995, 994, 993, 992, 991]);
    expect(first.page.at(-1)?.rcid).not.toBe(second.page[0]?.rcid);
  });

  it('omits nextCursor on the last page', () => {
    const first = paginateEntries(catalog, 10);
    const second = paginateEntries(catalog, 10, first.nextCursor);

    expect(second.nextCursor).toBeUndefined();
  });

  it('round-trips cursor encoding', () => {
    const entry = catalog[0]!;
    const decoded = decodeCursor(encodeCursor(entry));

    expect(decoded).toEqual({ timestamp: entry.timestamp, rcid: entry.rcid });
  });
});
