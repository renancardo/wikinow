export type StreamChangeType = 'edit' | 'new' | 'log' | 'categorize';

export type StreamRecentChangeEvent = {
  meta: { domain: string; uri?: string };
  wiki: string;
  type: StreamChangeType;
  namespace: number;
  title: string;
  title_url: string;
  user: string;
  timestamp: number;
  id: number;
};
