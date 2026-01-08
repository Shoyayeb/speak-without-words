import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient' | 'glass';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  animated?: boolean;
  glowColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
  animated = false,
  glowColor,
}) => {
  const Container = animated ? Animated.View : View;

  const baseStyle: ViewStyle = {
    padding: spacing[padding],
    borderRadius: borderRadius.lg,
  };

  if (variant === 'gradient') {
    return (
      <Container
        entering={animated ? FadeIn.duration(300) : undefined}
        exiting={animated ? FadeOut.duration(200) : undefined}
        style={[style]}
      >
        <LinearGradient
          colors={[colors.surface.default, colors.background.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            baseStyle,
            styles.gradient,
            glowColor && {
              ...shadows.glow,
              shadowColor: glowColor,
            },
          ]}
        >
          {children}
        </LinearGradient>
      </Container>
    );
  }

  return (
    <Container
      entering={animated ? FadeIn.duration(300) : undefined}
      exiting={animated ? FadeOut.duration(200) : undefined}
      style={[
        baseStyle,
        variant === 'default' && styles.default,
        variant === 'elevated' && styles.elevated,
        variant === 'glass' && styles.glass,
        glowColor && {
          ...shadows.glow,
          shadowColor: glowColor,
        },
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  elevated: {
    backgroundColor: colors.background.elevated,
    ...shadows.lg,
  },
  gradient: {
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  glass: {
    backgroundColor: 'rgba(22, 22, 58, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Note: backdropFilter not supported in React Native, use BlurView component instead
  },
});
