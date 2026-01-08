import { LinearGradient } from 'expo-linear-gradient';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { CONNECTION_STATES, ConnectionState } from '../../constants/signals';
import { borderRadius, colors, spacing } from '../../constants/theme';
import { Text } from '../ui/Text';

interface ConnectionStatusProps {
  state: ConnectionState;
  sessionId?: string;
  partnerName?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  state,
  sessionId,
  partnerName,
}) => {
  const pulseOpacity = useSharedValue(1);
  const spinRotation = useSharedValue(0);

  React.useEffect(() => {
    if (state === CONNECTION_STATES.CONNECTING || state === CONNECTION_STATES.RECONNECTING) {
      spinRotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinRotation.value = 0;
    }

    if (state === CONNECTION_STATES.CONNECTED) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [state]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const getStatusConfig = () => {
    switch (state) {
      case CONNECTION_STATES.CONNECTED:
        return {
          icon: <Wifi size={20} color={colors.connection.connected} />,
          label: 'Connected',
          color: colors.connection.connected,
          gradient: colors.gradients.secondary,
        };
      case CONNECTION_STATES.CONNECTING:
        return {
          icon: (
            <Animated.View style={spinStyle}>
              <RefreshCw size={20} color={colors.connection.connecting} />
            </Animated.View>
          ),
          label: 'Connecting...',
          color: colors.connection.connecting,
          gradient: ['#FDCB6E', '#E17055'] as [string, string],
        };
      case CONNECTION_STATES.RECONNECTING:
        return {
          icon: (
            <Animated.View style={spinStyle}>
              <RefreshCw size={20} color={colors.connection.connecting} />
            </Animated.View>
          ),
          label: 'Reconnecting...',
          color: colors.connection.connecting,
          gradient: ['#FDCB6E', '#E17055'] as [string, string],
        };
      default:
        return {
          icon: <WifiOff size={20} color={colors.connection.disconnected} />,
          label: 'Disconnected',
          color: colors.connection.disconnected,
          gradient: ['#E17055', '#D63031'] as [string, string],
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, pulseStyle]}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
      </Animated.View>

      <View style={styles.info}>
        <View style={styles.statusRow}>
          {config.icon}
          <Text variant="caption" color="secondary" style={styles.statusLabel}>
            {config.label}
          </Text>
        </View>

        {state === CONNECTION_STATES.CONNECTED && (
          <>
            {partnerName && (
              <Text variant="body" weight="semibold" numberOfLines={1}>
                {partnerName}
              </Text>
            )}
            {sessionId && (
              <View style={styles.sessionBadge}>
                <LinearGradient
                  colors={config.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sessionGradient}
                >
                  <Text variant="label" color="inverse">
                    {sessionId}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  indicator: {
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  info: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusLabel: {
    marginLeft: spacing.xs,
  },
  sessionBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  sessionGradient: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});
