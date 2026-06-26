import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLiveMode } from '@/providers/LiveModeProvider';

export default function LiveToggle() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const isOnline = useOnlineStatus();
  const {
    isLiveEnabled,
    toggleLive,
    isStreamConnected,
    isStreamConnecting,
    isStreamError,
  } = useLiveMode();

  const disabled = !isOnline;
  const isOn = isLiveEnabled && isOnline;
  const isConnected = isOn && isStreamConnected;

  let statusSuffix = '';
  if (disabled) {
    statusSuffix = ' · Offline';
  } else if (isOn && isStreamError) {
    statusSuffix = ' · Error';
  } else if (isOn && (isStreamConnecting || !isStreamConnected)) {
    statusSuffix = ' · …';
  }

  const foreground = isOn ? '#ffffff' : palette.tint;
  const background = isOn ? palette.live : palette.background;
  const borderColor = isOn ? palette.live : palette.tint;

  return (
    <Pressable
      onPress={toggleLive}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn, disabled }}
      accessibilityLabel="Live updates"
      accessibilityHint="Turns real-time Wikipedia change streaming on or off"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
        },
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        isConnected && styles.buttonLive,
      ]}>
      <FontAwesome name="rss" size={13} color={foreground} />
      <Text style={[styles.label, { color: foreground }]}>
        Live{statusSuffix}
      </Text>
      {isConnected ? <View style={styles.liveIndicator} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  buttonLive: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: '#94a3b8',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    opacity: 0.95,
  },
});
