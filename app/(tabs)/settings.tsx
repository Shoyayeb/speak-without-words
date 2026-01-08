import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronRight,
    Eye,
    Github,
    HelpCircle,
    Info,
    Moon,
    Shield,
    Trash2,
    User,
    Vibrate,
    Volume2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, Text } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
}) => (
  <View
    style={styles.settingRow}
    onTouchEnd={() => {
      if (onPress) {
        Haptics.selectionAsync();
        onPress();
      }
    }}
  >
    <View style={styles.settingIcon}>{icon}</View>
    <View style={styles.settingContent}>
      <Text variant="body">{title}</Text>
      {subtitle && (
        <Text variant="caption" color="tertiary">{subtitle}</Text>
      )}
    </View>
    {trailing || <ChevronRight size={20} color={colors.text.muted} />}
  </View>
);

export default function SettingsScreen() {
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const handleToggleHaptic = (value: boolean) => {
    setHapticEnabled(value);
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text variant="h1">Settings</Text>
          <Text variant="body" color="secondary">
            Customize your experience
          </Text>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text variant="label" color="tertiary" style={styles.sectionLabel}>
            PROFILE
          </Text>
          <Card variant="default">
            <View style={styles.profileCard}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.avatar}
              >
                <User size={32} color={colors.text.primary} />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text variant="h3">Anonymous User</Text>
                <Text variant="caption" color="secondary">
                  No account required • Privacy first
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text variant="label" color="tertiary" style={styles.sectionLabel}>
            PREFERENCES
          </Text>
          <Card variant="default" padding="sm">
            <SettingRow
              icon={<Vibrate size={20} color={colors.primary[500]} />}
              title="Haptic Feedback"
              subtitle="Vibration on interactions"
              trailing={
                <Switch
                  value={hapticEnabled}
                  onValueChange={handleToggleHaptic}
                  trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
                  thumbColor={colors.text.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Volume2 size={20} color={colors.primary[500]} />}
              title="Sound Effects"
              subtitle="Audio feedback on signals"
              trailing={
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
                  thumbColor={colors.text.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Moon size={20} color={colors.primary[500]} />}
              title="Dark Mode"
              subtitle="Always on for this app"
              trailing={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.surface.border, true: colors.primary[500] }}
                  thumbColor={colors.text.primary}
                  disabled
                />
              }
            />
          </Card>
        </Animated.View>

        {/* Accessibility Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text variant="label" color="tertiary" style={styles.sectionLabel}>
            ACCESSIBILITY
          </Text>
          <Card variant="default" padding="sm">
            <SettingRow
              icon={<Eye size={20} color={colors.secondary[500]} />}
              title="High Contrast Mode"
              subtitle="Enhanced visibility"
              trailing={
                <Switch
                  value={accessibilityMode}
                  onValueChange={setAccessibilityMode}
                  trackColor={{ false: colors.surface.border, true: colors.secondary[500] }}
                  thumbColor={colors.text.primary}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Vibrate size={20} color={colors.secondary[500]} />}
              title="Haptic-First Mode"
              subtitle="Prioritize vibration for blind users"
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text variant="label" color="tertiary" style={styles.sectionLabel}>
            PRIVACY & DATA
          </Text>
          <Card variant="default" padding="sm">
            <SettingRow
              icon={<Shield size={20} color={colors.accent.success} />}
              title="Privacy Policy"
              subtitle="Your data stays on device"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Trash2 size={20} color={colors.accent.error} />}
              title="Clear All Data"
              subtitle="Delete decks and history"
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <Text variant="label" color="tertiary" style={styles.sectionLabel}>
            ABOUT
          </Text>
          <Card variant="default" padding="sm">
            <SettingRow
              icon={<Info size={20} color={colors.text.muted} />}
              title="Version"
              subtitle="1.0.0 (Hackathon Build)"
              trailing={null}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<HelpCircle size={20} color={colors.text.muted} />}
              title="Help & Support"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Github size={20} color={colors.text.muted} />}
              title="View Source Code"
              subtitle="Open source project"
              onPress={() => Linking.openURL('https://github.com')}
            />
          </Card>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.disclaimer}>
          <Text variant="caption" color="muted" align="center">
            Speak Without Words is an educational project created for hackathon purposes.
            All signal features are for learning and play - please use responsibly.
          </Text>
        </Animated.View>

        {/* Spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginLeft: 56,
  },
  disclaimer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});
