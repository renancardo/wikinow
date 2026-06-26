export type ChangeType = 'edit' | 'new' | 'log';

export type RecentChange = {
  rcid: number;
  title: string;
  user: string;
  type: ChangeType;
  namespace: number;
  timestamp: string;
  pageUrl: string;
};
