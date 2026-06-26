export type FeedFreshnessSource = 'api' | 'stream' | 'cache';

export type FeedFreshness = {
  /** Unix ms timestamp of the last feed update (API poll, stream event, or cache hydrate). */
  lastUpdatedAt: number | null;
  source: FeedFreshnessSource;
};

export function createFeedFreshness(
  lastUpdatedAt: number | null | undefined,
  source: FeedFreshnessSource = 'api',
): FeedFreshness {
  return {
    lastUpdatedAt: lastUpdatedAt && lastUpdatedAt > 0 ? lastUpdatedAt : null,
    source,
  };
}

/**
 * When live stream is enabled, prefer the most recent timestamp across sources.
 */
export function mergeFeedFreshness(
  current: FeedFreshness,
  incoming: FeedFreshness,
): FeedFreshness {
  if (!incoming.lastUpdatedAt) {
    return current;
  }

  if (!current.lastUpdatedAt || incoming.lastUpdatedAt >= current.lastUpdatedAt) {
    return incoming;
  }

  return current;
}
