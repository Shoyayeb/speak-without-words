import React from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { borderRadius, colors, spacing, typography } from '../../constants/theme';
import { Text } from './Text';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerStyle?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const borderColor = useSharedValue<string>(colors.surface.border);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = (e: any) => {
    borderColor.value = withTiming(colors.primary[500], { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    borderColor.value = withTiming(
      error ? colors.accent.error : colors.surface.border,
      { duration: 200 }
    );
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" color="secondary" style={styles.label}>
          {label}
        </Text>
      )}
      <AnimatedView style={[styles.inputContainer, animatedStyle, error ? styles.errorBorder : null]}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <RNTextInput
          style={[
            styles.input,
            icon && iconPosition === 'left' ? styles.inputWithLeftIcon : null,
            icon && iconPosition === 'right' ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </AnimatedView>
      {error && (
        <Text variant="caption" color={colors.accent.error} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderWidth: 2,
    borderRadius: borderRadius.md,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  iconLeft: {
    paddingLeft: spacing.md,
  },
  iconRight: {
    paddingRight: spacing.md,
  },
  errorBorder: {
    borderColor: colors.accent.error,
  },
  error: {
    marginTop: spacing.xs,
  },
});
