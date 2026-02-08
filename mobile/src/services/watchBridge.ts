import { AppState, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { RobotConnectionRepository } from '../data/RobotConnectionRepository';
import { RobotConfigRepository } from '../data/RobotConfigRepository';
import type { AxisMode, RobotConfig } from '../data/RobotConfig';
import { getConfig } from '../screens/Wizard/Wizard.viewModel';
import { stopRun } from '../screens/Running/Running.viewModel';
import { navigateToRunning } from '../navigation/navigationRef';

const { WatchConnectivityModule } = NativeModules;

export type WatchCommandPayload = { command: string; key?: string; value?: string };

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

export function subscribeWatchCommands(callback: (payload: WatchCommandPayload) => void): () => void {
  if (Platform.OS !== 'ios' || !WatchConnectivityModule) {
    return () => {};
  }
  const emitter = new NativeEventEmitter(WatchConnectivityModule);
  const sub = emitter.addListener('WatchCommand', (payload: WatchCommandPayload) => {
    callback(payload ?? { command: '' });
  });
  return () => sub.remove();
}

const AXIS_MODES: AxisMode[] = ['LIVE', 'AUTO1', 'AUTO2', 'RANDOM'];

function applyWatchConfig(key: string, value: string): Partial<RobotConfig> {
  const num = (): number => Number(value);
  const mode = (): AxisMode => (AXIS_MODES.includes(value as AxisMode) ? (value as AxisMode) : 'LIVE');
  const map: Record<string, () => RobotConfig[keyof RobotConfig]> = {
    panMode: mode,
    tiltMode: mode,
    panTarget: num,
    tiltTarget: num,
    panMin: num,
    panMax: num,
    tiltMin: num,
    tiltMax: num,
    panAuto1Speed: num,
    tiltAuto1Speed: num,
    panAuto2Step: num,
    tiltAuto2Step: num,
    panAuto2PauseMs: num,
    tiltAuto2PauseMs: num,
    panRandomMinDist: num,
    tiltRandomMinDist: num,
    panRandomPauseMs: num,
    tiltRandomPauseMs: num,
  };
  const fn = map[key as keyof typeof map];
  if (!fn) return {};
  return { [key]: fn() } as Partial<RobotConfig>;
}

export function handleWatchCommand(payload: WatchCommandPayload): void {
  const { command, key, value } = payload;
  if (command === 'config' && key != null && value != null) {
    const partial = applyWatchConfig(key, value);
    if (Object.keys(partial).length > 0) {
      RobotConfigRepository.setConfig(partial);
    }
    return;
  }
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
