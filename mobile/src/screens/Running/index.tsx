import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { getElapsedSeconds } from './Running.viewModel';
import { RunningView } from './Running.view';

type RunningScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

export function RunningScreen({ navigation }: RunningScreenProps) {
  const elapsedSeconds = getElapsedSeconds();

  const handleStop = () => {
    navigation.goBack();
  };

  return <RunningView elapsedSeconds={elapsedSeconds} onStop={handleStop} />;
}
