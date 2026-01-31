import React, { useState, useEffect } from 'react';
import { getAxisModes, getTiltState, setTiltMode, setTiltTarget, subscribeConfig } from './Tilt.viewModel';
import { TiltView } from './Tilt.view';

export function TiltScreen() {
  const [state, setState] = useState(() => getTiltState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ tiltMode: c.tiltMode, panTarget: c.panTarget, tiltTarget: c.tiltTarget });
    });
  }, []);

  const axisModes = getAxisModes();

  return (
    <TiltView
      tiltMode={state.tiltMode}
      panTarget={state.panTarget}
      tiltTarget={state.tiltTarget}
      axisModes={axisModes}
      onModeSelect={setTiltMode}
      onTiltTargetChange={setTiltTarget}
    />
  );
}
