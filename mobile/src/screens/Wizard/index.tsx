import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SPIN_DIRECTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';
import { PresetsRepository } from '../../data/PresetsRepository';
import { getWizardItems, subscribeConfig, getConfig } from './Wizard.viewModel';
import { WizardView } from './Wizard.view';
import { WizardMenuModal } from './WizardMenuModal';
import { SavePresetModal } from './SavePresetModal';
import { PresetsListModal } from './PresetsListModal';
import { theme } from '../../theme';

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ padding: theme.spacing.xs }}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

  const handleSavePreset = useCallback(async (name: string) => {
    await PresetsRepository.save(config, name);
    setSaveModalVisible(false);
  }, [config]);

  const handleLoadPreset = useCallback((preset: { config: typeof config }) => {
    RobotConfigRepository.setConfig(preset.config);
    setListModalVisible(false);
  }, []);

  return (
    <>
      <WizardView
        items={items}
        config={config}
        displaySpin={displaySpin}
        onItemPress={handleItemPress}
        onStartPress={handleStartPress}
      />

      <WizardMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSaveAsPreset={() => setSaveModalVisible(true)}
        onManagePresets={() => setListModalVisible(true)}
      />

      <SavePresetModal
        visible={saveModalVisible}
        onSave={handleSavePreset}
        onCancel={() => setSaveModalVisible(false)}
      />

      <PresetsListModal
        visible={listModalVisible}
        currentConfigSnapshot={config}
        onLoad={handleLoadPreset}
        onClose={() => setListModalVisible(false)}
      />
    </>
  );
}
