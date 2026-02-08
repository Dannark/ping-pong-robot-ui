import { AppState, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { RobotConnectionRepository } from '../data/RobotConnectionRepository';
import { getConfig } from '../screens/Wizard/Wizard.viewModel';
import { stopRun } from '../screens/Running/Running.viewModel';
import { navigateToRunning } from '../navigation/navigationRef';

const { WatchConnectivityModule } = NativeModules;

function pushWatchState(): void {
  if (Platform.OS !== 'ios' || !WatchConnectivityModule?.updateWatchState) {
    if (__DEV__) console.log('[WatchSync JS] pushWatchState SKIP (not iOS or no module)');
    return;
  }
  const conn = RobotConnectionRepository.getDataSource().getConnectionState();
  const run = RobotConnectionRepository.getRunState();
  const robotName = conn.status === 'connected' ? (conn.deviceName ?? '') : '';
  const payload = {
    robotConnected: conn.status === 'connected',
    robotName: robotName || '',
    isRunning: run.runStartTime != null,
    runStartTime: run.runStartTime ?? 0,
  };
  if (__DEV__) {
    console.log('[WatchSync JS] pushWatchState', {
      connStatus: conn.status,
      robotName: payload.robotName,
      isRunning: payload.isRunning,
      runStartTime: payload.runStartTime,
    });
  }
  WatchConnectivityModule.updateWatchState(payload);
}

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
      navigateToRunning();
      RobotConnectionRepository.startRun(config).catch(() => {});
    }
  } else if (command === 'stop') {
    stopRun().catch(() => {});
  }
}

const WATCH_STATE_PUSH_INTERVAL_MS = 5000;

export function startWatchStateSync(): () => void {
  if (Platform.OS !== 'ios' || !WatchConnectivityModule?.updateWatchState) return () => {};
  pushWatchState();
  const unsubConn = RobotConnectionRepository.getDataSource().subscribeConnectionState(() => pushWatchState());
  const unsubRun = RobotConnectionRepository.subscribeRunState(() => pushWatchState());
  const emitter = new NativeEventEmitter(WatchConnectivityModule);
  const stateRequestSub = emitter.addListener('WatchStateRequest', () => pushWatchState());
  const appStateSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') pushWatchState();
  });
  const intervalId = setInterval(() => {
    if (AppState.currentState === 'active') pushWatchState();
  }, WATCH_STATE_PUSH_INTERVAL_MS);
  return () => {
    unsubConn();
    unsubRun();
    stateRequestSub.remove();
    appStateSub.remove();
    clearInterval(intervalId);
  };
}
