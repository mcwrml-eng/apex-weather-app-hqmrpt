
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import en from '../translations/en.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import de from '../translations/de.json';
import it from '../translations/it.json';
import pt from '../translations/pt.json';
import ja from '../translations/ja.json';
import zh from '../translations/zh.json';
import ar from '../translations/ar.json';
import ru from '../translations/ru.json';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ar' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'app_language';

const translations: Record<Language, Record<string, string>> = {
  en,
  es,
  fr,
  de,
  it,
  pt,
  ja,
  zh,
  ar,
  ru,
};

// Detect device language
function getDeviceLanguage(): Language {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const deviceLang = locales[0].languageCode?.toLowerCase();
      console.log('LanguageContext: Device language detected:', deviceLang);
      
      // Map device language to supported languages
      if (deviceLang === 'es') return 'es';
      if (deviceLang === 'fr') return 'fr';
      if (deviceLang === 'de') return 'de';
      if (deviceLang === 'it') return 'it';
      if (deviceLang === 'pt') return 'pt';
      if (deviceLang === 'ja') return 'ja';
      if (deviceLang === 'zh') return 'zh';
      if (deviceLang === 'ar') return 'ar';
      if (deviceLang === 'ru') return 'ru';
    }
  } catch (error) {
    console.error('LanguageContext: Error detecting device language:', error);
  }
  
  return 'en'; // Default to English
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved language preference or detect device language
    async function loadLanguage() {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLanguage && translations[savedLanguage as Language]) {
          console.log('LanguageContext: Loading saved language:', savedLanguage);
          setLanguageState(savedLanguage as Language);
        } else {
          // Detect device language
          const deviceLang = getDeviceLanguage();
          console.log('LanguageContext: Using device language:', deviceLang);
          setLanguageState(deviceLang);
        }
      } catch (error) {
        console.error('LanguageContext: Error loading language:', error);
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    }

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      console.log('LanguageContext: Setting language to:', lang);
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('LanguageContext: Error saving language:', error);
    }
  };

  const t = useCallback((key: string): string => {
    const translation = translations[language]?.[key];
    if (!translation) {
      console.warn(`LanguageContext: Missing translation for key "${key}" in language "${language}"`);
      return translations.en[key] || key;
    }
    return translation;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  if (isLoading) {
    return null;
  }

  console.log('LanguageContext: Current language is', language);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    console.log('useLanguage: Context not found, using default English');
    return { 
      language: 'en' as Language, 
      setLanguage: async () => {},
      t: (key: string) => key,
    };
  }
  return context;
}
