import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLiveMode } from '@/providers/LiveModeProvider';

export default function LiveToggle() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const isOnline = useOnlineStatus();
  const {
    isLiveEnabled,
    toggleLive,
    streamActive,
    isStreamConnected,
    isStreamConnecting,
    isStreamError,
  } = useLiveMode();

  const disabled = !isOnline;
  const isOn = isLiveEnabled && isOnline;

  let label = 'Live';
  if (isOn && isStreamError) {
    label = 'Live · error';
  } else if (isOn && isStreamConnected) {
    label = 'Live · on';
  } else if (isOn && isStreamConnecting) {
    label = 'Live · connecting';
  } else if (isOn && !streamActive) {
    label = 'Live · paused';
  } else if (isOn) {
    label = 'Live · starting';
  }

  return (
    <Pressable
      onPress={toggleLive}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isOn ? { backgroundColor: tint } : styles.buttonOff,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn, disabled }}
      accessibilityLabel="Live updates">
      <Text
        style={styles.label}
        lightColor={isOn ? '#fff' : undefined}
        darkColor={isOn ? '#000' : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  buttonOff: {
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
