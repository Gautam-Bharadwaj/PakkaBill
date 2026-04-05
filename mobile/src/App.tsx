import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { billoTheme } from './theme';
import { AppNavigator } from './navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={billoTheme}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
