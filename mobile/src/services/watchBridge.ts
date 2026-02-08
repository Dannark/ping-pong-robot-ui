import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { RobotConnectionRepository } from '../data/RobotConnectionRepository';
import { getConfig } from '../screens/Wizard/Wizard.viewModel';
import { stopRun } from '../screens/Running/Running.viewModel';

const { WatchConnectivityModule } = NativeModules;

export function subscribeWatchCommands(callback: (command: string) => void): () => void {
  if (Platform.OS !== 'ios' || !WatchConnectivityModule) {
    return () => {};
  }
  const emitter = new NativeEventEmitter(WatchConnectivityModule);
  const sub = emitter.addListener('WatchCommand', (payload: { command: string }) => {
    callback(payload?.command ?? '');
  });
  return () => sub.remove();
}

export function handleWatchCommand(command: string): void {
  if (command === 'start') {
    const config = getConfig();
    const status = RobotConnectionRepository.getDataSource().getConnectionState().status;
    if (status === 'connected') {
      RobotConnectionRepository.startRun(config).catch(() => {});
    }
  } else if (command === 'stop') {
    stopRun().catch(() => {});
  }
}
