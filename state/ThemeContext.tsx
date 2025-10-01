
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          const savedTheme = window.localStorage.getItem(STORAGE_KEY);
          if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
          }
        }
      } catch (error) {
        console.error('[ThemeProvider] Error loading theme:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Save theme preference
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, newTheme);
        } catch (error) {
          console.error('[ThemeProvider] Error saving theme:', error);
        }
      }
      
      return newTheme;
    });
  }, []);

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };

  // Don't render children until theme is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn('[useTheme] Context not found, using default light theme');
    return { 
      theme: 'light' as Theme, 
      isDark: false, 
      toggleTheme: () => {
        console.warn('[useTheme] toggleTheme called but no context available');
      }
    };
  }
  return context;
}
