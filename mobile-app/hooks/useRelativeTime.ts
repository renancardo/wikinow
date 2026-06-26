import { useEffect, useState } from 'react';

import { formatRelativeTime } from '@/lib/format-relative-time';

const TICK_MS = 10_000;

export function useRelativeTime(timestamp: number | null | undefined): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    setNow(Date.now());
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(intervalId);
  }, [timestamp]);

  if (!timestamp) {
    return null;
  }

  return formatRelativeTime(timestamp, now);
}
