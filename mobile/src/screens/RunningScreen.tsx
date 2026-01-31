import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Running'>;
};

export function RunningScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.runningLabel}>RUNNING</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.elapsed}>Elapsed: 0s</Text>
        <Text style={styles.caption}>Controle ao vivo (em breve)</Text>
      </View>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.stopLabel}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  runningLabel: {
    ...theme.typography.header,
    color: theme.colors.success,
  },
  body: {
    flex: 1,
  },
  elapsed: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  stopButton: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minHeight: theme.touchableMinHeight,
    justifyContent: 'center',
  },
  stopLabel: {
    ...theme.typography.header,
    color: theme.colors.text,
  },
});
