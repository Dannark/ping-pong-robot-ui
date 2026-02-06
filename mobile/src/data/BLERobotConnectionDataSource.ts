import { Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { getDeviceName } from 'react-native-device-info';
import type { RobotConfig } from './RobotConfig';
import type { RobotConnectionDataSource, ConnectionState } from './RobotConnectionDataSource';
import {
  configToConfigLine,
  getStartCommand,
  getStopCommand,
  getDeviceNameCommand,
} from './btProtocol';

const HM10_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const HM10_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const CHUNK_SIZE = 20;

function toBase64(str: string): string {
  const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    out += key[a >> 2];
    out += key[((a & 3) << 4) | (b >> 4)];
    out += i + 1 < str.length ? key[((b & 15) << 2) | (c >> 6)] : '=';
    out += i + 2 < str.length ? key[c & 63] : '=';
  }
  return out;
}

export type BLEDevice = { id: string; name: string | null };

let bleManager: BleManager | null = null;
let targetDevice: BLEDevice | null = null;

function getManager(): BleManager {
  if (!bleManager) bleManager = new BleManager();
  return bleManager;
}

export function initBleManager(): void {
  getManager();
}

export function stopBLEScan(): void {
  if (bleManager) bleManager.stopDeviceScan();
}

export function destroyBleManager(): void {
  if (bleManager) {
    try {
      bleManager.destroy();
    } catch {
      // ignore
    }
    bleManager = null;
  }
}

export function setBLETargetDevice(device: BLEDevice | null): void {
  targetDevice = device;
}

export function getBLETargetDevice(): BLEDevice | null {
  return targetDevice;
}

function waitForPoweredOn(manager: BleManager): Promise<void> {
  return manager.state().then((state) => {
    if (state === 'PoweredOn') return Promise.resolve();
    return new Promise((resolve) => {
      const sub = manager.onStateChange((s) => {
        if (s === 'PoweredOn') {
          sub.remove();
          resolve();
        }
      }, true);
    });
  });
}

export async function scanBLEDevices(
  onDevice: (device: BLEDevice) => void,
  timeoutMs: number = 10000
): Promise<void> {
  const manager = getManager();
  await waitForPoweredOn(manager);
  await new Promise<void>((r) => setTimeout(() => r(), 300));
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      manager.stopDeviceScan();
      resolve();
    }, timeoutMs);
    manager.startDeviceScan(
      null,
      { allowDuplicates: true },
      (error, device) => {
        if (error) {
          clearTimeout(timeout);
          manager.stopDeviceScan();
          reject(error);
          return;
        }
        if (device)
          onDevice({ id: device.id, name: device.name ?? null });
      }
    );
  });
}

export class BLERobotConnectionDataSource implements RobotConnectionDataSource {
  private state: ConnectionState = { status: 'disconnected' };
  private listeners = new Set<(s: ConnectionState) => void>();
  private deviceId: string | null = null;
  private deviceDisplayName: string | null = null;
  private disconnectionSubscription: { remove: () => void } | null = null;

  private setState(next: Partial<ConnectionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn(this.getConnectionState()));
  }

  private clearConnectionListeners(): void {
    if (this.disconnectionSubscription != null) {
      this.disconnectionSubscription.remove();
      this.disconnectionSubscription = null;
    }
  }

  private onBleDisconnected(): void {
    this.clearConnectionListeners();
    this.deviceId = null;
    this.deviceDisplayName = null;
    this.setState({ status: 'disconnected', error: undefined, deviceName: null });
  }

  private subscribeDisconnect(deviceObj: Device): void {
    this.disconnectionSubscription = deviceObj.onDisconnected(() => {
      this.onBleDisconnected();
    });
  }

  async connect(): Promise<void> {
    if (!targetDevice) {
      this.setState({ status: 'disconnected', error: 'No device selected' });
      return;
    }
    const device = targetDevice;
    const manager = getManager();
    if (this.state.status === 'connected' && this.deviceId === device.id) {
      await this.disconnect();
      await new Promise<void>((r) => setTimeout(() => r(), 400));
    }
    this.setState({ status: 'connecting', error: undefined });
    try {
      const deviceObj = await manager.connectToDevice(device.id, {
        autoConnect: false,
      });
      await deviceObj.discoverAllServicesAndCharacteristics();
      this.deviceId = device.id;
      this.deviceDisplayName = device.name || 'HM-10';
      this.setState({
        status: 'connected',
        error: undefined,
        deviceName: this.deviceDisplayName,
      });
      let nameToSend: string;
      try {
        nameToSend = await getDeviceName();
      } catch {
        nameToSend = Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Phone';
      }
      if (!nameToSend || nameToSend.trim() === '') {
        nameToSend = Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Phone';
      }
      await this.writeLine(getDeviceNameCommand(nameToSend.trim()));
      this.subscribeDisconnect(deviceObj);
    } catch (e) {
      this.clearConnectionListeners();
      this.setState({
        status: 'disconnected',
        error: 'CONNECTION_FAILED',
      });
      this.deviceId = null;
      this.deviceDisplayName = null;
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    this.clearConnectionListeners();
    if (this.deviceId) {
      try {
        await getManager().cancelDeviceConnection(this.deviceId);
      } catch {
        // ignore
      }
      this.deviceId = null;
      this.deviceDisplayName = null;
    }
    this.setState({ status: 'disconnected', error: undefined, deviceName: null });
  }

  private async writeLine(line: string): Promise<void> {
    if (!this.deviceId || this.state.status !== 'connected') return;
    const manager = getManager();
    for (let i = 0; i < line.length; i += CHUNK_SIZE) {
      const chunk = line.slice(i, i + CHUNK_SIZE);
      const base64 = toBase64(chunk);
      await manager.writeCharacteristicWithoutResponseForDevice(
        this.deviceId,
        HM10_SERVICE_UUID,
        HM10_CHAR_UUID,
        base64
      );
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
