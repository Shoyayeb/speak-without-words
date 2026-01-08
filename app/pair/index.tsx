import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle, Camera, Check, CheckCircle, Copy, QrCode, RefreshCw, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, IconButton, Text } from '../../src/components/ui';
import { PulseAnimation } from '../../src/components/ui/Animations';
import { borderRadius, colors, spacing } from '../../src/constants/theme';
import { useConnection } from '../../src/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PairMode = 'show' | 'scan';
type ConnectionPhase = 'idle' | 'connecting' | 'success' | 'error';

export default function PairScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<PairMode>('show');
  const [scanned, setScanned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    createSession, 
    connectWithQR, 
    checkForConnection,
    isConnected,
    error: connectionError 
  } = useConnection();

  // Initialize session when component mounts
  useEffect(() => {
    initializeSession();
    
    return () => {
      // Clean up polling on unmount
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for incoming connections when showing QR
  useEffect(() => {
    if (mode === 'show' && sessionCode && !isConnected) {
      // Start polling for connection
      pollIntervalRef.current = setInterval(async () => {
        const connected = await checkForConnection();
        if (connected) {
          handleConnectionSuccess();
        }
      }, 1500);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [mode, sessionCode, isConnected]);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && connectionPhase !== 'success') {
      handleConnectionSuccess();
    }
  }, [isConnected]);

  const initializeSession = async () => {
    try {
      const result = await createSession();
      if (result) {
        setSessionCode(result.sessionCode);
        setQrData(result.qrData);
      } else {
        setErrorMessage('Failed to create session. Please try again.');
        setConnectionPhase('error');
      }
    } catch (err) {
      console.error('Session creation error:', err);
      setErrorMessage('Error creating session');
      setConnectionPhase('error');
    }
  };

  const handleConnectionSuccess = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    setConnectionPhase('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to home after showing success
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    // Navigate to home screen safely
    router.replace('/(tabs)');
  };

  const handleSwitchMode = (newMode: PairMode) => {
    Haptics.selectionAsync();
    setMode(newMode);
    setScanned(false);
    setConnectionPhase('idle');
    setErrorMessage('');
  };

  const handleRefreshCode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await initializeSession();
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(sessionCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || connectionPhase !== 'idle') return;
    
    setScanned(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnectionPhase('connecting');

    try {
      // Validate QR data
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        throw new Error('Invalid QR code format');
      }

      if (parsedData.app !== 'speak-without-words') {
        throw new Error('This QR code is not from Speak Without Words');
      }

      // Attempt to connect
      const success = await connectWithQR(data);
      
      if (success) {
        handleConnectionSuccess();
      } else {
        throw new Error(connectionError || 'Connection failed. Please try again.');
      }
    } catch (error: any) {
      setConnectionPhase('error');
      setErrorMessage(error.message || 'Connection failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Allow retry after 2 seconds
      setTimeout(() => {
        setScanned(false);
        setConnectionPhase('idle');
      }, 2500);
    }
  };

  const renderShowQR = () => (
    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.content}>
      <Card variant="gradient" style={styles.qrCard}>
        <View style={styles.qrContainer}>
          <PulseAnimation size={280} color={colors.primary[500]} />
          <View style={styles.qrWrapper}>
            {qrData ? (
              <QRCode
                value={qrData}
                size={200}
                backgroundColor={colors.text.primary}
                color={colors.background.primary}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text variant="body" color="muted">Generating...</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.codeContainer}>
          <Text variant="label" color="tertiary">SESSION CODE</Text>
          <View style={styles.codeRow}>
            <Text variant="h1" style={styles.code}>{sessionCode || '------'}</Text>
            <IconButton
              icon={copied ? <Check size={20} color={colors.accent.success} /> : <Copy size={20} color={colors.text.secondary} />}
              onPress={handleCopyCode}
              variant="ghost"
              size="sm"
            />
          </View>
        </View>
      </Card>

      <View style={styles.statusContainer}>
        {connectionPhase === 'success' ? (
          <View style={styles.statusRow}>
            <CheckCircle size={20} color={colors.accent.success} />
            <Text variant="body" color="secondary" style={styles.statusText}>
              Connected! Redirecting...
            </Text>
          </View>
        ) : (
          <Text variant="body" color="secondary" align="center" style={styles.instructions}>
            Have your partner scan this QR code{'\n'}or enter the session code manually
          </Text>
        )}
      </View>

      <Button
        title="Generate New Code"
        onPress={handleRefreshCode}
        variant="outline"
        icon={<RefreshCw size={18} color={colors.primary[500]} style={{ marginRight: spacing.sm }} />}
      />

      <View style={styles.waitingIndicator}>
        <Text variant="caption" color="muted">
          Waiting for partner to connect...
        </Text>
      </View>
    </Animated.View>
  );

  const renderScanner = () => {
    if (!permission?.granted) {
      return (
        <Card variant="gradient" style={styles.permissionCard}>
          <Camera size={48} color={colors.primary[500]} />
          <Text variant="h3" align="center" style={styles.permissionTitle}>
            Camera Access Needed
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.permissionText}>
            Allow camera access to scan QR codes and connect with others
          </Text>
          <Button
            title="Allow Camera"
            onPress={requestPermission}
            variant="primary"
          />
        </Card>
      );
    }

    if (connectionPhase === 'connecting') {
      return (
        <Card variant="gradient" style={styles.connectingCard}>
          <PulseAnimation size={150} color={colors.primary[500]} active />
          <Text variant="h3" align="center" style={styles.connectingTitle}>
            Connecting...
          </Text>
          <Text variant="body" color="secondary" align="center">
            Establishing secure connection
          </Text>
        </Card>
      );
    }

    if (connectionPhase === 'success') {
      return (
        <Card variant="gradient" style={styles.connectingCard}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={colors.accent.success} />
          </View>
          <Text variant="h3" align="center" style={styles.connectingTitle}>
            Connected!
          </Text>
          <Text variant="body" color="secondary" align="center">
            You're now connected with your partner
          </Text>
        </Card>
      );
    }

    if (connectionPhase === 'error') {
      return (
        <Card variant="gradient" style={styles.connectingCard}>
          <View style={styles.errorIcon}>
            <AlertCircle size={64} color={colors.accent.error} />
          </View>
          <Text variant="h3" align="center" style={styles.connectingTitle}>
            Connection Failed
          </Text>
          <Text variant="body" color="secondary" align="center">
            {errorMessage}
          </Text>
          <Text variant="caption" color="muted" align="center" style={{ marginTop: spacing.md }}>
            Retrying in a moment...
          </Text>
        </Card>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
        
        <Text variant="body" color="secondary" align="center" style={styles.scanInstructions}>
          Point your camera at your partner's QR code
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <IconButton
          icon={<X size={24} color={colors.text.primary} />}
          onPress={handleClose}
          variant="ghost"
        />
        <Text variant="h3">Connect Devices</Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      {/* Mode Switcher */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'show' && styles.modeTabActive]}
          onPress={() => handleSwitchMode('show')}
        >
          <QrCode size={20} color={mode === 'show' ? colors.primary[500] : colors.text.muted} />
          <Text
            variant="body"
            color={mode === 'show' ? colors.primary[500] : 'muted'}
            style={styles.modeTabText}
          >
            Show QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'scan' && styles.modeTabActive]}
          onPress={() => handleSwitchMode('scan')}
        >
          <Camera size={20} color={mode === 'scan' ? colors.primary[500] : colors.text.muted} />
          <Text
            variant="body"
            color={mode === 'scan' ? colors.primary[500] : 'muted'}
            style={styles.modeTabText}
          >
            Scan QR
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      {mode === 'show' ? renderShowQR() : (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.content}>
          {renderScanner()}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  modeSwitcher: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  modeTabActive: {
    backgroundColor: colors.surface.hover,
  },
  modeTabText: {
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  qrCard: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginBottom: spacing.lg,
  },
  qrWrapper: {
    position: 'absolute',
    padding: spacing.md,
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.lg,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.md,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  code: {
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  statusContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginLeft: spacing.sm,
  },
  instructions: {
    lineHeight: 24,
  },
  waitingIndicator: {
    marginTop: spacing.xl,
    opacity: 0.7,
  },
  permissionCard: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.xxl,
  },
  permissionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  connectingCard: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.xxl,
  },
  connectingTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginBottom: spacing.md,
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.xl,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[500],
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanInstructions: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
