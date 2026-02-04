import type { TFunction } from 'i18next';
import type { RootStackParamList } from '../../navigation/RootStack';

export type HomeCard = {
  label: string;
  subtitle: string;
  screen: keyof RootStackParamList;
  icon: string;
  primary?: boolean;
};

export function getHomeCards(t: TFunction): HomeCard[] {
  return [
    { label: t('home.cardConnect'), subtitle: t('home.cardConnectSubtitle'), screen: 'Connect', icon: 'bluetooth' },
    { label: t('home.cardStart'), subtitle: t('home.cardStartSubtitle'), screen: 'Wizard', icon: 'rocket-launch', primary: true },
    { label: t('home.cardInfo'), subtitle: t('home.cardInfoSubtitle'), screen: 'Info', icon: 'information-outline' },
    { label: t('home.cardSettings'), subtitle: t('home.cardSettingsSubtitle'), screen: 'Settings', icon: 'cog-outline' },
  ];
}
