import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    View
} from 'react-native';
import { GestureType } from '../../constants/signals';
import { borderRadius, colors, spacing } from '../../constants/theme';
import { SignalRipple } from '../ui/Animations';
import { Text } from '../ui/Text';

interface TapAreaProps {
  onGesture: (gesture: GestureType) => void;
  disabled?: boolean;
}

export const TapArea: React.FC<TapAreaProps> = ({ onGesture, disabled = false }) => {
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [lastGesture, setLastGesture] = useState<string>('');
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0.5)).current;

  const triggerRipple = useCallback(() => {
    setRippleTrigger((prev) => prev + 1);
  }, []);

  const showGestureLabel = useCallback((label: string) => {
    setLastGesture(label);
    setTimeout(() => setLastGesture(''), 1500);
  }, []);

  const animatePress = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
    Animated.timing(borderOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const animateRelease = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    Animated.timing(borderOpacity, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only become responder if there's significant movement
        return !disabled && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10);
      },
      onPanResponderGrant: () => {
        isLongPress.current = false;
        animatePress();
        
        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          handleLongPress();
          animateRelease();
        }, 500);
      },
      onPanResponderMove: (_, gestureState) => {
        // If moved significantly, cancel long press
        if (Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20) {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        
        animateRelease();
        
        const { dx, dy } = gestureState;
        const SWIPE_THRESHOLD = 50;
        
        // Check for swipe
        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              onGesture('swipe-right');
              showGestureLabel('Swipe Right');
            } else {
              onGesture('swipe-left');
              showGestureLabel('Swipe Left');
            }
          } else {
            if (dy > 0) {
              onGesture('swipe-down');
              showGestureLabel('Swipe Down');
            } else {
              onGesture('swipe-up');
              showGestureLabel('Swipe Up');
            }
          }
          triggerRipple();
        } else if (!isLongPress.current) {
          // It was a tap
          handleTap();
        }
      },
      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        animateRelease();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.touchArea, { transform: [{ scale }] }]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.surface.default, colors.background.secondary]}
          style={styles.gradient}
        >
          <Animated.View style={[styles.border, { opacity: borderOpacity }]} />
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
