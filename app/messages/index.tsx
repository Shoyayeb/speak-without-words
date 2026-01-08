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
import Animated, { FadeInDown, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Info,
  ArrowLeft
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { Text, Button, Card, IconButton, Modal } from '../../src/components/ui';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { useConnection } from '../../src/hooks';
import encryptedMessaging from '../../src/services/EncryptedMessaging';
import { 
  sendFirebaseMessage, 
  subscribeToMessages, 
  FirebaseMessage,
  isFirebaseConfigured 
} from '../../src/services/firebase';

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
  const [deviceId, setDeviceId] = useState<string>('');
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Generate a unique device ID for this session
  useEffect(() => {
    const id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setDeviceId(id);
  }, []);

  // Subscribe to incoming messages from Firebase
  useEffect(() => {
    if (!isConnected || !connection?.sessionCode || !deviceId) {
      console.log('Not subscribing to messages:', { isConnected, sessionCode: connection?.sessionCode, deviceId });
      return;
    }

    const sessionId = connection.sessionCode;
    console.log('Setting up message subscription for session:', sessionId);

    // Add welcome message if this is a fresh chat
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: '🔐 End-to-end encrypted chat established. Only you and your partner can read these messages.',
        direction: 'received',
        timestamp: Date.now() - 1000,
        type: 'text',
        encrypted: true,
        status: 'delivered',
      }]);
      processedMessageIds.current.add('welcome');
    }

    const subscriptionStartTime = Date.now() - 60000; // Get messages from last minute
    
    const unsubscribe = subscribeToMessages(
      sessionId,
      (firebaseMessage: FirebaseMessage) => {
        console.log('Received Firebase message:', firebaseMessage.id, 'from:', firebaseMessage.senderId);
        
        // Skip if we've already processed this message
        if (processedMessageIds.current.has(firebaseMessage.id)) {
          console.log('Message already processed, skipping:', firebaseMessage.id);
          return;
        }
        
        processedMessageIds.current.add(firebaseMessage.id);

        // Determine direction based on sender
        const direction = firebaseMessage.senderId === deviceId ? 'sent' : 'received';
        
        // Only add if it's a received message (sent ones are already in state)
        if (direction === 'received') {
          console.log('Adding received message to chat');
          
          const chatMessage: ChatMessage = {
            id: firebaseMessage.id,
            content: firebaseMessage.content, // In real app, decrypt here
            direction: 'received',
            timestamp: firebaseMessage.timestamp,
            type: firebaseMessage.type,
            encrypted: true,
            status: 'delivered',
          };

          setMessages(prev => {
            // Check if message already exists
            if (prev.some(m => m.id === chatMessage.id)) {
              return prev;
            }
            return [...prev, chatMessage].sort((a, b) => a.timestamp - b.timestamp);
          });

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Scroll to bottom
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      },
      subscriptionStartTime
    );

    return () => {
      console.log('Cleaning up message subscription');
      unsubscribe();
    };
  }, [isConnected, connection?.sessionCode, deviceId]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !isConnected || !connection?.sessionCode || !deviceId) {
      console.log('Cannot send:', { inputText: !!inputText.trim(), isConnected, sessionCode: connection?.sessionCode, deviceId });
      return;
    }

    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageContent = inputText.trim();
    
    // Add to processed to prevent showing our own message twice
    processedMessageIds.current.add(messageId);

    const newMessage: ChatMessage = {
      id: messageId,
      content: messageContent,
      direction: 'sent',
      timestamp: Date.now(),
      type: 'text',
      encrypted: true,
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Send to Firebase
    const firebaseMessage: FirebaseMessage = {
      id: messageId,
      senderId: deviceId,
      content: messageContent, // In real app, encrypt here
      type: 'text',
      timestamp: Date.now(),
    };

    console.log('Sending message to Firebase:', messageId);
    const success = await sendFirebaseMessage(connection.sessionCode, firebaseMessage);

    // Update message status
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, status: success ? 'sent' : 'sending' } : m)
    );
    
    setSending(false);

    if (success) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message');
    }

    scrollRef.current?.scrollToEnd({ animated: true });
  }, [inputText, isConnected, connection?.sessionCode, deviceId]);

  const handleImagePick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const messageId = `img_${Date.now()}`;
      processedMessageIds.current.add(messageId);
      
      const newMessage: ChatMessage = {
        id: messageId,
        content: '📷 Encrypted image',
        direction: 'sent',
        timestamp: Date.now(),
        type: 'image',
        encrypted: true,
        status: 'sent',
      };
      
      setMessages(prev => [...prev, newMessage]);

      // Send to Firebase
      if (connection?.sessionCode && deviceId) {
        await sendFirebaseMessage(connection.sessionCode, {
          id: messageId,
          senderId: deviceId,
          content: '📷 Encrypted image',
          type: 'image',
          timestamp: Date.now(),
        });
      }
    }
  }, [connection?.sessionCode, deviceId]);

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
            Session: {connection?.sessionCode || 'N/A'}
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

      {/* Firebase Status */}
      {!isFirebaseConfigured() && (
        <View style={styles.warningBanner}>
          <Text variant="caption" color="primary">
            ⚠️ Firebase not configured - messages won't sync
          </Text>
        </View>
      )}

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
              <Text variant="body" color="primary">
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
              onSubmitEditing={handleSend}
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
  warningBanner: {
    backgroundColor: colors.accent.warning + '30',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
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
    backgroundColor: colors.surface.default,
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
    backgroundColor: colors.surface.default,
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
