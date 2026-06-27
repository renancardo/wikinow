import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DetailScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const goBackInWebView = useCallback(() => {
    if (!canGoBackRef.current) {
      return false;
    }
    webViewRef.current?.goBack();
    return true;
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
  }, []);

  useEffect(() => {
    canGoBackRef.current = false;
  }, [retryKey, url]);

  // Android hardware back: prefer WebView history before leaving the screen.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', goBackInWebView);
    return () => subscription.remove();
  }, [goBackInWebView]);

  // Header back and iOS swipe-back: same WebView-first behavior.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!canGoBackRef.current) {
        return;
      }

      event.preventDefault();
      webViewRef.current?.goBack();
    });

    return unsubscribe;
  }, [navigation]);

  if (!url) {
    return (
      <View style={styles.centered}>
        <Text>No page URL provided.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load page</Text>
        <Text style={styles.errorMessage}>{title ?? url}</Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: tint }]}
          onPress={() => {
            setError(false);
            setLoading(true);
            setRetryKey((key) => key + 1);
          }}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      )}
      <WebView
        key={retryKey}
        ref={webViewRef}
        style={styles.webView}
        source={{ uri: url }}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        contentInsetAdjustmentBehavior="never"
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        onHttpError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
