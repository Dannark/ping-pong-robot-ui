import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import { FeederVisualization } from '../../components/FeederVisualization/FeederVisualization';
import { SpinVisualization } from '../../components/SpinVisualization/SpinVisualization';
import type { WizardItem } from './Wizard.viewModel';
import { getFeederOnOffMs, type RobotConfig, type SpinDirection } from '../../data/RobotConfig';

type WizardViewProps = {
  items: WizardItem[];
  config: RobotConfig;
  displaySpin: SpinDirection;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  willTryReconnect?: boolean;
  onItemPress: (screen: WizardItem['screen']) => void;
  onStartPress: () => void;
};

const PREVIEW_SIZE = 90;
const SPIN_PREVIEW_SIZE = 90;

export function WizardView({ items, config, displaySpin, connectionStatus, willTryReconnect, onItemPress, onStartPress }: WizardViewProps) {
  const { t } = useTranslation();
  const spinForPreview = config.spinRandom ? displaySpin : config.spinDirection;
  const showReconnectingMessage =
    connectionStatus === 'connecting' || (connectionStatus === 'disconnected' && willTryReconnect);

  return (
    <View style={styles.container}>
      <View style={styles.robotStatus}>
        <MaterialCommunityIcons
          name={connectionStatus === 'connected' ? 'bluetooth-connect' : 'bluetooth'}
          size={20}
          color={connectionStatus === 'connected' ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text style={[styles.robotStatusText, connectionStatus === 'connected' && styles.robotStatusConnected]}>
          {connectionStatus === 'connected'
            ? t('wizard.robotConnected')
            : showReconnectingMessage
              ? t('wizard.reconnectingInSeconds')
              : t('wizard.robotDisconnected')}
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>{t('wizard.preview')}</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewBlock}>
              <Text style={styles.previewLabel}>{t('wizard.aim')}</Text>
              <AimPreview
                size={PREVIEW_SIZE}
                pan={config.panTarget}
                tilt={config.tiltTarget}
                panMode={config.panMode}
                tiltMode={config.tiltMode}
                panMin={config.panMin}
                panMax={config.panMax}
                tiltMin={config.tiltMin}
                tiltMax={config.tiltMax}
                panAuto1Speed={config.panAuto1Speed}
                panAuto2Step={config.panAuto2Step}
                panAuto2PauseMs={config.panAuto2PauseMs}
                tiltAuto1Speed={config.tiltAuto1Speed}
                tiltAuto2Step={config.tiltAuto2Step}
                tiltAuto2PauseMs={config.tiltAuto2PauseMs}
                panRandomMinDist={config.panRandomMinDist}
                panRandomPauseMs={config.panRandomPauseMs}
                tiltRandomMinDist={config.tiltRandomMinDist}
                tiltRandomPauseMs={config.tiltRandomPauseMs}
              />
            </View>
            <View style={styles.previewBlock}>
              <Text style={styles.previewLabel}>{t('wizard.feeder')}</Text>
              <FeederVisualization
                size={PREVIEW_SIZE}
                feederMode={config.feederMode}
                feederSpeed={config.feederSpeed}
                feederOnMs={getFeederOnOffMs(
                  config.feederMode,
                  config.feederCustomOnMs,
                  config.feederCustomOffMs
                ).onMs}
                feederOffMs={getFeederOnOffMs(
                  config.feederMode,
                  config.feederCustomOnMs,
                  config.feederCustomOffMs
                ).offMs}
                animate={true}
              />
            </View>
            <View style={styles.previewBlock}>
              <Text style={styles.previewLabel}>{t('wizard.spin')}</Text>
              <SpinVisualization
                size={SPIN_PREVIEW_SIZE}
                spinDirection={spinForPreview}
                spinIntensity={config.spinIntensity}
                launcherPower={config.launcherPower}
                animate={true}
              />
            </View>
          </View>
        </View>

        <View style={styles.list}>
          {items.map(({ label, value, screen, icon }) => (
            <TouchableOpacity
              key={screen}
              style={styles.row}
              onPress={() => onItemPress(screen)}
              activeOpacity={0.8}
            >
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.rowLabel}>{label}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{value}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, connectionStatus !== 'connected' && styles.startButtonDisabled]}
          onPress={onStartPress}
          activeOpacity={0.85}
          disabled={connectionStatus !== 'connected'}
        >
          <MaterialCommunityIcons
            name="play"
            size={28}
            color={connectionStatus === 'connected' ? theme.colors.background : theme.colors.textSecondary}
          />
          <Text style={[styles.startLabel, connectionStatus !== 'connected' && styles.startLabelDisabled]}>
            {t('wizard.start')}
          </Text>
        </TouchableOpacity>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  robotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  robotStatusText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  robotStatusConnected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  previewSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  previewTitle: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  previewBlock: {
    alignItems: 'center',
  },
  previewLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minHeight: theme.touchableMinHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowValue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    minHeight: 56,
    ...theme.shadow.md,
  },
  startLabel: {
    ...theme.typography.hero,
    color: theme.colors.background,
    fontSize: 22,
  },
  startButtonDisabled: {
    backgroundColor: theme.colors.surfaceOverlay,
  },
  startLabelDisabled: {
    color: theme.colors.textSecondary,
  },
});
