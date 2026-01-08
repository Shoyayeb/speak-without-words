import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { X, QrCode, Camera, RefreshCw, Copy, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';

import { Text, Button, Card, IconButton } from '../../src/components/ui';
import { PulseAnimation } from '../../src/components/ui/Animations';
import { colors, spacing, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PairMode = 'show' | 'scan';

export default function PairScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<PairMode>('show');
  const [sessionCode, setSessionCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    generateSessionCode();
  }, []);

  const generateSessionCode = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(4);
    const code = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .slice(0, 6);
    setSessionCode(code);
  };

  const handleClose = () => {
    router.back();
  };

  const handleSwitchMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'show' ? 'scan' : 'show');
    setScanned(false);
  };

  const handleRefreshCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    generateSessionCode();
  };

  const handleCopyCode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // In a real app, would copy to clipboard
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConnecting(true);
      
      // Simulate connection
      setTimeout(() => {
        setConnecting(false);
        router.back();
      }, 2000);
    }
  };

  const qrValue = JSON.stringify({
    app: 'speak-without-words',
    session: sessionCode,
    timestamp: Date.now(),
  });

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
          onPress={() => setMode('show')}
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
          onPress={() => setMode('scan')}
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
      {mode === 'show' ? (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.content}>
          <Card variant="gradient" style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <PulseAnimation size={280} color={colors.primary[500]} />
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrValue}
                  size={200}
                  backgroundColor="transparent"
                  color={colors.text.primary}
                />
              </View>
            </View>
            
            <View style={styles.codeContainer}>
              <Text variant="label" color="tertiary">SESSION CODE</Text>
              <View style={styles.codeRow}>
                <Text variant="h1" style={styles.code}>{sessionCode}</Text>
                <IconButton
                  icon={copied ? <Check size={20} color={colors.accent.success} /> : <Copy size={20} color={colors.text.secondary} />}
                  onPress={handleCopyCode}
                  variant="ghost"
                  size="sm"
                />
              </View>
            </View>
          </Card>

          <Text variant="body" color="secondary" align="center" style={styles.instructions}>
            Have your partner scan this QR code or enter the session code manually
          </Text>

          <Button
            title="Generate New Code"
            onPress={handleRefreshCode}
            variant="outline"
            icon={<RefreshCw size={18} color={colors.primary[500]} style={{ marginRight: spacing.sm }} />}
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.content}>
          {!permission?.granted ? (
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
          ) : connecting ? (
            <Card variant="gradient" style={styles.connectingCard}>
              <PulseAnimation size={150} color={colors.accent.success} active />
              <Text variant="h3" align="center" style={styles.connectingTitle}>
                Connecting...
              </Text>
              <Text variant="body" color="secondary" align="center">
                Establishing secure connection
              </Text>
            </Card>
          ) : (
            <View style={styles.scannerContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              >
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                </View>
              </CameraView>
              
              <Text variant="body" color="secondary" align="center" style={styles.scanInstructions}>
                Point your camera at your partner's QR code
              </Text>
            </View>
          )}
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
  instructions: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
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
  scannerContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  scanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
