import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { HomeScreen } from '../screens/Home';
import { WizardScreen } from '../screens/Wizard';
import { InfoScreen } from '../screens/Info';
import { SettingsScreen } from '../screens/Settings';
import { PanScreen } from '../screens/Pan';
import { TiltScreen } from '../screens/Tilt';
import { LauncherScreen } from '../screens/Launcher';
import { FeederScreen } from '../screens/Feeder';
import { TimerScreen } from '../screens/Timer';
import { RunningScreen } from '../screens/Running';
import { TrainingCompleteScreen } from '../screens/TrainingComplete';
import type { RobotConfig } from '../data/RobotConfig';

export type RootStackParamList = {
  Home: undefined;
  Wizard: undefined;
  Info: undefined;
  Settings: undefined;
  Pan: undefined;
  Tilt: undefined;
  Launcher: undefined;
  Feeder: undefined;
  Timer: undefined;
  Running: undefined;
  TrainingComplete: { elapsedSeconds: number; runConfig: RobotConfig | null };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTintColor: theme.colors.primary,
  headerTitleStyle: { fontSize: 18, fontWeight: '600' as const, color: theme.colors.text },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: theme.colors.background },
  presentation: 'modal' as const,
};

function navTitleKey(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

export function RootStack() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          ...screenOptions,
          title: t(`nav.${navTitleKey(route.name)}`),
          headerLargeTitle: route.name === 'Home' ? false : undefined,
          headerBackVisible: route.name === 'Running' ? true : route.name === 'TrainingComplete' ? false : undefined,
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Wizard" component={WizardScreen} />
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Pan" component={PanScreen} />
        <Stack.Screen name="Tilt" component={TiltScreen} />
        <Stack.Screen name="Launcher" component={LauncherScreen} />
        <Stack.Screen name="Feeder" component={FeederScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Running" component={RunningScreen} />
        <Stack.Screen name="TrainingComplete" component={TrainingCompleteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
