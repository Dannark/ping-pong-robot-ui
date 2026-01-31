import React, { useState, useEffect } from 'react';
import {
  getAxisModes,
  getPanState,
  resetPan,
  setPanMode,
  setPanTarget,
  setPanMin,
  setPanMax,
  setPanAuto1Speed,
  setPanAuto2Step,
  setPanAuto2PauseMs,
  setPanAuto3MinDist,
  setPanAuto3PauseMs,
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
        panAuto2PauseMs: c.panAuto2PauseMs,
        tiltAuto1Speed: c.tiltAuto1Speed,
        tiltAuto2Step: c.tiltAuto2Step,
        tiltAuto2PauseMs: c.tiltAuto2PauseMs,
        panAuto3MinDist: c.panAuto3MinDist,
        panAuto3PauseMs: c.panAuto3PauseMs,
        tiltAuto3MinDist: c.tiltAuto3MinDist,
        tiltAuto3PauseMs: c.tiltAuto3PauseMs,
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
      panAuto2PauseMs={state.panAuto2PauseMs}
      tiltAuto1Speed={state.tiltAuto1Speed}
      tiltAuto2Step={state.tiltAuto2Step}
      tiltAuto2PauseMs={state.tiltAuto2PauseMs}
      panAuto3MinDist={state.panAuto3MinDist}
      panAuto3PauseMs={state.panAuto3PauseMs}
      tiltAuto3MinDist={state.tiltAuto3MinDist}
      tiltAuto3PauseMs={state.tiltAuto3PauseMs}
      axisModes={axisModes}
      onModeSelect={setPanMode}
      onPanTargetChange={setPanTarget}
      onPanMinChange={setPanMin}
      onPanMaxChange={setPanMax}
      onPanAuto1SpeedChange={setPanAuto1Speed}
      onPanAuto2StepChange={setPanAuto2Step}
      onPanAuto2PauseMsChange={setPanAuto2PauseMs}
      onPanAuto3MinDistChange={setPanAuto3MinDist}
      onPanAuto3PauseMsChange={setPanAuto3PauseMs}
      onReset={resetPan}
    />
  );
}
