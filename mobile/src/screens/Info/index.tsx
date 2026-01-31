import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { APP_VERSION, APP_CAPTION } from './Info.viewModel';
import { InfoView } from './Info.view';

type InfoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Info'>;
};

export function InfoScreen({ navigation }: InfoScreenProps) {
  return <InfoView version={APP_VERSION} caption={APP_CAPTION} />;
}
