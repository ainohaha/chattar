import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { OfflineVocabularyList } from "@/components/offline-vocabulary-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wifi, WifiOff, Database, DownloadCloud } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Card } from "@/components/ui/card";
import { useOfflineVocabulary } from "@/hooks/use-offline-vocabulary";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function OfflineVocabularyPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { 
    offlineSupported, 
    stats, 
    isSyncing, 
    syncWithServer 
  } = useOfflineVocabulary();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!user) {
    return (
      <MobileLayout withStatusBar>
        <div className="flex flex-col items-center justify-center p-6 h-[80vh]">
          <Card className="p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center">Sign in Required</h2>
            <p className="text-gray-600 text-center mb-6">
              Please sign in to view your offline vocabulary.
            </p>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/welcome")}
            >
              Go to Sign In
            </Button>
          </Card>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout withStatusBar>
      {/* Header */}
      <div className="flex flex-col bg-primary/90 text-white py-4 px-4 rounded-b-lg mb-2">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold">Offline Vocabulary</h1>
          
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-white" />
            ) : (
              <WifiOff className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {stats.total} {stats.total === 1 ? 'word' : 'words'} available offline
            </span>
          </div>
          
          {stats.needsSync > 0 && isOnline && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white bg-white/10 hover:bg-white/20 text-xs font-normal"
              onClick={() => syncWithServer()}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>Syncing...</>
              ) : (
                <>
                  <DownloadCloud className="h-3 w-3 mr-1" />
                  Sync {stats.needsSync} {stats.needsSync === 1 ? 'change' : 'changes'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Connection status banner */}
      <div className={`mx-4 mb-2 p-2 rounded-md text-center text-sm ${
        isOnline ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 inline-block mr-1" />
            You're online. Changes will sync automatically.
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 inline-block mr-1" />
            You're offline. Changes will sync when you're back online.
          </>
        )}
      </div>
      
      {/* Offline mode notice if not supported */}
      {!offlineSupported && (
        <div className="mx-4 mb-4 p-4 bg-red-500/10 text-red-600 rounded-md">
          <p className="text-sm font-medium">
            Offline mode is not supported in your browser. 
            Your vocabulary will only be available when you're online.
          </p>
        </div>
      )}
      
      {/* Main content */}
      <OfflineVocabularyList />
    </MobileLayout>
  );
}