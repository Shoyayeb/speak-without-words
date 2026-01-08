import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, DeckEntry, PRESET_DECKS } from '../../constants/presetDecks';

const STORAGE_KEYS = {
  DECKS: 'speak_without_words_decks',
  ACTIVE_DECK: 'speak_without_words_active_deck',
  LEARNING_PROGRESS: 'speak_without_words_learning_progress',
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Deck Storage
export const DeckStorage = {
  async getAllDecks(): Promise<Deck[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DECKS);
      if (stored) {
        const customDecks: Deck[] = JSON.parse(stored);
        // Combine preset decks with custom decks
        return [
          ...PRESET_DECKS.map(p => ({
            ...p,
            createdAt: 0,
            updatedAt: 0,
          })),
          ...customDecks,
        ];
      }
      // Return only preset decks if no custom decks
      return PRESET_DECKS.map(p => ({
        ...p,
        createdAt: 0,
        updatedAt: 0,
      }));
    } catch (error) {
      console.error('Error loading decks:', error);
      return PRESET_DECKS.map(p => ({
        ...p,
        createdAt: 0,
        updatedAt: 0,
      }));
    }
  },

  async getCustomDecks(): Promise<Deck[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DECKS);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error loading custom decks:', error);
      return [];
    }
  },

  async saveDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    try {
      const customDecks = await this.getCustomDecks();
      const newDeck: Deck = {
        ...deck,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPreset: false,
      };
      customDecks.push(newDeck);
      await AsyncStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(customDecks));
      return newDeck;
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  },

  async updateDeck(id: string, updates: Partial<Deck>): Promise<Deck | null> {
    try {
      const customDecks = await this.getCustomDecks();
      const index = customDecks.findIndex(d => d.id === id);
      if (index !== -1) {
        customDecks[index] = {
          ...customDecks[index],
          ...updates,
          updatedAt: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(customDecks));
        return customDecks[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating deck:', error);
      throw error;
    }
  },

  async deleteDeck(id: string): Promise<boolean> {
    try {
      const customDecks = await this.getCustomDecks();
      const filtered = customDecks.filter(d => d.id !== id);
      if (filtered.length !== customDecks.length) {
        await AsyncStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting deck:', error);
      return false;
    }
  },

  async getActiveDeckId(): Promise<string> {
    try {
      const id = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DECK);
      return id || PRESET_DECKS[0].id;
    } catch (error) {
      return PRESET_DECKS[0].id;
    }
  },

  async setActiveDeckId(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DECK, id);
    } catch (error) {
      console.error('Error setting active deck:', error);
    }
  },
};

// Learning Progress Storage
export interface LearningProgress {
  moduleId: string;
  completed: boolean;
  bestScore?: number;
  attempts: number;
  lastAttemptAt?: number;
}

export const LearningStorage = {
  async getProgress(): Promise<Record<string, LearningProgress>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
      if (stored) {
        return JSON.parse(stored);
      }
      return {};
    } catch (error) {
      console.error('Error loading learning progress:', error);
      return {};
    }
  },

  async updateProgress(moduleId: string, score: number): Promise<void> {
    try {
      const progress = await this.getProgress();
      const existing = progress[moduleId];
      
      progress[moduleId] = {
        moduleId,
        completed: true,
        bestScore: existing?.bestScore ? Math.max(existing.bestScore, score) : score,
        attempts: (existing?.attempts || 0) + 1,
        lastAttemptAt: Date.now(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  },

  async clearProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LEARNING_PROGRESS);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  },
};

// Clear all app data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DECKS,
      STORAGE_KEYS.ACTIVE_DECK,
      STORAGE_KEYS.LEARNING_PROGRESS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
