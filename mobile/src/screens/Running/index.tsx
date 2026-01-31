import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import {
  getRunState,
  subscribeRunState,
  stopRun,
  getElapsedSeconds,
  getLeftSeconds,
} from './Running.viewModel';
import { RunningView } from './Running.view';

type RunningScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

export function RunningScreen({ navigation }: RunningScreenProps) {
  const [runState, setRunState] = useState(() => getRunState());
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeRunState((s) => setRunState(s));
  }, []);

  useEffect(() => {
    if (runState.runStartTime == null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [runState.runStartTime]);

  const elapsedSeconds = getElapsedSeconds(runState.runStartTime);
  const leftSeconds =
    runState.runConfig != null && runState.runStartTime != null
      ? getLeftSeconds(runState.runStartTime, runState.runConfig.timerIndex)
      : null;

  const handleStop = useCallback(async () => {
    await stopRun();
    navigation.goBack();
  }, [navigation]);

  return (
    <RunningView
      elapsedSeconds={elapsedSeconds}
      leftSeconds={leftSeconds}
      runConfig={runState.runConfig}
      onStop={handleStop}
    />
  );
}
