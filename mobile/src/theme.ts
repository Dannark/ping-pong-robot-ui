/**
 * Tema do app – dark-first, produto final, legível.
 */
export const theme = {
  colors: {
    background: '#0a0e14',
    backgroundGradientTop: '#0d1219',
    surface: '#151b24',
    surfaceElevated: '#1c242e',
    surfaceOverlay: '#232d3a',
    primary: '#00d4aa',
    primaryDark: '#00b894',
    primaryMuted: 'rgba(0, 212, 170, 0.25)',
    accent: '#6c5ce7',
    text: '#eef2f5',
    textSecondary: '#8896a4',
    border: '#2a3340',
    success: '#00d4aa',
    warning: '#fdcb6e',
    danger: '#ff6b6b',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    hero: { fontSize: 28, fontWeight: '800' as const },
    title: { fontSize: 22, fontWeight: '700' as const },
    header: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16 },
    caption: { fontSize: 14, color: '#8896a4' },
    label: { fontSize: 12, fontWeight: '600' as const },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  touchableMinHeight: 48,
  shadow: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  },
};

export type Theme = typeof theme;
