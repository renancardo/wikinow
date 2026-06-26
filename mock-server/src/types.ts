export type StreamChangeType = 'edit' | 'new' | 'log' | 'categorize';

export type WikiRecentChangeRaw = {
  type: StreamChangeType;
  ns: number;
  title: string;
  rcid: number;
  user: string;
  timestamp: string;
};

export type WikiRecentChangesResponse = {
  batchcomplete?: boolean;
  continue?: {
    rccontinue: string;
    continue: string;
  };
  query?: {
    recentchanges: WikiRecentChangeRaw[];
  };
  error?: {
    code: string;
    info: string;
  };
};

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

export type FixtureEntry = WikiRecentChangeRaw;

export type RecentChangesQuery = {
  rclimit: number;
  rcnamespace?: number;
  rctype?: StreamChangeType;
  rccontinue?: string;
};
