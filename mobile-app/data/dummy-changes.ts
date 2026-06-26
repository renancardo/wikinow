import type { ChangeType, RecentChange } from '@/types/recent-change';

const DUMMY_CHANGES: RecentChange[] = [
  {
    rcid: 1001,
    title: 'React Native',
    user: 'AdaLovelace',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-25T10:00:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/React_Native',
  },
  {
    rcid: 1002,
    title: 'Expo (software framework)',
    user: 'GraceHopper',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-25T09:58:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Expo_(software_framework)',
  },
  {
    rcid: 1003,
    title: 'Draft:Mobile offline caching patterns',
    user: 'AlanTuring',
    type: 'new',
    namespace: 0,
    timestamp: '2026-06-25T09:55:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  },
  {
    rcid: 1004,
    title: 'User talk:WikiBot',
    user: 'WikiBot',
    type: 'log',
    namespace: 3,
    timestamp: '2026-06-25T09:52:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  },
  {
    rcid: 1005,
    title: 'TanStack Query',
    user: 'LinusTorvalds',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-25T09:50:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  },
  {
    rcid: 1006,
    title: 'Draft:Server-sent events on mobile',
    user: 'MargaretHamilton',
    type: 'new',
    namespace: 0,
    timestamp: '2026-06-25T09:48:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  },
  {
    rcid: 1007,
    title: 'Wikipedia:Recent changes',
    user: 'JimboWales',
    type: 'edit',
    namespace: 4,
    timestamp: '2026-06-25T09:45:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Recent_changes',
  },
  {
    rcid: 1008,
    title: 'FlashList',
    user: 'ShopifyDev',
    type: 'edit',
    namespace: 0,
    timestamp: '2026-06-25T09:42:00Z',
    pageUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  },
];

export function getDummyChanges(filter?: {
  namespace?: number;
  type?: ChangeType;
}): RecentChange[] {
  return DUMMY_CHANGES.filter((change) => {
    if (filter?.namespace !== undefined && change.namespace !== filter.namespace) {
      return false;
    }
    if (filter?.type !== undefined && change.type !== filter.type) {
      return false;
    }
    return true;
  });
}
