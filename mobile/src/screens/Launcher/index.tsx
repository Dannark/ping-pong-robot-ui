import React, { useState, useEffect } from 'react';
import {
  getLauncherState,
  resetLauncher,
  setLauncherPower,
  setSpinDirection,
  setSpinIntensity,
  setSpinRandom,
  subscribeConfig,
} from './Launcher.viewModel';
import { LauncherView } from './Launcher.view';

export function LauncherScreen() {
  const [state, setState] = useState(() => getLauncherState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        launcherPower: c.launcherPower,
        spinDirection: c.spinDirection,
        spinIntensity: c.spinIntensity,
        spinRandom: c.spinRandom,
      });
    });
  }, []);

  return (
    <LauncherView
      launcherPower={state.launcherPower}
      spinDirection={state.spinDirection}
      spinIntensity={state.spinIntensity}
      spinRandom={state.spinRandom}
      onPowerChange={setLauncherPower}
      onSpinDirectionChange={setSpinDirection}
      onSpinIntensityChange={setSpinIntensity}
      onSpinRandomChange={setSpinRandom}
      onReset={resetLauncher}
    />
  );
}
