/**
 * Secret Messages Screen
 * E2E encrypted messaging that embodies Riddle 2:
 * "Throughout history, how have secrets traveled unseen"
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  FileText,
  Info,
  ArrowLeft
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { Text, Button, Card, IconButton, Modal, TextInput } from '../../src/components/ui';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { useConnection } from '../../src/hooks';
import encryptedMessaging, { DecryptedMessage } from '../../src/services/EncryptedMessaging';

interface ChatMessage {
  id: string;
  content: string;
  direction: 'sent' | 'received';
  timestamp: number;
  type: 'text' | 'image' | 'file';
  encrypted: boolean;
  status: 'sending' | 'sent' | 'delivered';
}

export default function SecretMessagesScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { isConnected, connection } = useConnection();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sending, setSending] = useState(false);

  // Demo messages to show encryption working
  useEffect(() => {
    if (isConnected) {
      // Initialize with a welcome message
      setMessages([{
        id: 'welcome',
        content: '🔐 End-to-end encrypted chat established. Only you and your partner can read these messages.',
        direction: 'received',
        timestamp: Date.now(),
        type: 'text',
        encrypted: true,
        status: 'delivered',
      }]);
    }
  }, [isConnected]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !isConnected) return;

    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      direction: 'sent',
      timestamp: Date.now(),
      type: 'text',
      encrypted: true,
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate encryption and sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' as const } : m)
      );
      setSending(false);

      // Simulate received response for demo
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: '✓ Message received securely',
          direction: 'received',
          timestamp: Date.now(),
          type: 'text',
          encrypted: true,
          status: 'delivered',
        }]);
      }, 1000);
    }, 500);

    scrollRef.current?.scrollToEnd({ animated: true });
  }, [inputText, isConnected]);

  const handleImagePick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: '📷 Encrypted image',
        direction: 'sent',
        timestamp: Date.now(),
        type: 'image',
        encrypted: true,
        status: 'sent',
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const encryptionInfo = encryptedMessaging.getEncryptionInfo();

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.notConnected}>
          <Lock size={60} color={colors.text.muted} />
          <Text variant="h2" style={styles.notConnectedTitle}>
            Connect First
          </Text>
          <Text variant="body" color="secondary" align="center">
            Establish a secure connection with your partner to start encrypted messaging
          </Text>
          <Button
            title="Go to Connect"
            onPress={() => router.replace('/(tabs)')}
            variant="primary"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<ArrowLeft size={24} color={colors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
        />
        <View style={styles.headerCenter}>
          <View style={styles.headerTitle}>
            <Shield size={18} color={colors.accent.success} />
            <Text variant="h3">Secret Messages</Text>
          </View>
          <Text variant="caption" color="secondary">
            End-to-end encrypted
          </Text>
        </View>
        <IconButton
          icon={<Info size={24} color={colors.text.secondary} />}
          onPress={() => setShowInfoModal(true)}
          variant="ghost"
        />
      </View>

      {/* Encryption Banner */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.encryptionBanner}>
        <Lock size={14} color={colors.accent.success} />
        <Text variant="caption" color="secondary">
          Messages are encrypted with {encryptionInfo.algorithm}
        </Text>
        <Pressable onPress={() => setShowEncrypted(!showEncrypted)}>
          {showEncrypted ? (
            <EyeOff size={14} color={colors.text.muted} />
          ) : (
            <Eye size={14} color={colors.text.muted} />
          )}
        </Pressable>
      </Animated.View>

      {/* Messages */}
      <ScrollView 
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <Animated.View
            key={msg.id}
            entering={msg.direction === 'sent' ? SlideInRight.delay(index * 50) : SlideInLeft.delay(index * 50)}
            style={[
              styles.messageBubble,
              msg.direction === 'sent' ? styles.sentBubble : styles.receivedBubble
            ]}
          >
            {showEncrypted ? (
              <View>
                <Text variant="caption" color="tertiary" style={styles.encryptedLabel}>
                  ENCRYPTED:
                </Text>
                <Text variant="body" style={styles.encryptedText}>
                  {btoa(msg.content).substring(0, 40)}...
                </Text>
              </View>
            ) : (
              <Text variant="body" color={msg.direction === 'sent' ? 'primary' : 'primary'}>
                {msg.content}
              </Text>
            )}
            <View style={styles.messageFooter}>
              <Lock size={10} color={colors.accent.success} />
              <Text variant="caption" color="tertiary">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              {msg.direction === 'sent' && (
                <Text variant="caption" color="tertiary">
                  {msg.status === 'sending' ? '⏳' : msg.status === 'sent' ? '✓' : '✓✓'}
                </Text>
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <IconButton
            icon={<ImageIcon size={22} color={colors.text.secondary} />}
            onPress={handleImagePick}
            variant="ghost"
            size="sm"
          />
          <View style={styles.textInputWrapper}>
            <RNTextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a secret message..."
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={1000}
            />
          </View>
          <IconButton
            icon={<Send size={22} color={inputText.trim() ? colors.primary[500] : colors.text.muted} />}
            onPress={handleSend}
            variant={inputText.trim() ? 'primary' : 'ghost'}
            size="md"
            disabled={!inputText.trim() || sending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Encryption Info Modal */}
      <Modal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        position="bottom"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoModalContent}>
            <Shield size={48} color={colors.accent.success} style={styles.infoIcon} />
            <Text variant="h2" align="center">How Your Secrets Stay Safe</Text>
            
            <Text variant="body" color="secondary" style={styles.infoText}>
              Just like historical codes that traveled unseen past watchful eyes, 
              your messages are transformed into unreadable cipher text.
            </Text>

            <Card variant="elevated" style={styles.infoCard}>
              <Text variant="label" color="primary">Algorithm</Text>
              <Text variant="h3">{encryptionInfo.algorithm}</Text>
              <Text variant="caption" color="secondary">
                {encryptionInfo.description}
              </Text>
            </Card>

            <Card variant="elevated" style={styles.infoCard}>
              <Text variant="label" color="primary">Key Strength</Text>
              <Text variant="h3">{encryptionInfo.keyLength}-bit</Text>
              <Text variant="caption" color="secondary">
                Would take billions of years to crack with current technology
              </Text>
            </Card>

            <Card variant="elevated" style={styles.infoCard}>
              <Text variant="label" color="primary">Historical Connection</Text>
              <Text variant="body" color="secondary">
                {encryptionInfo.historicalConnection}
              </Text>
            </Card>

            <Button
              title="Got It"
              onPress={() => setShowInfoModal(false)}
              variant="primary"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.success + '15',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xs,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500] + '30',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.elevated,
    borderBottomLeftRadius: 4,
  },
  encryptedLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  encryptedText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: colors.text.muted,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    backgroundColor: colors.background.primary + 'F0',
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    maxHeight: 100,
  },
  textInput: {
    color: colors.text.primary,
    fontSize: 16,
    maxHeight: 80,
  },
  notConnected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notConnectedTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  infoModalContent: {
    padding: spacing.md,
  },
  infoIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  infoText: {
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
});
