import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOfflineVocabulary } from "@/hooks/use-offline-vocabulary";
import { Loader2, Search, WifiOff, Check, RotateCcw, Wifi, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { speakText } from "@/utils/translation";
import { OfflineVocabulary } from "@/lib/offlineStorage";

interface OfflineVocabularyListProps {
  className?: string;
}

export function OfflineVocabularyList({ className }: OfflineVocabularyListProps) {
  const { 
    offlineVocabulary, 
    offlineSupported, 
    isSyncing, 
    stats, 
    syncWithServer,
    updateMastered,
    refreshOfflineVocabulary 
  } = useOfflineVocabulary();
  
  const [filterText, setFilterText] = useState("");
  const [showOnlyNeedsSync, setShowOnlyNeedsSync] = useState(false);
  const { toast } = useToast();
  
  // Filter vocabulary based on search term
  const filteredVocabulary = useMemo(() => {
    if (!offlineVocabulary) return [];
    
    return offlineVocabulary.filter((vocab) => {
      // Apply search filter
      const searchMatch = filterText === "" || 
        vocab.card.originalPhrase.toLowerCase().includes(filterText.toLowerCase()) || 
        vocab.card.translatedPhrase.toLowerCase().includes(filterText.toLowerCase());
      
      // Apply sync filter
      const syncMatch = !showOnlyNeedsSync || vocab.needsSync;
      
      return searchMatch && syncMatch;
    });
  }, [offlineVocabulary, filterText, showOnlyNeedsSync]);
  
  // Group vocabulary by mastered status
  const groupedVocabulary = useMemo(() => {
    const masteredItems = filteredVocabulary.filter(vocab => vocab.mastered);
    const learningItems = filteredVocabulary.filter(vocab => !vocab.mastered);
    
    return { masteredItems, learningItems };
  }, [filteredVocabulary]);
  
  // Handle speak text
  const handleSpeak = (text: string, language: string) => {
    speakText(text, language)
      .catch(error => {
        console.error("Failed to speak text:", error);
        toast({
          title: "Speech Error",
          description: "Could not play pronunciation. Your device may not support speech synthesis.",
          variant: "destructive",
        });
      });
  };
  
  // Render an individual vocabulary item
  const renderVocabularyItem = (vocab: OfflineVocabulary) => {
    const { card } = vocab;
    const needsSync = vocab.needsSync;
    
    return (
      <Card key={vocab.temporaryId || `${vocab.userId}_${vocab.cardId}`} 
            className={cn(
              "p-4 mb-2 transition-all", 
              vocab.mastered ? "border-green-500/50" : "border-blue-500/50"
            )}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg cursor-pointer" 
                  onClick={() => handleSpeak(card.originalPhrase, card.category || 'en')}>
                {card.originalPhrase}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 cursor-pointer" 
                 onClick={() => handleSpeak(card.translatedPhrase, 'fi')}>
                {card.translatedPhrase}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {needsSync && <WifiOff className="h-4 w-4 text-orange-500" />}
              <Badge variant={vocab.mastered ? "outline" : "secondary"}>
                {vocab.mastered ? "Mastered" : "Learning"}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              Saved {vocab.savedAt ? new Date(vocab.savedAt).toLocaleDateString() : 'Unknown date'}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => handleSpeak(card.originalPhrase, card.category || 'en')}
              >
                <Download className="h-4 w-4 mr-1" />
                Hear
              </Button>
              
              <Button 
                variant={vocab.mastered ? "outline" : "default"} 
                size="sm" 
                className="h-8 px-2"
                onClick={() => updateMastered(vocab, !vocab.mastered)}
              >
                {vocab.mastered ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Review Again
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Mark Mastered
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  // If offline storage is not supported
  if (!offlineSupported) {
    return (
      <div className={cn("w-full p-4", className)}>
        <Card className="p-6 text-center">
          <WifiOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">Offline Storage Not Available</h2>
          <p className="text-gray-600 mb-4">
            Your browser does not support offline storage. Please use a modern browser to
            access offline vocabulary features.
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={cn("w-full p-4", className)}>
      {/* Header with statistics */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Offline Vocabulary</h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncWithServer()}
            disabled={isSyncing || stats.needsSync === 0}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Sync ({stats.needsSync})
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-sm text-gray-500">Learning</p>
            <p className="text-lg font-bold">{stats.total - stats.mastered}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-sm text-gray-500">Mastered</p>
            <p className="text-lg font-bold">{stats.mastered}</p>
          </Card>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search your vocabulary..."
            className="pl-8"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-needs-sync"
            checked={showOnlyNeedsSync}
            onCheckedChange={setShowOnlyNeedsSync}
          />
          <Label htmlFor="show-needs-sync" className="cursor-pointer">
            Show only items needing sync
          </Label>
        </div>
      </div>
      
      {/* Empty state */}
      {filteredVocabulary.length === 0 && (
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Vocabulary Items Found</h3>
          <p className="text-gray-600 mb-4">
            {offlineVocabulary.length === 0
              ? "You haven't saved any vocabulary for offline use yet."
              : "No vocabulary matches your current filters."}
          </p>
          {offlineVocabulary.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterText("");
                setShowOnlyNeedsSync(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}
      
      {/* Vocabulary list */}
      {filteredVocabulary.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({filteredVocabulary.length})</TabsTrigger>
            <TabsTrigger value="learning">Learning ({groupedVocabulary.learningItems.length})</TabsTrigger>
            <TabsTrigger value="mastered">Mastered ({groupedVocabulary.masteredItems.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2">
            {filteredVocabulary.map(renderVocabularyItem)}
          </TabsContent>
          
          <TabsContent value="learning" className="space-y-2">
            {groupedVocabulary.learningItems.length === 0 ? (
              <Card className="p-4 text-center">
                <p>No vocabulary items in this category.</p>
              </Card>
            ) : (
              groupedVocabulary.learningItems.map(renderVocabularyItem)
            )}
          </TabsContent>
          
          <TabsContent value="mastered" className="space-y-2">
            {groupedVocabulary.masteredItems.length === 0 ? (
              <Card className="p-4 text-center">
                <p>No vocabulary items in this category.</p>
              </Card>
            ) : (
              groupedVocabulary.masteredItems.map(renderVocabularyItem)
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {/* Refresh button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          onClick={() => refreshOfflineVocabulary()}
          className="text-gray-500"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}