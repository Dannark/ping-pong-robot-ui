import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { FeederVisualization } from '../../components/FeederVisualization/FeederVisualization';
import {
  estimateBallsPerMinute,
  effectiveBallsPerMinute,
  DEFAULT_FEEDER_VOLTAGE,
} from '../../data/feederCalibration';
import { getFeederOnOffMs, type FeederMode } from '../../data/RobotConfig';
import { FeederModeGraph } from '../../components/FeederModeGraph/FeederModeGraph';

const VISUALIZER_SIZE = 160;
const CUSTOM_STEP_MS = 250;
const CUSTOM_MIN_MS = 500;
const CUSTOM_MAX_MS = 5000;

type FeederViewProps = {
  feederMode: FeederMode;
  feederSpeed: number;
  feederCustomOnMs: number;
  feederCustomOffMs: number;
  feederModes: FeederMode[];
  onModeSelect: (mode: FeederMode) => void;
  onSpeedChange: (value: number) => void;
  onCustomOnMsChange: (value: number) => void;
  onCustomOffMsChange: (value: number) => void;
  onReset: () => void;
};

export function FeederView({
  feederMode,
  feederSpeed,
  feederCustomOnMs,
  feederCustomOffMs,
  feederModes,
  onModeSelect,
  onSpeedChange,
  onCustomOnMsChange,
  onCustomOffMsChange,
  onReset,
}: FeederViewProps) {
  const { t } = useTranslation();
  const { onMs: visOnMs, offMs: visOffMs } = getFeederOnOffMs(
    feederMode,
    feederCustomOnMs,
    feederCustomOffMs
  );
  const continuousBalls = estimateBallsPerMinute(feederSpeed);
  const displayBallsPerMin =
    feederMode === 'CONT'
      ? continuousBalls
      : effectiveBallsPerMinute(continuousBalls, visOnMs, visOffMs);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.visualizerSection}>
        <Text style={styles.previewLabel}>{t('wizard.feeder')}</Text>
        <FeederVisualization
          size={VISUALIZER_SIZE}
          feederMode={feederMode}
          feederSpeed={feederSpeed}
          feederOnMs={visOnMs}
          feederOffMs={visOffMs}
          animate={true}
        />
        <View style={styles.modeGraphWrap}>
          <FeederModeGraph
            feederMode={feederMode}
            onMs={visOnMs}
            offMs={visOffMs}
            width={VISUALIZER_SIZE}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t('feeder.mode')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
          style={styles.chipScroll}
        >
          <View style={styles.chipRow}>
            {feederModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.chip, feederMode === mode && styles.chipSelected]}
                onPress={() => onModeSelect(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, feederMode === mode && styles.chipTextSelected]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>{t('feeder.speed')}</Text>
          <Text style={styles.value}>{feederSpeed}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={feederSpeed}
          onValueChange={onSpeedChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.ballsPerMinRow}>
          <Text style={styles.ballsPerMinLabel}>
            {feederSpeed < 60
              ? t('feeder.ballsPerMinZero', { voltage: DEFAULT_FEEDER_VOLTAGE })
              : t('feeder.ballsPerMin', {
                  count: displayBallsPerMin,
                  voltage: DEFAULT_FEEDER_VOLTAGE,
                })}
          </Text>
        </View>
      </View>
      {feederMode === 'CUSTOM' && (
        <View style={styles.section}>
          <Text style={styles.label}>{t('feeder.customLabel')}</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.on')}</Text>
            <Text style={styles.value}>{(feederCustomOnMs / 1000).toFixed(2)} s</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={CUSTOM_MIN_MS}
            maximumValue={CUSTOM_MAX_MS}
            step={CUSTOM_STEP_MS}
            value={feederCustomOnMs}
            onValueChange={onCustomOnMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.off')}</Text>
            <Text style={styles.value}>{(feederCustomOffMs / 1000).toFixed(2)} s</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={CUSTOM_MIN_MS}
            maximumValue={CUSTOM_MAX_MS}
            step={CUSTOM_STEP_MS}
            value={feederCustomOffMs}
            onValueChange={onCustomOffMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('feeder.reset')}</Text>
      </TouchableOpacity>
      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
  },
  visualizerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  modeGraphWrap: {
    marginTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  chipScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  chipScrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.background,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ballsPerMinRow: {
    marginTop: theme.spacing.sm,
  },
  ballsPerMinLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
