import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootStack';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToRunning(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Running');
  }
}
