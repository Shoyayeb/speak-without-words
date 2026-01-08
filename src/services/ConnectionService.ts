/**
 * Connection Service
 * Manages peer-to-peer connections for Speak Without Words
 * 
 * Uses Firebase Realtime Database for cross-device communication.
 * Falls back to local-only mode if Firebase is not configured.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import naclUtil from 'tweetnacl-util';
import { DeckEntry } from '../constants/presetDecks';
import {
    closeFirebaseSession,
    createFirebaseSession,
    FirebaseSignal,
    isFirebaseConfigured,
    joinFirebaseSession,
    sendFirebaseSignal,
    subscribeToSession,
    subscribeToSignals
} from './firebase';
import signalService, { parseQRCodeData, QRCodeData } from './SignalService';

const STORAGE_KEYS = {
  CONNECTION: '@sww_connection',
  SESSION: '@sww_session',
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface Connection {
  id: string;
  sessionCode: string;
  partnerPublicKey?: string;
  status: ConnectionStatus;
  isHost: boolean;
  createdAt: number;
  lastActivity: number;
}

export interface PendingSignal {
  id: string;
  entry: DeckEntry;
  timestamp: number;
  direction: 'sent' | 'received';
}

// Simple event listener types
type ConnectionListener = (connection: Connection) => void;
type SignalListener = (signal: PendingSignal) => void;
type DisconnectListener = () => void;

interface EventListeners {
  connected: Set<ConnectionListener>;
  signal: Set<SignalListener>;
  disconnected: Set<DisconnectListener>;
}

class ConnectionService {
  private connection: Connection | null = null;
  private sessionUnsubscribe: (() => void) | null = null;
  private signalsUnsubscribe: (() => void) | null = null;
  private lastSignalTimestamp: number = 0;
  private deviceId: string = '';
  
  // Simple event emitter replacement
  private listeners: EventListeners = {
    connected: new Set(),
    signal: new Set(),
    disconnected: new Set(),
  };

  constructor() {
    this.initDeviceId();
  }

  // Event emitter methods
  on(event: 'connected', listener: ConnectionListener): void;
  on(event: 'signal', listener: SignalListener): void;
  on(event: 'disconnected', listener: DisconnectListener): void;
  on(event: keyof EventListeners, listener: any): void {
    this.listeners[event].add(listener);
  }

  off(event: 'connected', listener: ConnectionListener): void;
  off(event: 'signal', listener: SignalListener): void;
  off(event: 'disconnected', listener: DisconnectListener): void;
  off(event: keyof EventListeners, listener: any): void {
    this.listeners[event].delete(listener);
  }

  private emit(event: 'connected', data: Connection): void;
  private emit(event: 'signal', data: PendingSignal): void;
  private emit(event: 'disconnected'): void;
  private emit(event: keyof EventListeners, data?: any): void {
    if (event === 'connected') {
      this.listeners.connected.forEach(listener => listener(data));
    } else if (event === 'signal') {
      this.listeners.signal.forEach(listener => listener(data));
    } else if (event === 'disconnected') {
      this.listeners.disconnected.forEach(listener => listener());
    }
  }

  /**
   * Initialize a unique device ID
   */
  private async initDeviceId(): Promise<void> {
    try {
      let storedId = await AsyncStorage.getItem('@sww_device_id');
      if (!storedId) {
        const bytes = await Crypto.getRandomBytesAsync(8);
        storedId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        await AsyncStorage.setItem('@sww_device_id', storedId);
      }
      this.deviceId = storedId;
    } catch (error) {
      this.deviceId = Math.random().toString(36).slice(2);
    }
  }

  /**
   * Check if Firebase is available
   */
  isFirebaseAvailable(): boolean {
    return isFirebaseConfigured();
  }

  /**
   * Load existing connection from storage
   */
  async loadConnection(): Promise<Connection | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTION);
      if (stored) {
        this.connection = JSON.parse(stored);
        // Check if connection is still valid (less than 24 hours old)
        if (this.connection && Date.now() - this.connection.createdAt > 24 * 60 * 60 * 1000) {
          await this.disconnect();
          return null;
        }
        // Resubscribe if connected
        if (this.connection?.status === 'connected') {
          this.subscribeToUpdates();
        }
        return this.connection;
      }
      return null;
    } catch (error) {
      console.error('Error loading connection:', error);
      return null;
    }
  }

  /**
   * Save connection to storage
   */
  private async saveConnection(): Promise<void> {
    try {
      if (this.connection) {
        await AsyncStorage.setItem(STORAGE_KEYS.CONNECTION, JSON.stringify(this.connection));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CONNECTION);
      }
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  }

  /**
   * Generate a new session for showing QR code (Host mode)
   */
  async createSession(): Promise<{ sessionCode: string; qrData: string }> {
    // Create cryptographic session
    const session = await signalService.createNewSession();
    
    this.connection = {
      id: session.id,
      sessionCode: session.id,
      status: 'disconnected',
      isHost: true,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    
    // Create QR data
    const qrData: QRCodeData = {
      app: 'speak-without-words',
      version: 1,
      sessionId: session.id,
      publicKey: naclUtil.encodeBase64(session.localKeyPair.publicKey),
      timestamp: Date.now(),
    };
    
    // If Firebase is available, create session there
    if (this.isFirebaseAvailable()) {
      const created = await createFirebaseSession(
        session.id, 
        qrData.publicKey
      );
      if (created) {
        // Subscribe to session updates to know when guest joins
        this.subscribeToSessionUpdates(session.id);
      }
    }

    await this.saveConnection();
    
    return {
      sessionCode: session.id,
      qrData: JSON.stringify(qrData),
    };
  }

  /**
   * Connect to partner by scanning their QR code (Guest mode)
   */
  async connectWithQR(qrDataString: string): Promise<{ success: boolean; error?: string }> {
    try {
      const qrData = parseQRCodeData(qrDataString);
      
      if (!qrData) {
        return { success: false, error: 'Invalid QR code' };
      }

      if (qrData.app !== 'speak-without-words') {
        return { success: false, error: 'QR code is not from Speak Without Words app' };
      }

      // Check if QR is too old (more than 5 minutes)
      if (Date.now() - qrData.timestamp > 5 * 60 * 1000) {
        return { success: false, error: 'QR code has expired. Please generate a new one.' };
      }

      // Create our own session if we don't have one
      if (!signalService.getSession()) {
        await signalService.createNewSession();
      }

      const localSession = signalService.getSession()!;
      const localPublicKey = naclUtil.encodeBase64(localSession.localKeyPair.publicKey);

      // Complete key exchange locally
      const exchangeSuccess = signalService.completeKeyExchange(qrData.publicKey);
      
      if (!exchangeSuccess) {
        return { success: false, error: 'Failed to establish secure connection' };
      }

      // Update connection state
      this.connection = {
        id: await this.generateConnectionId(),
        sessionCode: qrData.sessionId,
        partnerPublicKey: qrData.publicKey,
        status: 'connected',
        isHost: false,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      // If Firebase is available, join the session
      if (this.isFirebaseAvailable()) {
        const result = await joinFirebaseSession(qrData.sessionId, localPublicKey);
        if (!result.success) {
          // Firebase failed but we have local connection info
          console.warn('Firebase join failed, continuing with local state');
        }
        // Subscribe to signals
        this.subscribeToUpdates();
      }

      await this.saveConnection();
      this.emit('connected', this.connection);

      return { success: true };
    } catch (error) {
      console.error('Connection error:', error);
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  }

  /**
   * Subscribe to session updates (for host to know when guest joins)
   */
  private subscribeToSessionUpdates(sessionId: string): void {
    if (!this.isFirebaseAvailable()) return;

    this.sessionUnsubscribe = subscribeToSession(sessionId, (session) => {
      if (session && session.status === 'connected' && session.guestPublicKey) {
        // Guest has joined!
        const exchangeSuccess = signalService.completeKeyExchange(session.guestPublicKey);
        
        if (exchangeSuccess && this.connection) {
          this.connection.status = 'connected';
          this.connection.partnerPublicKey = session.guestPublicKey;
          this.connection.lastActivity = Date.now();
          
          this.saveConnection();
          this.emit('connected', this.connection);
          
          // Now subscribe to signals
          this.subscribeToUpdates();
        }
      }
    });
  }

  /**
   * Subscribe to signal updates
   */
  private subscribeToUpdates(): void {
    if (!this.isFirebaseAvailable() || !this.connection?.sessionCode) return;

    this.lastSignalTimestamp = Date.now();

    this.signalsUnsubscribe = subscribeToSignals(
      this.connection.sessionCode,
      (signal) => {
        // Only process signals from partner (not our own)
        if (signal.senderId !== this.deviceId && signal.timestamp > this.lastSignalTimestamp) {
          this.lastSignalTimestamp = signal.timestamp;
          
          const pendingSignal: PendingSignal = {
            id: signal.id,
            entry: {
              id: signal.entryId,
              iconId: signal.iconId,
              meaning: signal.meaning,
              color: signal.color,
            } as DeckEntry,
            timestamp: signal.timestamp,
            direction: 'received',
          };
          
          this.emit('signal', pendingSignal);
        }
      },
      this.lastSignalTimestamp
    );
  }

  /**
   * Check if someone has connected to our session (polling fallback)
   */
  async checkForConnection(): Promise<boolean> {
    if (!this.connection?.sessionCode || !this.connection.isHost) return false;
    
    // Firebase handles this via subscription, but we can check status
    return this.connection.status === 'connected';
  }

  /**
   * Send a signal to partner
   * Returns the signal ID if successful, null if failed
   */
  async sendSignal(entry: DeckEntry): Promise<string | null> {
    if (!this.connection || this.connection.status !== 'connected') {
      return null;
    }

    try {
      if (this.isFirebaseAvailable()) {
        const signalId = await this.generateConnectionId();
        const signal: FirebaseSignal = {
          id: signalId,
          senderId: this.deviceId,
          entryId: entry.id,
          iconId: entry.iconId,
          meaning: entry.meaning,
          color: entry.color,
          timestamp: Date.now(),
        };

        const sent = await sendFirebaseSignal(this.connection.sessionCode, signal);
        if (sent) {
          this.connection.lastActivity = Date.now();
          await this.saveConnection();
          return signalId; // Return the signal ID for response tracking
        }
        return null;
      }

      // Local-only mode - return a dummy ID
      return `local_${Date.now()}`;
    } catch (error) {
      console.error('Send signal error:', error);
      return null;
    }
  }

  /**
   * Disconnect from partner
   */
  async disconnect(): Promise<void> {
    // Unsubscribe from Firebase
    if (this.sessionUnsubscribe) {
      this.sessionUnsubscribe();
      this.sessionUnsubscribe = null;
    }
    if (this.signalsUnsubscribe) {
      this.signalsUnsubscribe();
      this.signalsUnsubscribe = null;
    }

    // Clean up Firebase session
    if (this.connection?.sessionCode && this.isFirebaseAvailable()) {
      await closeFirebaseSession(this.connection.sessionCode);
    }
    
    this.connection = null;
    signalService.disconnect();
    
    await AsyncStorage.removeItem(STORAGE_KEYS.CONNECTION);
    
    this.emit('disconnected');
  }

  /**
   * Get current connection
   */
  getConnection(): Connection | null {
    return this.connection;
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return this.connection?.status || 'disconnected';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.status === 'connected';
  }

  /**
   * Generate unique connection ID
   */
  private async generateConnectionId(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(8);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const connectionService = new ConnectionService();
export default connectionService;
