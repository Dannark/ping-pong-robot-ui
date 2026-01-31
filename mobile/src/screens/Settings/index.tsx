import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SettingsView } from './Settings.view';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  return <SettingsView />;
}
