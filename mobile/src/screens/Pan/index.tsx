import React, { useState, useEffect } from 'react';
import { getAxisModes, getPanState, setPanMode, setPanTarget, subscribeConfig } from './Pan.viewModel';
import { PanView } from './Pan.view';

export function PanScreen() {
  const [state, setState] = useState(() => getPanState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ panMode: c.panMode, panTarget: c.panTarget, tiltTarget: c.tiltTarget });
    });
  }, []);

  const axisModes = getAxisModes();

  return (
    <PanView
      panMode={state.panMode}
      panTarget={state.panTarget}
      tiltTarget={state.tiltTarget}
      axisModes={axisModes}
      onModeSelect={setPanMode}
      onPanTargetChange={setPanTarget}
    />
  );
}
