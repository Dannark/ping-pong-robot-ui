import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { HomeCard } from './Home.viewModel';

type HomeViewProps = {
  cards: HomeCard[];
  onCardPress: (screen: HomeCard['screen']) => void;
};

export function HomeView({ cards, onCardPress }: HomeViewProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="table-tennis" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('home.heroSubtitle')}</Text>
      </View>
      <View style={styles.cards}>
        {cards.map(({ label, subtitle, screen, icon, primary }) => (
          <TouchableOpacity
            key={screen}
            style={[styles.card, primary && styles.cardPrimary]}
            onPress={() => onCardPress(screen)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIconWrap, primary && styles.cardIconWrapPrimary]}>
              <MaterialCommunityIcons
                name={icon as any}
                size={28}
                color={primary ? theme.colors.background : theme.colors.primary}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, primary && styles.cardLabelPrimary]}>{label}</Text>
              <Text style={[styles.cardSubtitle, primary && styles.cardSubtitlePrimary]}>
                {subtitle}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={primary ? 'rgba(0,0,0,0.4)' : theme.colors.textSecondary}
            />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  heroTitle: {
    ...theme.typography.hero,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  cards: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minHeight: 72,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
    ...theme.shadow.md,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cardIconWrapPrimary: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardLabelPrimary: {
    color: theme.colors.background,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  cardSubtitlePrimary: {
    color: 'rgba(0,0,0,0.65)',
  },
});
