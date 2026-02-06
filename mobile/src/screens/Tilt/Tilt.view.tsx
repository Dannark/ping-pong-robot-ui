import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import type { AxisMode } from '../../data/RobotConfig';

type TiltViewProps = {
  tiltMode: AxisMode;
  panTarget: number;
  tiltTarget: number;
  panMode: AxisMode;
  panMin: number;
  panMax: number;
  tiltMin: number;
  tiltMax: number;
  panAuto1Speed: number;
  panAuto2Step: number;
  panAuto2PauseMs: number;
  tiltAuto1Speed: number;
  tiltAuto2Step: number;
  tiltAuto2PauseMs: number;
  panRandomMinDist: number;
  panRandomPauseMs: number;
  tiltRandomMinDist: number;
  tiltRandomPauseMs: number;
  axisModes: AxisMode[];
  onModeSelect: (mode: AxisMode) => void;
  onTiltTargetChange: (value: number) => void;
  onTiltMinChange: (value: number) => void;
  onTiltMaxChange: (value: number) => void;
  onTiltAuto1SpeedChange: (value: number) => void;
  onTiltAuto2StepChange: (value: number) => void;
  onTiltAuto2PauseMsChange: (value: number) => void;
  onTiltAuto3MinDistChange: (value: number) => void;
  onTiltAuto3PauseMsChange: (value: number) => void;
  onReset: () => void;
  onTiltSlidingComplete?: () => void;
  liveSliderKey?: number;
};

const PREVIEW_SIZE = 140;

export function TiltView({
  tiltMode,
  panTarget,
  tiltTarget,
  panMode,
  panMin,
  panMax,
  tiltMin,
  tiltMax,
  panAuto1Speed,
  panAuto2Step,
  panAuto2PauseMs,
  tiltAuto1Speed,
  tiltAuto2Step,
  tiltAuto2PauseMs,
  panRandomMinDist,
  panRandomPauseMs,
  tiltRandomMinDist,
  tiltRandomPauseMs,
  axisModes,
  onModeSelect,
  onTiltTargetChange,
  onTiltMinChange,
  onTiltMaxChange,
  onTiltAuto1SpeedChange,
  onTiltAuto2StepChange,
  onTiltAuto2PauseMsChange,
  onTiltAuto3MinDistChange,
  onTiltAuto3PauseMsChange,
  onReset,
  onTiltSlidingComplete,
  liveSliderKey,
}: TiltViewProps) {
  const { t } = useTranslation();
  const isAuto = tiltMode === 'AUTO1' || tiltMode === 'AUTO2' || tiltMode === 'RANDOM';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>{t('tilt.previewLabel')}</Text>
        <AimPreview
          size={PREVIEW_SIZE}
          pan={panTarget}
          tilt={tiltTarget}
          panMode={panMode}
          tiltMode={tiltMode}
          panMin={panMin}
          panMax={panMax}
          tiltMin={tiltMin}
          tiltMax={tiltMax}
          panAuto1Speed={panAuto1Speed}
          panAuto2Step={panAuto2Step}
          panAuto2PauseMs={panAuto2PauseMs}
          tiltAuto1Speed={tiltAuto1Speed}
          tiltAuto2Step={tiltAuto2Step}
          tiltAuto2PauseMs={tiltAuto2PauseMs}
          panRandomMinDist={panRandomMinDist}
          panRandomPauseMs={panRandomPauseMs}
          tiltRandomMinDist={tiltRandomMinDist}
          tiltRandomPauseMs={tiltRandomPauseMs}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t('tilt.mode')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
          style={styles.chipScroll}
        >
          <View style={styles.chipRow}>
            {axisModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.chip, tiltMode === mode && styles.chipSelected]}
                onPress={() => onModeSelect(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, tiltMode === mode && styles.chipTextSelected]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      {tiltMode === 'LIVE' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.initialTiltTarget')}</Text>
            <Text style={styles.value}>{tiltTarget.toFixed(2)}</Text>
          </View>
          <Slider
            key={liveSliderKey}
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.025}
            value={(tiltTarget + 1) / 2}
            onValueChange={(v) => onTiltTargetChange(v * 2 - 1)}
            onSlidingComplete={onTiltSlidingComplete}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {isAuto && (() => {
        const minSliderMax = Math.min(1, tiltMax - 0.1);
        const minRange = minSliderMax - (-1);
        const minSliderNorm = minRange > 0 ? (tiltMin - (-1)) / minRange : 0;
        return (
        <View style={styles.section}>
          <Text style={styles.label}>{t('tilt.angleRangeTilt')}</Text>
          <View style={styles.angleRangeRow}>
            <View style={styles.angleRangeCol}>
              <View style={styles.sliderRow}>
                <Text style={styles.label}>{t('tilt.min')}</Text>
                <Text style={styles.value}>{tiltMin.toFixed(1)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={minRange > 0 ? 0.1 / minRange : 0.01}
                value={minSliderNorm}
                onValueChange={(raw) => {
                  const v = -1 + raw * minRange;
                  onTiltMinChange(Math.round(v * 10) / 10);
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.angleRangeCol}>
              <View style={styles.sliderRow}>
                <Text style={styles.label}>{t('tilt.max')}</Text>
                <Text style={styles.value}>{tiltMax.toFixed(1)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={Math.max(-1, tiltMin + 0.1)}
                maximumValue={1}
                step={0.1}
                value={tiltMax}
                onValueChange={onTiltMaxChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </View>
        </View>
        );
      })()}
      {tiltMode === 'AUTO1' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.auto1Speed')}</Text>
            <Text style={styles.value}>{tiltAuto1Speed.toFixed(3)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.01}
            maximumValue={0.1}
            step={0.005}
            value={tiltAuto1Speed}
            onValueChange={onTiltAuto1SpeedChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {tiltMode === 'AUTO2' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.auto2Step')}</Text>
            <Text style={styles.value}>{tiltAuto2Step.toFixed(2)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.05}
            maximumValue={0.5}
            step={0.05}
            value={tiltAuto2Step}
            onValueChange={onTiltAuto2StepChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.timeBetweenPositions')}</Text>
            <Text style={styles.value}>{tiltAuto2PauseMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={3000}
            step={100}
            value={tiltAuto2PauseMs}
            onValueChange={onTiltAuto2PauseMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {tiltMode === 'RANDOM' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.randomMinDist')}</Text>
            <Text style={styles.value}>{tiltRandomMinDist.toFixed(2)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1}
            step={0.1}
            value={tiltRandomMinDist}
            onValueChange={onTiltAuto3MinDistChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('tilt.timeBetweenPositions')}</Text>
            <Text style={styles.value}>{tiltRandomPauseMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1500}
            maximumValue={5000}
            step={100}
            value={tiltRandomPauseMs}
            onValueChange={onTiltAuto3PauseMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('tilt.reset')}</Text>
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
    paddingBottom: theme.spacing.xl,
  },
  previewSection: {
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
  angleRangeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  angleRangeCol: {
    flex: 1,
    minWidth: 0,
  },
  slider: {
    width: '100%',
    height: 40,
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
