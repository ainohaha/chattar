import { Card, Vocabulary } from "@shared/schema";

// Define types for offline storage
export interface OfflineVocabulary {
  userId: number;
  cardId: number;
  savedAt: string; // ISO string of when item was saved
  mastered: boolean;
  temporaryId?: string; // Used for local tracking
  card: Card; // Include the full card data
  needsSync: boolean; // Indicates if this entry needs to be synced with the server
}

// Storage keys
const OFFLINE_VOCABULARY_KEY = 'chattar_offline_vocabulary';
const OFFLINE_CARDS_KEY = 'chattar_offline_cards';

/**
 * Save vocabulary to offline storage
 */
export const saveVocabularyOffline = (
  userId: number, 
  card: Card, 
  mastered: boolean = false
): OfflineVocabulary => {
  // Get existing vocabulary
  const existingItems = getOfflineVocabulary();
  
  // Create a temporary ID
  const temporaryId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Create new vocabulary item
  const newVocabularyItem: OfflineVocabulary = {
    userId,
    cardId: card.id,
    savedAt: new Date().toISOString(),
    mastered,
    temporaryId,
    card,
    needsSync: true // Mark for syncing when online
  };
  
  // Add to existing items
  const updatedItems = [...existingItems, newVocabularyItem];
  
  // Save to local storage
  localStorage.setItem(OFFLINE_VOCABULARY_KEY, JSON.stringify(updatedItems));
  
  // Also ensure the card is saved
  saveCardOffline(card);
  
  return newVocabularyItem;
};

/**
 * Update mastered status of an offline vocabulary item
 */
export const updateVocabularyMasteredOffline = (
  vocabularyItem: OfflineVocabulary | Vocabulary,
  mastered: boolean
): OfflineVocabulary | null => {
  // Get existing vocabulary
  const existingItems = getOfflineVocabulary();
  
  // Find the vocabulary item by different identifiers
  const isOfflineItem = 'temporaryId' in vocabularyItem;
  const existingIndex = existingItems.findIndex(item => 
    isOfflineItem
      ? item.temporaryId === (vocabularyItem as OfflineVocabulary).temporaryId
      : item.cardId === vocabularyItem.cardId && item.userId === vocabularyItem.userId
  );
  
  if (existingIndex === -1) {
    return null;
  }
  
  // Update the item
  const updatedItem = {
    ...existingItems[existingIndex],
    mastered,
    needsSync: true
  };
  
  // Replace the item in the array
  const updatedItems = [
    ...existingItems.slice(0, existingIndex),
    updatedItem,
    ...existingItems.slice(existingIndex + 1)
  ];
  
  // Save to local storage
  localStorage.setItem(OFFLINE_VOCABULARY_KEY, JSON.stringify(updatedItems));
  
  return updatedItem;
};

/**
 * Get all offline vocabulary
 */
export const getOfflineVocabulary = (): OfflineVocabulary[] => {
  const vocabJson = localStorage.getItem(OFFLINE_VOCABULARY_KEY);
  
  if (!vocabJson) {
    return [];
  }
  
  try {
    return JSON.parse(vocabJson);
  } catch (error) {
    console.error('Error parsing offline vocabulary:', error);
    return [];
  }
};

/**
 * Get offline vocabulary for a specific user
 */
export const getUserOfflineVocabulary = (userId: number): OfflineVocabulary[] => {
  const allVocabulary = getOfflineVocabulary();
  return allVocabulary.filter(vocab => vocab.userId === userId);
};

/**
 * Save a card to offline storage for reference
 */
export const saveCardOffline = (card: Card): void => {
  // Get existing cards
  const existingCards = getOfflineCards();
  
  // Check if card already exists
  const cardExists = existingCards.some(c => c.id === card.id);
  
  if (!cardExists) {
    // Add to existing cards
    const updatedCards = [...existingCards, card];
    
    // Save to local storage
    localStorage.setItem(OFFLINE_CARDS_KEY, JSON.stringify(updatedCards));
  }
};

/**
 * Get all offline cards
 */
export const getOfflineCards = (): Card[] => {
  const cardsJson = localStorage.getItem(OFFLINE_CARDS_KEY);
  
  if (!cardsJson) {
    return [];
  }
  
  try {
    return JSON.parse(cardsJson);
  } catch (error) {
    console.error('Error parsing offline cards:', error);
    return [];
  }
};

/**
 * Get an offline card by ID
 */
export const getOfflineCardById = (cardId: number): Card | undefined => {
  const allCards = getOfflineCards();
  return allCards.find(card => card.id === cardId);
};

/**
 * Synchronize offline vocabulary with the server
 * This function will attempt to save any offline vocabulary to the server
 * and clean up the local storage
 */
export const syncOfflineVocabulary = async (
  syncFunction: (item: OfflineVocabulary) => Promise<boolean>
): Promise<{
  synced: number;
  failed: number;
  remaining: OfflineVocabulary[];
}> => {
  // Get all vocabulary that needs syncing
  const allVocabulary = getOfflineVocabulary();
  const needsSync = allVocabulary.filter(vocab => vocab.needsSync);
  
  let synced = 0;
  let failed = 0;
  const stillNeedsSync: OfflineVocabulary[] = [];
  
  // Try to sync each item
  for (const vocabItem of needsSync) {
    try {
      const success = await syncFunction(vocabItem);
      
      if (success) {
        synced++;
      } else {
        failed++;
        stillNeedsSync.push(vocabItem);
      }
    } catch (error) {
      console.error('Error syncing vocabulary item:', error);
      failed++;
      stillNeedsSync.push(vocabItem);
    }
  }
  
  // Update local storage with items that still need syncing
  // and items that never needed syncing in the first place
  const notNeedingSync = allVocabulary.filter(vocab => !vocab.needsSync);
  const updatedItems = [...notNeedingSync, ...stillNeedsSync];
  
  // Save updated items to local storage
  localStorage.setItem(OFFLINE_VOCABULARY_KEY, JSON.stringify(updatedItems));
  
  // Return sync results
  return {
    synced,
    failed,
    remaining: stillNeedsSync
  };
};

/**
 * Check if the browser supports local storage
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get the total count of vocabulary items stored offline
 */
export const getOfflineVocabularyCount = (): number => {
  return getOfflineVocabulary().length;
};

/**
 * Clear all offline vocabulary
 */
export const clearOfflineVocabulary = (): void => {
  localStorage.removeItem(OFFLINE_VOCABULARY_KEY);
};

/**
 * Clear all offline cards
 */
export const clearOfflineCards = (): void => {
  localStorage.removeItem(OFFLINE_CARDS_KEY);
};