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
import { estimateBallsPerMinute, DEFAULT_FEEDER_VOLTAGE } from '../../data/feederCalibration';
import type { FeederMode } from '../../data/RobotConfig';

const VISUALIZER_SIZE = 160;

type FeederViewProps = {
  feederMode: FeederMode;
  feederSpeed: number;
  feederP1OnMs: number;
  feederP1OffMs: number;
  feederP2OnMs: number;
  feederP2OffMs: number;
  feederModes: FeederMode[];
  onModeSelect: (mode: FeederMode) => void;
  onSpeedChange: (value: number) => void;
  onP1OnMsChange: (value: number) => void;
  onP1OffMsChange: (value: number) => void;
  onP2OnMsChange: (value: number) => void;
  onP2OffMsChange: (value: number) => void;
  onReset: () => void;
};

export function FeederView({
  feederMode,
  feederSpeed,
  feederP1OnMs,
  feederP1OffMs,
  feederP2OnMs,
  feederP2OffMs,
  feederModes,
  onModeSelect,
  onSpeedChange,
  onP1OnMsChange,
  onP1OffMsChange,
  onP2OnMsChange,
  onP2OffMsChange,
  onReset,
}: FeederViewProps) {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.visualizerSection}>
        <Text style={styles.previewLabel}>{t('wizard.feeder')}</Text>
        <FeederVisualization
          size={VISUALIZER_SIZE}
          feederMode={feederMode}
          feederSpeed={feederSpeed}
          feederP1OnMs={feederP1OnMs}
          feederP1OffMs={feederP1OffMs}
          feederP2OnMs={feederP2OnMs}
          feederP2OffMs={feederP2OffMs}
          animate={true}
        />
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
                  count: estimateBallsPerMinute(feederSpeed),
                  voltage: DEFAULT_FEEDER_VOLTAGE,
                })}
          </Text>
        </View>
      </View>
      {feederMode === 'P1/1' && (
        <View style={styles.section}>
          <Text style={styles.label}>{t('feeder.p1Label')}</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.on')}</Text>
            <Text style={styles.value}>{feederP1OnMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={3000}
            step={100}
            value={feederP1OnMs}
            onValueChange={onP1OnMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.off')}</Text>
            <Text style={styles.value}>{feederP1OffMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={3000}
            step={100}
            value={feederP1OffMs}
            onValueChange={onP1OffMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {feederMode === 'P2/2' && (
        <View style={styles.section}>
          <Text style={styles.label}>{t('feeder.p2Label')}</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.on')}</Text>
            <Text style={styles.value}>{feederP2OnMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={5000}
            step={100}
            value={feederP2OnMs}
            onValueChange={onP2OnMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('feeder.off')}</Text>
            <Text style={styles.value}>{feederP2OffMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={5000}
            step={100}
            value={feederP2OffMs}
            onValueChange={onP2OffMsChange}
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
