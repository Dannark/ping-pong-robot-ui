import React, { useState, useEffect } from 'react';
import { getTimerOptions, getTimerState, resetTimer, setTimerIndex, subscribeConfig } from './Timer.viewModel';
import { TimerView } from './Timer.view';

export function TimerScreen() {
  const [state, setState] = useState(() => getTimerState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ timerIndex: c.timerIndex });
    });
  }, []);

  const options = getTimerOptions();

  return (
    <TimerView
      timerIndex={state.timerIndex}
      options={options}
      onSelect={setTimerIndex}
      onReset={resetTimer}
    />
  );
}
