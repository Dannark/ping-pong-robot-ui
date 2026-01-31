import React, { useState, useEffect } from 'react';
import { getAxisModes, getTiltState, resetTilt, setTiltMode, setTiltTarget, subscribeConfig } from './Tilt.viewModel';
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
        panAuto1Speed: c.panAuto1Speed,
        panAuto2Step: c.panAuto2Step,
        tiltAuto1Speed: c.tiltAuto1Speed,
        tiltAuto2Step: c.tiltAuto2Step,
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
      panAuto1Speed={state.panAuto1Speed}
      panAuto2Step={state.panAuto2Step}
      tiltAuto1Speed={state.tiltAuto1Speed}
      tiltAuto2Step={state.tiltAuto2Step}
      axisModes={axisModes}
      onModeSelect={setTiltMode}
      onTiltTargetChange={setTiltTarget}
      onReset={resetTilt}
    />
  );
}
