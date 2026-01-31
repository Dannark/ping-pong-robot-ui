import React, { useState, useEffect } from 'react';
import {
  getAxisModes,
  getPanState,
  resetPan,
  setPanMode,
  setPanTarget,
  setPanMin,
  setPanMax,
  setPanAuto2Step,
  subscribeConfig,
} from './Pan.viewModel';
import { PanView } from './Pan.view';

export function PanScreen() {
  const [state, setState] = useState(() => getPanState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        panMode: c.panMode,
        panTarget: c.panTarget,
        panMin: c.panMin,
        panMax: c.panMax,
        tiltTarget: c.tiltTarget,
        tiltMode: c.tiltMode,
        tiltMin: c.tiltMin,
        tiltMax: c.tiltMax,
        panAuto1Speed: c.panAuto1Speed,
        panAuto2Step: c.panAuto2Step,
        tiltAuto1Speed: c.tiltAuto1Speed,
        tiltAuto2Step: c.tiltAuto2Step,
      });
    });
  }, []);

  const axisModes = getAxisModes();

  return (
    <PanView
      panMode={state.panMode}
      panTarget={state.panTarget}
      panMin={state.panMin}
      panMax={state.panMax}
      tiltTarget={state.tiltTarget}
      tiltMode={state.tiltMode}
      tiltMin={state.tiltMin}
      tiltMax={state.tiltMax}
      panAuto1Speed={state.panAuto1Speed}
      panAuto2Step={state.panAuto2Step}
      tiltAuto1Speed={state.tiltAuto1Speed}
      tiltAuto2Step={state.tiltAuto2Step}
      axisModes={axisModes}
      onModeSelect={setPanMode}
      onPanTargetChange={setPanTarget}
      onPanMinChange={setPanMin}
      onPanMaxChange={setPanMax}
      onPanAuto2StepChange={setPanAuto2Step}
      onReset={resetPan}
    />
  );
}
