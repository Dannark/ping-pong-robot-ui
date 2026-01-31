import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Info'>;
};

export function InfoScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Info</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.version}>Ping Pong Bot UI v1</Text>
        <Text style={styles.caption}>App – controle via Bluetooth (em breve)</Text>
      </View>
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
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  body: {
    flex: 1,
  },
  version: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
