import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import en from './locales/en.json';
import pt from './locales/pt.json';

const SUPPORTED_LANGS = ['en', 'pt'] as const;

function getDeviceLanguage(): string {
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
    return SUPPORTED_LANGS.includes(code as any) ? code : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: { en: { translation: en }, pt: { translation: pt } },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
