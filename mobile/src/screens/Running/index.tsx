import React, { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { SPIN_DIRECTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import {
  getRunState,
  subscribeRunState,
  stopRun,
  getElapsedSeconds,
  getLeftSeconds,
} from './Running.viewModel';
import { RunningView } from './Running.view';

const RANDOM_SPIN_INTERVAL_MS = 5000;
const RANDOM_SPIN_POOL: SpinDirection[] = SPIN_DIRECTIONS.filter((d) => d !== 'NONE');

function pickRandomSpin(): SpinDirection {
  return RANDOM_SPIN_POOL[Math.floor(Math.random() * RANDOM_SPIN_POOL.length)];
}

type RunningScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

export function RunningScreen({ navigation }: RunningScreenProps) {
  const [runState, setRunState] = useState(() => getRunState());
  const [, setTick] = useState(0);
  const [currentRandomSpin, setCurrentRandomSpin] = useState<SpinDirection>(() => pickRandomSpin());

  useEffect(() => {
    return subscribeRunState((s) => setRunState(s));
  }, []);

  useEffect(() => {
    if (runState.runStartTime == null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [runState.runStartTime]);

  useEffect(() => {
    if (runState.runConfig?.spinRandom !== true) return;
    setCurrentRandomSpin(pickRandomSpin());
    const id = setInterval(() => setCurrentRandomSpin(pickRandomSpin()), RANDOM_SPIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [runState.runConfig?.spinRandom]);

  const elapsedSeconds = getElapsedSeconds(runState.runStartTime);
  const leftSeconds =
    runState.runConfig != null && runState.runStartTime != null
      ? getLeftSeconds(runState.runStartTime, runState.runConfig.timerIndex)
      : null;

  const displaySpin =
    runState.runConfig?.spinRandom === true ? currentRandomSpin : runState.runConfig?.spinDirection ?? 'NONE';

  const handleStop = useCallback(async () => {
    await stopRun();
    navigation.goBack();
  }, [navigation]);

  return (
    <RunningView
      elapsedSeconds={elapsedSeconds}
      leftSeconds={leftSeconds}
      runConfig={runState.runConfig}
      displaySpin={displaySpin}
      onStop={handleStop}
    />
  );
}
