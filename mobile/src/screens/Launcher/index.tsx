import React, { useState, useEffect } from 'react';
import { SPIN_DIRECTIONS } from '../../data/RobotConfig';
import type { SpinDirection } from '../../data/RobotConfig';
import {
  getLauncherState,
  resetLauncher,
  setLauncherPower,
  setSpinDirection,
  setSpinIntensity,
  setSpinRandom,
  setSpinRandomIntervalSec,
  subscribeConfig,
} from './Launcher.viewModel';
import { LauncherView } from './Launcher.view';

const RANDOM_SPIN_POOL: SpinDirection[] = SPIN_DIRECTIONS.filter((d) => d !== 'NONE');

function pickRandomSpin(): SpinDirection {
  return RANDOM_SPIN_POOL[Math.floor(Math.random() * RANDOM_SPIN_POOL.length)];
}

export function LauncherScreen() {
  const [state, setState] = useState(() => getLauncherState());
  const [currentRandomSpin, setCurrentRandomSpin] = useState<SpinDirection>(() => pickRandomSpin());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        launcherPower: c.launcherPower,
        spinDirection: c.spinDirection,
        spinIntensity: c.spinIntensity,
        spinRandom: c.spinRandom,
        spinRandomIntervalSec: c.spinRandomIntervalSec,
      });
    });
  }, []);

  useEffect(() => {
    if (state.spinRandom !== true) return;
    const intervalMs = Math.max(2000, Math.min(20000, state.spinRandomIntervalSec * 1000));
    setCurrentRandomSpin(pickRandomSpin());
    const id = setInterval(() => setCurrentRandomSpin(pickRandomSpin()), intervalMs);
    return () => clearInterval(id);
  }, [state.spinRandom, state.spinRandomIntervalSec]);

  const displaySpin = state.spinRandom ? currentRandomSpin : state.spinDirection;

  return (
    <LauncherView
      launcherPower={state.launcherPower}
      spinDirection={state.spinDirection}
      spinIntensity={state.spinIntensity}
      spinRandom={state.spinRandom}
      spinRandomIntervalSec={state.spinRandomIntervalSec}
      displaySpin={displaySpin}
      onPowerChange={setLauncherPower}
      onSpinDirectionChange={setSpinDirection}
      onSpinIntensityChange={setSpinIntensity}
      onSpinRandomChange={setSpinRandom}
      onSpinRandomIntervalSecChange={setSpinRandomIntervalSec}
      onReset={resetLauncher}
    />
  );
}
