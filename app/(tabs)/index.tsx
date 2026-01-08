import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Zap, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text, Button, Card, IconButton, Modal } from '../../src/components/ui';
import {
  DeckGrid,
  SignalDisplay,
  TapArea,
  ConfirmButtons,
  ConnectionStatus,
} from '../../src/components/connect';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { PRESET_DECKS, DeckEntry } from '../../src/constants/presetDecks';
import { GestureType, CONNECTION_STATES, ConnectionState } from '../../src/constants/signals';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ConnectScreen() {
  const router = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>(CONNECTION_STATES.DISCONNECTED);
  const [selectedDeck, setSelectedDeck] = useState(PRESET_DECKS[0]);
  const [selectedEntry, setSelectedEntry] = useState<DeckEntry | null>(null);
  const [incomingSignal, setIncomingSignal] = useState<DeckEntry | null>(null);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);

  const handleConnect = useCallback(() => {
    router.push('/pair');
  }, [router]);

  const handleDeckSelect = useCallback((entry: DeckEntry) => {
    setSelectedEntry(entry);
    Haptics.selectionAsync();
  }, []);

  const handleGesture = useCallback((gesture: GestureType) => {
    setLastGesture(gesture);
    
    // Find matching entry in deck
    const matchingEntry = selectedDeck.entries.find(e => e.gesture === gesture);
    if (matchingEntry && connectionState === CONNECTION_STATES.CONNECTED) {
      // Simulate sending signal
      setSelectedEntry(matchingEntry);
      // In real app, this would send via WebRTC/Socket
    }
  }, [selectedDeck, connectionState]);

  const handleSendSignal = useCallback(() => {
    if (selectedEntry) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Simulate receiving for demo
      setTimeout(() => {
        setIncomingSignal(selectedEntry);
      }, 500);
      setSelectedEntry(null);
    }
  }, [selectedEntry]);

  const handleConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setIncomingSignal(null), 1500);
  }, []);

  const handleConfused = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // Would send confused signal to partner
  }, []);

  const handleReject = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIncomingSignal(null);
  }, []);

  // Demo: Toggle connection state
  const handleDemoConnect = useCallback(() => {
    if (connectionState === CONNECTION_STATES.DISCONNECTED) {
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setTimeout(() => {
        setConnectionState(CONNECTION_STATES.CONNECTED);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1500);
    } else {
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    }
  }, [connectionState]);

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
          <View style={styles.titleRow}>
            <Text variant="h1" style={styles.title}>Connect</Text>
            <IconButton
              icon={<QrCode size={24} color={colors.text.primary} />}
              onPress={handleConnect}
              variant="primary"
              size="md"
            />
          </View>
          <Text variant="body" color="secondary">
            Share meaning without words
          </Text>
        </Animated.View>

        {/* Connection Status */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <ConnectionStatus
            state={connectionState}
            sessionId={connectionState === CONNECTION_STATES.CONNECTED ? 'XK7D42' : undefined}
            partnerName={connectionState === CONNECTION_STATES.CONNECTED ? 'Partner' : undefined}
          />
          
          {connectionState === CONNECTION_STATES.DISCONNECTED && (
            <View style={styles.connectActions}>
              <Button
                title="Scan QR to Connect"
                onPress={handleConnect}
                variant="primary"
                icon={<QrCode size={20} color={colors.text.primary} style={{ marginRight: spacing.sm }} />}
                fullWidth
              />
              <Button
                title="Demo Mode"
                onPress={handleDemoConnect}
                variant="outline"
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </Animated.View>

        {/* Incoming Signal Display */}
        {incomingSignal && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <Text variant="label" color="secondary" style={styles.sectionLabel}>
              INCOMING SIGNAL
            </Text>
            <SignalDisplay signal={incomingSignal} />
            <ConfirmButtons
              onConfirm={handleConfirm}
              onConfused={handleConfused}
              onReject={handleReject}
            />
          </Animated.View>
        )}

        {/* Your Deck */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="secondary">YOUR DECK</Text>
            <Button
              title={selectedDeck.name}
              onPress={() => setShowDeckPicker(true)}
              variant="ghost"
              size="sm"
              icon={<Zap size={16} color={colors.primary[500]} />}
            />
          </View>
          <Card variant="gradient">
            <DeckGrid
              entries={selectedDeck.entries}
              onSelect={handleDeckSelect}
              selectedId={selectedEntry?.id}
            />
          </Card>
          
          {selectedEntry && connectionState === CONNECTION_STATES.CONNECTED && (
            <Button
              title={`Send "${selectedEntry.meaning}"`}
              onPress={handleSendSignal}
              variant="secondary"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          )}
        </Animated.View>

        {/* Tap Area */}
        {connectionState === CONNECTION_STATES.CONNECTED && (
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
            <Text variant="label" color="secondary" style={styles.sectionLabel}>
              GESTURE INPUT
            </Text>
            <TapArea
              onGesture={handleGesture}
              disabled={connectionState !== CONNECTION_STATES.CONNECTED}
            />
          </Animated.View>
        )}

        {/* Spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Deck Picker Modal */}
      <Modal
        visible={showDeckPicker}
        onClose={() => setShowDeckPicker(false)}
        position="bottom"
      >
        <Text variant="h3" style={styles.modalTitle}>Choose a Deck</Text>
        <Text variant="body" color="secondary" style={styles.modalSubtitle}>
          Select a preset or create your own
        </Text>
        
        {PRESET_DECKS.map((deck) => (
          <Card
            key={deck.id}
            variant={deck.id === selectedDeck.id ? 'gradient' : 'default'}
            style={styles.deckOption}
            glowColor={deck.id === selectedDeck.id ? colors.primary[500] : undefined}
          >
            <View
              style={styles.deckOptionContent}
              onTouchEnd={() => {
                setSelectedDeck(deck);
                setShowDeckPicker(false);
                Haptics.selectionAsync();
              }}
            >
              <Text style={styles.deckIcon}>{deck.icon}</Text>
              <View style={styles.deckInfo}>
                <Text variant="body" weight="semibold">{deck.name}</Text>
                <Text variant="caption" color="secondary">{deck.description}</Text>
              </View>
              {deck.id === selectedDeck.id && (
                <View style={styles.selectedBadge}>
                  <Text variant="caption" color="primary">✓</Text>
                </View>
              )}
            </View>
          </Card>
        ))}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  connectActions: {
    marginTop: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
  },
  deckOption: {
    marginBottom: spacing.sm,
  },
  deckOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deckIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  deckInfo: {
    flex: 1,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
