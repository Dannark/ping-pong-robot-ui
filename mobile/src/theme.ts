/**
 * Tema do app – dark-first, legível, alinhado ao display do robô.
 */
export const theme = {
  colors: {
    background: '#0d1117',
    surface: '#161b22',
    surfaceElevated: '#21262d',
    primary: '#58a6ff',
    primaryMuted: '#388bfd',
    text: '#e6edf3',
    textSecondary: '#8b949e',
    border: '#30363d',
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: { fontSize: 22, fontWeight: '700' as const },
    header: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16 },
    caption: { fontSize: 14, color: '#8b949e' },
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
  touchableMinHeight: 48,
};

export type Theme = typeof theme;
