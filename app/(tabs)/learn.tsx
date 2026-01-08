import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { History, Gamepad2, Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text, Button, Card, Modal } from '../../src/components/ui';
import { TimelineCard, MorseGame } from '../../src/components/learn';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { HISTORICAL_CODES, LearningModule } from '../../src/constants/historicalData';

export default function LearnScreen() {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [gameScore, setGameScore] = useState<number | null>(null);
  const [currentGame, setCurrentGame] = useState<'morse' | 'semaphore' | 'cipher' | null>(null);

  const handleModulePress = useCallback((module: LearningModule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModule(module);
  }, []);

  const handlePlayGame = useCallback((gameType: 'morse' | 'semaphore' | 'cipher') => {
    setCurrentGame(gameType);
    setShowGame(true);
    setSelectedModule(null);
    setGameScore(null);
  }, []);

  const handleGameComplete = useCallback((score: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGameScore(score);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text variant="h1">Learn</Text>
          <Text variant="body" color="secondary">
            Discover how secrets traveled through history
          </Text>
        </Animated.View>

        {/* Featured Game Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Card variant="gradient" glowColor={colors.primary[500]}>
            <LinearGradient
              colors={colors.gradients.mystical}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                <Gamepad2 size={40} color={colors.text.primary} />
                <Text variant="h2" style={styles.featuredTitle}>
                  Try Morse Code
                </Text>
                <Text variant="body" color="secondary" align="center">
                  Learn the dots and dashes that changed communication forever
                </Text>
                <Button
                  title="Play Now"
                  onPress={() => handlePlayGame('morse')}
                  variant="secondary"
                  style={styles.playButton}
                />
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Timeline Header */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <History size={20} color={colors.primary[500]} />
            <Text variant="h3" style={styles.sectionTitle}>
              Historical Timeline
            </Text>
          </View>
          <Text variant="body" color="secondary">
            Throughout history, secrets have traveled unseen through ingenious methods
          </Text>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.timeline}>
          {HISTORICAL_CODES.map((module, index) => (
            <TimelineCard
              key={module.id}
              module={module}
              onPress={handleModulePress}
              index={index}
            />
          ))}
        </Animated.View>

        {/* Spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Module Detail Modal */}
      <Modal
        visible={!!selectedModule}
        onClose={() => setSelectedModule(null)}
        position="bottom"
      >
        {selectedModule && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <View style={[styles.moduleIcon, { backgroundColor: `${selectedModule.color}30` }]}>
                <Text style={styles.moduleIconText}>{selectedModule.icon}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text variant="h2">{selectedModule.title}</Text>
                <Text variant="caption" color="tertiary">{selectedModule.era}</Text>
              </View>
            </View>

            <Text variant="body" color="secondary" style={styles.moduleDescription}>
              {selectedModule.fullContent}
            </Text>

            {selectedModule.hasGame && selectedModule.gameType && selectedModule.gameType !== 'puzzle' && (
              <Button
                title={`Play ${selectedModule.title} Game`}
                onPress={() => handlePlayGame(selectedModule.gameType as 'morse' | 'semaphore' | 'cipher')}
                variant="primary"
                fullWidth
                style={styles.moduleButton}
              />
            )}
          </ScrollView>
        )}
      </Modal>

      {/* Game Modal */}
      <Modal
        visible={showGame}
        onClose={() => {
          setShowGame(false);
          setGameScore(null);
        }}
        position="center"
      >
        {gameScore !== null ? (
          <View style={styles.gameComplete}>
            <Award size={60} color={colors.accent.success} />
            <Text variant="h2" style={styles.completeTitle}>
              Well Done!
            </Text>
            <Text variant="display" color={colors.accent.success}>
              {gameScore}/5
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.completeText}>
              You've learned the basics of Morse code!
            </Text>
            <Button
              title="Play Again"
              onPress={() => setGameScore(null)}
              variant="primary"
              style={styles.playAgainButton}
            />
            <Button
              title="Close"
              onPress={() => {
                setShowGame(false);
                setGameScore(null);
              }}
              variant="ghost"
            />
          </View>
        ) : (
          currentGame === 'morse' && (
            <MorseGame onComplete={handleGameComplete} />
          )
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
  },
  featuredGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  playButton: {
    marginTop: spacing.lg,
    minWidth: 150,
  },
  timeline: {
    paddingHorizontal: spacing.lg,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleIconText: {
    fontSize: 32,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleDescription: {
    lineHeight: 24,
  },
  moduleButton: {
    marginTop: spacing.lg,
  },
  gameComplete: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  completeTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  completeText: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  playAgainButton: {
    minWidth: 150,
    marginBottom: spacing.sm,
  },
});
