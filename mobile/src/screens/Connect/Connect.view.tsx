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

export type BLEDeviceItem = { id: string; name: string | null; lastSeen?: number };

type ConnectViewProps = {
  devices: BLEDeviceItem[];
  status: 'disconnected' | 'connecting' | 'connected' | 'scanning';
  error?: string;
  connectedDeviceName: string | null;
  robotCount: number;
  totalCount: number;
  isRobotDevice: (device: BLEDeviceItem) => boolean;
  onDevicePress: (device: BLEDeviceItem) => void;
  onDisconnect: () => void;
};

export function ConnectView({
  devices,
  status,
  error,
  connectedDeviceName,
  robotCount,
  totalCount,
  isRobotDevice,
  onDevicePress,
  onDisconnect,
}: ConnectViewProps) {
  const { t } = useTranslation();

  const statusText =
    status === 'scanning'
      ? t('connect.scanning')
      : status === 'connecting'
        ? t('connect.connecting')
        : status === 'connected'
          ? t('connect.connected', { name: connectedDeviceName || 'HM-10' })
          : error
            ? error
            : t('connect.selectDevice');

  const showSearching = status === 'scanning' || status === 'connecting';

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
            {showSearching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
            ) : null}
            <Text style={[styles.statusText, error && styles.statusError]}>{statusText}</Text>
          </View>
        </View>
        {status === 'connected' ? (
          <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect} activeOpacity={0.8}>
            <Text style={styles.disconnectLabel}>{t('connect.disconnect')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{t('connect.availableDevices')}</Text>
        <Text style={styles.sectionCount}>{robotCount}/{totalCount}</Text>
      </View>
      {devices.length === 0 ? (
        <Text style={styles.empty}>{t('connect.noDevices')}</Text>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {devices.map((d) => {
            const isRobot = isRobotDevice(d);
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.row, !isRobot && styles.rowNotRobot]}
                onPress={() => isRobot && onDevicePress(d)}
                disabled={status === 'connecting' || !isRobot}
                activeOpacity={0.8}
              >
                <View style={[styles.rowIconWrap, !isRobot && styles.rowIconWrapNotRobot]}>
                  <MaterialCommunityIcons
                    name="bluetooth"
                    size={24}
                    color={isRobot ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, !isRobot && styles.rowTextNotRobot]} numberOfLines={1}>{d.name || t('connect.unknownDevice')}</Text>
                  <Text style={[styles.rowAddress, !isRobot && styles.rowTextNotRobot]} numberOfLines={1}>{d.id}</Text>
                </View>
                {connectedDeviceName && (d.name === connectedDeviceName || (!d.name && connectedDeviceName === 'HM-10')) ? (
                  <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={24} color={isRobot ? theme.colors.textSecondary : theme.colors.border} />
                )}
              </TouchableOpacity>
            );
          })}
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.text,
  },
  sectionCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
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
  rowNotRobot: {
    opacity: 0.7,
    backgroundColor: theme.colors.background,
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
  rowIconWrapNotRobot: {
    backgroundColor: theme.colors.border,
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
  rowTextNotRobot: {
    color: theme.colors.textSecondary,
  },
});
