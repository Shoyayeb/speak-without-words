import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { SignalRipple } from '../ui/Animations';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { GestureType } from '../../constants/signals';

interface TapAreaProps {
  onGesture: (gesture: GestureType) => void;
  disabled?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TapArea: React.FC<TapAreaProps> = ({ onGesture, disabled = false }) => {
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [lastGesture, setLastGesture] = useState<string>('');
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.5);
  const pulseScale = useSharedValue(1);

  const triggerRipple = useCallback(() => {
    setRippleTrigger((prev) => prev + 1);
  }, []);

  const showGestureLabel = useCallback((label: string) => {
    setLastGesture(label);
    setTimeout(() => setLastGesture(''), 1500);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < 300) {
      // Double tap
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onGesture('double-tap');
      showGestureLabel('Double Tap');
      lastTapTime.current = 0;
    } else {
      // Single tap - wait to see if it becomes double
      lastTapTime.current = now;
      setTimeout(() => {
        if (lastTapTime.current === now) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onGesture('tap');
          showGestureLabel('Tap');
        }
      }, 300);
    }
    triggerRipple();
  }, [onGesture, triggerRipple, showGestureLabel]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onGesture('long-press');
    showGestureLabel('Long Press');
    triggerRipple();
  }, [onGesture, triggerRipple, showGestureLabel]);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      scale.value = withSpring(0.98, { damping: 15 });
      borderOpacity.value = withTiming(1, { duration: 100 });
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15 });
      borderOpacity.value = withTiming(0.5, { duration: 300 });
      runOnJS(handleTap)();
    });

  const longPress = Gesture.LongPress()
    .enabled(!disabled)
    .minDuration(500)
    .onStart(() => {
      scale.value = withSpring(0.96, { damping: 15 });
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15 });
      runOnJS(handleLongPress)();
    });

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(50)
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Determine swipe direction
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 0) {
          runOnJS(onGesture)('swipe-right');
          runOnJS(showGestureLabel)('Swipe Right');
        } else {
          runOnJS(onGesture)('swipe-left');
          runOnJS(showGestureLabel)('Swipe Left');
        }
      } else {
        if (translationY > 0) {
          runOnJS(onGesture)('swipe-down');
          runOnJS(showGestureLabel)('Swipe Down');
        } else {
          runOnJS(onGesture)('swipe-up');
          runOnJS(showGestureLabel)('Swipe Up');
        }
      }
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(triggerRipple)();
    });

  const composed = Gesture.Race(longPress, tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.touchArea, animatedStyle]}>
          <LinearGradient
            colors={[colors.surface.default, colors.background.secondary]}
            style={styles.gradient}
          >
            <Animated.View style={[styles.border, borderStyle]} />
            <SignalRipple trigger={rippleTrigger} color={colors.primary[400]} />
            
            <View style={styles.content}>
              <Text variant="h3" color="secondary" align="center">
                👆
              </Text>
              <Text variant="body" color="tertiary" align="center" style={styles.hint}>
                Tap, hold, or swipe to send
              </Text>
              {lastGesture ? (
                <View style={styles.gestureBadge}>
                  <Text variant="caption" color="primary" weight="semibold">
                    {lastGesture}
                  </Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  touchArea: {
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    borderStyle: 'dashed',
  },
  content: {
    alignItems: 'center',
  },
  hint: {
    marginTop: spacing.sm,
  },
  gestureBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
});
