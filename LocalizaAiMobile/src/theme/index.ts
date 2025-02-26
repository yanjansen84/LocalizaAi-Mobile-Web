import { useColorScheme } from 'react-native';
import { Theme as NavigationTheme } from '@react-navigation/native';

interface Theme extends NavigationTheme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    errorBg: string;
    purple: {
      500: string;
      600: string;
    };
    gray: {
      100: string;
      200: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fonts: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#7c3aed', // purple-600
    background: '#ffffff',
    surface: '#f5f3ff', // purple-50
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#ddd6fe', // purple-200
    error: '#ef4444',
    errorBg: '#fee2e2',
    purple: {
      500: '#8B5CF6',
      600: '#7C3AED',
    },
    gray: {
      100: '#F1F5F9',
      200: '#E2E8F0',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    border: '#404040',
  },
};

export function useTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
