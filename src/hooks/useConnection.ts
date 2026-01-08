/**
 * useConnection Hook
 * Manages connection state between devices
 */

import { useCallback, useEffect, useState } from 'react';
import { DeckEntry } from '../constants/presetDecks';
import connectionService, { Connection, ConnectionStatus, PendingSignal } from '../services/ConnectionService';

interface UseConnectionReturn {
  // State
  connection: Connection | null;
  status: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  incomingSignal: PendingSignal | null;
  
  // Actions
  createSession: () => Promise<{ sessionCode: string; qrData: string } | null>;
  connectWithQR: (qrData: string) => Promise<boolean>;
  checkForConnection: () => Promise<boolean>;
  sendSignal: (entry: DeckEntry) => Promise<string | null>; // Returns signal ID or null
  disconnect: () => Promise<void>;
  clearIncomingSignal: () => void;
  clearError: () => void;
}

export function useConnection(): UseConnectionReturn {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [incomingSignal, setIncomingSignal] = useState<PendingSignal | null>(null);

  // Load initial connection state
  useEffect(() => {
    const loadConnection = async () => {
      const existing = await connectionService.loadConnection();
      if (existing) {
        setConnection(existing);
        setStatus(existing.status);
      }
    };
    
    loadConnection();
  }, []);

  // Listen for connection events
  useEffect(() => {
    const handleConnected = (conn: Connection) => {
      setConnection(conn);
      setStatus('connected');
      setError(null);
    };

    const handleDisconnected = () => {
      setConnection(null);
      setStatus('disconnected');
      setIncomingSignal(null);
    };

    const handleSignal = (signal: PendingSignal) => {
      setIncomingSignal(signal);
    };

    connectionService.on('connected', handleConnected);
    connectionService.on('disconnected', handleDisconnected);
    connectionService.on('signal', handleSignal);

    return () => {
      connectionService.off('connected', handleConnected);
      connectionService.off('disconnected', handleDisconnected);
      connectionService.off('signal', handleSignal);
    };
  }, []);

  const createSession = useCallback(async () => {
    try {
      setError(null);
      const result = await connectionService.createSession();
      setConnection(connectionService.getConnection());
      return result;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create session');
      return null;
    }
  }, []);

  const connectWithQR = useCallback(async (qrData: string) => {
    try {
      setError(null);
      setStatus('connecting');
      
      const result = await connectionService.connectWithQR(qrData);
      
      if (result.success) {
        setConnection(connectionService.getConnection());
        setStatus('connected');
        return true;
      } else {
        setError(result.error || 'Connection failed');
        setStatus('disconnected');
        return false;
      }
    } catch (err) {
      setError('Connection failed');
      setStatus('error');
      return false;
    }
  }, []);

  const checkForConnection = useCallback(async () => {
    const connected = await connectionService.checkForConnection();
    if (connected) {
      setConnection(connectionService.getConnection());
      setStatus('connected');
    }
    return connected;
  }, []);

  const sendSignal = useCallback(async (entry: DeckEntry): Promise<string | null> => {
    const signalId = await connectionService.sendSignal(entry);
    if (!signalId) {
      setError('Failed to send signal');
    }
    return signalId;
  }, []);

  const disconnect = useCallback(async () => {
    await connectionService.disconnect();
    setConnection(null);
    setStatus('disconnected');
    setIncomingSignal(null);
    setError(null);
  }, []);

  const clearIncomingSignal = useCallback(() => {
    setIncomingSignal(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connection,
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    error,
    incomingSignal,
    createSession,
    connectWithQR,
    checkForConnection,
    sendSignal,
    disconnect,
    clearIncomingSignal,
    clearError,
  };
}

export default useConnection;
