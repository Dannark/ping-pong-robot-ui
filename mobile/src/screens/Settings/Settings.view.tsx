import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import i18n, { getDeviceLanguage } from '../../i18n';
import { getStoredLanguage, setStoredLanguage, SUPPORTED_LANGUAGES } from '../../i18n/languageStorage';

const HARDWARE_ITEMS: { labelKey: string; icon: string }[] = [
  { labelKey: 'settings.servo1', icon: 'axis-z-rotate-counterclockwise' },
  { labelKey: 'settings.servo2', icon: 'axis-z-rotate-clockwise' },
  { labelKey: 'settings.m1Test', icon: 'engine-outline' },
  { labelKey: 'settings.m2Test', icon: 'engine-outline' },
  { labelKey: 'settings.m3Test', icon: 'engine-outline' },
];

export function SettingsView() {
  const { t } = useTranslation();
  const [storedLng, setStoredLng] = useState<string | null>(null);
  const currentLng = i18n.language?.slice(0, 2) ?? 'en';

  useEffect(() => {
    getStoredLanguage().then((v) => setStoredLng(v ?? ''));
  }, []);

  const handleLanguageSelect = async (code: string) => {
    if (code === 'system') {
      await setStoredLanguage('');
      setStoredLng('');
      await i18n.changeLanguage(getDeviceLanguage());
    } else {
      await setStoredLanguage(code);
      setStoredLng(code);
      await i18n.changeLanguage(code);
    }
  };

  const currentLanguageName =
    currentLng === 'en'
      ? t('settings.langEn')
      : currentLng === 'pt'
        ? t('settings.langPt')
        : currentLng === 'es'
          ? t('settings.langEs')
          : currentLng === 'de'
            ? t('settings.langDe')
            : currentLng === 'fr'
              ? t('settings.langFr')
              : currentLng === 'zh'
                ? t('settings.langZh')
                : t('settings.langEn');

  const isSystem = storedLng === null || storedLng === '';
  const isChipSelected = (code: string) =>
    code === 'system' ? isSystem : storedLng === code;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="cog-outline" size={48} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Text style={styles.currentLabel}>
          {t('settings.language')}: {currentLanguageName}
        </Text>
        <View style={styles.chipRow}>
          {SUPPORTED_LANGUAGES.map(({ code, nameKey }) => (
            <TouchableOpacity
              key={code}
              style={[styles.chip, isChipSelected(code) && styles.chipSelected]}
              onPress={() => handleLanguageSelect(code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isChipSelected(code) && styles.chipTextSelected]}>
                {t(nameKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.hardwareSection')}</Text>
        <View style={styles.list}>
          {HARDWARE_ITEMS.map(({ labelKey, icon }) => (
            <View key={labelKey} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.rowLabel}>{t(labelKey)}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{t('settings.comingSoon')}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  currentLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
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
  list: {
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
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
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
});
