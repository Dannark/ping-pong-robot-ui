import type { AxisMode } from '../../data/RobotConfig';
import { AXIS_MODES, DEFAULT_CONFIG } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getAxisModes(): AxisMode[] {
  return AXIS_MODES;
}

export function getTiltState() {
  const c = RobotConfigRepository.getConfig();
  return {
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
  };
}

export function setTiltMode(mode: AxisMode) {
  RobotConfigRepository.setConfig({ tiltMode: mode });
}

export function setTiltTarget(value: number) {
  RobotConfigRepository.setConfig({ tiltTarget: value });
}

export function setTiltMin(value: number) {
  RobotConfigRepository.setConfig({ tiltMin: value });
}

export function setTiltMax(value: number) {
  RobotConfigRepository.setConfig({ tiltMax: value });
}

export function setTiltAuto2Step(value: number) {
  RobotConfigRepository.setConfig({ tiltAuto2Step: value });
}

export function setTiltAuto1Speed(value: number) {
  RobotConfigRepository.setConfig({ tiltAuto1Speed: value });
}

export function setTiltAuto2PauseMs(value: number) {
  RobotConfigRepository.setConfig({ tiltAuto2PauseMs: value });
}

export function setTiltAuto3MinDist(value: number) {
  RobotConfigRepository.setConfig({ tiltRandomMinDist: value });
}

export function setTiltAuto3PauseMs(value: number) {
  RobotConfigRepository.setConfig({ tiltRandomPauseMs: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetTilt() {
  RobotConfigRepository.setConfig({
    tiltMode: DEFAULT_CONFIG.tiltMode,
    tiltTarget: DEFAULT_CONFIG.tiltTarget,
    tiltMin: DEFAULT_CONFIG.tiltMin,
    tiltMax: DEFAULT_CONFIG.tiltMax,
    tiltAuto1Speed: DEFAULT_CONFIG.tiltAuto1Speed,
    tiltAuto2Step: DEFAULT_CONFIG.tiltAuto2Step,
    tiltAuto2PauseMs: DEFAULT_CONFIG.tiltAuto2PauseMs,
    tiltRandomMinDist: DEFAULT_CONFIG.tiltRandomMinDist,
    tiltRandomPauseMs: DEFAULT_CONFIG.tiltRandomPauseMs,
  });
}
