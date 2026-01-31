import type { AxisMode } from '../../data/RobotConfig';
import { AXIS_MODES, DEFAULT_CONFIG } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getAxisModes(): AxisMode[] {
  return AXIS_MODES;
}

export function getPanState() {
  const c = RobotConfigRepository.getConfig();
  return {
    panMode: c.panMode,
    panTarget: c.panTarget,
    panMin: c.panMin,
    panMax: c.panMax,
    tiltTarget: c.tiltTarget,
    tiltMode: c.tiltMode,
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
  };
}

export function setPanMode(mode: AxisMode) {
  RobotConfigRepository.setConfig({ panMode: mode });
}

export function setPanTarget(value: number) {
  RobotConfigRepository.setConfig({ panTarget: value });
}

export function setPanMin(value: number) {
  RobotConfigRepository.setConfig({ panMin: value });
}

export function setPanMax(value: number) {
  RobotConfigRepository.setConfig({ panMax: value });
}

export function setPanAuto2Step(value: number) {
  RobotConfigRepository.setConfig({ panAuto2Step: value });
}

export function setPanAuto1Speed(value: number) {
  RobotConfigRepository.setConfig({ panAuto1Speed: value });
}

export function setPanAuto2PauseMs(value: number) {
  RobotConfigRepository.setConfig({ panAuto2PauseMs: value });
}

export function setPanAuto3MinDist(value: number) {
  RobotConfigRepository.setConfig({ panRandomMinDist: value });
}

export function setPanAuto3PauseMs(value: number) {
  RobotConfigRepository.setConfig({ panRandomPauseMs: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetPan() {
  RobotConfigRepository.setConfig({
    panMode: DEFAULT_CONFIG.panMode,
    panTarget: DEFAULT_CONFIG.panTarget,
    panMin: DEFAULT_CONFIG.panMin,
    panMax: DEFAULT_CONFIG.panMax,
    panAuto1Speed: DEFAULT_CONFIG.panAuto1Speed,
    panAuto2Step: DEFAULT_CONFIG.panAuto2Step,
    panAuto2PauseMs: DEFAULT_CONFIG.panAuto2PauseMs,
    panRandomMinDist: DEFAULT_CONFIG.panRandomMinDist,
    panRandomPauseMs: DEFAULT_CONFIG.panRandomPauseMs,
  });
}
