import type { FeederMode } from '../../data/RobotConfig';
import { DEFAULT_CONFIG, FEEDER_MODES } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getFeederModes(): FeederMode[] {
  return FEEDER_MODES;
}

export function getFeederState() {
  const c = RobotConfigRepository.getConfig();
  return {
    feederMode: c.feederMode,
    feederSpeed: c.feederSpeed,
    feederP1OnMs: c.feederP1OnMs,
    feederP1OffMs: c.feederP1OffMs,
    feederP2OnMs: c.feederP2OnMs,
    feederP2OffMs: c.feederP2OffMs,
  };
}

export function setFeederMode(mode: FeederMode) {
  RobotConfigRepository.setConfig({ feederMode: mode });
}

export function setFeederSpeed(value: number) {
  RobotConfigRepository.setConfig({ feederSpeed: value });
}

export function setFeederP1OnMs(value: number) {
  RobotConfigRepository.setConfig({ feederP1OnMs: value });
}

export function setFeederP1OffMs(value: number) {
  RobotConfigRepository.setConfig({ feederP1OffMs: value });
}

export function setFeederP2OnMs(value: number) {
  RobotConfigRepository.setConfig({ feederP2OnMs: value });
}

export function setFeederP2OffMs(value: number) {
  RobotConfigRepository.setConfig({ feederP2OffMs: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetFeeder() {
  RobotConfigRepository.setConfig({
    feederMode: DEFAULT_CONFIG.feederMode,
    feederSpeed: DEFAULT_CONFIG.feederSpeed,
    feederP1OnMs: DEFAULT_CONFIG.feederP1OnMs,
    feederP1OffMs: DEFAULT_CONFIG.feederP1OffMs,
    feederP2OnMs: DEFAULT_CONFIG.feederP2OnMs,
    feederP2OffMs: DEFAULT_CONFIG.feederP2OffMs,
  });
}
