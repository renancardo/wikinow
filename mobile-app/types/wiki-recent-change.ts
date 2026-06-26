import type { RecentChange } from '@/types/recent-change';
import type { StreamChangeType } from '@/types/stream-recent-change';

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

export type RecentChangesPage = {
  changes: RecentChange[];
  nextCursor?: string;
};
