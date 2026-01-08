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
 * 5. Copy your config and paste below
 */

import { getApp, getApps, initializeApp } from 'firebase/app';
import { DatabaseReference, DataSnapshot, get, getDatabase, onValue, ref, remove, set, update } from 'firebase/database';

// ============================================
// 🔧 FIREBASE CONFIGURATION
// ============================================
// Replace with your Firebase config from the console
// Go to: Project Settings > General > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDrgPPglqdAsvlJ4uFMijbEoxnpmR8dfQg",
  authDomain: "speak-without-words.firebaseapp.com",
  databaseURL: "https://speak-without-words-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "speak-without-words",
  storageBucket: "speak-without-words.firebasestorage.app",
  messagingSenderId: "444519523528",
  appId: "1:444519523528:web:b062f5b00a336e709231fd",
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
};
