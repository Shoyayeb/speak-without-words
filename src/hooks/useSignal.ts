import { useEffect, useState, useCallback } from 'react';
import signalService, { Session, Signal, QRCodeData, createQRCodeData } from '../services/SignalService';
import { DeckEntry } from '../constants/presetDecks';

interface UseSignalReturn {
  session: Session | null;
  isConnected: boolean;
  isLoading: boolean;
  qrCodeData: string | null;
  receivedSignal: Signal | null;
  createSession: () => Promise<void>;
  connectWithQR: (qrData: string) => boolean;
  sendSignal: (entry: DeckEntry) => Promise<Signal | null>;
  disconnect: () => void;
  clearReceivedSignal: () => void;
}

export const useSignal = (): UseSignalReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [receivedSignal, setReceivedSignal] = useState<Signal | null>(null);

  // Listen for incoming signals
  useEffect(() => {
    const unsubscribe = signalService.onSignalReceived((signal) => {
      setReceivedSignal(signal);
    });

    return () => unsubscribe();
  }, []);

  const createSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSession = await signalService.createNewSession();
      setSession(newSession);
      
      // Generate QR code data
      const qrData = createQRCodeData(newSession);
      setQrCodeData(JSON.stringify(qrData));
      
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWithQR = useCallback((qrDataString: string): boolean => {
    try {
      const qrData: QRCodeData = JSON.parse(qrDataString);
      
      if (qrData.app !== 'speak-without-words') {
        console.error('Invalid QR code: wrong app');
        return false;
      }

      const success = signalService.completeKeyExchange(qrData.publicKey);
      if (success) {
        setIsConnected(true);
      }
      return success;
    } catch (error) {
      console.error('Failed to connect with QR:', error);
      return false;
    }
  }, []);

  const sendSignal = useCallback(async (entry: DeckEntry): Promise<Signal | null> => {
    return signalService.sendSignal(entry);
  }, []);

  const disconnect = useCallback(() => {
    signalService.disconnect();
    setSession(null);
    setIsConnected(false);
    setQrCodeData(null);
    setReceivedSignal(null);
  }, []);

  const clearReceivedSignal = useCallback(() => {
    setReceivedSignal(null);
  }, []);

  return {
    session,
    isConnected,
    isLoading,
    qrCodeData,
    receivedSignal,
    createSession,
    connectWithQR,
    sendSignal,
    disconnect,
    clearReceivedSignal,
  };
};

export default useSignal;
