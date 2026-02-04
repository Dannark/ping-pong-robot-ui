import React, { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStack';
import { RobotConnectionRepository } from '../../data/RobotConnectionRepository';
import { setBluetoothTargetDevice } from '../../data/BluetoothRobotConnectionDataSource';
import type { BondedDevice } from './Connect.view';
import { ConnectView } from './Connect.view';

type ConnectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Connect'>;
};

export function ConnectScreen({ navigation: _navigation }: ConnectScreenProps) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<BondedDevice[]>([]);
  const [connectionState, setConnectionState] = useState(() =>
    RobotConnectionRepository.getDataSource().getConnectionState()
  );

  const loadBondedDevices = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setDevices([]);
      return;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: t('connect.permissionTitle'),
          message: t('connect.permissionMessage'),
          buttonNeutral: t('connect.cancel'),
          buttonNegative: t('connect.cancel'),
          buttonPositive: t('connect.ok'),
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setDevices([]);
        return;
      }
      const RNBluetoothClassic = require('react-native-bluetooth-classic').default;
      const bonded = await RNBluetoothClassic.getBondedDevices();
      setDevices(
        (bonded || []).map((d: { address: string; name: string }) => ({
          address: d.address,
          name: d.name || '',
        }))
      );
    } catch {
      setDevices([]);
    }
  }, [t]);

  useEffect(() => {
    loadBondedDevices();
  }, [loadBondedDevices]);

  useEffect(() => {
    const ds = RobotConnectionRepository.getDataSource();
    const unsub = ds.subscribeConnectionState((state) => setConnectionState(state));
    return unsub;
  }, []);

  const handleDevicePress = useCallback(
    async (device: BondedDevice) => {
      const RNBluetoothClassic = require('react-native-bluetooth-classic').default;
      const bonded = await RNBluetoothClassic.getBondedDevices();
      const btDevice = (bonded || []).find((d: { address: string }) => d.address === device.address);
      if (!btDevice) return;
      setBluetoothTargetDevice(btDevice);
      await RobotConnectionRepository.getDataSource().connect();
    },
    []
  );

  const handleDisconnect = useCallback(async () => {
    await RobotConnectionRepository.getDataSource().disconnect();
    setBluetoothTargetDevice(null);
  }, []);

  const handleRetry = useCallback(() => {
    loadBondedDevices();
  }, [loadBondedDevices]);

  return (
    <ConnectView
      devices={devices}
      status={connectionState.status}
      error={connectionState.error}
      connectedDeviceName={connectionState.status === 'connected' ? (connectionState.deviceName ?? null) : null}
      onDevicePress={handleDevicePress}
      onDisconnect={handleDisconnect}
      onRetry={handleRetry}
    />
  );
}
