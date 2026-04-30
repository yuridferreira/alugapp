import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  darkMode: false,
  language: 'pt',
  highContrast: false,
  analyticsEnabled: true,
  currency: 'BRL',
};

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);

export async function loadAppSettings() {
  try {
    const entries = await Promise.all(
      SETTINGS_KEYS.map(async (key) => [key, await AsyncStorage.getItem(key)])
    );

    return entries.reduce((acc, [key, rawValue]) => {
      const defaultValue = DEFAULT_SETTINGS[key];

      if (typeof defaultValue === 'boolean') {
        acc[key] = rawValue === null ? defaultValue : rawValue === 'true';
        return acc;
      }

      acc[key] = rawValue || defaultValue;
      return acc;
    }, { ...DEFAULT_SETTINGS });
  } catch (error) {
    console.log('Erro ao carregar configurações:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveAppSetting(key, value) {
  try {
    await AsyncStorage.setItem(key, value.toString());
  } catch (error) {
    console.log('Erro ao salvar configuração:', error);
  }
}
