import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wizard'>;
};

const AXIS_MODES = ['LIVE', 'AUTO1', 'AUTO2'] as const;
const SPIN_DIRECTIONS = ['NONE', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
const FEEDER_MODES = ['CONT', 'P1/1', 'P2/2'] as const;
const TIMER_OPTIONS = ['OFF', '15s', '30s', '1m', '2m', '5m'] as const;

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ChipRow<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly T[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipSelected]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextSelected]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SetupScreen({ navigation }: Props) {
  const [panMode, setPanMode] = useState<'LIVE' | 'AUTO1' | 'AUTO2'>('LIVE');
  const [tiltMode, setTiltMode] = useState<'LIVE' | 'AUTO1' | 'AUTO2'>('LIVE');
  const [launcherPower, setLauncherPower] = useState(255);
  const [spinDirection, setSpinDirection] = useState<(typeof SPIN_DIRECTIONS)[number]>('NONE');
  const [spinIntensity, setSpinIntensity] = useState(255);
  const [feederMode, setFeederMode] = useState<(typeof FEEDER_MODES)[number]>('CONT');
  const [feederSpeed, setFeederSpeed] = useState(160);
  const [timerIndex, setTimerIndex] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Aim" icon="crosshairs-gps">
          <Text style={styles.label}>Pan</Text>
          <ChipRow options={AXIS_MODES} value={panMode} onSelect={setPanMode} />
          <Text style={[styles.label, { marginTop: theme.spacing.sm }]}>Tilt</Text>
          <ChipRow options={AXIS_MODES} value={tiltMode} onSelect={setTiltMode} />
        </Section>

        <Section title="Launcher" icon="target">
          <View style={styles.sliderRow}>
            <Text style={styles.label}>Potência</Text>
            <Text style={styles.value}>{launcherPower}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={255}
            step={1}
            value={launcherPower}
            onValueChange={setLauncherPower}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <Text style={[styles.label, { marginTop: theme.spacing.sm }]}>Spin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spinScroll}>
            {SPIN_DIRECTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.spinChip, spinDirection === d && styles.chipSelected]}
                onPress={() => setSpinDirection(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, spinDirection === d && styles.chipTextSelected]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.sliderRow}>
            <Text style={styles.label}>Intensidade spin</Text>
            <Text style={styles.value}>{spinIntensity}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={512}
            step={1}
            value={spinIntensity}
            onValueChange={setSpinIntensity}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </Section>

        <Section title="Feeder" icon="feeder">
          <Text style={styles.label}>Modo</Text>
          <ChipRow options={FEEDER_MODES} value={feederMode} onSelect={setFeederMode} />
          <View style={[styles.sliderRow, { marginTop: theme.spacing.sm }]}>
            <Text style={styles.label}>Velocidade</Text>
            <Text style={styles.value}>{feederSpeed}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={255}
            step={1}
            value={feederSpeed}
            onValueChange={setFeederSpeed}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </Section>

        <Section title="Timer" icon="timer-outline">
          <View style={styles.timerRow}>
            {TIMER_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[styles.timerChip, timerIndex === i && styles.chipSelected]}
                onPress={() => setTimerIndex(i)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timerChipText, timerIndex === i && styles.chipTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Running')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="play" size={28} color={theme.colors.background} />
          <Text style={styles.startLabel}>Iniciar</Text>
        </TouchableOpacity>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.text,
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
    ...(Platform.OS === 'android' && { marginVertical: -8 }),
  },
  spinScroll: {
    marginBottom: theme.spacing.sm,
  },
  spinChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timerChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerChipText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    minHeight: 56,
    ...theme.shadow.md,
  },
  startLabel: {
    ...theme.typography.hero,
    color: theme.colors.background,
    fontSize: 22,
  },
});
