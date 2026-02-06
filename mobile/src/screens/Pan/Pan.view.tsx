import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import type { AxisMode } from '../../data/RobotConfig';

type PanViewProps = {
  panMode: AxisMode;
  panTarget: number;
  panMin: number;
  panMax: number;
  tiltTarget: number;
  tiltMode: AxisMode;
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
  onPanTargetChange: (value: number) => void;
  onPanMinChange: (value: number) => void;
  onPanMaxChange: (value: number) => void;
  onPanAuto1SpeedChange: (value: number) => void;
  onPanAuto2StepChange: (value: number) => void;
  onPanAuto2PauseMsChange: (value: number) => void;
  onPanAuto3MinDistChange: (value: number) => void;
  onPanAuto3PauseMsChange: (value: number) => void;
  onReset: () => void;
  onPanSlidingComplete?: () => void;
  liveSliderKey?: number;
};

const PREVIEW_SIZE = 140;

export function PanView({
  panMode,
  panTarget,
  panMin,
  panMax,
  tiltTarget,
  tiltMode,
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
  onPanTargetChange,
  onPanMinChange,
  onPanMaxChange,
  onPanAuto1SpeedChange,
  onPanAuto2StepChange,
  onPanAuto2PauseMsChange,
  onPanAuto3MinDistChange,
  onPanAuto3PauseMsChange,
  onReset,
  onPanSlidingComplete,
  liveSliderKey,
}: PanViewProps) {
  const { t } = useTranslation();
  const isAuto = panMode === 'AUTO1' || panMode === 'AUTO2' || panMode === 'RANDOM';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>{t('pan.previewLabel')}</Text>
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
        <Text style={styles.label}>{t('pan.mode')}</Text>
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
                style={[styles.chip, panMode === mode && styles.chipSelected]}
                onPress={() => onModeSelect(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, panMode === mode && styles.chipTextSelected]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      {panMode === 'LIVE' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.initialPanTarget')}</Text>
            <Text style={styles.value}>{panTarget.toFixed(2)}</Text>
          </View>
          <Slider
            key={liveSliderKey}
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.025}
            value={(panTarget + 1) / 2}
            onValueChange={(v) => onPanTargetChange(v * 2 - 1)}
            onSlidingComplete={onPanSlidingComplete}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {isAuto && (() => {
        const minSliderMax = Math.min(1, panMax - 0.1);
        const minRange = minSliderMax - (-1);
        const minSliderNorm = minRange > 0 ? (panMin - (-1)) / minRange : 0;
        return (
        <View style={styles.section}>
          <Text style={styles.label}>{t('pan.angleRangePan')}</Text>
          <View style={styles.angleRangeRow}>
            <View style={styles.angleRangeCol}>
              <View style={styles.sliderRow}>
                <Text style={styles.label}>{t('pan.min')}</Text>
                <Text style={styles.value}>{panMin.toFixed(1)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={minRange > 0 ? 0.1 / minRange : 0.01}
                value={minSliderNorm}
                onValueChange={(raw) => {
                  const v = -1 + raw * minRange;
                  onPanMinChange(Math.round(v * 10) / 10);
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.angleRangeCol}>
              <View style={styles.sliderRow}>
                <Text style={styles.label}>{t('pan.max')}</Text>
                <Text style={styles.value}>{panMax.toFixed(1)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={Math.max(-1, panMin + 0.1)}
                maximumValue={1}
                step={0.1}
                value={panMax}
                onValueChange={onPanMaxChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </View>
        </View>
        );
      })()}
      {panMode === 'AUTO1' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.auto1Speed')}</Text>
            <Text style={styles.value}>{panAuto1Speed.toFixed(3)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.01}
            maximumValue={0.1}
            step={0.005}
            value={panAuto1Speed}
            onValueChange={onPanAuto1SpeedChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {panMode === 'AUTO2' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.auto2Step')}</Text>
            <Text style={styles.value}>{panAuto2Step.toFixed(2)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.05}
            maximumValue={0.5}
            step={0.05}
            value={panAuto2Step}
            onValueChange={onPanAuto2StepChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.timeBetweenPositions')}</Text>
            <Text style={styles.value}>{panAuto2PauseMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={200}
            maximumValue={3000}
            step={100}
            value={panAuto2PauseMs}
            onValueChange={onPanAuto2PauseMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {panMode === 'RANDOM' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.randomMinDist')}</Text>
            <Text style={styles.value}>{panRandomMinDist.toFixed(2)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1}
            step={0.1}
            value={panRandomMinDist}
            onValueChange={onPanAuto3MinDistChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('pan.timeBetweenPositions')}</Text>
            <Text style={styles.value}>{panRandomPauseMs}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1500}
            maximumValue={5000}
            step={100}
            value={panRandomPauseMs}
            onValueChange={onPanAuto3PauseMsChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('pan.reset')}</Text>
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
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
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
