import React, { useState, useEffect } from 'react';
import {
  getFeederModes,
  getFeederState,
  resetFeeder,
  setFeederMode,
  setFeederSpeed,
  setFeederP1OnMs,
  setFeederP1OffMs,
  setFeederP2OnMs,
  setFeederP2OffMs,
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
        feederP1OnMs: c.feederP1OnMs,
        feederP1OffMs: c.feederP1OffMs,
        feederP2OnMs: c.feederP2OnMs,
        feederP2OffMs: c.feederP2OffMs,
      });
    });
  }, []);

  const feederModes = getFeederModes();

  return (
    <FeederView
      feederMode={state.feederMode}
      feederSpeed={state.feederSpeed}
      feederP1OnMs={state.feederP1OnMs}
      feederP1OffMs={state.feederP1OffMs}
      feederP2OnMs={state.feederP2OnMs}
      feederP2OffMs={state.feederP2OffMs}
      feederModes={feederModes}
      onModeSelect={setFeederMode}
      onSpeedChange={setFeederSpeed}
      onP1OnMsChange={setFeederP1OnMs}
      onP1OffMsChange={setFeederP1OffMs}
      onP2OnMsChange={setFeederP2OnMs}
      onP2OffMsChange={setFeederP2OffMs}
      onReset={resetFeeder}
    />
  );
}
