import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { setBLETargetDevice } from '../../data/BLERobotConnectionDataSource';
import { SettingsView } from './Settings.view';
import type { HardwareItem } from './Settings.view';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [connectionState, setConnectionState] = useState(() =>
    RobotConnectionRepository.getDataSource().getConnectionState()
  );

  useEffect(() => {
    const unsub = RobotConnectionRepository.getDataSource().subscribeConnectionState(
      (state) => setConnectionState(state)
    );
    return unsub;
  }, []);

  const handleDisconnect = useCallback(async () => {
    await RobotConnectionRepository.getDataSource().disconnect();
    setBLETargetDevice(null);
  }, []);

  const handleHardwareItemPress = (item: HardwareItem) => {
    if (item.screen === 'SettingsMotorTest') {
      navigation.navigate('SettingsMotorTest', { motorIndex: item.motorIndex });
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SettingsView
      onHardwareItemPress={handleHardwareItemPress}
      isConnected={connectionState.status === 'connected'}
      connectedDeviceName={connectionState.deviceName ?? null}
      onDisconnect={handleDisconnect}
    />
  );
}
