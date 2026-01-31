import type { SpinDirection } from '../../data/RobotConfig';
import { DEFAULT_CONFIG } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';

export function getLauncherState() {
  const c = RobotConfigRepository.getConfig();
  return {
    launcherPower: c.launcherPower,
    spinDirection: c.spinDirection,
    spinIntensity: c.spinIntensity,
  };
}

export function setLauncherPower(value: number) {
  RobotConfigRepository.setConfig({ launcherPower: value });
}

export function setSpinDirection(value: SpinDirection) {
  RobotConfigRepository.setConfig({ spinDirection: value });
}

export function setSpinIntensity(value: number) {
  RobotConfigRepository.setConfig({ spinIntensity: value });
}

export function subscribeConfig(cb: (c: import('../../data/RobotConfig').RobotConfig) => void) {
  return RobotConfigRepository.subscribe(cb);
}

export function resetLauncher() {
  RobotConfigRepository.setConfig({
    launcherPower: DEFAULT_CONFIG.launcherPower,
    spinDirection: DEFAULT_CONFIG.spinDirection,
    spinIntensity: DEFAULT_CONFIG.spinIntensity,
  });
}
