import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { AimPreview } from '../../components/AimPreview/AimPreview';
import type { RobotConfig } from '../../data/RobotConfig';
import { spinDirectionLabel } from '../../data/RobotConfig';

type RunningViewProps = {
  elapsedSeconds: number;
  leftSeconds: number | null;
  runConfig: RobotConfig | null;
  onStop: () => void;
};

const PREVIEW_SIZE = 80;

export function RunningView({ elapsedSeconds, leftSeconds, runConfig, onStop }: RunningViewProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 350);
    return () => clearInterval(id);
  }, []);

  if (!runConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Em execução</Text>
        <Text style={styles.caption}>Nenhuma sessão ativa</Text>
        <TouchableOpacity style={styles.stopButton} onPress={onStop} activeOpacity={0.85}>
          <MaterialCommunityIcons name="stop" size={24} color={theme.colors.text} />
          <Text style={styles.stopLabel}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const spinLabel = spinDirectionLabel(runConfig.spinDirection, runConfig.spinRandom);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.runningTitle, !blink && styles.runningTitleDim]}>
          {blink ? 'RUNNING' : '       '}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.timeRow}>
          <Text style={styles.label}>
            {leftSeconds !== null ? 'Left: ' : 'Elapsed: '}
          </Text>
          <Text style={styles.value}>
            {leftSeconds !== null ? `${leftSeconds}s` : `${elapsedSeconds}s`}
          </Text>
        </View>

        <View style={styles.detailList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pan:</Text>
            <Text style={styles.detailValue}>{runConfig.panMode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tilt:</Text>
            <Text style={styles.detailValue}>{runConfig.tiltMode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Power:</Text>
            <Text style={styles.detailValue}>{runConfig.launcherPower}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spin:</Text>
            <Text style={styles.detailValue}>{spinLabel}</Text>
          </View>
        </View>

        <View style={styles.radarRow}>
          <AimPreview
            size={PREVIEW_SIZE}
            pan={runConfig.panTarget}
            tilt={runConfig.tiltTarget}
            panMode={runConfig.panMode}
            tiltMode={runConfig.tiltMode}
            panAuto1Speed={runConfig.panAuto1Speed}
            panAuto2Step={runConfig.panAuto2Step}
            tiltAuto1Speed={runConfig.tiltAuto1Speed}
            tiltAuto2Step={runConfig.tiltAuto2Step}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.stopButton} onPress={onStop} activeOpacity={0.85}>
        <MaterialCommunityIcons name="stop" size={24} color={theme.colors.text} />
        <Text style={styles.stopLabel}>Parar</Text>
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
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  runningTitle: {
    ...theme.typography.hero,
    color: theme.colors.success,
    fontSize: 24,
  },
  runningTitleDim: {
    color: 'transparent',
  },
  body: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  value: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  detailList: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    width: 56,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  radarRow: {
    alignItems: 'center',
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
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
