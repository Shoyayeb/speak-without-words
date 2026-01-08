/**
 * Speak Without Words - Design System
 * A sleek, modern dark theme with mystical accents
 */

export const colors = {
  // Primary palette - mystical purple
  primary: {
    50: '#F3F0FF',
    100: '#E9E3FF',
    200: '#D4CAFF',
    300: '#B5A3FF',
    400: '#9171FF',
    500: '#6C5CE7', // Main primary
    600: '#5B4BD3',
    700: '#4A3CB3',
    800: '#3D3293',
    900: '#2D2570',
  },

  // Secondary palette - teal communication
  secondary: {
    50: '#E6FFFC',
    100: '#B3FFF5',
    200: '#80FFED',
    300: '#4DFFE6',
    400: '#1AFFDE',
    500: '#00CEC9', // Main secondary
    600: '#00A8A4',
    700: '#00827F',
    800: '#005C5A',
    900: '#003635',
  },

  // Accent colors
  accent: {
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E17055',
    info: '#74B9FF',
  },

  // Dark theme backgrounds
  background: {
    primary: '#0A0A1A',    // Deepest dark
    secondary: '#12122A',   // Card backgrounds
    tertiary: '#1A1A3E',    // Elevated surfaces
    elevated: '#222252',    // Modals, dropdowns
  },

  // Surface colors
  surface: {
    default: '#16163A',
    hover: '#1E1E4A',
    active: '#26265A',
    border: '#2A2A5A',
    borderLight: '#3A3A6A',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B8B8D0',
    tertiary: '#7878A0',
    muted: '#5858A0',
    inverse: '#0A0A1A',
  },

  // Gradient definitions
  gradients: {
    primary: ['#6C5CE7', '#A855F7'],
    secondary: ['#00CEC9', '#00B894'],
    mystical: ['#6C5CE7', '#00CEC9'],
    dark: ['#0A0A1A', '#16163A'],
    glow: ['rgba(108, 92, 231, 0.4)', 'rgba(108, 92, 231, 0)'],
  },

  // Semantic colors
  connection: {
    connected: '#00B894',
    connecting: '#FDCB6E',
    disconnected: '#E17055',
    idle: '#7878A0',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: 'JetBrainsMono_400Regular',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    pulse: 1500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    spring: 'spring',
  },
} as const;

// Haptic patterns (in milliseconds)
export const hapticPatterns = {
  tap: [50],
  doubleTap: [50, 100, 50],
  longPress: [200],
  success: [50, 50, 100],
  error: [100, 50, 100, 50, 100],
  pulse: [100, 100, 100, 100, 200],
  signal: [50, 100, 50, 100, 200, 100, 50],
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
  hapticPatterns,
} as const;

export type Theme = typeof theme;
export default theme;
