import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { getWizardItems, subscribeConfig, getConfig } from './Wizard.viewModel';
import { WizardView } from './Wizard.view';

type WizardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wizard'>;
};

export function WizardScreen({ navigation }: WizardScreenProps) {
  const [config, setConfig] = useState(() => getConfig());
  const [items, setItems] = useState(() => getWizardItems(getConfig()));

  useEffect(() => {
    const unsub = subscribeConfig((c) => {
      setConfig(c);
      setItems(getWizardItems(c));
    });
    return unsub;
  }, []);

  const handleItemPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const handleStartPress = () => {
    navigation.navigate('Running');
  };

  return (
    <WizardView
      items={items}
      config={config}
      onItemPress={handleItemPress}
      onStartPress={handleStartPress}
    />
  );
}
