export type ChangesTab = 'all' | 'articles' | 'new-pages';

export type RecentChangesApiFilter = {
  rcnamespace?: number;
  rctype?: 'edit' | 'new' | 'log' | 'categorize';
};

export const TAB_FILTERS: Record<ChangesTab, RecentChangesApiFilter> = {
  all: {},
  articles: { rcnamespace: 0 },
  'new-pages': { rctype: 'new' },
};

export const TAB_LABELS: Record<ChangesTab, string> = {
  all: 'All',
  articles: 'Articles',
  'new-pages': 'New pages',
};

export const TAB_EMPTY_MESSAGES: Record<ChangesTab, string> = {
  all: 'No recent changes.',
  articles: 'No article changes in this tab.',
  'new-pages': 'No new pages in this tab.',
};
