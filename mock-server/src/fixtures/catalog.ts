import type { FixtureEntry, StreamChangeType } from '../types.js';

const TYPES: StreamChangeType[] = ['edit', 'new', 'log', 'categorize'];
const USERS = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'MockBot'];
const ARTICLE_TITLES = [
  'TypeScript',
  'React Native',
  'Wikipedia',
  'JavaScript',
  'Node.js',
  'Expo',
  'TanStack Query',
  'FlashList',
];
const USER_TITLES = ['Alice', 'Bob', 'Carol'];
const TEMPLATE_TITLES = ['Citation needed', 'Stub', 'Infobox'];

function titleForNamespace(ns: number, index: number): string {
  if (ns === 0) {
    return ARTICLE_TITLES[index % ARTICLE_TITLES.length]!;
  }

  if (ns === 2) {
    return `User:${USER_TITLES[index % USER_TITLES.length]}`;
  }

  if (ns === 10) {
    return `Template:${TEMPLATE_TITLES[index % TEMPLATE_TITLES.length]}`;
  }

  return `Talk:Page_${index}`;
}

function typeForIndex(index: number): StreamChangeType {
  return TYPES[index % TYPES.length]!;
}

function namespaceForIndex(index: number): number {
  const namespaces = [0, 0, 0, 2, 10, 1];
  return namespaces[index % namespaces.length]!;
}

function timestampForRcid(rcid: number): string {
  const base = Date.UTC(2026, 5, 26, 12, 0, 0);
  const offsetMs = (1000 - rcid) * 60_000;
  return new Date(base - offsetMs).toISOString().replace('.000Z', 'Z');
}

export function buildFixtureCatalog(count = 100): FixtureEntry[] {
  const entries: FixtureEntry[] = [];

  for (let rcid = 1000; rcid > 1000 - count; rcid -= 1) {
    const index = 1000 - rcid;
    const ns = namespaceForIndex(index);
    const type = typeForIndex(index);

    entries.push({
      rcid,
      ns,
      type,
      title: titleForNamespace(ns, index),
      user: USERS[index % USERS.length]!,
      timestamp: timestampForRcid(rcid),
    });
  }

  return entries;
}

export const FIXTURE_CATALOG = buildFixtureCatalog(100);
