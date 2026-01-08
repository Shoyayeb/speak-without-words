import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
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
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const scale3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const createPulseAnimation = (value: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(value, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const anim1 = createPulseAnimation(scale1, 0);
      const anim2 = createPulseAnimation(scale2, 400);
      const anim3 = createPulseAnimation(scale3, 800);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      scale1.setValue(0);
      scale2.setValue(0);
      scale3.setValue(0);
    }
  }, [active]);

  const createAnimatedStyle = (scale: Animated.Value) => ({
    transform: [{
      scale: scale.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
    }],
    opacity: scale.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
  });

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    position: 'absolute' as const,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, createAnimatedStyle(scale1)]} />
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, createAnimatedStyle(scale2)]} />
      <Animated.View style={[ringStyle, styles.ring, { borderColor: color }, createAnimatedStyle(scale3)]} />
    </View>
  );
};

interface ConnectionPulseProps {
  connected?: boolean;
}

export const ConnectionPulse: React.FC<ConnectionPulseProps> = ({ connected = false }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const rotationAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnim.start();

    let glowAnim: Animated.CompositeAnimation | null = null;
    if (connected) {
      glowAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnim.start();
    }

    return () => {
      rotationAnim.stop();
      if (glowAnim) glowAnim.stop();
    };
  }, [connected]);

  const rotationStyle = {
    transform: [{
      rotate: rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    }],
  };

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
        <Animated.View style={[styles.glowCircle, { opacity: glow }]}>
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
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger > 0) {
      scale.setValue(0);
      opacity.setValue(1);
      
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View 
      style={[
        styles.ripple, 
        { backgroundColor: color },
        {
          transform: [{
            scale: scale.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 2],
            }),
          }],
          opacity,
        },
      ]} 
    />
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
