import type { RobotConfig } from './RobotConfig';
import type { RobotConnectionDataSource } from './RobotConnectionDataSource';
import { BluetoothRobotConnectionDataSource } from './BluetoothRobotConnectionDataSource';

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
  return {
    async startRun(config: RobotConfig): Promise<void> {
      await dataSource.sendConfig(config);
      await dataSource.start();
      runState = {
        runStartTime: Date.now(),
        runConfig: { ...config },
      };
      notifyRunState();
    },

    async stopRun(): Promise<void> {
      await dataSource.stop();
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

    getDataSource(): RobotConnectionDataSource {
      return dataSource;
    },
  };
}

export const RobotConnectionRepository = createRepository(new BluetoothRobotConnectionDataSource());
