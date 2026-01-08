import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

interface PulseAnimationProps {
  size?: number;
  color?: string;
  active?: boolean;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  size = 200,
  color = colors.primary[500],
  active = true,
}) => {
  const scale1 = useSharedValue(0);
  const scale2 = useSharedValue(0);
  const scale3 = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale1.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      scale2.value = withDelay(
        400,
        withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
          -1,
          false
        )
      );
      scale3.value = withDelay(
        800,
        withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
          -1,
          false
        )
      );
    } else {
      scale1.value = 0;
      scale2.value = 0;
      scale3.value = 0;
    }
  }, [active]);

  const createAnimatedStyle = (scale: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: interpolate(scale.value, [0, 1], [0.3, 1]) }],
      opacity: interpolate(scale.value, [0, 0.5, 1], [0.8, 0.4, 0]),
    }));

  const animatedStyle1 = createAnimatedStyle(scale1);
  const animatedStyle2 = createAnimatedStyle(scale2);
  const animatedStyle3 = createAnimatedStyle(scale3);

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    position: 'absolute' as const,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, animatedStyle1]} />
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, animatedStyle2]} />
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, animatedStyle3]} />
    </View>
  );
};

interface ConnectionPulseProps {
  connected?: boolean;
}

export const ConnectionPulse: React.FC<ConnectionPulseProps> = ({ connected = false }) => {
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    if (connected) {
      glow.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [connected]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.connectionContainer}>
      <Animated.View style={[styles.connectionRing, rotationStyle]}>
        <LinearGradient
          colors={connected ? colors.gradients.secondary : colors.gradients.mystical}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientRing}
        />
      </Animated.View>
      {connected && (
        <Animated.View style={[styles.glowCircle, glowStyle]}>
          <LinearGradient
            colors={['rgba(0, 206, 201, 0.4)', 'transparent']}
            style={styles.glowGradient}
          />
        </Animated.View>
      )}
    </View>
  );
};

interface SignalRippleProps {
  trigger: number;
  color?: string;
}

export const SignalRipple: React.FC<SignalRippleProps> = ({
  trigger,
  color = colors.primary[500],
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger > 0) {
      scale.value = 0;
      opacity.value = 1;
      scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 2 }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.ripple, { backgroundColor: color }, animatedStyle]} />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
  },
  connectionContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  gradientRing: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 70,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
