import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import type { AxisMode } from '../../data/RobotConfig';

type TiltViewProps = {
  tiltMode: AxisMode;
  panTarget: number;
  tiltTarget: number;
  axisModes: AxisMode[];
  onModeSelect: (mode: AxisMode) => void;
  onTiltTargetChange: (value: number) => void;
  onReset: () => void;
};

const PREVIEW_SIZE = 140;

export function TiltView({
  tiltMode,
  panTarget,
  tiltTarget,
  axisModes,
  onModeSelect,
  onTiltTargetChange,
  onReset,
}: TiltViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>Aim (Pan + Tilt)</Text>
        <AimPreview size={PREVIEW_SIZE} pan={panTarget} tilt={tiltTarget} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
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
      </View>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Tilt target</Text>
          <Text style={styles.value}>{tiltTarget.toFixed(2)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={-1}
          maximumValue={1}
          step={0.01}
          value={tiltTarget}
          onValueChange={onTiltTargetChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
      </View>
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
