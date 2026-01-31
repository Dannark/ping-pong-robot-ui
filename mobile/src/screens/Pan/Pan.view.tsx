import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
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
  tiltAuto1Speed: number;
  tiltAuto2Step: number;
  axisModes: AxisMode[];
  onModeSelect: (mode: AxisMode) => void;
  onPanTargetChange: (value: number) => void;
  onPanMinChange: (value: number) => void;
  onPanMaxChange: (value: number) => void;
  onPanAuto2StepChange: (value: number) => void;
  onReset: () => void;
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
  tiltAuto1Speed,
  tiltAuto2Step,
  axisModes,
  onModeSelect,
  onPanTargetChange,
  onPanMinChange,
  onPanMaxChange,
  onPanAuto2StepChange,
  onReset,
}: PanViewProps) {
  const isAuto = panMode === 'AUTO1' || panMode === 'AUTO2';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>Aim (Pan + Tilt)</Text>
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
          tiltAuto1Speed={tiltAuto1Speed}
          tiltAuto2Step={tiltAuto2Step}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
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
      </View>
      {panMode === 'LIVE' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>Initial Pan target</Text>
            <Text style={styles.value}>{panTarget.toFixed(2)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
            value={panTarget}
            onValueChange={onPanTargetChange}
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
          <Text style={styles.label}>Angle range (Pan)</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>Min</Text>
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
          <View style={styles.sliderRow}>
            <Text style={styles.label}>Max</Text>
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
        );
      })()}
      {panMode === 'AUTO2' && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>AUTO2 Step</Text>
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
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>Reset</Text>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
