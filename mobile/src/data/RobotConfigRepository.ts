import type { RobotConfig } from './RobotConfig';
import { DEFAULT_CONFIG } from './RobotConfig';

let config: RobotConfig = { ...DEFAULT_CONFIG };

const listeners = new Set<(c: RobotConfig) => void>();

function notify() {
  const snapshot = { ...config };
  listeners.forEach((fn) => fn(snapshot));
}

export const RobotConfigRepository = {
  getConfig(): RobotConfig {
    return { ...config };
  },

  setConfig(partial: Partial<RobotConfig>) {
    config = { ...config, ...partial };
    notify();
  },

  subscribe(fn: (c: RobotConfig) => void): () => void {
    listeners.add(fn);
    fn({ ...config });
    return () => listeners.delete(fn);
  },
};
