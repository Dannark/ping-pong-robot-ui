import type { FeederMode } from '../../data/RobotConfig';
import { DEFAULT_CONFIG, FEEDER_MODES } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getFeederModes(): FeederMode[] {
  return FEEDER_MODES;
}

export function getFeederState() {
  const c = RobotConfigRepository.getConfig();
  return { feederMode: c.feederMode, feederSpeed: c.feederSpeed };
}

export function setFeederMode(mode: FeederMode) {
  RobotConfigRepository.setConfig({ feederMode: mode });
}

export function setFeederSpeed(value: number) {
  RobotConfigRepository.setConfig({ feederSpeed: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetFeeder() {
  RobotConfigRepository.setConfig({
    feederMode: DEFAULT_CONFIG.feederMode,
    feederSpeed: DEFAULT_CONFIG.feederSpeed,
  });
}
