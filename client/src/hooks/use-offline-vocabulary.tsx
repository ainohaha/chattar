import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/user-context';
import { Card, Vocabulary } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  getOfflineVocabulary, 
  getUserOfflineVocabulary, 
  saveVocabularyOffline,
  updateVocabularyMasteredOffline,
  syncOfflineVocabulary,
  isLocalStorageAvailable,
  OfflineVocabulary
} from '@/lib/offlineStorage';

interface UseOfflineVocabularyOptions {
  enableAutoSync?: boolean;
}

export function useOfflineVocabulary(options: UseOfflineVocabularyOptions = {}) {
  const { enableAutoSync = true } = options;
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [offlineVocabulary, setOfflineVocabulary] = useState<OfflineVocabulary[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [offlineSupported, setOfflineSupported] = useState(true);
  
  // Check if offline storage is supported
  useEffect(() => {
    setOfflineSupported(isLocalStorageAvailable());
  }, []);
  
  // Load offline vocabulary for current user
  const loadOfflineVocabulary = useCallback(() => {
    if (!user || !offlineSupported) return;
    
    const userVocabulary = getUserOfflineVocabulary(user.id);
    setOfflineVocabulary(userVocabulary);
  }, [user, offlineSupported]);
  
  // Initialize and refresh when user changes
  useEffect(() => {
    loadOfflineVocabulary();
  }, [loadOfflineVocabulary, user?.id]);
  
  // Save vocabulary offline
  const saveOffline = useCallback((card: Card, mastered: boolean = false) => {
    if (!user || !offlineSupported) return null;
    
    try {
      const savedItem = saveVocabularyOffline(user.id, card, mastered);
      
      toast({
        title: "Saved Offline",
        description: `"${card.originalPhrase}" has been saved to your offline vocabulary.`,
      });
      
      // Refresh the list
      loadOfflineVocabulary();
      
      return savedItem;
    } catch (error) {
      console.error('Error saving vocabulary offline:', error);
      
      toast({
        title: "Error",
        description: "Failed to save vocabulary offline.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [user, offlineSupported, toast, loadOfflineVocabulary]);
  
  // Update mastered status offline
  const updateMastered = useCallback((
    vocabularyItem: OfflineVocabulary | Vocabulary,
    mastered: boolean
  ) => {
    if (!offlineSupported) return false;
    
    try {
      const updated = updateVocabularyMasteredOffline(vocabularyItem, mastered);
      
      if (updated) {
        // Refresh the list
        loadOfflineVocabulary();
        
        toast({
          title: mastered ? "Marked as Mastered" : "Marked for Review",
          description: `Vocabulary item has been ${mastered ? 'marked as mastered' : 'marked for review'}.`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating vocabulary offline:', error);
      
      toast({
        title: "Error",
        description: "Failed to update vocabulary status.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [offlineSupported, toast, loadOfflineVocabulary]);
  
  // Sync offline vocabulary with server
  const syncWithServer = useCallback(async () => {
    if (!user || !offlineSupported || isSyncing) return { synced: 0, failed: 0 };
    
    setIsSyncing(true);
    
    try {
      // Define the sync function to handle each vocabulary item
      const syncFunction = async (item: OfflineVocabulary): Promise<boolean> => {
        try {
          // First check if we need to create a new vocabulary item
          await apiRequest({
            url: '/api/vocabularies',
            method: 'POST',
            body: JSON.stringify({
              userId: item.userId,
              cardId: item.cardId,
              mastered: item.mastered
            })
          });
          
          return true;
        } catch (error) {
          console.error('Error syncing vocabulary item:', error);
          return false;
        }
      };
      
      // Perform the sync operation
      const result = await syncOfflineVocabulary(syncFunction);
      
      // Update UI
      if (result.synced > 0) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/users', user.id, 'vocabularies'] });
        
        // Show success toast
        toast({
          title: "Sync Complete",
          description: `${result.synced} vocabulary ${result.synced === 1 ? 'item has' : 'items have'} been synchronized with the server.`,
        });
      }
      
      // Show failed toast if any failed
      if (result.failed > 0) {
        toast({
          title: "Sync Incomplete",
          description: `${result.failed} vocabulary ${result.failed === 1 ? 'item' : 'items'} could not be synchronized. They will be tried again next time.`,
          variant: "destructive",
        });
      }
      
      // Update last sync time
      setLastSyncTime(new Date());
      
      // Refresh offlineVocabulary
      loadOfflineVocabulary();
      
      return { 
        synced: result.synced, 
        failed: result.failed,
        remaining: result.remaining
      };
    } catch (error) {
      console.error('Error syncing vocabulary:', error);
      
      toast({
        title: "Sync Failed",
        description: "An error occurred while trying to sync your vocabulary with the server.",
        variant: "destructive",
      });
      
      return { synced: 0, failed: getOfflineVocabulary().length };
    } finally {
      setIsSyncing(false);
    }
  }, [user, offlineSupported, isSyncing, toast, queryClient, loadOfflineVocabulary]);
  
  // Auto sync when online
  useEffect(() => {
    if (!enableAutoSync || !navigator.onLine || !user) return;
    
    const doSync = async () => {
      // Only auto-sync if there are items that need syncing
      const needsSync = getOfflineVocabulary().some(v => v.needsSync);
      if (needsSync) {
        await syncWithServer();
      }
    };
    
    const handleOnline = () => {
      doSync();
    };
    
    // Listen for online events
    window.addEventListener('online', handleOnline);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      doSync();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [enableAutoSync, user, syncWithServer]);
  
  // Stats
  const stats = useMemo(() => {
    const total = offlineVocabulary.length;
    const mastered = offlineVocabulary.filter(v => v.mastered).length;
    const needsSync = offlineVocabulary.filter(v => v.needsSync).length;
    
    return { total, mastered, needsSync };
  }, [offlineVocabulary]);
  
  return {
    offlineVocabulary,
    offlineSupported,
    isSyncing,
    lastSyncTime,
    stats,
    saveOffline,
    updateMastered,
    syncWithServer,
    refreshOfflineVocabulary: loadOfflineVocabulary
  };
}