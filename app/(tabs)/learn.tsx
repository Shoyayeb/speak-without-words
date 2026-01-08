/**
 * Learn Screen - Riddle 2 Education
 * "How secrets traveled unseen through history"
 * Educational content about cryptography and secret communication
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, History, Lock, Key, Shield, ScrollText } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MorseGame, TimelineCard } from '../../src/components/learn';
import { Button, Card, Modal, Text } from '../../src/components/ui';
import { HISTORICAL_CODES, LearningModule } from '../../src/constants/historicalData';
import { borderRadius, colors, spacing } from '../../src/constants/theme';

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
          <Text variant="h1">Secrets</Text>
          <Text variant="body" color="secondary">
            How messages traveled unseen through history
          </Text>
        </Animated.View>

        {/* Encryption Overview Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Card variant="gradient" glowColor={colors.primary[500]}>
            <LinearGradient
              colors={colors.gradients.mystical}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                <View style={styles.iconRow}>
                  <Lock size={28} color={colors.text.primary} />
                  <Key size={28} color={colors.primary[500]} style={{ marginLeft: -8 }} />
                </View>
                <Text variant="h2" style={styles.featuredTitle}>
                  The Art of Secret Messages
                </Text>
                <Text variant="body" color="secondary" align="center">
                  From ancient ciphers to modern encryption, humans have always found ways to communicate privately
                </Text>
                <View style={styles.cryptoInfo}>
                  <View style={styles.cryptoItem}>
                    <Shield size={20} color={colors.primary[500]} />
                    <Text variant="caption" color="primary">Military Secrets</Text>
                  </View>
                  <View style={styles.cryptoItem}>
                    <ScrollText size={20} color={colors.primary[500]} />
                    <Text variant="caption" color="primary">Hidden Messages</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Quick Fact Card */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
          <Card variant="elevated">
            <View style={styles.factCard}>
              <Text style={styles.factEmoji}>🔐</Text>
              <View style={styles.factInfo}>
                <Text variant="label" color="primary">DID YOU KNOW?</Text>
                <Text variant="body" color="secondary">
                  The word "cryptography" comes from Greek: "kryptós" (hidden) + "graphein" (to write)
                </Text>
              </View>
            </View>
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
            Explore how secrets have been protected throughout the ages
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
                title={`Try ${selectedModule.title} Challenge`}
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
              You've learned how secrets were hidden!
            </Text>
            <Button
              title="Try Again"
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featuredTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  cryptoInfo: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  cryptoItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  factCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  factEmoji: {
    fontSize: 32,
  },
  factInfo: {
    flex: 1,
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
