import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import type { FeederMode } from '../../data/RobotConfig';

type FeederViewProps = {
  feederMode: FeederMode;
  feederSpeed: number;
  feederModes: FeederMode[];
  onModeSelect: (mode: FeederMode) => void;
  onSpeedChange: (value: number) => void;
};

export function FeederView({
  feederMode,
  feederSpeed,
  feederModes,
  onModeSelect,
  onSpeedChange,
}: FeederViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
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
      </View>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Speed</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
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
});
