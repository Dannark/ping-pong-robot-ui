import { Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { getDeviceName } from 'react-native-device-info';
import type { RobotConfig } from './RobotConfig';
import type { RobotConnectionDataSource, ConnectionState } from './RobotConnectionDataSource';
import {
  configToConfigLine,
  getLiveAimLine,
  getStartCommand,
  getStopCommand,
  getDeviceNameCommand,
  getDisconnectCommand,
} from './btProtocol';

const HM10_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const HM10_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const CHUNK_SIZE = 20;
const CHUNK_DELAY_MS = 35;
const ACK_TIMEOUT_MS = 2500;

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

function fromBase64ToStr(base64: string): string {
  try {
    const atobFn = (globalThis as unknown as { atob?: (s: string) => string }).atob;
    return atobFn ? atobFn(base64) : '';
  } catch {
    return '';
  }
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

type PendingAck = { resolve: () => void; reject: (err: Error) => void; timeoutId: ReturnType<typeof setTimeout> };

export class BLERobotConnectionDataSource implements RobotConnectionDataSource {
  private state: ConnectionState = { status: 'disconnected' };
  private listeners = new Set<(s: ConnectionState) => void>();
  private liveAimListeners = new Set<(pan: number, tilt: number) => void>();
  private deviceId: string | null = null;
  private deviceDisplayName: string | null = null;
  private disconnectionSubscription: { remove: () => void } | null = null;
  private notificationSubscription: { remove: () => void } | null = null;
  private rxBuffer = '';
  private pendingConfigAck: PendingAck | null = null;
  private pendingStartAck: PendingAck | null = null;

  private setState(next: Partial<ConnectionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn(this.getConnectionState()));
  }

  private clearConnectionListeners(): void {
    if (this.disconnectionSubscription != null) {
      this.disconnectionSubscription.remove();
      this.disconnectionSubscription = null;
    }
    if (this.notificationSubscription != null) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }
  }

  private clearPendingAck(pending: PendingAck | null): void {
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    this.pendingConfigAck = this.pendingConfigAck === pending ? null : this.pendingConfigAck;
    this.pendingStartAck = this.pendingStartAck === pending ? null : this.pendingStartAck;
  }

  private onAckLine(line: string): void {
    const t = line.trim();
    if (t.startsWith('A,')) {
      const parts = t.slice(2).split(',');
      const pan = parts.length >= 1 ? parseInt(parts[0], 10) / 1000 : 0;
      const tilt = parts.length >= 2 ? parseInt(parts[1], 10) / 1000 : 0;
      if (!Number.isNaN(pan) && !Number.isNaN(tilt)) {
        this.liveAimListeners.forEach((fn) => fn(pan, tilt));
      }
      return;
    }
    if (t.startsWith('OK,C')) {
      const p = this.pendingConfigAck;
      this.pendingConfigAck = null;
      if (p) {
        clearTimeout(p.timeoutId);
        p.resolve();
      }
      return;
    }
    if (t.startsWith('OK,S')) {
      const p = this.pendingStartAck;
      this.pendingStartAck = null;
      if (p) {
        clearTimeout(p.timeoutId);
        p.resolve();
      }
      return;
    }
    if (t.startsWith('ERR,')) {
      const err = new Error(`Robot error: ${t}`);
      if (this.pendingConfigAck) {
        const p = this.pendingConfigAck;
        this.pendingConfigAck = null;
        clearTimeout(p.timeoutId);
        p.reject(err);
      }
      if (this.pendingStartAck) {
        const p = this.pendingStartAck;
        this.pendingStartAck = null;
        clearTimeout(p.timeoutId);
        p.reject(err);
      }
    }
  }

  private processAckBuffer(): void {
    let idx: number;
    while ((idx = this.rxBuffer.indexOf('\n')) >= 0) {
      const line = this.rxBuffer.slice(0, idx);
      this.rxBuffer = this.rxBuffer.slice(idx + 1);
      this.onAckLine(line);
    }
    const cr = this.rxBuffer.indexOf('\r');
    if (cr >= 0) {
      const line = this.rxBuffer.slice(0, cr);
      this.rxBuffer = this.rxBuffer.slice(cr + 1);
      this.onAckLine(line);
    }
  }

  private startNotificationMonitor(deviceId: string): void {
    const manager = getManager();
    this.notificationSubscription = manager.monitorCharacteristicForDevice(
      deviceId,
      HM10_SERVICE_UUID,
      HM10_CHAR_UUID,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;
        this.rxBuffer += fromBase64ToStr(characteristic.value);
        this.processAckBuffer();
      }
    );
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
      this.rxBuffer = '';
      this.startNotificationMonitor(device.id);
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
    if (this.deviceId && this.state.status === 'connected') {
      try {
        await this.writeLine(getDisconnectCommand());
      } catch {
        // ignore
      }
    }
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
    if (__DEV__) {
      const preview = line.includes('\n') ? line.replace(/\n/g, '\\n') : line;
      console.log('[BLE TX]', preview);
    }
    const manager = getManager();
    for (let i = 0; i < line.length; i += CHUNK_SIZE) {
      if (i > 0) {
        await new Promise<void>((r) => setTimeout(() => r(), CHUNK_DELAY_MS));
      }
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

  async sendConfigAndWaitAck(config: RobotConfig, timeoutMs: number = ACK_TIMEOUT_MS): Promise<void> {
    if (!this.deviceId || this.state.status !== 'connected') {
      throw new Error('Not connected');
    }
    this.clearPendingAck(this.pendingConfigAck);
    await this.writeLine(configToConfigLine(config));
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.pendingConfigAck === pending) {
          this.pendingConfigAck = null;
          reject(new Error('Config ACK timeout'));
        }
      }, timeoutMs);
      const pending: PendingAck = { resolve, reject, timeoutId };
      this.pendingConfigAck = pending;
    });
  }

  async startAndWaitAck(timeoutMs: number = ACK_TIMEOUT_MS): Promise<void> {
    if (!this.deviceId || this.state.status !== 'connected') {
      throw new Error('Not connected');
    }
    this.clearPendingAck(this.pendingStartAck);
    await this.writeLine(getStartCommand());
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.pendingStartAck === pending) {
          this.pendingStartAck = null;
          reject(new Error('Start ACK timeout'));
        }
      }, timeoutMs);
      const pending: PendingAck = { resolve, reject, timeoutId };
      this.pendingStartAck = pending;
    });
  }

  async sendLiveAim(pan: number, tilt: number): Promise<void> {
    await this.writeLine(getLiveAimLine(pan, tilt));
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

  subscribeLiveAimFromRobot(listener: (pan: number, tilt: number) => void): () => void {
    this.liveAimListeners.add(listener);
    return () => this.liveAimListeners.delete(listener);
  }
}
