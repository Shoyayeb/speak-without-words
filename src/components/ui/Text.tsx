import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { colors, typography } from '../../constants/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyLarge' | 'caption' | 'label';
  color?: keyof typeof colors.text | string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  style,
  numberOfLines,
}) => {
  const variantStyles: Record<string, TextStyle> = {
    display: {
      fontSize: typography.fontSize.display,
      fontWeight: '700',
      lineHeight: typography.fontSize.display * typography.lineHeight.tight,
    },
    h1: {
      fontSize: typography.fontSize.xxxl,
      fontWeight: '700',
      lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
    },
    h2: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '600',
      lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
    },
    h3: {
      fontSize: typography.fontSize.xl,
      fontWeight: '600',
      lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    },
    body: {
      fontSize: typography.fontSize.md,
      fontWeight: '400',
      lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    },
    bodyLarge: {
      fontSize: typography.fontSize.lg,
      fontWeight: '400',
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.sm,
      fontWeight: '400',
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: '500',
      lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  };

  const weightStyles: Record<string, TextStyle> = {
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
  };

  const textColor = color in colors.text 
    ? colors.text[color as keyof typeof colors.text]
    : color;

  return (
    <RNText
      style={[
        variantStyles[variant],
        weight && weightStyles[weight],
        { color: textColor, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
};
