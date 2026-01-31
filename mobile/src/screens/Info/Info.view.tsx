import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

type InfoViewProps = {
  version: string;
  caption: string;
};

export function InfoView({ version, caption }: InfoViewProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="information-outline" size={48} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{t('info.title')}</Text>
      <Text style={styles.version}>{version}</Text>
      <Text style={styles.caption}>{caption}</Text>
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
  version: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
