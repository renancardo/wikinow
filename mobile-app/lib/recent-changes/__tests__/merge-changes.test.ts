import type { RecentChange } from '@/types/recent-change';

import { mergeChanges } from '@/lib/recent-changes/merge-changes';

function change(rcid: number, title = `Page ${rcid}`): RecentChange {
  return {
    rcid,
    title,
    user: 'TestUser',
    type: 'edit',
    namespace: 0,
    timestamp: `2026-06-26T12:${String(rcid % 60).padStart(2, '0')}:00Z`,
    pageUrl: `https://en.wikipedia.org/wiki/Page_${rcid}`,
  };
}

describe('mergeChanges', () => {
  it('returns incoming sorted when existing is empty', () => {
    const incoming = [change(3), change(1), change(2)];

    expect(mergeChanges([], incoming)).toEqual([change(3), change(2), change(1)]);
  });

  it('returns existing sorted when incoming is empty', () => {
    const existing = [change(10), change(8)];

    expect(mergeChanges(existing, [])).toEqual([change(10), change(8)]);
  });

  it('dedupes by rcid and keeps the later occurrence', () => {
    const existing = [change(5, 'Old title'), change(4)];
    const incoming = [change(5, 'Updated title'), change(3)];

    const result = mergeChanges(existing, incoming);

    expect(result).toEqual([change(5, 'Updated title'), change(4), change(3)]);
  });

  it('merges newer head items with existing tail', () => {
    const existing = [change(50), change(49), change(48)];
    const incoming = [change(52), change(51)];

    const result = mergeChanges(existing, incoming);

    expect(result.map((item) => item.rcid)).toEqual([52, 51, 50, 49, 48]);
  });

  it('merges older pagination items with existing head', () => {
    const existing = [change(50), change(49)];
    const incoming = [change(48), change(47)];

    const result = mergeChanges(existing, incoming);

    expect(result.map((item) => item.rcid)).toEqual([50, 49, 48, 47]);
  });

  it('sorts out-of-order incoming responses by rcid descending', () => {
    const existing = [change(100)];
    const incoming = [change(97), change(99), change(98)];

    const result = mergeChanges(existing, incoming);

    expect(result.map((item) => item.rcid)).toEqual([100, 99, 98, 97]);
  });

  it('handles overlapping refresh and pagination without duplicate rcids', () => {
    const page1 = [change(20), change(19), change(18)];
    const page2 = [change(17), change(16), change(19)]; // duplicate 19 from overlap

    const afterPage1 = mergeChanges([], page1);
    const afterPage2 = mergeChanges(afterPage1, page2);

    expect(afterPage2.map((item) => item.rcid)).toEqual([20, 19, 18, 17, 16]);
    expect(afterPage2).toHaveLength(5);
  });
});

describe('mergeChanges head refresh scenario', () => {
  it('merges a new head page without losing paginated tail items', () => {
    const tail = [change(40), change(39), change(38), change(37)];
    const refreshedHead = [change(42), change(41), change(40)]; // 40 overlaps

    const result = mergeChanges(tail, refreshedHead);

    expect(result.map((item) => item.rcid)).toEqual([42, 41, 40, 39, 38, 37]);
  });
});
