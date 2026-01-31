import type { AxisMode } from '../../data/RobotConfig';
import { AXIS_MODES, DEFAULT_CONFIG } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getAxisModes(): AxisMode[] {
  return AXIS_MODES;
}

export function getTiltState() {
  const c = RobotConfigRepository.getConfig();
  return { tiltMode: c.tiltMode, panTarget: c.panTarget, tiltTarget: c.tiltTarget };
}

export function setTiltMode(mode: AxisMode) {
  RobotConfigRepository.setConfig({ tiltMode: mode });
}

export function setTiltTarget(value: number) {
  RobotConfigRepository.setConfig({ tiltTarget: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetTilt() {
  RobotConfigRepository.setConfig({
    tiltMode: DEFAULT_CONFIG.tiltMode,
    tiltTarget: DEFAULT_CONFIG.tiltTarget,
  });
}
