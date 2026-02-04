import type { RobotConfig } from './RobotConfig';
import type { RobotConnectionDataSource, ConnectionState } from './RobotConnectionDataSource';
import { configToConfigLine, getStartCommand, getStopCommand } from './btProtocol';

type BluetoothDevice = {
  address: string;
  name: string;
  connect: (options?: Record<string, unknown>) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  write: (data: string, encoding?: string) => Promise<boolean>;
  isConnected: () => Promise<boolean>;
};

let targetDevice: BluetoothDevice | null = null;

/** Define o dispositivo ao qual connect() vai ligar. Chamado pela tela Conectar ao robô. */
export function setBluetoothTargetDevice(device: BluetoothDevice | null): void {
  targetDevice = device;
}

export function getBluetoothTargetDevice(): BluetoothDevice | null {
  return targetDevice;
}

const CONNECTION_OPTIONS = {
  CONNECTOR_TYPE: 'rfcomm',
  DELIMITER: '\n',
  DEVICE_CHARSET: 'utf-8',
};

export class BluetoothRobotConnectionDataSource implements RobotConnectionDataSource {
  private state: ConnectionState = { status: 'disconnected' };
  private listeners = new Set<(s: ConnectionState) => void>();

  private setState(next: Partial<ConnectionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn(this.getConnectionState()));
  }

  async connect(): Promise<void> {
    if (!targetDevice) {
      this.setState({ status: 'disconnected', error: 'Nenhum dispositivo selecionado' });
      return;
    }
    this.setState({ status: 'connecting', error: undefined });
    try {
      const RNBluetoothClassic = require('react-native-bluetooth-classic').default;
      const connected = await targetDevice.connect(CONNECTION_OPTIONS);
      if (connected) {
        this.setState({ status: 'connected', error: undefined, deviceName: targetDevice.name || 'HC-05' });
      } else {
        this.setState({ status: 'disconnected', error: 'Conexão recusada' });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ status: 'disconnected', error: message });
    }
  }

  async disconnect(): Promise<void> {
    if (!targetDevice) {
      this.setState({ status: 'disconnected', error: undefined });
      return;
    }
    try {
      await targetDevice.disconnect();
    } catch {
      // ignore
    }
    this.setState({ status: 'disconnected', error: undefined, deviceName: null });
  }

  private async writeLine(line: string): Promise<void> {
    if (!targetDevice || this.state.status !== 'connected') return;
    try {
      const ok = await targetDevice.write(line, 'utf-8');
      if (!ok) throw new Error('Write failed');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ status: 'disconnected', error: message });
      throw e;
    }
  }

  async sendConfig(config: RobotConfig): Promise<void> {
    await this.writeLine(configToConfigLine(config));
  }

  async start(): Promise<void> {
    await this.writeLine(getStartCommand());
  }

  async stop(): Promise<void> {
    await this.writeLine(getStopCommand());
  }

  getConnectionState(): ConnectionState {
    return { ...this.state };
  }

  subscribeConnectionState(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getConnectionState());
    return () => this.listeners.delete(listener);
  }
}
