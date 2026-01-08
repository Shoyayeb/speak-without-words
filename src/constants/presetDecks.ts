import { GestureType } from './signals';

export interface DeckEntry {
  id: string;
  iconId: string;
  gesture: GestureType;
  meaning: string;
  color?: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  entries: DeckEntry[];
  createdAt: number;
  updatedAt: number;
  isPreset: boolean;
  icon?: string;
}

export interface PresetDeck extends Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
}

export const PRESET_DECKS: PresetDeck[] = [
  {
    id: 'travel',
    name: 'Travel',
    description: 'Essential signals for traveling together',
    icon: '✈️',
    isPreset: true,
    entries: [
      { id: 't1', iconId: '👁️', gesture: 'double-tap', meaning: 'I see you', color: '#00CEC9' },
      { id: 't2', iconId: '🚶', gesture: 'swipe-right', meaning: "Let's go", color: '#00B894' },
      { id: 't3', iconId: '⚠️', gesture: 'long-press', meaning: 'Wait / Danger', color: '#FDCB6E' },
      { id: 't4', iconId: '✅', gesture: 'tap', meaning: 'Yes / Agree', color: '#00B894' },
      { id: 't5', iconId: '❌', gesture: 'shake', meaning: 'No / Disagree', color: '#E17055' },
      { id: 't6', iconId: '💚', gesture: 'swipe-up', meaning: "I'm okay", color: '#00B894' },
    ],
  },
  {
    id: 'emergency',
    name: 'Emergency',
    description: 'Quick signals for urgent situations',
    icon: '🆘',
    isPreset: true,
    entries: [
      { id: 'e1', iconId: '🆘', gesture: 'shake', meaning: 'Help needed!', color: '#E17055' },
      { id: 'e2', iconId: '🛑', gesture: 'long-press', meaning: 'Stop now', color: '#E17055' },
      { id: 'e3', iconId: '👀', gesture: 'double-tap', meaning: 'Watch out', color: '#FDCB6E' },
      { id: 'e4', iconId: '🏠', gesture: 'swipe-left', meaning: 'Go back / Home', color: '#74B9FF' },
      { id: 'e5', iconId: '📍', gesture: 'tap', meaning: 'Meet here', color: '#00CEC9' },
      { id: 'e6', iconId: '💚', gesture: 'swipe-up', meaning: 'All clear', color: '#00B894' },
    ],
  },
  {
    id: 'stealth',
    name: 'Stealth',
    description: 'Subtle signals for covert communication',
    icon: '🤫',
    isPreset: true,
    entries: [
      { id: 's1', iconId: '🤫', gesture: 'long-press', meaning: 'Be quiet', color: '#9171FF' },
      { id: 's2', iconId: '👁️', gesture: 'tap', meaning: 'Someone watching', color: '#E17055' },
      { id: 's3', iconId: '🚪', gesture: 'swipe-right', meaning: 'Exit now', color: '#FDCB6E' },
      { id: 's4', iconId: '⏰', gesture: 'double-tap', meaning: '5 minutes', color: '#74B9FF' },
      { id: 's5', iconId: '✋', gesture: 'swipe-up', meaning: 'Hold position', color: '#00CEC9' },
      { id: 's6', iconId: '👍', gesture: 'swipe-down', meaning: 'Proceed', color: '#00B894' },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Fun signals for social gatherings',
    icon: '🎉',
    isPreset: true,
    entries: [
      { id: 'c1', iconId: '🎉', gesture: 'shake', meaning: "Let's celebrate!", color: '#FDCB6E' },
      { id: 'c2', iconId: '🍕', gesture: 'tap', meaning: "I'm hungry", color: '#E17055' },
      { id: 'c3', iconId: '💤', gesture: 'long-press', meaning: "I'm tired", color: '#9171FF' },
      { id: 'c4', iconId: '🚗', gesture: 'swipe-left', meaning: 'Ready to leave', color: '#74B9FF' },
      { id: 'c5', iconId: '😄', gesture: 'double-tap', meaning: 'Having fun!', color: '#00B894' },
      { id: 'c6', iconId: '📸', gesture: 'swipe-up', meaning: 'Photo time!', color: '#00CEC9' },
    ],
  },
];
