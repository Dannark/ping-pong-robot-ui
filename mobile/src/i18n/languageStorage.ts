import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@PingPongRobot/language';

export const SUPPORTED_LANGUAGES = [
  { code: 'system', nameKey: 'settings.languageSystem' },
  { code: 'en', nameKey: 'settings.langEn' },
  { code: 'pt', nameKey: 'settings.langPt' },
  { code: 'es', nameKey: 'settings.langEs' },
  { code: 'de', nameKey: 'settings.langDe' },
  { code: 'fr', nameKey: 'settings.langFr' },
  { code: 'zh', nameKey: 'settings.langZh' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export async function getStoredLanguage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function setStoredLanguage(lng: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // ignore
  }
}
