import React, { useState, useEffect } from 'react';
import {
  getTimerOptions,
  getTimerState,
  resetTimer,
  setTimerIndex,
  setTimerSoundAlert,
  subscribeConfig,
} from './Timer.viewModel';
import { TimerView } from './Timer.view';

export function TimerScreen() {
  const [state, setState] = useState(() => getTimerState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ timerIndex: c.timerIndex, timerSoundAlert: c.timerSoundAlert });
    });
  }, []);

  const options = getTimerOptions();

  return (
    <TimerView
      timerIndex={state.timerIndex}
      timerSoundAlert={state.timerSoundAlert}
      options={options}
      onSelect={setTimerIndex}
      onTimerSoundAlertChange={setTimerSoundAlert}
      onReset={resetTimer}
    />
  );
}
