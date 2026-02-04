import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

export type BondedDevice = { address: string; name: string };

type ConnectViewProps = {
  devices: BondedDevice[];
  status: 'disconnected' | 'connecting' | 'connected';
  error?: string;
  connectedDeviceName: string | null;
  onDevicePress: (device: BondedDevice) => void;
  onDisconnect: () => void;
  onRetry: () => void;
};

export function ConnectView({
  devices,
  status,
  error,
  connectedDeviceName,
  onDevicePress,
  onDisconnect,
  onRetry,
}: ConnectViewProps) {
  const { t } = useTranslation();

  const statusText =
    status === 'connecting'
      ? t('connect.connecting')
      : status === 'connected'
        ? t('connect.connected', { name: connectedDeviceName || 'HC-05' })
        : error
          ? error
          : t('connect.selectDevice');

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name={status === 'connected' ? 'bluetooth-connected' : 'bluetooth'}
            size={28}
            color={status === 'connected' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <View style={styles.statusTextWrap}>
            {status === 'connecting' ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
            ) : null}
            <Text style={[styles.statusText, error && styles.statusError]}>{statusText}</Text>
          </View>
        </View>
        {status === 'connected' ? (
          <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect} activeOpacity={0.8}>
            <Text style={styles.disconnectLabel}>{t('connect.disconnect')}</Text>
          </TouchableOpacity>
        ) : error ? (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryLabel}>{t('connect.retry')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t('connect.pairedDevices')}</Text>
      {devices.length === 0 ? (
        <Text style={styles.empty}>{t('connect.noPairedDevices')}</Text>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {devices.map((d) => (
            <TouchableOpacity
              key={d.address}
              style={styles.row}
              onPress={() => onDevicePress(d)}
              disabled={status === 'connecting'}
              activeOpacity={0.8}
            >
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons
                  name="bluetooth"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>{d.name || t('connect.unknownDevice')}</Text>
                <Text style={styles.rowAddress} numberOfLines={1}>{d.address}</Text>
              </View>
              {connectedDeviceName && (d.name === connectedDeviceName || (d.name === '' && connectedDeviceName === 'HC-05')) ? (
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
              ) : (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextWrap: {
    flex: 1,
    marginLeft: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginRight: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  statusError: {
    color: theme.colors.danger,
  },
  disconnectButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  disconnectLabel: {
    ...theme.typography.body,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  retryLabel: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  empty: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  rowAddress: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
