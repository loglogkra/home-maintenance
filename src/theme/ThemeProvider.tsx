import React, { createContext, useContext, useMemo } from 'react';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { useHomeStore } from '../state/useHomeStore';
import { ThemeColors, ThemeName, themes } from './theme';

export type ThemeContextValue = {
  colors: ThemeColors;
  themeName: ThemeName;
  toggleTheme: () => void;
  navigationTheme: NavigationTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeName, toggleTheme } = useHomeStore((state) => ({
    themeName: state.theme,
    toggleTheme: state.toggleTheme,
  }));

  const palette = themes[themeName]?.colors ?? themes.light.colors;

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = themeName === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        notification: palette.primary,
      },
    };
  }, [palette, themeName]);

  const value = useMemo(
    () => ({ colors: palette, themeName, toggleTheme, navigationTheme }),
    [palette, themeName, toggleTheme, navigationTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
