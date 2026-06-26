const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) {
    return 'just now';
  }

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  const diffMin = Math.floor(diffMs / MINUTE_MS);
  if (diffMin < 60) {
    return diffMin === 1 ? '1m ago' : `${diffMin}m ago`;
  }

  const diffHours = Math.floor(diffMs / HOUR_MS);
  if (diffHours < 24) {
    return diffHours === 1 ? '1h ago' : `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / DAY_MS);
  return diffDays === 1 ? '1d ago' : `${diffDays}d ago`;
}

export function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
