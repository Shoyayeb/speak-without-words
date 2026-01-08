import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Modal as RNModal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { borderRadius, colors, spacing } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'bottom';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  position = 'center',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.backdrop} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View
          entering={position === 'bottom' ? SlideInDown.springify().damping(15) : FadeIn.duration(200)}
          exiting={position === 'bottom' ? SlideOutDown.duration(200) : FadeOut.duration(150)}
          style={[
            styles.content,
            position === 'center' && styles.contentCenter,
            position === 'bottom' && styles.contentBottom,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxWidth: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  contentCenter: {
    // centered by parent flex
  },
  contentBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: spacing.xxl,
  },
});
