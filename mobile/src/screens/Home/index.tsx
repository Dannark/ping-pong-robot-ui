import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { getHomeCards } from './Home.viewModel';
import { HomeView } from './Home.view';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const cards = getHomeCards();

  const handleCardPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return <HomeView cards={cards} onCardPress={handleCardPress} />;
}
