import React, { useState, useEffect, useCallback } from 'react';
import {
  getTimerOptions,
  getTimerState,
  resetTimer,
  setTimerIndex,
  setTimerSoundAlert,
  subscribeConfig,
} from './Timer.viewModel';
import { requestNotificationPermission } from '../../services/localNotification';
import { TimerView } from './Timer.view';

export function TimerScreen() {
  const [state, setState] = useState(() => getTimerState());

  useEffect(() => {
    return subscribeConfig((c) => {
      setState({ timerIndex: c.timerIndex, timerSoundAlert: c.timerSoundAlert });
    });
  }, []);

  const handleTimerSoundAlertChange = useCallback(async (value: boolean) => {
    if (value) {
      await requestNotificationPermission();
    }
    setTimerSoundAlert(value);
  }, []);

  const options = getTimerOptions();

  return (
    <TimerView
      timerIndex={state.timerIndex}
      timerSoundAlert={state.timerSoundAlert}
      options={options}
      onSelect={setTimerIndex}
      onTimerSoundAlertChange={handleTimerSoundAlertChange}
      onReset={resetTimer}
    />
  );
}
