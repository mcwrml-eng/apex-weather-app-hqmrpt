
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Load saved theme preference
    if (Platform.OS === 'web') {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        console.log('ThemeProvider: Loading saved theme:', savedTheme);
        setTheme(savedTheme);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        console.log('ThemeProvider: Toggling theme from', theme, 'to', newTheme);
        setTheme(newTheme);
        
        // Save theme preference
        if (Platform.OS === 'web') {
          localStorage.setItem(STORAGE_KEY, newTheme);
        }
      },
    }),
    [theme]
  );

  console.log('ThemeProvider: Current theme is', theme);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    console.log('useTheme: Context not found, using default light theme');
    return { 
      theme: 'light' as Theme, 
      isDark: false, 
      toggleTheme: () => {} 
    };
  }
  return context;
}
