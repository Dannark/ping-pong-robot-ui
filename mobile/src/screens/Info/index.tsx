import React from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { APP_VERSION } from './Info.viewModel';
import { InfoView } from './Info.view';

type InfoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Info'>;
};

export function InfoScreen({ navigation }: InfoScreenProps) {
  const { t } = useTranslation();
  return <InfoView version={APP_VERSION} caption={t('info.caption')} />;
}
