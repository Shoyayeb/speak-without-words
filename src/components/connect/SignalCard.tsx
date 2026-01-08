/**
 * SignalCard - A more prominent signal display component
 * Shows sent/received signals with confirmation status
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { Check, X, HelpCircle, Send, Download } from 'lucide-react-native';
import { Text, Card } from '../ui';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { DeckEntry } from '../../constants/presetDecks';

export type SignalStatus = 'sending' | 'sent' | 'received' | 'confirmed' | 'confused' | 'rejected';

interface SignalCardProps {
  entry: DeckEntry;
  status: SignalStatus;
  direction: 'sent' | 'received';
  timestamp?: number;
  onConfirm?: () => void;
  onConfused?: () => void;
  onReject?: () => void;
}

export function SignalCard({
  entry,
  status,
  direction,
  timestamp,
  onConfirm,
  onConfused,
  onReject,
}: SignalCardProps) {
  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    if (status === 'sending' || status === 'received') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withSpring(1);
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const isSent = direction === 'sent';
  const showActions = status === 'received' && !isSent;

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return colors.accent.success;
      case 'confused': return colors.accent.warning;
      case 'rejected': return colors.accent.error;
      default: return entry.color || colors.primary[500];
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending': return <Send size={16} color={colors.text.muted} />;
      case 'sent': return <Check size={16} color={colors.text.muted} />;
      case 'confirmed': return <Check size={16} color={colors.accent.success} />;
      case 'confused': return <HelpCircle size={16} color={colors.accent.warning} />;
      case 'rejected': return <X size={16} color={colors.accent.error} />;
      case 'received': return <Download size={16} color={colors.primary[500]} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending': return 'Sending...';
      case 'sent': return 'Sent';
      case 'confirmed': return 'Understood ✓';
      case 'confused': return 'Partner confused';
      case 'rejected': return 'Rejected';
      case 'received': return 'Tap to respond';
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.springify()} 
      exiting={FadeOut}
      style={pulseStyle}
    >
      <Card 
        variant="elevated" 
        style={[
          styles.card, 
          { borderLeftColor: getStatusColor(), borderLeftWidth: 4 },
          isSent ? styles.sentCard : styles.receivedCard
        ]}
      >
        <View style={styles.header}>
          <View style={styles.directionBadge}>
            {isSent ? (
              <Send size={14} color={colors.text.secondary} />
            ) : (
              <Download size={14} color={colors.primary[500]} />
            )}
            <Text variant="caption" color={isSent ? 'secondary' : 'primary'}>
              {isSent ? 'You sent' : 'Received'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            {getStatusIcon()}
            <Text variant="caption" style={{ color: getStatusColor(), marginLeft: 4 }}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${entry.color || colors.primary[500]}30` }]}>
            <Text style={styles.icon}>{entry.iconId}</Text>
          </View>
          <View style={styles.meaningContainer}>
            <Text variant="h3">{entry.meaning}</Text>
            <Text variant="caption" color="tertiary">
              {entry.gesture.replace('-', ' ')}
            </Text>
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            <Pressable 
              style={[styles.actionButton, styles.confirmButton]} 
              onPress={onConfirm}
            >
              <Check size={20} color={colors.text.primary} />
              <Text variant="label">Got it</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.confusedButton]} 
              onPress={onConfused}
            >
              <HelpCircle size={20} color={colors.text.primary} />
              <Text variant="label">Confused</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.rejectButton]} 
              onPress={onReject}
            >
              <X size={20} color={colors.text.primary} />
              <Text variant="label">No</Text>
            </Pressable>
          </View>
        )}

        {timestamp && (
          <Text variant="caption" color="tertiary" style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  sentCard: {
    marginLeft: spacing.xl,
    backgroundColor: colors.surface.card + '80',
  },
  receivedCard: {
    marginRight: spacing.xl,
    backgroundColor: colors.surface.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  meaningContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  confirmButton: {
    backgroundColor: colors.accent.success + '30',
  },
  confusedButton: {
    backgroundColor: colors.accent.warning + '30',
  },
  rejectButton: {
    backgroundColor: colors.accent.error + '30',
  },
  timestamp: {
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});

export default SignalCard;
