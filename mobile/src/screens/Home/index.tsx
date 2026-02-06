import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { getHomeCards } from './Home.viewModel';
import { HomeView } from './Home.view';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const [connectionState, setConnectionState] = useState(() =>
    RobotConnectionRepository.getDataSource().getConnectionState()
  );

  useEffect(() => {
    const unsub = RobotConnectionRepository.getDataSource().subscribeConnectionState(
      (state) => setConnectionState(state)
    );
    return unsub;
  }, []);

  const isConnected = connectionState.status === 'connected';
  const cards = getHomeCards(t, isConnected);

  const handleCardPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return <HomeView cards={cards} onCardPress={handleCardPress} />;
}
