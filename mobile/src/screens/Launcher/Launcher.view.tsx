import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { SpinClockPicker } from '../../components/SpinClockPicker/SpinClockPicker';
import { SpinVisualization } from '../../components/SpinVisualization/SpinVisualization';
import type { SpinDirection } from '../../data/RobotConfig';
import { getLauncherMotorSpeeds } from '../../data/RobotConfig';

type LauncherViewProps = {
  launcherPower: number;
  spinDirection: SpinDirection;
  spinIntensity: number;
  spinRandom: boolean;
  spinRandomIntervalSec: number;
  displaySpin: SpinDirection;
  onPowerChange: (value: number) => void;
  onSpinDirectionChange: (value: SpinDirection) => void;
  onSpinIntensityChange: (value: number) => void;
  onSpinRandomChange: (value: boolean) => void;
  onSpinRandomIntervalSecChange: (value: number) => void;
  onReset: () => void;
};

const CLOCK_SIZE = 200;
const SPIN_PREVIEW_SIZE = 100;

const SPIN_RANDOM_INTERVAL_MIN = 2;
const SPIN_RANDOM_INTERVAL_MAX = 20;

export function LauncherView({
  launcherPower,
  spinDirection,
  spinIntensity,
  spinRandom,
  spinRandomIntervalSec,
  displaySpin,
  onPowerChange,
  onSpinDirectionChange,
  onSpinIntensityChange,
  onSpinRandomChange,
  onSpinRandomIntervalSecChange,
  onReset,
}: LauncherViewProps) {
  const { t } = useTranslation();
  const spinForPreview = spinRandom ? displaySpin : spinDirection;
  const { speed1, speed2, speed3 } = getLauncherMotorSpeeds(
    launcherPower,
    spinForPreview,
    spinIntensity
  );
  const hasMotorReversed = speed1 < 0 || speed2 < 0 || speed3 < 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>{t('launcher.maxPower')}</Text>
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
        <View style={styles.randomRow}>
          <Text style={styles.label}>{t('launcher.spinRandom')}</Text>
          <Switch
            value={spinRandom}
            onValueChange={onSpinRandomChange}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
            thumbColor={spinRandom ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>
      </View>
      {spinRandom && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('launcher.randomInterval')}</Text>
            <Text style={styles.value}>{spinRandomIntervalSec}s</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={SPIN_RANDOM_INTERVAL_MIN}
            maximumValue={SPIN_RANDOM_INTERVAL_MAX}
            step={1}
            value={spinRandomIntervalSec}
            onValueChange={onSpinRandomIntervalSecChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
      {!spinRandom && (
        <View style={styles.section}>
          <Text style={styles.label}>{t('launcher.spinDirection')}</Text>
          <View style={styles.clockWrap}>
            <SpinClockPicker
              size={CLOCK_SIZE}
              value={spinDirection}
              onSelect={onSpinDirectionChange}
            />
          </View>
        </View>
      )}
      {(spinDirection !== 'NONE' || spinRandom) && (
        <View style={styles.section}>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>{t('launcher.spinIntensity')}</Text>
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
      )}
      <View style={styles.section}>
        <Text style={styles.label}>{t('launcher.previewMotors')}</Text>
        <View style={styles.previewRow}>
          <SpinVisualization
            size={SPIN_PREVIEW_SIZE}
            spinDirection={spinForPreview}
            spinIntensity={spinIntensity}
            launcherPower={launcherPower}
            animate={true}
          />
          <View style={styles.motorSpeeds}>
            <View style={styles.motorRow}>
              <Text style={styles.motorLabel}>M1</Text>
              <Text style={[styles.motorValue, speed1 < 0 && styles.motorValueReverse]}>
                {speed1}
              </Text>
            </View>
            <View style={styles.motorRow}>
              <Text style={styles.motorLabel}>M2</Text>
              <Text style={[styles.motorValue, speed2 < 0 && styles.motorValueReverse]}>
                {speed2}
              </Text>
            </View>
            <View style={styles.motorRow}>
              <Text style={styles.motorLabel}>M3</Text>
              <Text style={[styles.motorValue, speed3 < 0 && styles.motorValueReverse]}>
                {speed3}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {hasMotorReversed && (
        <View style={styles.spinWarning}>
          <Text style={styles.spinWarningText}>
            {t('launcher.motorReversedWarning')}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('launcher.reset')}</Text>
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
  randomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  motorSpeeds: {
    gap: theme.spacing.xs,
  },
  motorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 64,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  motorLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  motorValue: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  motorValueReverse: {
    color: theme.colors.warning,
  },
  spinWarning: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  spinWarningText: {
    ...theme.typography.caption,
    color: theme.colors.text,
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
