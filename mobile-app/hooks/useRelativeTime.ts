import { useEffect, useState } from 'react';

import { formatRelativeTime } from '@/lib/utils/format-relative-time';
import { useAppConfig } from '@/providers/AppConfigProvider';

export function useRelativeTime(timestamp: number | null | undefined): string | null {
  const { config } = useAppConfig();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    setNow(Date.now());
    const intervalId = setInterval(() => setNow(Date.now()), config.tickMs);
    return () => clearInterval(intervalId);
  }, [timestamp, config.tickMs]);

  if (!timestamp) {
    return null;
  }

  return formatRelativeTime(timestamp, now);
}
