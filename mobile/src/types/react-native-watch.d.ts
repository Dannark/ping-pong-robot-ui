import type { NativeModule } from 'react-native';

export interface WatchConnectivityModuleSpec extends NativeModule {
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    WatchConnectivityModule?: WatchConnectivityModuleSpec;
  }
}
