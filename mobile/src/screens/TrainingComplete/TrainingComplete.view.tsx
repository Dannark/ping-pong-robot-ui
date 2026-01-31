import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { RobotConfig } from '../../data/RobotConfig';
import { TIMER_OPTIONS } from '../../data/RobotConfig';

type TrainingCompleteViewProps = {
  elapsedSeconds: number;
  runConfig: RobotConfig | null;
  onBackToWizard: () => void;
};

const STAR_COUNT = 5;

export function TrainingCompleteView({
  elapsedSeconds,
  runConfig,
  onBackToWizard,
}: TrainingCompleteViewProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}min ${s}s` : `${s}s`;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="check-circle" size={56} color={theme.colors.success} />
        </View>
        <Text style={styles.title}>{t('trainingComplete.title')}</Text>
        <Text style={styles.subtitle}>{t('trainingComplete.subtitle')}</Text>
      </View>

      {runConfig && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('trainingComplete.statsTitle')}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.time')}</Text>
            <Text style={styles.statsValue}>{formatTime(elapsedSeconds)}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.pan')}</Text>
            <Text style={styles.statsValue}>{runConfig.panMode}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.tilt')}</Text>
            <Text style={styles.statsValue}>{runConfig.tiltMode}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.power')}</Text>
            <Text style={styles.statsValue}>{runConfig.launcherPower}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.spin')}</Text>
            <Text style={styles.statsValue}>
              {runConfig.spinRandom ? 'Random' : runConfig.spinDirection}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>{t('trainingComplete.timer')}</Text>
            <Text style={styles.statsValue}>
              {TIMER_OPTIONS[runConfig.timerIndex] ?? 'OFF'}
            </Text>
          </View>
          <View style={[styles.statsRow, styles.statsRowLast]}>
            <Text style={styles.statsLabel}>{t('trainingComplete.feeder')}</Text>
            <Text style={styles.statsValue}>{runConfig.feederMode}</Text>
          </View>
        </View>
      )}

      <View style={styles.ratingCard}>
        <Text style={styles.ratingQuestion}>{t('trainingComplete.ratingQuestion')}</Text>
        <View style={styles.starsRow}>
          {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              style={styles.starTouch}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={value <= rating ? 'star' : 'star-outline'}
                size={36}
                color={value <= rating ? theme.colors.warning : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingHint}>
          {rating === 0 ? t('trainingComplete.ratingHint') : t('trainingComplete.ratingStars', { count: rating })}
        </Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBackToWizard} activeOpacity={0.85}>
        <MaterialCommunityIcons name="wizard-hat" size={22} color={theme.colors.text} />
        <Text style={styles.backLabel}>{t('trainingComplete.backToWizard')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconWrap: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statsRowLast: {
    borderBottomWidth: 0,
  },
  statsLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  ratingQuestion: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  starTouch: {
    padding: theme.spacing.xs,
  },
  ratingHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    minHeight: theme.touchableMinHeight,
    ...theme.shadow.sm,
  },
  backLabel: {
    ...theme.typography.header,
    color: theme.colors.background,
  },
});
