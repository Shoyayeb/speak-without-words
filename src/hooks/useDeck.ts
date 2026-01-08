import { useCallback, useEffect, useState } from 'react';
import { Deck, DeckEntry, PRESET_DECKS } from '../constants/presetDecks';
import { DeckStorage } from '../services/storage/DeckStorage';

export const useDeck = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  // Load decks on mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoading(true);
    try {
      const allDecks = await DeckStorage.getAllDecks();
      const activeId = await DeckStorage.getActiveDeckId();
      
      setDecks(allDecks);
      
      const active = allDecks.find(d => d.id === activeId) || allDecks[0];
      setActiveDeck(active);
    } catch (error) {
      console.error('Error loading decks:', error);
      // Fallback to first preset
      const fallbackDeck = {
        ...PRESET_DECKS[0],
        createdAt: 0,
        updatedAt: 0,
      };
      setDecks([fallbackDeck]);
      setActiveDeck(fallbackDeck);
    }
    setLoading(false);
  };

  const selectDeck = useCallback(async (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      setActiveDeck(deck);
      await DeckStorage.setActiveDeckId(deckId);
    }
  }, [decks]);

  const createDeck = useCallback(async (
    name: string,
    entries: DeckEntry[],
    description?: string,
    icon?: string
  ): Promise<Deck> => {
    const newDeck = await DeckStorage.saveDeck({
      name,
      description,
      icon,
      entries,
      isPreset: false,
    });
    
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  }, []);

  const updateDeck = useCallback(async (
    deckId: string,
    updates: Partial<Deck>
  ): Promise<Deck | null> => {
    const updated = await DeckStorage.updateDeck(deckId, updates);
    if (updated) {
      setDecks(prev => prev.map(d => d.id === deckId ? updated : d));
      if (activeDeck?.id === deckId) {
        setActiveDeck(updated);
      }
    }
    return updated;
  }, [activeDeck]);

  const deleteDeck = useCallback(async (deckId: string): Promise<boolean> => {
    const success = await DeckStorage.deleteDeck(deckId);
    if (success) {
      setDecks(prev => prev.filter(d => d.id !== deckId));
      if (activeDeck?.id === deckId) {
        // Select first available deck
        const remaining = decks.filter(d => d.id !== deckId);
        if (remaining.length > 0) {
          setActiveDeck(remaining[0]);
          await DeckStorage.setActiveDeckId(remaining[0].id);
        }
      }
    }
    return success;
  }, [activeDeck, decks]);

  const addEntryToDeck = useCallback(async (
    deckId: string,
    entry: Omit<DeckEntry, 'id'>
  ): Promise<DeckEntry | null> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck || deck.entries.length >= 6) return null;

    const newEntry: DeckEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = await DeckStorage.updateDeck(deckId, {
      entries: [...deck.entries, newEntry],
    });

    if (updated) {
      setDecks(prev => prev.map(d => d.id === deckId ? updated : d));
      if (activeDeck?.id === deckId) {
        setActiveDeck(updated);
      }
      return newEntry;
    }
    return null;
  }, [decks, activeDeck]);

  const removeEntryFromDeck = useCallback(async (
    deckId: string,
    entryId: string
  ): Promise<boolean> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return false;

    const updated = await DeckStorage.updateDeck(deckId, {
      entries: deck.entries.filter(e => e.id !== entryId),
    });

    if (updated) {
      setDecks(prev => prev.map(d => d.id === deckId ? updated : d));
      if (activeDeck?.id === deckId) {
        setActiveDeck(updated);
      }
      return true;
    }
    return false;
  }, [decks, activeDeck]);

  return {
    decks,
    activeDeck,
    loading,
    selectDeck,
    createDeck,
    updateDeck,
    deleteDeck,
    addEntryToDeck,
    removeEntryFromDeck,
    refreshDecks: loadDecks,
  };
};
