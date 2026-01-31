import React, { useState, useEffect } from 'react';
import {
  getAxisModes,
  getTiltState,
  resetTilt,
  setTiltMode,
  setTiltTarget,
  setTiltMin,
  setTiltMax,
  setTiltAuto1Speed,
  setTiltAuto2Step,
  setTiltAuto2PauseMs,
  setTiltAuto3MinDist,
  setTiltAuto3PauseMs,
  subscribeConfig,
} from './Tilt.viewModel';
import { TiltView } from './Tilt.view';

export function TiltScreen() {
  const [state, setState] = useState(() => getTiltState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        tiltMode: c.tiltMode,
        panTarget: c.panTarget,
        tiltTarget: c.tiltTarget,
        panMode: c.panMode,
        panMin: c.panMin,
        panMax: c.panMax,
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
    <TiltView
      tiltMode={state.tiltMode}
      panTarget={state.panTarget}
      tiltTarget={state.tiltTarget}
      panMode={state.panMode}
      panMin={state.panMin}
      panMax={state.panMax}
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
      onModeSelect={setTiltMode}
      onTiltTargetChange={setTiltTarget}
      onTiltMinChange={setTiltMin}
      onTiltMaxChange={setTiltMax}
      onTiltAuto1SpeedChange={setTiltAuto1Speed}
      onTiltAuto2StepChange={setTiltAuto2Step}
      onTiltAuto2PauseMsChange={setTiltAuto2PauseMs}
      onTiltAuto3MinDistChange={setTiltAuto3MinDist}
      onTiltAuto3PauseMsChange={setTiltAuto3PauseMs}
      onReset={resetTilt}
    />
  );
}
