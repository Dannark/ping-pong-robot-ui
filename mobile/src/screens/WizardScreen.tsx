import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wizard'>;
};

// Valores mock – depois virão do estado/contexto
const WIZARD_ITEMS: { label: string; value: string; screen?: keyof RootStackParamList }[] = [
  { label: 'Pan', value: 'LIVE', screen: 'Pan' },
  { label: 'Tilt', value: 'LIVE', screen: 'Tilt' },
  { label: 'Launcher', value: '255', screen: 'Launcher' },
  { label: 'Feeder', value: '160', screen: 'Feeder' },
  { label: 'Timer', value: 'OFF', screen: 'Timer' },
];

export function WizardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wizard</Text>
        <Text style={styles.subtitle}>Configure e inicie</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {WIZARD_ITEMS.map(({ label, value, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.row}
            onPress={() => screen && navigation.navigate(screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{value}</Text>
              {screen && <Text style={styles.arrow}>›</Text>}
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.row, styles.startButton]}
          onPress={() => navigation.navigate('Running')}
          activeOpacity={0.7}
        >
          <Text style={styles.startLabel}>START</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minHeight: theme.touchableMinHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowValue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  startButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
  },
  startLabel: {
    ...theme.typography.header,
    color: theme.colors.background,
  },
});
