import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import type { ServoLimits } from '../../data/HardwareSettingsRepository';

type SettingsServoPanViewProps = {
  limits: ServoLimits;
  onMinChange: (v: number) => void;
  onMidChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  onReset: () => void;
};

export function SettingsServoPanView({
  limits,
  onMinChange,
  onMidChange,
  onMaxChange,
  onReset,
}: SettingsServoPanViewProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sliderRow}>
          <Text style={styles.label}>{t('settings.servoMid')}</Text>
          <Text style={styles.value}>{limits.mid}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={180}
          step={1}
          value={limits.mid}
          onValueChange={onMidChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
      </View>
      <View style={styles.section}>
        <View style={styles.angleRangeRow}>
          <View style={styles.angleRangeCol}>
            <View style={styles.sliderRow}>
              <Text style={styles.label}>{t('settings.servoMin')}</Text>
              <Text style={styles.value}>{limits.min}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              step={1}
              value={limits.min}
              onValueChange={onMinChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
          <View style={styles.angleRangeCol}>
            <View style={styles.sliderRow}>
              <Text style={styles.label}>{t('settings.servoMax')}</Text>
              <Text style={styles.value}>{limits.max}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              step={1}
              value={limits.max}
              onValueChange={onMaxChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('pan.reset')}</Text>
      </TouchableOpacity>
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
  angleRangeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  angleRangeCol: {
    flex: 1,
    minWidth: 0,
  },
  slider: { width: '100%', height: 40 },
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
