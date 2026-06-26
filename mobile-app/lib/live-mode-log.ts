import { getAppConfig } from '@/lib/app-config-store';

const LOG_PREFIX = '[WikiNow:Live]';

export function liveLog(message: string, detail?: unknown) {
  if (!getAppConfig().liveLogEnabled) {
    return;
  }

  if (detail !== undefined) {
    console.log(LOG_PREFIX, message, detail);
  } else {
    console.log(LOG_PREFIX, message);
  }
}
