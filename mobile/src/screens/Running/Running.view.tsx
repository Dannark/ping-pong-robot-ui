import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import { SpinVisualization } from '../../components/SpinVisualization/SpinVisualization';
import { FeederVisualization } from '../../components/FeederVisualization/FeederVisualization';
import { getFeederOnOffMs, type RobotConfig, type SpinDirection } from '../../data/RobotConfig';

export type LiveAim = { pan: number; tilt: number };

type RunningViewProps = {
  elapsedSeconds: number;
  leftSeconds: number | null;
  runConfig: RobotConfig | null;
  displaySpin: SpinDirection;
  spinRandom: boolean;
  timerLabel: string;
  onStop: () => void;
  liveAim: LiveAim | null;
  onLiveAimChange: (pan: number, tilt: number) => void;
  onLiveAimRelease?: (pan: number, tilt: number) => void;
};

const PREVIEW_SIZE = 72;

export function RunningView({
  elapsedSeconds,
  leftSeconds,
  runConfig,
  displaySpin,
  spinRandom,
  timerLabel,
  onStop,
  liveAim,
  onLiveAimChange,
  onLiveAimRelease,
}: RunningViewProps) {
  const { t } = useTranslation();
  const [blink, setBlink] = useState(true);

  const isLiveAim = runConfig?.panMode === 'LIVE' && runConfig?.tiltMode === 'LIVE';
  const panMin = runConfig?.panMin ?? -1;
  const panMax = runConfig?.panMax ?? 1;
  const tiltMin = runConfig?.tiltMin ?? -1;
  const tiltMax = runConfig?.tiltMax ?? 1;

  const aimPan = isLiveAim && liveAim ? liveAim.pan : (runConfig?.panTarget ?? 0);
  const aimTilt = isLiveAim && liveAim ? liveAim.tilt : (runConfig?.tiltTarget ?? 0);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 350);
    return () => clearInterval(id);
  }, []);

  if (!runConfig) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="motion-play-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('running.emptyTitle')}</Text>
          <Text style={styles.emptyCaption}>{t('running.emptyCaption')}</Text>
        </View>
        <TouchableOpacity style={styles.stopButton} onPress={onStop} activeOpacity={0.85}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
          <Text style={styles.stopLabel}>{t('running.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timeText =
    leftSeconds !== null ? `${leftSeconds}s` : `${elapsedSeconds}s`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusDot, blink && styles.statusDotOn]} />
        <Text style={[styles.runningTitle, !blink && styles.runningTitleDim]}>
          {blink ? 'RUNNING' : '       '}
        </Text>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTime}>
          {timeText}
        </Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.pan')}</Text>
            <Text style={styles.detailValue}>{runConfig.panMode}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.tilt')}</Text>
            <Text style={styles.detailValue}>{runConfig.tiltMode}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.power')}</Text>
            <Text style={styles.detailValue}>{runConfig.launcherPower}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.spin')}</Text>
            <Text style={styles.detailValue}>
              {spinRandom ? 'Random' : displaySpin}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.timer')}</Text>
            <Text style={styles.detailValue}>{timerLabel}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.feeder')}</Text>
            <Text style={styles.detailValue}>{runConfig.feederMode}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('running.feederSpeed')}</Text>
            <Text style={styles.detailValue}>{runConfig.feederSpeed}</Text>
          </View>
          {runConfig.spinDirection !== 'NONE' && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('running.spinIntensity')}</Text>
              <Text style={styles.detailValue}>{runConfig.spinIntensity}</Text>
            </View>
          )}
          {spinRandom && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('running.spinInterval')}</Text>
              <Text style={styles.detailValue}>{runConfig.spinRandomIntervalSec}s</Text>
            </View>
          )}
        </View>

        <View style={styles.aimSpinRow}>
          <View style={styles.aimSpinBlock}>
            <Text style={styles.radarLabel}>{t('wizard.aim')}</Text>
            <AimPreview
              size={PREVIEW_SIZE}
              pan={aimPan}
              tilt={aimTilt}
              panMode={runConfig.panMode}
              tiltMode={runConfig.tiltMode}
              panMin={runConfig.panMin}
              panMax={runConfig.panMax}
              tiltMin={runConfig.tiltMin}
              tiltMax={runConfig.tiltMax}
              panAuto1Speed={runConfig.panAuto1Speed}
              panAuto2Step={runConfig.panAuto2Step}
              panAuto2PauseMs={runConfig.panAuto2PauseMs}
              tiltAuto1Speed={runConfig.tiltAuto1Speed}
              tiltAuto2Step={runConfig.tiltAuto2Step}
              tiltAuto2PauseMs={runConfig.tiltAuto2PauseMs}
              panRandomMinDist={runConfig.panRandomMinDist}
              panRandomPauseMs={runConfig.panRandomPauseMs}
              tiltRandomMinDist={runConfig.tiltRandomMinDist}
              tiltRandomPauseMs={runConfig.tiltRandomPauseMs}
            />
          </View>
          <View style={styles.aimSpinBlock}>
            <Text style={styles.radarLabel}>{t('wizard.feeder')}</Text>
            <FeederVisualization
              size={PREVIEW_SIZE}
              feederMode={runConfig.feederMode}
              feederSpeed={runConfig.feederSpeed}
              feederOnMs={getFeederOnOffMs(
                runConfig.feederMode,
                runConfig.feederCustomOnMs,
                runConfig.feederCustomOffMs
              ).onMs}
              feederOffMs={getFeederOnOffMs(
                runConfig.feederMode,
                runConfig.feederCustomOnMs,
                runConfig.feederCustomOffMs
              ).offMs}
              animate={true}
            />
          </View>
          <View style={styles.aimSpinBlock}>
            <Text style={styles.radarLabel}>{t('wizard.spin')}</Text>
            <SpinVisualization
              size={PREVIEW_SIZE}
              spinDirection={displaySpin}
              spinIntensity={runConfig.spinIntensity}
              launcherPower={runConfig.launcherPower}
              animate={true}
            />
          </View>
        </View>

        {isLiveAim && (() => {
          const panRange = panMax - panMin;
          const tiltRange = tiltMax - tiltMin;
          const panNorm = panRange > 0 ? (aimPan - panMin) / panRange : 0;
          const tiltNorm = tiltRange > 0 ? (aimTilt - tiltMin) / tiltRange : 0;
          return (
          <View style={styles.manualAimSection}>
            <Text style={styles.manualAimLabel}>{t('running.manualAim')}</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>{t('running.pan')}</Text>
              <Text style={styles.sliderValue}>{aimPan.toFixed(2)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={panRange > 0 ? 0.05 / panRange : 0.01}
              value={panNorm}
              onValueChange={(v) => onLiveAimChange(panMin + v * panRange, aimTilt)}
              onSlidingComplete={() => onLiveAimRelease?.(aimPan, aimTilt)}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>{t('running.tilt')}</Text>
              <Text style={styles.sliderValue}>{aimTilt.toFixed(2)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={tiltRange > 0 ? 0.05 / tiltRange : 0.01}
              value={tiltNorm}
              onValueChange={(v) => onLiveAimChange(aimPan, tiltMin + v * tiltRange)}
              onSlidingComplete={() => onLiveAimRelease?.(aimPan, aimTilt)}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
          );
        })()}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.stopButton} onPress={onStop} activeOpacity={0.85}>
        <MaterialCommunityIcons name="stop" size={24} color={theme.colors.text} />
        <Text style={styles.stopLabel}>{t('running.stop')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  headerTime: {
    ...theme.typography.title,
    color: theme.colors.primary,
    fontSize: 18,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border,
  },
  statusDotOn: {
    backgroundColor: theme.colors.success,
    ...theme.shadow.sm,
  },
  runningTitle: {
    ...theme.typography.hero,
    color: theme.colors.success,
    fontSize: 22,
    letterSpacing: 1,
  },
  runningTitleDim: {
    color: 'transparent',
  },
  body: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyScrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  detailLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '700',
  },
  aimSpinRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  aimSpinBlock: {
    alignItems: 'center',
  },
  radarLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  manualAimSection: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  manualAimLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  sliderLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  sliderValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: theme.spacing.sm,
  },
  emptyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyCaption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    minHeight: theme.touchableMinHeight,
    ...theme.shadow.sm,
  },
  stopLabel: {
    ...theme.typography.header,
    color: theme.colors.text,
  },
});
