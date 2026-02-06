import type { RobotConfig } from './RobotConfig';
import type { RobotConnectionDataSource } from './RobotConnectionDataSource';
import { BLERobotConnectionDataSource } from './BLERobotConnectionDataSource';

export type RunState = {
  runStartTime: number | null;
  runConfig: RobotConfig | null;
};

const defaultRunState: RunState = {
  runStartTime: null,
  runConfig: null,
};

let runState: RunState = { ...defaultRunState };
const runListeners = new Set<(s: RunState) => void>();

function notifyRunState() {
  const snapshot: RunState = {
    runStartTime: runState.runStartTime,
    runConfig: runState.runConfig ? { ...runState.runConfig } : null,
  };
  runListeners.forEach((fn) => fn(snapshot));
}

function createRepository(dataSource: RobotConnectionDataSource) {
  dataSource.subscribeConnectionState((state) => {
    if (state.status === 'disconnected') {
      runState = { ...defaultRunState };
      notifyRunState();
    }
  });

  return {
    async sendConfig(config: RobotConfig): Promise<void> {
      await dataSource.sendConfig(config);
    },

    async sendLiveAim(pan: number, tilt: number): Promise<void> {
      await dataSource.sendLiveAim(pan, tilt);
    },

    async startRun(config: RobotConfig): Promise<void> {
      const maxAttempts = 3;
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await dataSource.sendConfigAndWaitAck(config);
          await dataSource.startAndWaitAck();
          runState = {
            runStartTime: Date.now(),
            runConfig: { ...config },
          };
          notifyRunState();
          return;
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          if (attempt === maxAttempts) break;
        }
      }
      throw lastError ?? new Error('Start failed');
    },

    async stopRun(): Promise<void> {
      await dataSource.stop();
      runState = { ...defaultRunState };
      notifyRunState();
    },

    cancelRun(): void {
      runState = { ...defaultRunState };
      notifyRunState();
    },

    getRunState(): RunState {
      return {
        runStartTime: runState.runStartTime,
        runConfig: runState.runConfig ? { ...runState.runConfig } : null,
      };
    },

    subscribeRunState(listener: (s: RunState) => void): () => void {
      runListeners.add(listener);
      listener(this.getRunState());
      return () => runListeners.delete(listener);
    },

    subscribeLiveAimFromRobot(listener: (pan: number, tilt: number) => void): () => void {
      return dataSource.subscribeLiveAimFromRobot(listener);
    },

    getDataSource(): RobotConnectionDataSource {
      return dataSource;
    },
  };
}

export const RobotConnectionRepository = createRepository(new BLERobotConnectionDataSource());
