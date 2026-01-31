import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { WizardScreen } from '../screens/WizardScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { RunningScreen } from '../screens/RunningScreen';

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
  headerTintColor: theme.colors.text,
  headerTitleStyle: { fontSize: 18, fontWeight: '600' as const },
  headerShadowVisible: false,
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
          options={{ title: 'Wizard' }}
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
          component={PlaceholderScreen}
          options={{ title: 'Pan' }}
        />
        <Stack.Screen
          name="Tilt"
          component={PlaceholderScreen}
          options={{ title: 'Tilt' }}
        />
        <Stack.Screen
          name="Launcher"
          component={PlaceholderScreen}
          options={{ title: 'Launcher' }}
        />
        <Stack.Screen
          name="Feeder"
          component={PlaceholderScreen}
          options={{ title: 'Feeder' }}
        />
        <Stack.Screen
          name="Timer"
          component={PlaceholderScreen}
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
