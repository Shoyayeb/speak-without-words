/**
 * Connect Screen - Riddle 1
 * "Two minds sharing a secret with no words or sound"
 * Real-time nonverbal communication between partners
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  MessageSquareLock, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Zap,
  Check,
  HelpCircle,
  X,
  Send,
  History
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  FadeOut,
  SlideInRight,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  DeckGrid,
} from '../../src/components/connect';
import { Button, Card, IconButton, Modal, Text } from '../../src/components/ui';
import { DeckEntry, PRESET_DECKS } from '../../src/constants/presetDecks';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { useConnection } from '../../src/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SignalHistoryItem {
  id: string;
  entry: DeckEntry;
  direction: 'sent' | 'received';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'confused' | 'rejected';
}

export default function ConnectScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  
  // Use the real connection hook
  const { 
    connection, 
    status: connectionStatus, 
    isConnected, 
    sendSignal: sendConnectionSignal,
    incomingSignal: realIncomingSignal,
    clearIncomingSignal,
    disconnect 
  } = useConnection();
  
  const [selectedDeck, setSelectedDeck] = useState(PRESET_DECKS[0]);
  const [selectedEntry, setSelectedEntry] = useState<DeckEntry | null>(null);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [signalHistory, setSignalHistory] = useState<SignalHistoryItem[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<SignalHistoryItem | null>(null);

  // Pulse animation for connection indicator
  const pulseAnim = useSharedValue(1);
  
  useEffect(() => {
    if (isConnected) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isConnected]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value > 1.1 ? 0.6 : 1,
  }));

  // Handle incoming signals
  useEffect(() => {
    if (realIncomingSignal) {
      const newSignal: SignalHistoryItem = {
        id: Date.now().toString(),
        entry: realIncomingSignal.entry,
        direction: 'received',
        timestamp: Date.now(),
        status: 'pending',
      };
      setPendingConfirmation(newSignal);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [realIncomingSignal]);

  const handleConnect = useCallback(() => {
    router.push('/pair');
  }, [router]);

  const handleDeckSelect = useCallback((entry: DeckEntry) => {
    setSelectedEntry(entry);
    Haptics.selectionAsync();
  }, []);

  const handleSendSignal = useCallback(async () => {
    if (!selectedEntry || !isConnected) return;

    const newSignal: SignalHistoryItem = {
      id: Date.now().toString(),
      entry: selectedEntry,
      direction: 'sent',
      timestamp: Date.now(),
      status: 'pending',
    };

    setSignalHistory(prev => [newSignal, ...prev].slice(0, 20));
    
    const success = await sendConnectionSignal(selectedEntry);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Simulate partner confirmation for demo
      setTimeout(() => {
        setSignalHistory(prev => 
          prev.map(s => s.id === newSignal.id ? { ...s, status: 'confirmed' as const } : s)
        );
      }, 1500);
    }
    
    setSelectedEntry(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [selectedEntry, isConnected, sendConnectionSignal]);

  const handleConfirm = useCallback(() => {
    if (!pendingConfirmation) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSignalHistory(prev => [
      { ...pendingConfirmation, status: 'confirmed' as const },
      ...prev
    ].slice(0, 20));
    setPendingConfirmation(null);
    clearIncomingSignal();
  }, [pendingConfirmation, clearIncomingSignal]);

  const handleConfused = useCallback(() => {
    if (!pendingConfirmation) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSignalHistory(prev => [
      { ...pendingConfirmation, status: 'confused' as const },
      ...prev
    ].slice(0, 20));
    setPendingConfirmation(null);
    clearIncomingSignal();
  }, [pendingConfirmation, clearIncomingSignal]);

  const handleReject = useCallback(() => {
    if (!pendingConfirmation) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSignalHistory(prev => [
      { ...pendingConfirmation, status: 'rejected' as const },
      ...prev
    ].slice(0, 20));
    setPendingConfirmation(null);
    clearIncomingSignal();
  }, [pendingConfirmation, clearIncomingSignal]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setSignalHistory([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [disconnect]);

  const getStatusIcon = (status: SignalHistoryItem['status']) => {
    switch (status) {
      case 'confirmed': return <Check size={14} color={colors.accent.success} />;
      case 'confused': return <HelpCircle size={14} color={colors.accent.warning} />;
      case 'rejected': return <X size={14} color={colors.accent.error} />;
      default: return <Send size={14} color={colors.text.muted} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.titleRow}>
            <Text variant="h1">Speak</Text>
            <View style={styles.connectionIndicator}>
              {isConnected ? (
                <Animated.View style={pulseStyle}>
                  <Wifi size={24} color={colors.accent.success} />
                </Animated.View>
              ) : (
                <WifiOff size={24} color={colors.text.muted} />
              )}
            </View>
          </View>
          <Text variant="body" color="secondary">
            Share meaning without words
          </Text>
        </Animated.View>

        {/* Connection Status Card */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Card variant={isConnected ? 'elevated' : 'default'} glowColor={isConnected ? colors.accent.success : undefined}>
            <View style={styles.connectionCard}>
              <View style={styles.connectionInfo}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: isConnected ? colors.accent.success : colors.text.muted }
                ]} />
                <View>
                  <Text variant="h3">
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Text>
                  {isConnected && connection?.sessionCode && (
                    <Text variant="caption" color="secondary">
                      Session: {connection.sessionCode}
                    </Text>
                  )}
                </View>
              </View>
              
              {isConnected ? (
                <View style={styles.connectionActions}>
                  <IconButton
                    icon={<MessageSquareLock size={20} color={colors.primary[500]} />}
                    onPress={() => router.push('/messages')}
                    variant="ghost"
                    size="sm"
                  />
                  <Button
                    title="Disconnect"
                    onPress={handleDisconnect}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              ) : (
                <Button
                  title="Connect"
                  onPress={handleConnect}
                  variant="primary"
                  size="sm"
                  icon={<QrCode size={16} color={colors.text.primary} />}
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Quick Access to Encrypted Messages */}
        {isConnected && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Pressable onPress={() => router.push('/messages')}>
              <Card variant="gradient" glowColor={colors.primary[500]}>
                <View style={styles.secretMessagesCard}>
                  <MessageSquareLock size={32} color={colors.primary[500]} />
                  <View style={styles.secretMessagesInfo}>
                    <Text variant="h3">Secret Messages</Text>
                    <Text variant="caption" color="secondary">
                      End-to-end encrypted chat
                    </Text>
                  </View>
                  <Text variant="body" color="primary">→</Text>
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        )}

        {/* Pending Confirmation */}
        {pendingConfirmation && (
          <Animated.View 
            entering={FadeIn.springify()} 
            exiting={FadeOut}
            style={styles.section}
          >
            <Card variant="elevated" style={styles.pendingCard}>
              <Text variant="label" color="primary" style={styles.pendingLabel}>
                📨 INCOMING SIGNAL
              </Text>
              
              <View style={styles.signalContent}>
                <View style={[
                  styles.signalIcon, 
                  { backgroundColor: `${pendingConfirmation.entry.color || colors.primary[500]}30` }
                ]}>
                  <Text style={styles.signalEmoji}>
                    {pendingConfirmation.entry.iconId}
                  </Text>
                </View>
                <View style={styles.signalInfo}>
                  <Text variant="h2">{pendingConfirmation.entry.meaning}</Text>
                  <Text variant="caption" color="tertiary">
                    Tap a response to confirm understanding
                  </Text>
                </View>
              </View>

              <View style={styles.confirmationActions}>
                <Pressable 
                  style={[styles.confirmButton, { backgroundColor: colors.accent.success + '30' }]}
                  onPress={handleConfirm}
                >
                  <Check size={24} color={colors.accent.success} />
                  <Text variant="label" style={{ color: colors.accent.success }}>Got it</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.confirmButton, { backgroundColor: colors.accent.warning + '30' }]}
                  onPress={handleConfused}
                >
                  <HelpCircle size={24} color={colors.accent.warning} />
                  <Text variant="label" style={{ color: colors.accent.warning }}>What?</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.confirmButton, { backgroundColor: colors.accent.error + '30' }]}
                  onPress={handleReject}
                >
                  <X size={24} color={colors.accent.error} />
                  <Text variant="label" style={{ color: colors.accent.error }}>No</Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Signal History */}
        {signalHistory.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <History size={16} color={colors.text.secondary} />
              <Text variant="label" color="secondary">SIGNAL HISTORY</Text>
            </View>
            
            <View style={styles.historyList}>
              {signalHistory.slice(0, 5).map((signal, index) => (
                <Animated.View 
                  key={signal.id}
                  entering={signal.direction === 'sent' ? SlideInRight.delay(index * 50) : SlideInLeft.delay(index * 50)}
                  style={[
                    styles.historyItem,
                    signal.direction === 'sent' ? styles.sentItem : styles.receivedItem
                  ]}
                >
                  <Text style={styles.historyEmoji}>{signal.entry.iconId}</Text>
                  <View style={styles.historyInfo}>
                    <Text variant="body">{signal.entry.meaning}</Text>
                    <View style={styles.historyMeta}>
                      {getStatusIcon(signal.status)}
                      <Text variant="caption" color="tertiary">
                        {signal.direction === 'sent' ? 'Sent' : 'Received'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Signal Deck */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={16} color={colors.primary[500]} />
            <Text variant="label" color="secondary">YOUR SIGNALS</Text>
            <Pressable onPress={() => setShowDeckPicker(true)} style={styles.deckSelector}>
              <Text variant="caption" color="primary">{selectedDeck.icon} {selectedDeck.name}</Text>
            </Pressable>
          </View>
          
          <Card variant="default">
            <DeckGrid
              entries={selectedDeck.entries}
              onSelect={handleDeckSelect}
              selectedId={selectedEntry?.id}
            />
          </Card>
          
          {selectedEntry && (
            <Animated.View entering={FadeInUp.springify()}>
              <Button
                title={`Send "${selectedEntry.meaning}"`}
                onPress={handleSendSignal}
                variant="primary"
                fullWidth
                disabled={!isConnected}
                style={styles.sendButton}
                icon={<Send size={18} color={colors.text.primary} style={{ marginRight: 8 }} />}
              />
              {!isConnected && (
                <Text variant="caption" color="tertiary" align="center" style={{ marginTop: 8 }}>
                  Connect with a partner to send signals
                </Text>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Spacer for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Deck Picker Modal */}
      <Modal
        visible={showDeckPicker}
        onClose={() => setShowDeckPicker(false)}
        position="bottom"
      >
        <Text variant="h3" style={styles.modalTitle}>Choose a Signal Deck</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
          {PRESET_DECKS.map((deck) => (
            <Pressable
              key={deck.id}
              style={[
                styles.deckOption,
                selectedDeck.id === deck.id && styles.deckOptionSelected
              ]}
              onPress={() => {
                setSelectedDeck(deck);
                setShowDeckPicker(false);
                Haptics.selectionAsync();
              }}
            >
              <Text style={styles.deckIcon}>{deck.icon}</Text>
              <View style={styles.deckInfo}>
                <Text variant="h4">{deck.name}</Text>
                <Text variant="caption" color="secondary">{deck.description}</Text>
              </View>
              {selectedDeck.id === deck.id && (
                <Check size={20} color={colors.primary[500]} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionIndicator: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  secretMessagesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  secretMessagesInfo: {
    flex: 1,
  },
  pendingCard: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  pendingLabel: {
    marginBottom: spacing.md,
  },
  signalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  signalIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalEmoji: {
    fontSize: 36,
  },
  signalInfo: {
    flex: 1,
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  deckSelector: {
    marginLeft: 'auto',
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  sentItem: {
    backgroundColor: colors.primary[500] + '15',
    marginLeft: spacing.xl,
  },
  receivedItem: {
    backgroundColor: colors.surface.elevated,
    marginRight: spacing.xl,
  },
  historyEmoji: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  sendButton: {
    marginTop: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.lg,
  },
  deckOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface.card,
  },
  deckOptionSelected: {
    backgroundColor: colors.primary[500] + '20',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  deckIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  deckInfo: {
    flex: 1,
  },
});
