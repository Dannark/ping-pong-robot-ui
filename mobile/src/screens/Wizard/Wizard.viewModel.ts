import type { TFunction } from 'i18next';
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

export function getWizardItems(config: RobotConfig, t: TFunction): WizardItem[] {
  const launcherValue = config.spinRandom
    ? `${config.launcherPower} Random`
    : String(config.launcherPower);
  return [
    { label: t('nav.pan'), value: config.panMode, screen: 'Pan', icon: 'compass' },
    { label: t('nav.tilt'), value: config.tiltMode, screen: 'Tilt', icon: 'angle-acute' },
    { label: t('nav.launcher'), value: launcherValue, screen: 'Launcher', icon: 'rocket-launch' },
    { label: t('nav.feeder'), value: config.feederMode, screen: 'Feeder', icon: 'fan' },
    { label: t('nav.timer'), value: TIMER_OPTIONS[config.timerIndex], screen: 'Timer', icon: 'timer-outline' },
  ];
}

export function subscribeConfig(cb: (c: RobotConfig) => void): () => void {
  return RobotConfigRepository.subscribe(cb);
}

export function getConfig(): RobotConfig {
  return RobotConfigRepository.getConfig();
}
