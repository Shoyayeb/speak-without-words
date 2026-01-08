/**
 * E2E Encrypted Messaging Service
 * Implements historical cryptography concepts for secure communication
 */

import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { initCrypto } from './SignalService';

export interface EncryptedMessage {
  id: string;
  ciphertext: string;
  nonce: string;
  timestamp: number;
  type: 'text' | 'file' | 'image';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface DecryptedMessage {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'image';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface MessageThread {
  messages: Array<{
    message: DecryptedMessage;
    direction: 'sent' | 'received';
    status: 'sending' | 'sent' | 'delivered' | 'read';
  }>;
}

class EncryptedMessagingService {
  private sharedKey: Uint8Array | null = null;
  private initialized = false;

  /**
   * Initialize the messaging service with a shared secret
   * This should be called after key exchange is complete
   */
  async initialize(sharedSecret: Uint8Array): Promise<void> {
    await initCrypto();
    this.sharedKey = sharedSecret;
    this.initialized = true;
  }

  /**
   * Set shared key directly (for existing connections)
   */
  setSharedKey(key: Uint8Array): void {
    this.sharedKey = key;
    this.initialized = true;
  }

  /**
   * Check if service is ready for encryption
   */
  isReady(): boolean {
    return this.initialized && this.sharedKey !== null;
  }

  /**
   * Encrypt a text message using NaCl secretbox
   * This uses XSalsa20-Poly1305 (modern stream cipher with authentication)
   */
  async encryptMessage(plaintext: string, type: 'text' | 'file' | 'image' = 'text', metadata?: any): Promise<EncryptedMessage> {
    if (!this.sharedKey) {
      throw new Error('Encryption service not initialized. Complete key exchange first.');
    }

    // Generate random nonce (24 bytes for secretbox)
    const nonceBytes = await Crypto.getRandomBytesAsync(24);
    const nonce = new Uint8Array(nonceBytes);

    // Encode message to bytes
    const messageBytes = naclUtil.decodeUTF8(plaintext);

    // Encrypt using NaCl secretbox (symmetric encryption)
    const ciphertext = nacl.secretbox(messageBytes, nonce, this.sharedKey);

    // Generate unique message ID
    const idBytes = await Crypto.getRandomBytesAsync(8);
    const id = Array.from(new Uint8Array(idBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      id,
      ciphertext: naclUtil.encodeBase64(ciphertext),
      nonce: naclUtil.encodeBase64(nonce),
      timestamp: Date.now(),
      type,
      metadata,
    };
  }

  /**
   * Decrypt a received message
   */
  decryptMessage(encrypted: EncryptedMessage): DecryptedMessage | null {
    if (!this.sharedKey) {
      throw new Error('Encryption service not initialized.');
    }

    try {
      const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
      const nonce = naclUtil.decodeBase64(encrypted.nonce);

      // Decrypt using NaCl secretbox
      const decrypted = nacl.secretbox.open(ciphertext, nonce, this.sharedKey);

      if (!decrypted) {
        console.error('Decryption failed - message may be tampered');
        return null;
      }

      return {
        id: encrypted.id,
        content: naclUtil.encodeUTF8(decrypted),
        timestamp: encrypted.timestamp,
        type: encrypted.type,
        metadata: encrypted.metadata,
      };
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Encrypt a file (base64 encoded)
   */
  async encryptFile(
    base64Content: string, 
    fileName: string, 
    mimeType: string
  ): Promise<EncryptedMessage> {
    return this.encryptMessage(base64Content, 'file', {
      fileName,
      fileSize: base64Content.length,
      mimeType,
    });
  }

  /**
   * Encrypt an image (base64 encoded)
   */
  async encryptImage(base64Content: string): Promise<EncryptedMessage> {
    return this.encryptMessage(base64Content, 'image', {
      mimeType: 'image/jpeg',
      fileSize: base64Content.length,
    });
  }

  /**
   * Clear encryption keys (for security on disconnect)
   */
  clear(): void {
    if (this.sharedKey) {
      // Overwrite key with zeros before clearing
      this.sharedKey.fill(0);
    }
    this.sharedKey = null;
    this.initialized = false;
  }

  /**
   * Get encryption info for educational display
   */
  getEncryptionInfo(): {
    algorithm: string;
    keyLength: number;
    nonceLength: number;
    description: string;
    historicalConnection: string;
  } {
    return {
      algorithm: 'XSalsa20-Poly1305',
      keyLength: 256,
      nonceLength: 192,
      description: 'Modern authenticated encryption combining the Salsa20 stream cipher with Poly1305 MAC',
      historicalConnection: 'Like the Enigma machine, this uses substitution and transposition, but with mathematical operations that make it unbreakable with current technology.',
    };
  }
}

// Export singleton instance
export const encryptedMessaging = new EncryptedMessagingService();
export default encryptedMessaging;
