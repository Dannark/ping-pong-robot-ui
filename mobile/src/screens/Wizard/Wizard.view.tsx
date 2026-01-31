import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import { SpinVisualization } from '../../components/SpinVisualization/SpinVisualization';
import type { WizardItem } from './Wizard.viewModel';
import type { RobotConfig, SpinDirection } from '../../data/RobotConfig';

type WizardViewProps = {
  items: WizardItem[];
  config: RobotConfig;
  displaySpin: SpinDirection;
  onItemPress: (screen: WizardItem['screen']) => void;
  onStartPress: () => void;
};

const PREVIEW_SIZE = 100;
const SPIN_PREVIEW_SIZE = 100;

export function WizardView({ items, config, displaySpin, onItemPress, onStartPress }: WizardViewProps) {
  const spinForPreview = config.spinRandom ? displaySpin : config.spinDirection;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewBlock}>
              <Text style={styles.previewLabel}>Aim</Text>
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
                panAuto3MinDist={config.panAuto3MinDist}
                panAuto3PauseMs={config.panAuto3PauseMs}
                tiltAuto3MinDist={config.tiltAuto3MinDist}
                tiltAuto3PauseMs={config.tiltAuto3PauseMs}
              />
            </View>
            <View style={styles.previewBlock}>
              <Text style={styles.previewLabel}>Spin</Text>
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

        <TouchableOpacity style={styles.startButton} onPress={onStartPress} activeOpacity={0.85}>
          <MaterialCommunityIcons name="play" size={28} color={theme.colors.background} />
          <Text style={styles.startLabel}>Iniciar</Text>
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
});
