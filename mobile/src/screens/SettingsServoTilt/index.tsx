import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import {
  getServoTiltLimits,
  setServoTiltLimits,
  subscribeServoTilt,
  getDefaultServoTilt,
} from '../../data/HardwareSettingsRepository';
import { SettingsServoTiltView } from './SettingsServoTilt.view';

type SettingsServoTiltScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsServoTilt'>;
};

export function SettingsServoTiltScreen({ navigation }: SettingsServoTiltScreenProps) {
  const [limits, setLimits] = useState({ min: 45, mid: 100, max: 120 });

  const load = useCallback(async () => {
    const l = await getServoTiltLimits();
    setLimits(l);
  }, []);

  useEffect(() => {
    load();
    return subscribeServoTilt(load);
  }, [load]);

  const handleMinChange = useCallback(async (v: number) => {
    const next = { ...limits, min: Math.round(v) };
    setLimits(next);
    await setServoTiltLimits(next);
  }, [limits]);

  const handleMidChange = useCallback(async (v: number) => {
    const next = { ...limits, mid: Math.round(v) };
    setLimits(next);
    await setServoTiltLimits(next);
  }, [limits]);

  const handleMaxChange = useCallback(async (v: number) => {
    const next = { ...limits, max: Math.round(v) };
    setLimits(next);
    await setServoTiltLimits(next);
  }, [limits]);

  const handleReset = useCallback(async () => {
    const def = getDefaultServoTilt();
    setLimits(def);
    await setServoTiltLimits(def);
  }, []);

  return (
    <SettingsServoTiltView
      limits={limits}
      onMinChange={handleMinChange}
      onMidChange={handleMidChange}
      onMaxChange={handleMaxChange}
      onReset={handleReset}
    />
  );
}
