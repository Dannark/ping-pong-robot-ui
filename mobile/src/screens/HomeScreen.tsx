import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const MENU_ITEMS: { label: string; screen: keyof RootStackParamList }[] = [
  { label: 'Start Wizard', screen: 'Wizard' },
  { label: 'Info / Stats', screen: 'Info' },
  { label: 'Settings', screen: 'Settings' },
];

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Ping Pong Robot</Text>
        <Text style={styles.subtitle}>HOME</Text>
      </View>
      <View style={styles.menu}>
        {MENU_ITEMS.map(({ label, screen }) => (
          <TouchableOpacity
            key={screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuLabel}>{label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  menu: {
    gap: theme.spacing.sm,
  },
  menuItem: {
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
  menuLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  menuArrow: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
});
