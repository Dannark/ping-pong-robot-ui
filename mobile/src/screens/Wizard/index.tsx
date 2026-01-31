import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SPIN_DIRECTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { getWizardItems, subscribeConfig, getConfig } from './Wizard.viewModel';
import { WizardView } from './Wizard.view';

const RANDOM_SPIN_POOL: SpinDirection[] = SPIN_DIRECTIONS.filter((d) => d !== 'NONE');

function pickRandomSpin(): SpinDirection {
  return RANDOM_SPIN_POOL[Math.floor(Math.random() * RANDOM_SPIN_POOL.length)];
}

type WizardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wizard'>;
};

export function WizardScreen({ navigation }: WizardScreenProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState(() => getConfig());
  const [items, setItems] = useState(() => getWizardItems(getConfig(), t));
  const [currentRandomSpin, setCurrentRandomSpin] = useState<SpinDirection>(() => pickRandomSpin());

  useEffect(() => {
    const unsub = subscribeConfig((c) => {
      setConfig(c);
      setItems(getWizardItems(c, t));
    });
    return unsub;
  }, [t]);

  useEffect(() => {
    if (config.spinRandom !== true) return;
    const intervalSec = config.spinRandomIntervalSec ?? 5;
    const intervalMs = Math.max(2000, Math.min(20000, intervalSec * 1000));
    setCurrentRandomSpin(pickRandomSpin());
    const id = setInterval(() => setCurrentRandomSpin(pickRandomSpin()), intervalMs);
    return () => clearInterval(id);
  }, [config.spinRandom, config.spinRandomIntervalSec]);

  const displaySpin = config.spinRandom ? currentRandomSpin : config.spinDirection;

  const handleItemPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const handleStartPress = async () => {
    await RobotConnectionRepository.startRun(config);
    navigation.navigate('Running');
  };

  return (
    <WizardView
      items={items}
      config={config}
      displaySpin={displaySpin}
      onItemPress={handleItemPress}
      onStartPress={handleStartPress}
    />
  );
}
