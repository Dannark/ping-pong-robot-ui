import type { RobotConfig } from './RobotConfig';

/**
 * Data source for robot communication. Implement BluetoothRobotConnectionDataSource
 * to send config/start/stop over BT; StubRobotConnectionDataSource is used until then.
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type ConnectionState = {
  status: ConnectionStatus;
  error?: string;
  deviceName?: string | null;
};

export interface RobotConnectionDataSource {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendConfig(config: RobotConfig): Promise<void>;
  sendConfigAndWaitAck(config: RobotConfig, timeoutMs?: number): Promise<void>;
  startAndWaitAck(timeoutMs?: number): Promise<void>;
  sendLiveAim(pan: number, tilt: number): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getConnectionState(): ConnectionState;
  subscribeConnectionState(listener: (state: ConnectionState) => void): () => void;
}

export class StubRobotConnectionDataSource implements RobotConnectionDataSource {
  private state: ConnectionState = { status: 'disconnected' };
  private listeners = new Set<(s: ConnectionState) => void>();

  async connect(): Promise<void> {
    this.setState({ status: 'connecting' });
    await Promise.resolve();
    this.setState({ status: 'connected' });
  }

  async disconnect(): Promise<void> {
    this.setState({ status: 'disconnected', error: undefined });
  }

  async sendConfig(_config: RobotConfig): Promise<void> {
    await Promise.resolve();
  }

  async sendConfigAndWaitAck(_config: RobotConfig, _timeoutMs?: number): Promise<void> {
    await Promise.resolve();
  }

  async startAndWaitAck(_timeoutMs?: number): Promise<void> {
    await Promise.resolve();
  }

  async sendLiveAim(_pan: number, _tilt: number): Promise<void> {
    await Promise.resolve();
  }

  async start(): Promise<void> {
    await Promise.resolve();
  }

  async stop(): Promise<void> {
    await Promise.resolve();
  }

  getConnectionState(): ConnectionState {
    return { ...this.state };
  }

  subscribeConnectionState(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getConnectionState());
    return () => this.listeners.delete(listener);
  }

  private setState(next: Partial<ConnectionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn(this.getConnectionState()));
  }
}
