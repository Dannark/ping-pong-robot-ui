import { TIMER_OPTIONS } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getTimerOptions(): readonly string[] {
  return TIMER_OPTIONS;
}

export function getTimerState() {
  const c = RobotConfigRepository.getConfig();
  return { timerIndex: c.timerIndex };
}

export function setTimerIndex(value: number) {
  RobotConfigRepository.setConfig({ timerIndex: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}
