import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAxisModes,
  getTiltState,
  resetTilt,
  setTiltMode,
  setTiltTarget,
  flushTiltLiveSend,
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
  const [liveSliderKey, setLiveSliderKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setLiveSliderKey((k) => k + 1);
    }, [])
  );

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
        panRandomMinDist: c.panRandomMinDist,
        panRandomPauseMs: c.panRandomPauseMs,
        tiltRandomMinDist: c.tiltRandomMinDist,
        tiltRandomPauseMs: c.tiltRandomPauseMs,
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
      panRandomMinDist={state.panRandomMinDist}
      panRandomPauseMs={state.panRandomPauseMs}
      tiltRandomMinDist={state.tiltRandomMinDist}
      tiltRandomPauseMs={state.tiltRandomPauseMs}
      axisModes={axisModes}
      onModeSelect={setTiltMode}
      onTiltTargetChange={setTiltTarget}
      onTiltSlidingComplete={flushTiltLiveSend}
      liveSliderKey={liveSliderKey}
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
