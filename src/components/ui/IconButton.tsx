import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { borderRadius, colors, shadows } from '../../constants/theme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  glowing?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  haptic = true,
  style,
  glowing = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const sizeValues = {
    sm: 36,
    md: 48,
    lg: 56,
    xl: 72,
  };

  const buttonSize = sizeValues[size];

  const baseStyle: ViewStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (variant === 'primary' || variant === 'secondary') {
    const gradientColors = variant === 'primary' 
      ? colors.gradients.primary 
      : colors.gradients.secondary;

    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[
          animatedStyle,
          glowing && {
            ...shadows.glow,
            shadowColor: variant === 'primary' ? colors.primary[500] : colors.secondary[500],
          },
          style,
        ]}
      >
        <LinearGradient
          colors={disabled ? [colors.surface.default, colors.surface.default] : gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          {icon}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        animatedStyle,
        baseStyle,
        variant === 'default' && styles.default,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        glowing && {
          ...shadows.glow,
          shadowColor: variant === 'danger' ? colors.accent.error : colors.primary[500],
        },
        style,
      ]}
    >
      {icon}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.accent.error,
  },
  disabled: {
    opacity: 0.5,
  },
});
