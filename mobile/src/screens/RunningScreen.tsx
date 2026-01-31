import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

export function RunningScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.statusWrap}>
        <View style={styles.pulse} />
        <MaterialCommunityIcons name="motion-play-outline" size={56} color={theme.colors.success} />
      </View>
      <Text style={styles.title}>Em execução</Text>
      <Text style={styles.elapsed}>0s</Text>
      <Text style={styles.caption}>Controle ao vivo (em breve)</Text>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
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
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.xl,
    alignItems: 'center',
  },
  statusWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.success,
    opacity: 0.3,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  elapsed: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
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
