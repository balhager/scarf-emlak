export const Colors = {
  background: '#000000',
  surface: '#0C0C0E',
  accent: '#D4C8B0',
  muted: '#8E8E93',
  border: 'rgba(212, 200, 176, 0.12)',
  overlay: 'rgba(12, 12, 14, 0.72)',
  glass: 'rgba(255, 255, 255, 0.04)',
  white: '#FFFFFF',
};

export const Typography = {
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: Colors.muted,
  },
  heading: {
    fontSize: 22,
    fontWeight: '300' as const,
    letterSpacing: 4,
    color: Colors.white,
  },
  logo: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 6,
    color: Colors.accent,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    color: Colors.muted,
    lineHeight: 20,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};
