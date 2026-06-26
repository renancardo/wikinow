import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  return onlineManager.subscribe(callback);
}

function getSnapshot() {
  return onlineManager.isOnline();
}

function getServerSnapshot() {
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
