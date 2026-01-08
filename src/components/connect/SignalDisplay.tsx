import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { DeckEntry } from '../../constants/presetDecks';
import { ConfirmationStatus } from '../../constants/signals';

interface SignalDisplayProps {
  signal?: DeckEntry | null;
  status?: ConfirmationStatus;
  onAnimationComplete?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SignalDisplay: React.FC<SignalDisplayProps> = ({
  signal,
  status = 'pending',
  onAnimationComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);

  useEffect(() => {
    if (signal) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Entrance animation sequence
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      iconScale.value = withDelay(
        150,
        withSpring(1, { damping: 8, stiffness: 150 })
      );
      glowOpacity.value = withDelay(
        300,
        withSequence(
          withTiming(0.8, { duration: 300 }),
          withTiming(0.4, { duration: 500 })
        )
      );
      ringScale.value = withDelay(
        200,
        withSequence(
          withTiming(1.2, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 200 })
        )
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      iconScale.value = 0;
      glowOpacity.value = 0;
    }
  }, [signal]);

  useEffect(() => {
    if (status === 'confirmed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.5, { duration: 300 }),
        withTiming(0, { duration: 500 }, () => {
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    }
  }, [status]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.2]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [0, 1, 1.2], [0, 1, 0]),
  }));

  if (!signal) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircle}>
          <Text variant="h3" color="muted">📡</Text>
        </View>
        <Text variant="body" color="tertiary" align="center" style={styles.emptyText}>
          Waiting for signal...
        </Text>
      </View>
    );
  }

  const signalColor = signal.color || colors.primary[500];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glow, { backgroundColor: signalColor }, glowStyle]} />
      
      {/* Expanding ring */}
      <Animated.View style={[styles.ring, { borderColor: signalColor }, ringStyle]} />

      {/* Main card */}
      <Card variant="gradient" style={styles.card} glowColor={signalColor}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Text style={styles.icon}>{signal.iconId}</Text>
        </Animated.View>
        
        <Text variant="h3" align="center" style={styles.meaning}>
          {signal.meaning}
        </Text>

        {status === 'confirmed' && (
          <View style={styles.confirmedBadge}>
            <LinearGradient
              colors={colors.gradients.secondary}
              style={styles.badgeGradient}
            >
              <Text variant="caption" color="primary" weight="semibold">
                ✓ Understood
              </Text>
            </LinearGradient>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    padding: spacing.xl,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: spacing.md,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
  },
  card: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.surface.borderLight,
  },
  icon: {
    fontSize: 48,
  },
  meaning: {
    marginBottom: spacing.sm,
  },
  confirmedBadge: {
    marginTop: spacing.md,
  },
  badgeGradient: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
});
