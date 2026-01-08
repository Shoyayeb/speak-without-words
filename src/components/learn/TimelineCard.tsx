import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { LearningModule } from '../../constants/historicalData';

interface TimelineCardProps {
  module: LearningModule;
  onPress: (module: LearningModule) => void;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TimelineCard: React.FC<TimelineCardProps> = ({
  module,
  onPress,
  index,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(module);
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      style={[styles.container, animatedStyle]}
    >
      {/* Timeline connector */}
      <View style={styles.timelineConnector}>
        <View style={[styles.dot, { backgroundColor: module.color }]} />
        {index > 0 && <View style={styles.lineTop} />}
        <View style={styles.lineBottom} />
      </View>

      {/* Card content */}
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={[colors.surface.default, colors.background.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Era badge */}
          <View style={[styles.eraBadge, { backgroundColor: module.color }]}>
            <Text variant="label" color="inverse">
              {module.year || module.era}
            </Text>
          </View>

          {/* Icon and title */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${module.color}30` }]}>
              <Text style={styles.icon}>{module.icon}</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text variant="h3" numberOfLines={1}>{module.title}</Text>
              <Text variant="caption" color="tertiary">{module.era}</Text>
            </View>
          </View>

          {/* Description */}
          <Text variant="body" color="secondary" numberOfLines={2} style={styles.description}>
            {module.description}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {module.hasGame && (
              <View style={styles.gameTag}>
                <Play size={14} color={colors.accent.success} />
                <Text variant="caption" color={colors.accent.success} style={styles.gameText}>
                  Interactive
                </Text>
              </View>
            )}
            <View style={styles.readMore}>
              <Text variant="caption" color="primary">Read more</Text>
              <ChevronRight size={16} color={colors.primary[500]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineConnector: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 1,
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 8,
    backgroundColor: colors.surface.border,
  },
  lineBottom: {
    position: 'absolute',
    top: 16,
    bottom: -spacing.md,
    width: 2,
    backgroundColor: colors.surface.border,
  },
  cardWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  eraBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.md,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  description: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.success}20`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  gameText: {
    marginLeft: spacing.xs,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
