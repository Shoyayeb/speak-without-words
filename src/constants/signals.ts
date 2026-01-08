// Signal types and gesture definitions
export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'shake'
  | 'circle'
  | 'zigzag';

export type SignalType =
  | 'icon'
  | 'tap-pattern'
  | 'haptic'
  | 'light'
  | 'gesture';

export type ConfirmationStatus = 'confirmed' | 'confused' | 'rejected' | 'pending';

export const GESTURES: Record<GestureType, { label: string; icon: string; description: string }> = {
  'tap': {
    label: 'Tap',
    icon: '👆',
    description: 'Single tap on screen',
  },
  'double-tap': {
    label: 'Double Tap',
    icon: '👆👆',
    description: 'Two quick taps',
  },
  'long-press': {
    label: 'Long Press',
    icon: '👇',
    description: 'Press and hold',
  },
  'swipe-left': {
    label: 'Swipe Left',
    icon: '👈',
    description: 'Swipe finger left',
  },
  'swipe-right': {
    label: 'Swipe Right',
    icon: '👉',
    description: 'Swipe finger right',
  },
  'swipe-up': {
    label: 'Swipe Up',
    icon: '👆',
    description: 'Swipe finger up',
  },
  'swipe-down': {
    label: 'Swipe Down',
    icon: '👇',
    description: 'Swipe finger down',
  },
  'shake': {
    label: 'Shake',
    icon: '📳',
    description: 'Shake device',
  },
  'circle': {
    label: 'Circle',
    icon: '⭕',
    description: 'Draw a circle',
  },
  'zigzag': {
    label: 'Zigzag',
    icon: '⚡',
    description: 'Draw a zigzag',
  },
};

// Available signal icons
export const SIGNAL_ICONS = [
  '👁️', '👀', '🚶', '🏃', '⚠️', '🛑',
  '✅', '❌', '❓', '💚', '❤️', '💙',
  '🔵', '🟢', '🟡', '🔴', '⚪', '⚫',
  '👋', '🤚', '✋', '🖐️', '🤙', '👍',
  '👎', '🤝', '🙏', '💪', '🎯', '⭐',
  '🌙', '☀️', '🌈', '⚡', '🔥', '💧',
  '🏠', '🚗', '✈️', '🚢', '🎵', '🔔',
  '🔇', '📍', '🧭', '⏰', '💤', '🆘',
];

// Default deck icons for quick setup
export const DEFAULT_DECK_ICONS = ['👁️', '🚶', '⚠️', '✅', '❌', '💚'];

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export const CONNECTION_STATES: Record<string, ConnectionState> = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
};
