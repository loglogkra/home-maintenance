export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  card: string;
  primary: string;
  text: string;
  muted: string;
  border: string;
  white: string;
  success: string;
};

export type ThemeDefinition = {
  name: ThemeName;
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  background: '#f8fafc',
  card: '#f1f5f9',
  primary: '#2563eb',
  text: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
  white: '#ffffff',
  success: '#16a34a',
};

const darkColors: ThemeColors = {
  background: '#0b1220',
  card: '#111827',
  primary: '#3b82f6',
  text: '#e2e8f0',
  muted: '#94a3b8',
  border: '#1f2937',
  white: '#f8fafc',
  success: '#22c55e',
};

export const themes: Record<ThemeName, ThemeDefinition> = {
  light: { name: 'light', colors: lightColors },
  dark: { name: 'dark', colors: darkColors },
};

export const colors = themes.light.colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  heading: 22,
  subheading: 18,
  body: 16,
  small: 14,
};
