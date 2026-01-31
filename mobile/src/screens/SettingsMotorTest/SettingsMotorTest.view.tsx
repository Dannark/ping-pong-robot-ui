import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';

type SettingsMotorTestViewProps = {
  motorIndex: 1 | 2 | 3;
  speed: number;
  onSpeedChange: (v: number) => void;
};

export function SettingsMotorTestView({
  motorIndex,
  speed,
  onSpeedChange,
}: SettingsMotorTestViewProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>{t('settings.speed')}</Text>
          <Text style={styles.value}>{speed}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={speed}
          onValueChange={onSpeedChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
      </View>
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          M{motorIndex} — {t('settings.comingSoon')}
        </Text>
      </View>
      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: { marginBottom: theme.spacing.lg },
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
  slider: { width: '100%', height: 40 },
  hint: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
  },
  hintText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
