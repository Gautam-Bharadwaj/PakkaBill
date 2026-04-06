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
import { useState } from 'react';

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();
  const { updateAvailable, applyUpdate } = useAppUpdate();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (updateAvailable) setShowUpdate(true);
  }, [updateAvailable]);

  return (
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
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
