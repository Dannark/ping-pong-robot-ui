import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SettingsView } from './Settings.view';
import type { HardwareItem } from './Settings.view';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const handleHardwareItemPress = (item: HardwareItem) => {
    if (item.screen === 'SettingsMotorTest') {
      navigation.navigate('SettingsMotorTest', { motorIndex: item.motorIndex });
    } else {
      navigation.navigate(item.screen);
    }
  };

  return <SettingsView onHardwareItemPress={handleHardwareItemPress} />;
}
