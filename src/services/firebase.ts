/**
 * Firebase Configuration for Speak Without Words
 * 
 * For the hackathon demo, we're using Firebase Realtime Database
 * for real-time peer-to-peer connection between devices.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable Realtime Database (not Firestore)
 * 4. Set database rules to allow read/write (for demo only!)
 * 5. Create .env file with your Firebase config (see .env.example)
 */

import { getApp, getApps, initializeApp } from 'firebase/app';
import { DatabaseReference, DataSnapshot, get, getDatabase, onValue, push, ref, remove, set, update } from 'firebase/database';

// ============================================
// 🔧 FIREBASE CONFIGURATION FROM ENV
// ============================================
// These values come from .env file (EXPO_PUBLIC_ prefix makes them available in client)

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// ============================================
// Check if Firebase is configured
// ============================================
export const isFirebaseConfigured = (): boolean => {
  // Firebase is configured if we have valid-looking credentials
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.databaseURL && 
    firebaseConfig.databaseURL.includes('firebasedatabase.app')
  );
};

// ============================================
// Initialize Firebase
// ============================================
let app: ReturnType<typeof initializeApp> | null = null;
let database: ReturnType<typeof getDatabase> | null = null;

export const initializeFirebase = () => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Using local-only mode.');
    return null;
  }

  try {
    // Check if already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    database = getDatabase(app);
    return database;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// ============================================
// Database References
// ============================================
export const getSessionRef = (sessionId: string): DatabaseReference | null => {
  if (!database) {
    database = initializeFirebase();
  }
  if (!database) return null;
  return ref(database, `sessions/${sessionId}`);
};

export const getSignalsRef = (sessionId: string): DatabaseReference | null => {
  if (!database) {
    database = initializeFirebase();
  }
  if (!database) return null;
  return ref(database, `signals/${sessionId}`);
};

// ============================================
// Session Types
// ============================================
export interface FirebaseSession {
  id: string;
  hostPublicKey: string;
  guestPublicKey?: string;
  status: 'waiting' | 'connected' | 'closed';
  createdAt: number;
  lastActivity: number;
}

export interface FirebaseSignal {
  id: string;
  senderId: string;
  entryId: string;
  iconId: string;
  meaning: string;
  color?: string;
  timestamp: number;
}

// ============================================
// Session Management
// ============================================

/**
 * Create a new session in Firebase
 */
export const createFirebaseSession = async (
  sessionId: string, 
  hostPublicKey: string
): Promise<boolean> => {
  const sessionRef = getSessionRef(sessionId);
  if (!sessionRef) return false;

  try {
    const session: FirebaseSession = {
      id: sessionId,
      hostPublicKey,
      status: 'waiting',
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    await set(sessionRef, session);
    return true;
  } catch (error) {
    console.error('Create session error:', error);
    return false;
  }
};

/**
 * Join an existing session
 */
export const joinFirebaseSession = async (
  sessionId: string,
  guestPublicKey: string
): Promise<{ success: boolean; hostPublicKey?: string }> => {
  const sessionRef = getSessionRef(sessionId);
  if (!sessionRef) return { success: false };

  try {
    const snapshot = await get(sessionRef);
    if (!snapshot.exists()) {
      return { success: false };
    }

    const session = snapshot.val() as FirebaseSession;
    
    // Update session with guest info
    await update(sessionRef, {
      guestPublicKey,
      status: 'connected',
      lastActivity: Date.now(),
    });

    return { success: true, hostPublicKey: session.hostPublicKey };
  } catch (error) {
    console.error('Join session error:', error);
    return { success: false };
  }
};

/**
 * Listen for session updates
 */
export const subscribeToSession = (
  sessionId: string,
  callback: (session: FirebaseSession | null) => void
): (() => void) => {
  const sessionRef = getSessionRef(sessionId);
  if (!sessionRef) {
    callback(null);
    return () => {};
  }

  const unsubscribe = onValue(sessionRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as FirebaseSession);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

/**
 * Send a signal to partner
 */
export const sendFirebaseSignal = async (
  sessionId: string,
  signal: FirebaseSignal
): Promise<boolean> => {
  const signalsRef = getSignalsRef(sessionId);
  if (!signalsRef) return false;

  try {
    const signalRef = ref(database!, `signals/${sessionId}/${signal.id}`);
    await set(signalRef, signal);
    return true;
  } catch (error) {
    console.error('Send signal error:', error);
    return false;
  }
};

/**
 * Listen for incoming signals
 */
export const subscribeToSignals = (
  sessionId: string,
  callback: (signal: FirebaseSignal) => void,
  afterTimestamp: number = 0
): (() => void) => {
  const signalsRef = getSignalsRef(sessionId);
  if (!signalsRef) return () => {};

  const unsubscribe = onValue(signalsRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const signals = snapshot.val() as Record<string, FirebaseSignal>;
      Object.values(signals).forEach(signal => {
        if (signal.timestamp > afterTimestamp) {
          callback(signal);
        }
      });
    }
  });

  return unsubscribe;
};

/**
 * Close/cleanup a session
 */
export const closeFirebaseSession = async (sessionId: string): Promise<void> => {
  const sessionRef = getSessionRef(sessionId);
  const signalsRef = getSignalsRef(sessionId);

  try {
    if (sessionRef) await remove(sessionRef);
    if (signalsRef) await remove(signalsRef);
  } catch (error) {
    console.error('Close session error:', error);
  }
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = async (sessionId: string): Promise<void> => {
  const sessionRef = getSessionRef(sessionId);
  if (!sessionRef) return;

  try {
    await update(sessionRef, { lastActivity: Date.now() });
  } catch (error) {
    console.error('Update activity error:', error);
  }
};

// ============================================
// Message Types and Functions (for Secret Messages / Riddle 2)
// ============================================
export interface FirebaseMessage {
  id: string;
  senderId: string;
  content: string;  // Encrypted content
  type: 'text' | 'image' | 'file';
  timestamp: number;
  iv?: string;  // Initialization vector for decryption
}

/**
 * Get reference to messages for a session
 */
export const getMessagesRef = (sessionId: string): DatabaseReference | null => {
  if (!database) {
    database = initializeFirebase();
  }
  if (!database) return null;
  return ref(database, `messages/${sessionId}`);
};

/**
 * Send an encrypted message
 */
export const sendFirebaseMessage = async (
  sessionId: string,
  message: FirebaseMessage
): Promise<boolean> => {
  if (!database) {
    database = initializeFirebase();
  }
  if (!database) return false;

  try {
    const messageRef = ref(database, `messages/${sessionId}/${message.id}`);
    await set(messageRef, message);
    console.log('Message sent to Firebase:', message.id);
    return true;
  } catch (error) {
    console.error('Send message error:', error);
    return false;
  }
};

/**
 * Subscribe to messages for real-time updates
 */
export const subscribeToMessages = (
  sessionId: string,
  callback: (message: FirebaseMessage) => void,
  afterTimestamp: number = 0
): (() => void) => {
  const messagesRef = getMessagesRef(sessionId);
  if (!messagesRef) {
    console.warn('Cannot subscribe to messages - no Firebase');
    return () => {};
  }

  console.log('Subscribing to messages for session:', sessionId);
  
  const processedIds = new Set<string>();
  
  const unsubscribe = onValue(messagesRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const messages = snapshot.val() as Record<string, FirebaseMessage>;
      Object.values(messages).forEach(message => {
        // Only process new messages we haven't seen
        if (message.timestamp > afterTimestamp && !processedIds.has(message.id)) {
          processedIds.add(message.id);
          console.log('New message received:', message.id);
          callback(message);
        }
      });
    }
  });

  return unsubscribe;
};

/**
 * Delete all messages for a session
 */
export const clearFirebaseMessages = async (sessionId: string): Promise<void> => {
  const messagesRef = getMessagesRef(sessionId);
  if (!messagesRef) return;

  try {
    await remove(messagesRef);
  } catch (error) {
    console.error('Clear messages error:', error);
  }
};

// Initialize on import
initializeFirebase();

export default {
  isFirebaseConfigured,
  initializeFirebase,
  createFirebaseSession,
  joinFirebaseSession,
  subscribeToSession,
  sendFirebaseSignal,
  subscribeToSignals,
  closeFirebaseSession,
  updateSessionActivity,
  sendFirebaseMessage,
  subscribeToMessages,
  clearFirebaseMessages,
};
