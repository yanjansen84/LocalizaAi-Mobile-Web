import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextData {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
  };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const lightTheme = {
  primary: '#7C3AED',
  background: '#ffffff',
  card: '#f3f4f6',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
};

const darkTheme = {
  primary: '#7C3AED',
  background: '#111827',
  card: '#1f2937',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#374151',
  error: '#ef4444',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem('@LocalizaAi:theme');
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  }

  async function toggleTheme() {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      await AsyncStorage.setItem('@LocalizaAi:theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return {
    ...context,
    isDark: context.theme === 'dark'
  };
}
