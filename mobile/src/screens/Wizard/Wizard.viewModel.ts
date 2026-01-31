import type { RootStackParamList } from '../../navigation/RootStack';
import type { RobotConfig } from '../../data/RobotConfig';
import { RobotConfigRepository } from '../../data/RobotConfigRepository';
import { TIMER_OPTIONS } from '../../data/RobotConfig';

export type WizardItem = {
  label: string;
  value: string;
  screen: keyof RootStackParamList;
};

export function getWizardItems(config: RobotConfig): WizardItem[] {
  return [
    { label: 'Pan', value: config.panMode, screen: 'Pan' },
    { label: 'Tilt', value: config.tiltMode, screen: 'Tilt' },
    { label: 'Launcher', value: String(config.launcherPower), screen: 'Launcher' },
    { label: 'Feeder', value: `${config.feederMode} ${config.feederSpeed}`, screen: 'Feeder' },
    { label: 'Timer', value: TIMER_OPTIONS[config.timerIndex], screen: 'Timer' },
  ];
}

export function subscribeConfig(cb: (c: RobotConfig) => void): () => void {
  return RobotConfigRepository.subscribe(cb);
}

export function getConfig(): RobotConfig {
  return RobotConfigRepository.getConfig();
}
