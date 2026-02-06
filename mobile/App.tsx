/**
 * SpinBot – App
 * Navegação e telas alinhadas ao display TFT do robô.
 */

import './src/i18n';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initStoredLanguage } from './src/i18n';
import { initBleManager } from './src/data/BLERobotConnectionDataSource';
import { RootStack } from './src/navigation/RootStack';
import { theme } from './src/theme';

function App() {
  useEffect(() => {
    initStoredLanguage();
    initBleManager();
  }, []);

  return (
    <SafeAreaProvider>
      <KeepAwake />
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <RootStack />
    </SafeAreaProvider>
  );
}

export default App;
