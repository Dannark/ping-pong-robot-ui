/**
 * Ping Pong Robot – App
 * Navegação e telas alinhadas ao display TFT do robô.
 */

import './src/i18n';

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './src/navigation/RootStack';
import { theme } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <RootStack />
    </SafeAreaProvider>
  );
}

export default App;
