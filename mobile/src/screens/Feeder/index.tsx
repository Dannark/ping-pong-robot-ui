import React, { useState, useEffect } from 'react';
import {
  getFeederModes,
  getFeederState,
  resetFeeder,
  setFeederMode,
  setFeederSpeed,
  setFeederCustomOnMs,
  setFeederCustomOffMs,
  subscribeConfig,
} from './Feeder.viewModel';
import { FeederView } from './Feeder.view';

export function FeederScreen() {
  const [state, setState] = useState(() => getFeederState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({
        feederMode: c.feederMode,
        feederSpeed: c.feederSpeed,
        feederCustomOnMs: c.feederCustomOnMs,
        feederCustomOffMs: c.feederCustomOffMs,
      });
    });
  }, []);

  const feederModes = getFeederModes();

  return (
    <FeederView
      feederMode={state.feederMode}
      feederSpeed={state.feederSpeed}
      feederCustomOnMs={state.feederCustomOnMs}
      feederCustomOffMs={state.feederCustomOffMs}
      feederModes={feederModes}
      onModeSelect={setFeederMode}
      onSpeedChange={setFeederSpeed}
      onCustomOnMsChange={setFeederCustomOnMs}
      onCustomOffMsChange={setFeederCustomOffMs}
      onReset={resetFeeder}
    />
  );
}
