import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface MorseGameProps {
  onComplete: (score: number) => void;
}

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', ' ': '/',
};

const CHALLENGES = [
  { word: 'SOS', hint: 'The most famous distress signal' },
  { word: 'HI', hint: 'A simple greeting' },
  { word: 'OK', hint: 'Everything is fine' },
  { word: 'YES', hint: 'Affirmative' },
  { word: 'NO', hint: 'Negative' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MorseGame: React.FC<MorseGameProps> = ({ onComplete }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const challenge = CHALLENGES[currentChallenge];
  const targetMorse = challenge.word.split('').map(c => MORSE_CODE[c] || '').join(' ');

  const dotScale = useSharedValue(1);
  const dashScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const feedbackColor = useSharedValue<string>(colors.accent.success);

  const handleDot = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dotScale.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withSpring(1, { damping: 10 })
    );
    setInput(prev => prev + '.');
  }, []);

  const handleDash = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dashScale.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withSpring(1, { damping: 10 })
    );
    setInput(prev => prev + '-');
  }, []);

  const handleSpace = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInput(prev => prev + ' ');
  }, []);

  const handleClear = useCallback(() => {
    Haptics.selectionAsync();
    setInput('');
  }, []);

  const handleCheck = useCallback(() => {
    const isCorrect = input.trim() === targetMorse;
    
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      feedbackColor.value = colors.accent.success;
      setScore(prev => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      feedbackColor.value = colors.accent.error;
    }
    
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 1000 })
    );

    // Move to next challenge
    setTimeout(() => {
      if (currentChallenge < CHALLENGES.length - 1) {
        setCurrentChallenge(prev => prev + 1);
        setInput('');
        setShowAnswer(false);
      } else {
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  }, [input, targetMorse, currentChallenge, score, onComplete]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const dashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dashScale.value }],
  }));

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    backgroundColor: feedbackColor.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Morse Code</Text>
        <View style={styles.scoreContainer}>
          <Text variant="caption" color="secondary">Score</Text>
          <Text variant="h2" color={colors.primary[500]}>{score}/{CHALLENGES.length}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        {CHALLENGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < currentChallenge && styles.progressComplete,
              i === currentChallenge && styles.progressCurrent,
            ]}
          />
        ))}
      </View>

      {/* Challenge */}
      <Card variant="gradient" style={styles.challengeCard}>
        <Text variant="label" color="secondary" style={styles.hintLabel}>
          ENCODE THIS WORD
        </Text>
        <Text variant="display" align="center" style={styles.word}>
          {challenge.word}
        </Text>
        <Text variant="caption" color="tertiary" align="center">
          {challenge.hint}
        </Text>

        {showAnswer && (
          <View style={styles.answerContainer}>
            <Text variant="caption" color="secondary">Answer:</Text>
            <Text variant="body" color={colors.primary[500]} style={styles.answerText}>
              {targetMorse}
            </Text>
          </View>
        )}
      </Card>

      {/* Input display */}
      <Card variant="default" style={styles.inputCard}>
        <Text variant="caption" color="secondary" style={styles.inputLabel}>
          YOUR INPUT
        </Text>
        <Text variant="h3" align="center" style={styles.inputText}>
          {input || '_ _ _'}
        </Text>
        <Animated.View style={[styles.feedbackBar, feedbackStyle]} />
      </Card>

      {/* Controls */}
      <View style={styles.controls}>
        <Animated.View style={dotStyle}>
          <Button
            title="•"
            onPress={handleDot}
            variant="outline"
            style={styles.morseButton}
          />
        </Animated.View>
        <Animated.View style={dashStyle}>
          <Button
            title="—"
            onPress={handleDash}
            variant="outline"
            style={styles.morseButton}
          />
        </Animated.View>
        <Button
          title="␣"
          onPress={handleSpace}
          variant="ghost"
          style={styles.spaceButton}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Clear"
          onPress={handleClear}
          variant="ghost"
          size="sm"
        />
        <Button
          title={showAnswer ? 'Hide Answer' : 'Show Answer'}
          onPress={() => setShowAnswer(!showAnswer)}
          variant="ghost"
          size="sm"
        />
        <Button
          title="Check"
          onPress={handleCheck}
          variant="primary"
          disabled={!input.trim()}
        />
      </View>

      {/* Morse reference */}
      <View style={styles.reference}>
        <Text variant="caption" color="tertiary" align="center">
          • = dot (short)  |  — = dash (long)  |  ␣ = letter space
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface.border,
  },
  progressComplete: {
    backgroundColor: colors.accent.success,
  },
  progressCurrent: {
    backgroundColor: colors.primary[500],
  },
  challengeCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  hintLabel: {
    marginBottom: spacing.sm,
  },
  word: {
    letterSpacing: 8,
    marginBottom: spacing.xs,
  },
  answerContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  answerText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  inputCard: {
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  inputLabel: {
    marginBottom: spacing.sm,
  },
  inputText: {
    fontFamily: 'monospace',
    letterSpacing: 4,
    minHeight: 40,
  },
  feedbackBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  morseButton: {
    width: 80,
    height: 80,
  },
  spaceButton: {
    width: 60,
    height: 80,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reference: {
    paddingVertical: spacing.sm,
  },
});
