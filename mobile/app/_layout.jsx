import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import paperTheme from '../src/theme/theme';
import useAuthStore from '../src/store/useAuthStore';
import useAppUpdate from '../src/hooks/useAppUpdate';
import UpdatePrompt from '../src/components/update/UpdatePrompt';
import { initDB } from '../src/utils/offline';
import useInvoiceStore from '../src/store/useInvoiceStore';
import NetInfo from '@react-native-community/netinfo';
import { useState } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();
  const { updateAvailable, applyUpdate } = useAppUpdate();
  const { syncOfflineData } = useInvoiceStore();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const start = async () => {
      await initDB();
      await loadFromStorage();
    };
    start();

    // Sync when network becomes available
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (updateAvailable) setShowUpdate(true);
  }, [updateAvailable]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <PaperProvider theme={paperTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <UpdatePrompt
            visible={showUpdate}
            onUpdate={applyUpdate}
            onLater={() => setShowUpdate(false)}
          />
          <FlashMessage position="top" />
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
