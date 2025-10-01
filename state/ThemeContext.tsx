
import React, { createContext, useContext, useState, useEffect } from 'react';
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
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          console.log('ThemeProvider: Loading saved theme:', savedTheme);
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('ThemeProvider: Error loading theme:', error);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('ThemeProvider: Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
    
    // Save theme preference
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('ThemeProvider: Error saving theme:', error);
      }
    }
  };

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };

  console.log('ThemeProvider: Current theme is', theme);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    console.log('useTheme: Context not found, using default light theme');
    return { 
      theme: 'light' as Theme, 
      isDark: false, 
      toggleTheme: () => {
        console.log('useTheme: toggleTheme called but no context available');
      }
    };
  }
  return context;
}
