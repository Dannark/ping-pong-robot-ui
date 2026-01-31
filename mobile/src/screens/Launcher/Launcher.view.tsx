import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { SpinClockPicker } from '../../components/SpinClockPicker/SpinClockPicker';
import type { SpinDirection } from '../../data/RobotConfig';

type LauncherViewProps = {
  launcherPower: number;
  spinDirection: SpinDirection;
  spinIntensity: number;
  onPowerChange: (value: number) => void;
  onSpinDirectionChange: (value: SpinDirection) => void;
  onSpinIntensityChange: (value: number) => void;
  onReset: () => void;
};

const CLOCK_SIZE = 200;

export function LauncherView({
  launcherPower,
  spinDirection,
  spinIntensity,
  onPowerChange,
  onSpinDirectionChange,
  onSpinIntensityChange,
  onReset,
}: LauncherViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Power</Text>
          <Text style={styles.value}>{launcherPower}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={launcherPower}
          onValueChange={onPowerChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Spin direction</Text>
        <View style={styles.clockWrap}>
          <SpinClockPicker
            size={CLOCK_SIZE}
            value={spinDirection}
            onSelect={onSpinDirectionChange}
          />
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>Spin intensity</Text>
          <Text style={styles.value}>{spinIntensity}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={512}
          step={1}
          value={spinIntensity}
          onValueChange={onSpinIntensityChange}
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
  clockWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
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
