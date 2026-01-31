import React, { useState, useEffect } from 'react';
import {
  getFeederModes,
  getFeederState,
  resetFeeder,
  setFeederMode,
  setFeederSpeed,
  subscribeConfig,
} from './Feeder.viewModel';
import { FeederView } from './Feeder.view';

export function FeederScreen() {
  const [state, setState] = useState(() => getFeederState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ feederMode: c.feederMode, feederSpeed: c.feederSpeed });
    });
  }, []);

  const feederModes = getFeederModes();

  return (
    <FeederView
      feederMode={state.feederMode}
      feederSpeed={state.feederSpeed}
      feederModes={feederModes}
      onModeSelect={setFeederMode}
      onSpeedChange={setFeederSpeed}
      onReset={resetFeeder}
    />
  );
}
