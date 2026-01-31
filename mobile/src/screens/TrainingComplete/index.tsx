import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { TrainingCompleteView } from './TrainingComplete.view';

type TrainingCompleteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TrainingComplete'>;
  route: { params: { elapsedSeconds: number; runConfig: import('../../data/RobotConfig').RobotConfig | null } };
};

export function TrainingCompleteScreen({ navigation, route }: TrainingCompleteScreenProps) {
  const { elapsedSeconds, runConfig } = route.params;

  const handleBackToWizard = () => {
    navigation.pop(1);
  };

  return (
    <TrainingCompleteView
      elapsedSeconds={elapsedSeconds}
      runConfig={runConfig}
      onBackToWizard={handleBackToWizard}
    />
  );
}
