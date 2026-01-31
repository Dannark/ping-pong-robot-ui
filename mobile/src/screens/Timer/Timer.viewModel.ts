import { DEFAULT_CONFIG, TIMER_OPTIONS } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getTimerOptions(): readonly string[] {
  return TIMER_OPTIONS;
}

export function getTimerState() {
  const c = RobotConfigRepository.getConfig();
  return { timerIndex: c.timerIndex, timerSoundAlert: c.timerSoundAlert };
}

export function setTimerIndex(value: number) {
  RobotConfigRepository.setConfig({ timerIndex: value });
}

export function setTimerSoundAlert(value: boolean) {
  RobotConfigRepository.setConfig({ timerSoundAlert: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetTimer() {
  RobotConfigRepository.setConfig({
    timerIndex: DEFAULT_CONFIG.timerIndex,
    timerSoundAlert: DEFAULT_CONFIG.timerSoundAlert,
  });
}
