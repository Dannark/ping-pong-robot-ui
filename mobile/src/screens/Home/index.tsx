import React from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { getHomeCards } from './Home.viewModel';
import { HomeView } from './Home.view';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const cards = getHomeCards(t);

  const handleCardPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return <HomeView cards={cards} onCardPress={handleCardPress} />;
}
