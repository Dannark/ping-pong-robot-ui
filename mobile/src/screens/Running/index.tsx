import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Vibration } from 'react-native';
import type { RootStackParamList } from '../../navigation/RootStack';
import { showTrainingCompleteNotification } from '../../services/localNotification';
import { SPIN_DIRECTIONS, TIMER_OPTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import {
  getRunState,
  subscribeRunState,
  stopRun,
  getElapsedSeconds,
  getLeftSeconds,
  sendLiveAim,
} from './Running.viewModel';
import { RunningView, type LiveAim } from './Running.view';

const RANDOM_SPIN_POOL: SpinDirection[] = SPIN_DIRECTIONS.filter((d) => d !== 'NONE');

function pickRandomSpin(): SpinDirection {
  return RANDOM_SPIN_POOL[Math.floor(Math.random() * RANDOM_SPIN_POOL.length)];
}

type RunningScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

const LIVE_AIM_THROTTLE_MS = 80;

export function RunningScreen({ navigation }: RunningScreenProps) {
  const [runState, setRunState] = useState(() => getRunState());
  const [, setTick] = useState(0);
  const [currentRandomSpin, setCurrentRandomSpin] = useState<SpinDirection>(() => pickRandomSpin());
  const [liveAim, setLiveAim] = useState<LiveAim | null>(null);
  const liveAimLastSendRef = useRef(0);

  useEffect(() => {
    const cfg = runState.runConfig;
    if (cfg?.panMode === 'LIVE' && cfg?.tiltMode === 'LIVE') {
      setLiveAim({ pan: cfg.panTarget, tilt: cfg.tiltTarget });
    } else {
      setLiveAim(null);
    }
  }, [runState.runConfig]);

  const handleLiveAimChange = useCallback((pan: number, tilt: number) => {
    setLiveAim({ pan, tilt });
    const now = Date.now();
    if (now - liveAimLastSendRef.current < LIVE_AIM_THROTTLE_MS) return;
    liveAimLastSendRef.current = now;
    sendLiveAim(pan, tilt).catch(() => {});
  }, []);

  const handleLiveAimRelease = useCallback((pan: number, tilt: number) => {
    sendLiveAim(pan, tilt).catch(() => {});
  }, []);

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
    const intervalSec = runState.runConfig.spinRandomIntervalSec ?? 5;
    const intervalMs = Math.max(2000, Math.min(20000, intervalSec * 1000));
    setCurrentRandomSpin(pickRandomSpin());
    const id = setInterval(() => setCurrentRandomSpin(pickRandomSpin()), intervalMs);
    return () => clearInterval(id);
  }, [runState.runConfig?.spinRandom, runState.runConfig?.spinRandomIntervalSec]);

  const elapsedSeconds = getElapsedSeconds(runState.runStartTime);
  const leftSeconds =
    runState.runConfig != null && runState.runStartTime != null
      ? getLeftSeconds(runState.runStartTime, runState.runConfig.timerIndex)
      : null;

  const timerEndFiredRef = useRef(false);

  useEffect(() => {
    if (leftSeconds !== 0 || runState.runConfig == null || runState.runStartTime == null) return;
    if (runState.runConfig.timerIndex === 0) return;
    if (timerEndFiredRef.current) return;
    timerEndFiredRef.current = true;
    if (runState.runConfig.timerSoundAlert) {
      Vibration.vibrate([0, 500, 200, 500]);
      showTrainingCompleteNotification();
    }
    const elapsed = getElapsedSeconds(runState.runStartTime);
    stopRun().then(() =>
      navigation.replace('TrainingComplete', { elapsedSeconds: elapsed, runConfig: runState.runConfig })
    );
  }, [leftSeconds, runState.runConfig, runState.runStartTime, navigation]);

  const displaySpin =
    runState.runConfig?.spinRandom === true ? currentRandomSpin : runState.runConfig?.spinDirection ?? 'NONE';

  const timerLabel =
    runState.runConfig != null ? TIMER_OPTIONS[runState.runConfig.timerIndex] ?? 'OFF' : 'OFF';

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
      spinRandom={runState.runConfig?.spinRandom ?? false}
      timerLabel={timerLabel}
      onStop={handleStop}
      liveAim={liveAim}
      onLiveAimChange={handleLiveAimChange}
      onLiveAimRelease={handleLiveAimRelease}
    />
  );
}
