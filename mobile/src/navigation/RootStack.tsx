import React from 'react';
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTintColor: theme.colors.primary,
  headerTitleStyle: { fontSize: 18, fontWeight: '600' as const, color: theme.colors.text },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: theme.colors.background },
  animation: 'slide_from_right' as const,
};

export function RootStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Ping Pong Robot', headerLargeTitle: false }}
        />
        <Stack.Screen
          name="Wizard"
          component={WizardScreen}
          options={{ title: 'Configurar e iniciar' }}
        />
        <Stack.Screen
          name="Info"
          component={InfoScreen}
          options={{ title: 'Info' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Pan"
          component={PanScreen}
          options={{ title: 'Pan' }}
        />
        <Stack.Screen
          name="Tilt"
          component={TiltScreen}
          options={{ title: 'Tilt' }}
        />
        <Stack.Screen
          name="Launcher"
          component={LauncherScreen}
          options={{ title: 'Launcher' }}
        />
        <Stack.Screen
          name="Feeder"
          component={FeederScreen}
          options={{ title: 'Feeder' }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{ title: 'Timer' }}
        />
        <Stack.Screen
          name="Running"
          component={RunningScreen}
          options={{ title: 'Running', headerBackVisible: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
