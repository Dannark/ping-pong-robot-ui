import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SettingsMotorTestView } from './SettingsMotorTest.view';

type SettingsMotorTestScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SettingsMotorTest'>;
  route: { params: { motorIndex: 1 | 2 | 3 | 4 } };
};

export function SettingsMotorTestScreen({ navigation, route }: SettingsMotorTestScreenProps) {
  const { motorIndex } = route.params;
  const [speed, setSpeed] = useState(0);

  return (
    <SettingsMotorTestView
      motorIndex={motorIndex}
      speed={speed}
      onSpeedChange={setSpeed}
    />
  );
}
