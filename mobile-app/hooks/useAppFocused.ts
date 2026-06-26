import { useSyncExternalStore } from 'react';
import { focusManager } from '@tanstack/react-query';

function subscribe(callback: () => void) {
  return focusManager.subscribe(callback);
}

function getSnapshot() {
  return focusManager.isFocused();
}

function getServerSnapshot() {
  return true;
}

export function useAppFocused() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
