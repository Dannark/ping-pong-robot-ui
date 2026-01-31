import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import {
  getServoPanLimits,
  setServoPanLimits,
  subscribeServoPan,
  getDefaultServoPan,
} from '../../data/HardwareSettingsRepository';
import { SettingsServoPanView } from './SettingsServoPan.view';

type SettingsServoPanScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsServoPan'>;
};

export function SettingsServoPanScreen({ navigation }: SettingsServoPanScreenProps) {
  const [limits, setLimits] = useState({ min: 15, mid: 70, max: 125 });

  const load = useCallback(async () => {
    const l = await getServoPanLimits();
    setLimits(l);
  }, []);

  useEffect(() => {
    load();
    return subscribeServoPan(load);
  }, [load]);

  const handleMinChange = useCallback(async (v: number) => {
    const next = { ...limits, min: Math.round(v) };
    setLimits(next);
    await setServoPanLimits(next);
  }, [limits]);

  const handleMidChange = useCallback(async (v: number) => {
    const next = { ...limits, mid: Math.round(v) };
    setLimits(next);
    await setServoPanLimits(next);
  }, [limits]);

  const handleMaxChange = useCallback(async (v: number) => {
    const next = { ...limits, max: Math.round(v) };
    setLimits(next);
    await setServoPanLimits(next);
  }, [limits]);

  const handleReset = useCallback(async () => {
    const def = getDefaultServoPan();
    setLimits(def);
    await setServoPanLimits(def);
  }, []);

  return (
    <SettingsServoPanView
      limits={limits}
      onMinChange={handleMinChange}
      onMidChange={handleMidChange}
      onMaxChange={handleMaxChange}
      onReset={handleReset}
    />
  );
}
