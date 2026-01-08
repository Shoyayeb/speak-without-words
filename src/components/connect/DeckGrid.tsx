import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { DeckEntry } from '../../constants/presetDecks';
import { borderRadius, colors, spacing } from '../../constants/theme';
import { Text } from '../ui/Text';

interface DeckGridProps {
  entries: DeckEntry[];
  onSelect?: (entry: DeckEntry) => void;
  editable?: boolean;
  selectedId?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const ITEM_GAP = spacing.sm;
const ITEMS_PER_ROW = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - ITEM_GAP * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const DeckItem: React.FC<{
  entry: DeckEntry;
  onSelect?: (entry: DeckEntry) => void;
  selected?: boolean;
}> = ({ entry, onSelect, selected }) => {
  const scale = useSharedValue(1);
  const bounce = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * bounce.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bounce.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    onSelect?.(entry);
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[animatedStyle]}
    >
      <View style={[styles.itemContainer, selected && styles.itemSelected]}>
        {selected && (
          <LinearGradient
            colors={[entry.color || colors.primary[500], 'transparent']}
            style={styles.selectedGlow}
          />
        )}
        <LinearGradient
          colors={[colors.surface.default, colors.background.secondary]}
          style={[
            styles.item,
            selected && { borderColor: entry.color || colors.primary[500] },
          ]}
        >
          <Text style={styles.emoji}>{entry.iconId}</Text>
          <Text variant="caption" color="secondary" numberOfLines={1} style={styles.meaning}>
            {entry.meaning}
          </Text>
        </LinearGradient>
      </View>
    </AnimatedTouchable>
  );
};

export const DeckGrid: React.FC<DeckGridProps> = ({
  entries,
  onSelect,
  editable = false,
  selectedId,
}) => {
  // Pad entries to always show 6 slots
  const paddedEntries = [...entries];
  while (paddedEntries.length < 6) {
    paddedEntries.push({
      id: `empty-${paddedEntries.length}`,
      iconId: '+',
      gesture: 'tap',
      meaning: 'Add signal',
    });
  }

  return (
    <View style={styles.grid}>
      {paddedEntries.map((entry) => (
        <DeckItem
          key={entry.id}
          entry={entry}
          onSelect={onSelect}
          selected={entry.id === selectedId}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: ITEM_GAP,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: 'relative',
  },
  itemSelected: {
    zIndex: 1,
  },
  selectedGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: borderRadius.xl,
    opacity: 0.3,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surface.border,
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  meaning: {
    textAlign: 'center',
  },
});
