import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

type TimerViewProps = {
  timerIndex: number;
  timerSoundAlert: boolean;
  options: readonly string[];
  onSelect: (index: number) => void;
  onTimerSoundAlertChange: (value: boolean) => void;
  onReset: () => void;
};

export function TimerView({
  timerIndex,
  timerSoundAlert,
  options,
  onSelect,
  onTimerSoundAlertChange,
  onReset,
}: TimerViewProps) {
  const { t } = useTranslation();
  const timerEnabled = timerIndex !== 0;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>{t('timer.label')}</Text>
        <View style={styles.chipRow}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, timerIndex === i && styles.chipSelected]}
              onPress={() => onSelect(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, timerIndex === i && styles.chipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {timerEnabled && (
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>{t('timer.soundAlert')}</Text>
            <Switch
              value={timerSoundAlert}
              onValueChange={onTimerSoundAlertChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
              thumbColor={timerSoundAlert ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.85}>
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.text} />
        <Text style={styles.resetLabel}>{t('timer.reset')}</Text>
      </TouchableOpacity>
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
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
