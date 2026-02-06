import React, { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import {
  scanBLEDevices,
  setBLETargetDevice,
  stopBLEScan,
  destroyBleManager,
  type BLEDevice,
} from '../../data/BLERobotConnectionDataSource';
import type { BLEDeviceItem } from './Connect.view';
import { ConnectView } from './Connect.view';

type ConnectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Connect'>;
};

const SCAN_TIMEOUT_MS = 12000;
const AUTO_RESCAN_DELAY_MS = 1000;
const STALE_DEVICE_MS = 45000;

const ROBOT_DEVICE_NAMES = ['SpinBot', 'SpinRobot', 'HMSoft'];

function isRobotDevice(d: { name: string | null }): boolean {
  if (!d.name) return false;
  const name = d.name.trim();
  const lower = name.toLowerCase();
  return ROBOT_DEVICE_NAMES.some((n) => n.toLowerCase() === lower);
}

export function ConnectScreen({ navigation: _navigation }: ConnectScreenProps) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<BLEDeviceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionState, setConnectionState] = useState(() =>
    RobotConnectionRepository.getDataSource().getConnectionState()
  );

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const apiLevel = (Platform as { Version?: number }).Version ?? 31;
      if (apiLevel >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  const loadDevices = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) {
      setDevices([]);
      return;
    }
    setIsScanning(true);
    try {
      await scanBLEDevices(
        (d: BLEDevice) => {
          const now = Date.now();
          setDevices((prev) => {
            const map = new Map(prev.map((x) => [x.id, { ...x }]));
            map.set(d.id, {
              id: d.id,
              name: d.name,
              lastSeen: now,
            });
            return Array.from(map.values());
          });
        },
        SCAN_TIMEOUT_MS
      );
    } catch {
      // keep existing list on scan error
    } finally {
      setIsScanning(false);
    }
  }, [requestPermissions]);

  useEffect(() => {
    loadDevices();
    return () => {
      stopBLEScan();
      const status = RobotConnectionRepository.getDataSource().getConnectionState().status;
      if (status !== 'connected') destroyBleManager();
    };
  }, [loadDevices]);

  useEffect(() => {
    const ds = RobotConnectionRepository.getDataSource();
    const unsub = ds.subscribeConnectionState((state) => setConnectionState(state));
    return unsub;
  }, []);

  useEffect(() => {
    if (
      isScanning ||
      connectionState.status === 'connected' ||
      connectionState.status === 'connecting'
    )
      return;
    const timerId = setTimeout(() => loadDevices(), AUTO_RESCAN_DELAY_MS);
    return () => clearTimeout(timerId);
  }, [isScanning, connectionState.status, loadDevices]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - STALE_DEVICE_MS;
      setDevices((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.filter((d) => (d.lastSeen ?? Date.now()) >= cutoff);
        return next.length === prev.length ? prev : next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDevicePress = useCallback((device: BLEDeviceItem) => {
    if (!isRobotDevice(device)) return;
    setBLETargetDevice({ id: device.id, name: device.name });
    RobotConnectionRepository.getDataSource().connect().catch(() => {});
  }, []);

  const robotCount = devices.filter((d) => isRobotDevice(d)).length;
  const totalCount = devices.length;
  const sortedDevices = [...devices].sort(
    (a, b) => (isRobotDevice(b) ? 1 : 0) - (isRobotDevice(a) ? 1 : 0)
  );

  const handleDisconnect = useCallback(async () => {
    await RobotConnectionRepository.getDataSource().disconnect();
    setBLETargetDevice(null);
  }, []);

  const status =
    connectionState.status === 'connected'
      ? 'connected'
      : connectionState.status === 'connecting'
        ? 'connecting'
        : isScanning || devices.length === 0
          ? 'scanning'
          : 'disconnected';

  const displayError =
    connectionState.error === 'CONNECTION_FAILED'
      ? t('connect.errorConnectionFailed')
      : connectionState.error;

  return (
    <ConnectView
      devices={sortedDevices}
      status={status}
      error={displayError}
      connectedDeviceName={connectionState.status === 'connected' ? (connectionState.deviceName ?? null) : null}
      robotCount={robotCount}
      totalCount={totalCount}
      isRobotDevice={isRobotDevice}
      onDevicePress={handleDevicePress}
      onDisconnect={handleDisconnect}
    />
  );
}
