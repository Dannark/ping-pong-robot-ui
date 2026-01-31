import type { RootStackParamList } from '../../navigation/RootStack';

export type HomeCard = {
  label: string;
  subtitle: string;
  screen: keyof RootStackParamList;
  icon: string;
  primary?: boolean;
};

export const HOME_CARDS: HomeCard[] = [
  {
    label: 'Iniciar',
    subtitle: 'Configurar e lançar',
    screen: 'Wizard',
    icon: 'rocket-launch',
    primary: true,
  },
  {
    label: 'Info',
    subtitle: 'Versão e estatísticas',
    screen: 'Info',
    icon: 'information-outline',
  },
  {
    label: 'Configurações',
    subtitle: 'Servos e motores',
    screen: 'Settings',
    icon: 'cog-outline',
  },
];

export function getHomeCards(): HomeCard[] {
  return HOME_CARDS;
}
