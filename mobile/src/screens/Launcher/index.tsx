import React, { useState, useEffect } from 'react';
import {
  getLauncherState,
  resetLauncher,
  setLauncherPower,
  setSpinDirection,
  setSpinIntensity,
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
      });
    });
  }, []);

  return (
    <LauncherView
      launcherPower={state.launcherPower}
      spinDirection={state.spinDirection}
      spinIntensity={state.spinIntensity}
      onPowerChange={setLauncherPower}
      onSpinDirectionChange={setSpinDirection}
      onSpinIntensityChange={setSpinIntensity}
      onReset={resetLauncher}
    />
  );
}
