import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import { getStoredLanguage } from './languageStorage';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';

const SUPPORTED_LANGS = ['en', 'pt', 'es', 'de', 'fr', 'zh'] as const;

export function getDeviceLanguage(): string {
  try {
    let locale = 'en';
    if (Platform.OS === 'ios' && NativeModules.SettingsManager?.settings) {
      locale =
        NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages?.[0] ||
        'en';
    } else if (NativeModules.I18nManager?.localeIdentifier) {
      locale = NativeModules.I18nManager.localeIdentifier;
    }
    const code = String(locale).slice(0, 2).toLowerCase();
    return SUPPORTED_LANGS.includes(code as (typeof SUPPORTED_LANGS)[number]) ? code : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
    de: { translation: de },
    fr: { translation: fr },
    zh: { translation: zh },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export async function initStoredLanguage(): Promise<void> {
  const stored = await getStoredLanguage();
  if (stored && stored !== '' && SUPPORTED_LANGS.includes(stored as (typeof SUPPORTED_LANGS)[number])) {
    await i18n.changeLanguage(stored);
  }
}

export default i18n;
