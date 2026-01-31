import React, { useState, useEffect } from 'react';
import { getAxisModes, getPanState, resetPan, setPanMode, setPanTarget, subscribeConfig } from './Pan.viewModel';
import { PanView } from './Pan.view';

export function PanScreen() {
  const [state, setState] = useState(() => getPanState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        panMode: c.panMode,
        panTarget: c.panTarget,
        tiltTarget: c.tiltTarget,
        tiltMode: c.tiltMode,
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
      tiltTarget={state.tiltTarget}
      tiltMode={state.tiltMode}
      panAuto1Speed={state.panAuto1Speed}
      panAuto2Step={state.panAuto2Step}
      tiltAuto1Speed={state.tiltAuto1Speed}
      tiltAuto2Step={state.tiltAuto2Step}
      axisModes={axisModes}
      onModeSelect={setPanMode}
      onPanTargetChange={setPanTarget}
      onReset={resetPan}
    />
  );
}
