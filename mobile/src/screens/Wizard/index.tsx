import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SPIN_DIRECTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';
import { PresetsRepository } from '../../data/PresetsRepository';
import { getBLETargetDevice } from '../../data/BLERobotConnectionDataSource';
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
  const [connectionState, setConnectionState] = useState(() =>
    RobotConnectionRepository.getDataSource().getConnectionState()
  );
  const [showDisconnectedToast, setShowDisconnectedToast] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const prevStatusRef = useRef(connectionState.status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = connectionState.status;
    if (prev === 'connected' && connectionState.status !== 'connected') {
      setShowDisconnectedToast(true);
      const t = setTimeout(() => setShowDisconnectedToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [connectionState.status]);

  useEffect(() => {
    if (connectionState.status !== 'disconnected') return;
    const target = getBLETargetDevice();
    if (!target) return;
    const id = setInterval(() => {
      RobotConnectionRepository.getDataSource().connect().catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [connectionState.status]);

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
    const unsub = RobotConnectionRepository.getDataSource().subscribeConnectionState(setConnectionState);
    return unsub;
  }, []);

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
    setIsStarting(true);
    try {
      await RobotConnectionRepository.startRun(config);
      navigation.navigate('Running');
    } catch {
      Alert.alert(t('wizard.startFailedTitle'), t('wizard.startFailedMessage'));
    } finally {
      setIsStarting(false);
    }
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
      {showDisconnectedToast ? (
        <View style={toastStyles.toast}>
          <Text style={toastStyles.toastText}>{t('wizard.robotDisconnectedToast')}</Text>
        </View>
      ) : null}
      <WizardView
        items={items}
        config={config}
        displaySpin={displaySpin}
        connectionStatus={connectionState.status}
        willTryReconnect={
          connectionState.status === 'disconnected' && getBLETargetDevice() !== null
        }
        onItemPress={handleItemPress}
        onStartPress={handleStartPress}
        isStarting={isStarting}
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

const toastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: theme.colors.surfaceOverlay,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toastText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
