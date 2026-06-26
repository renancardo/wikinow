import { buildFixtureCatalog } from '../src/fixtures/catalog.js';
import { filterEntries, matchesFilter } from '../src/lib/filters.js';

describe('filterEntries', () => {
  const catalog = buildFixtureCatalog(30);

  it('filters article namespace 0', () => {
    const filtered = filterEntries(catalog, { rcnamespace: 0 });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((entry) => entry.ns === 0)).toBe(true);
  });

  it('filters new page changes', () => {
    const filtered = filterEntries(catalog, { rctype: 'new' });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((entry) => entry.type === 'new')).toBe(true);
  });

  it('matches tab filters independently', () => {
    expect(matchesFilter({ rcid: 1, ns: 0, type: 'edit', title: 'A', user: 'U', timestamp: 't' }, { rcnamespace: 0 })).toBe(true);
    expect(matchesFilter({ rcid: 1, ns: 2, type: 'edit', title: 'User:A', user: 'U', timestamp: 't' }, { rcnamespace: 0 })).toBe(false);
    expect(matchesFilter({ rcid: 1, ns: 0, type: 'new', title: 'A', user: 'U', timestamp: 't' }, { rctype: 'new' })).toBe(true);
    expect(matchesFilter({ rcid: 1, ns: 0, type: 'edit', title: 'A', user: 'U', timestamp: 't' }, { rctype: 'new' })).toBe(false);
  });
});
