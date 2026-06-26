import { focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';

let initialized = false;

export function setupQueryManagers() {
  if (initialized) {
    return;
  }
  initialized = true;

  focusManager.setEventListener((handleFocus) => {
    handleFocus(AppState.currentState === 'active');

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      handleFocus(state === 'active');
    });

    return () => subscription.remove();
  });

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
  });
}
