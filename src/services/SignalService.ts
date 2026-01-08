import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { DeckEntry } from '../constants/presetDecks';
import { GestureType, SignalType } from '../constants/signals';

// Set up PRNG for TweetNaCl using expo-crypto
// This is needed because React Native doesn't have a built-in PRNG
let randomBytesCache: Uint8Array | null = null;
let randomBytesCacheIndex = 0;
const CACHE_SIZE = 256;

// Pre-fill the cache with random bytes
const fillRandomCache = async () => {
  const bytes = await Crypto.getRandomBytesAsync(CACHE_SIZE);
  randomBytesCache = new Uint8Array(bytes);
  randomBytesCacheIndex = 0;
};

// Synchronous random bytes using cached values
const getRandomBytesSync = (n: number): Uint8Array => {
  if (!randomBytesCache || randomBytesCacheIndex + n > CACHE_SIZE) {
    throw new Error('Random bytes cache not initialized or exhausted. Call initCrypto() first.');
  }
  const bytes = randomBytesCache.slice(randomBytesCacheIndex, randomBytesCacheIndex + n);
  randomBytesCacheIndex += n;
  return bytes;
};

// Initialize the crypto system
export const initCrypto = async (): Promise<void> => {
  await fillRandomCache();
  // Set TweetNaCl's random byte generator
  nacl.setPRNG((x: Uint8Array, n: number) => {
    const randomBytes = getRandomBytesSync(n);
    for (let i = 0; i < n; i++) {
      x[i] = randomBytes[i];
    }
  });
};

// Session types
export interface Session {
  id: string;
  localKeyPair: nacl.BoxKeyPair;
  remotePublicKey?: Uint8Array;
  sharedSecret?: Uint8Array;
  createdAt: number;
  expiresAt: number;
}

// Signal types
export interface Signal {
  id: string;
  sessionId: string;
  type: SignalType;
  payload: SignalPayload;
  timestamp: number;
  encrypted?: boolean;
}

export interface SignalPayload {
  deckEntryId?: string;
  iconId?: string;
  meaning?: string;
  gesture?: GestureType;
  pattern?: number[];
  color?: string;
}

// Generate session ID (6-char alphanumeric)
export const generateSessionId = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(4);
  return Array.from(randomBytes)
    .map(b => b.toString(36))
    .join('')
    .toUpperCase()
    .slice(0, 6);
};

// Generate key pair for session - requires initCrypto to be called first
export const generateKeyPair = (): nacl.BoxKeyPair => {
  const keyPair = nacl.box.keyPair();
  // Refill cache in background for next use
  fillRandomCache().catch(console.error);
  return keyPair;
};

// Create a new session
export const createSession = async (): Promise<Session> => {
  // Initialize crypto system with PRNG
  await initCrypto();
  
  const id = await generateSessionId();
  const keyPair = generateKeyPair();
  const now = Date.now();
  
  return {
    id,
    localKeyPair: keyPair,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
  };
};

// Derive shared secret from key exchange
export const deriveSharedSecret = (
  localPrivateKey: Uint8Array,
  remotePublicKey: Uint8Array
): Uint8Array => {
  return nacl.box.before(remotePublicKey, localPrivateKey);
};

// Encrypt signal payload
export const encryptPayload = (
  payload: SignalPayload,
  sharedSecret: Uint8Array
): string => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const message = naclUtil.decodeUTF8(JSON.stringify(payload));
  const encrypted = nacl.box.after(message, nonce, sharedSecret);
  
  // Combine nonce + encrypted data
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  
  return naclUtil.encodeBase64(combined);
};

// Decrypt signal payload
export const decryptPayload = (
  encryptedData: string,
  sharedSecret: Uint8Array
): SignalPayload | null => {
  try {
    const combined = naclUtil.decodeBase64(encryptedData);
    const nonce = combined.slice(0, nacl.box.nonceLength);
    const encrypted = combined.slice(nacl.box.nonceLength);
    
    const decrypted = nacl.box.open.after(encrypted, nonce, sharedSecret);
    if (!decrypted) return null;
    
    return JSON.parse(naclUtil.encodeUTF8(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Create a signal from deck entry
export const createSignal = async (
  session: Session,
  entry: DeckEntry
): Promise<Signal> => {
  const payload: SignalPayload = {
    deckEntryId: entry.id,
    iconId: entry.iconId,
    meaning: entry.meaning,
    gesture: entry.gesture,
    color: entry.color,
  };

  const signal: Signal = {
    id: await generateSessionId(),
    sessionId: session.id,
    type: 'icon',
    payload,
    timestamp: Date.now(),
    encrypted: false,
  };

  return signal;
};

// Create QR code data
export interface QRCodeData {
  app: string;
  version: number;
  sessionId: string;
  publicKey: string;
  timestamp: number;
}

export const createQRCodeData = (session: Session): QRCodeData => {
  return {
    app: 'speak-without-words',
    version: 1,
    sessionId: session.id,
    publicKey: naclUtil.encodeBase64(session.localKeyPair.publicKey),
    timestamp: Date.now(),
  };
};

export const parseQRCodeData = (data: string): QRCodeData | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.app !== 'speak-without-words') return null;
    return parsed as QRCodeData;
  } catch {
    return null;
  }
};

// Signal service class for managing session state
class SignalService {
  private currentSession: Session | null = null;
  private listeners: Set<(signal: Signal) => void> = new Set();

  async createNewSession(): Promise<Session> {
    this.currentSession = await createSession();
    return this.currentSession;
  }

  getSession(): Session | null {
    return this.currentSession;
  }

  completeKeyExchange(remotePublicKeyBase64: string): boolean {
    if (!this.currentSession) return false;
    
    try {
      const remotePublicKey = naclUtil.decodeBase64(remotePublicKeyBase64);
      const sharedSecret = deriveSharedSecret(
        this.currentSession.localKeyPair.secretKey,
        remotePublicKey
      );
      
      this.currentSession.remotePublicKey = remotePublicKey;
      this.currentSession.sharedSecret = sharedSecret;
      
      return true;
    } catch (error) {
      console.error('Key exchange error:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!(this.currentSession?.sharedSecret);
  }

  async sendSignal(entry: DeckEntry): Promise<Signal | null> {
    if (!this.currentSession) return null;
    
    const signal = await createSignal(this.currentSession, entry);
    
    // If we have a shared secret, encrypt the payload
    if (this.currentSession.sharedSecret) {
      signal.encrypted = true;
      // In a real app, would encrypt and send via WebRTC/Socket
    }
    
    return signal;
  }

  onSignalReceived(callback: (signal: Signal) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Simulate receiving a signal (for demo purposes)
  simulateReceive(signal: Signal): void {
    this.listeners.forEach(callback => callback(signal));
  }

  disconnect(): void {
    this.currentSession = null;
    this.listeners.clear();
  }
}

export const signalService = new SignalService();
export default signalService;
