import type { AxisMode } from '../../data/RobotConfig';
import { AXIS_MODES } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getAxisModes(): AxisMode[] {
  return AXIS_MODES;
}

export function getPanState() {
  const c = RobotConfigRepository.getConfig();
  return { panMode: c.panMode, panTarget: c.panTarget, tiltTarget: c.tiltTarget };
}

export function setPanMode(mode: AxisMode) {
  RobotConfigRepository.setConfig({ panMode: mode });
}

export function setPanTarget(value: number) {
  RobotConfigRepository.setConfig({ panTarget: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}
