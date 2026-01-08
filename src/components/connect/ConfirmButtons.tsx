import * as Haptics from 'expo-haptics';
import { Check, HelpCircle, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { borderRadius, colors, spacing } from '../../constants/theme';
import { Text } from '../ui/Text';

interface ConfirmButtonsProps {
  onConfirm: () => void;
  onConfused: () => void;
  onReject: () => void;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  variant: 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  variant,
  disabled,
}) => {
  const scale = useSharedValue(1);

  const colorMap = {
    success: colors.accent.success,
    warning: colors.accent.warning,
    danger: colors.accent.error,
  };

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[styles.buttonWrapper, animatedStyle]}
    >
      <View style={[styles.button, { borderColor: colorMap[variant] }]}>
        <View style={[styles.iconCircle, { backgroundColor: colorMap[variant] }]}>
          {icon}
        </View>
        <Text variant="caption" color="secondary" style={styles.label}>
          {label}
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

export const ConfirmButtons: React.FC<ConfirmButtonsProps> = ({
  onConfirm,
  onConfused,
  onReject,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon={<Check size={24} color={colors.text.inverse} strokeWidth={3} />}
        label="Got it"
        onPress={onConfirm}
        variant="success"
        disabled={disabled}
      />
      <ActionButton
        icon={<HelpCircle size={24} color={colors.text.inverse} strokeWidth={2.5} />}
        label="Confused"
        onPress={onConfused}
        variant="warning"
        disabled={disabled}
      />
      <ActionButton
        icon={<X size={24} color={colors.text.inverse} strokeWidth={3} />}
        label="Wrong"
        onPress={onReject}
        variant="danger"
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonWrapper: {
    flex: 1,
    maxWidth: 100,
  },
  button: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.default,
    borderWidth: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    textAlign: 'center',
  },
});
