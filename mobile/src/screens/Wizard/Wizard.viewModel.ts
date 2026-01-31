import type { RootStackParamList } from '../../navigation/RootStack';
import type { RobotConfig } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';
import { TIMER_OPTIONS } from '../../data/RobotConfig';

export type WizardItem = {
  label: string;
  value: string;
  screen: keyof RootStackParamList;
  icon: string;
};

export function getWizardItems(config: RobotConfig): WizardItem[] {
  const launcherValue = config.spinRandom
    ? `${config.launcherPower} Random`
    : String(config.launcherPower);
  return [
    { label: 'Pan', value: config.panMode, screen: 'Pan', icon: 'compass' },
    { label: 'Tilt', value: config.tiltMode, screen: 'Tilt', icon: 'angle-acute' },
    { label: 'Launcher', value: launcherValue, screen: 'Launcher', icon: 'rocket-launch' },
    { label: 'Feeder', value: config.feederMode, screen: 'Feeder', icon: 'fan' },
    { label: 'Timer', value: TIMER_OPTIONS[config.timerIndex], screen: 'Timer', icon: 'timer-outline' },
  ];
}

export function subscribeConfig(cb: (c: RobotConfig) => void): () => void {
  return RobotConfigRepository.subscribe(cb);
}

export function getConfig(): RobotConfig {
  return RobotConfigRepository.getConfig();
}
