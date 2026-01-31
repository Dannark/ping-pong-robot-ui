import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

export function SettingsView() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="cog-outline" size={48} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
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
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
