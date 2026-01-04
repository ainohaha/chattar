import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { Button } from "@/components/ui/button";
import { CameraView } from "@/components/camera-view";
import { useLesson } from "@/context/lesson-context";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, MoveUp, Bookmark, Check } from "lucide-react";
import { speakText } from "@/utils/translation";

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const [, navigate] = useLocation();
  const { loadCard, currentCard, saveToVocabulary, vocabulary } = useLesson();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  useEffect(() => {
    if (cardId) {
      setLoading(true);
      loadCard(parseInt(cardId))
        .then(card => {
          if (!card) {
            toast({
              title: "Card Not Found",
              description: "Could not find the specified card.",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error loading card:", error);
          toast({
            title: "Loading Error",
            description: "Could not load the card details.",
            variant: "destructive",
          });
          navigate("/dashboard");
        });
    }
  }, [cardId, loadCard, navigate, toast]);
  
  // Check if this card is already saved
  useEffect(() => {
    if (currentCard && vocabulary.length > 0) {
      const isCardSaved = vocabulary.some(item => item.cardId === currentCard.id);
      setIsSaved(isCardSaved);
    }
  }, [currentCard, vocabulary]);
  
  const handleBackFromCardView = () => {
    navigate(`/card-review/${cardId}`);
  };
  
  const handlePronounce = async () => {
    if (currentCard && !isAudioPlaying) {
      setIsAudioPlaying(true);
      try {
        await speakText(currentCard.originalPhrase, 'fi-FI');
      } catch (error) {
        console.error("Pronunciation error:", error);
        toast({
          title: "Audio Error",
          description: "Could not play pronunciation.",
          variant: "destructive",
        });
      } finally {
        setIsAudioPlaying(false);
      }
    }
  };
  
  const handleSaveToVocabulary = async () => {
    if (currentCard && user) {
      try {
        await saveToVocabulary(user.id, currentCard.id);
        setIsSaved(true);
      } catch (error) {
        console.error("Save error:", error);
        toast({
          title: "Save Failed",
          description: "Could not save to vocabulary.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Logged In",
        description: "Please log in to save cards to your vocabulary.",
        variant: "destructive",
      });
    }
  };
  
  const handleResponse = (response: string) => {
    toast({
      title: "Good Job!",
      description: `You selected: "${response}"`,
    });
    
    // In a real app, we would record this response
    // For now, just navigate to the next card after a delay
    setTimeout(() => {
      handleNextCard();
    }, 1500);
  };
  
  const handleNextCard = () => {
    if (currentCard) {
      // Navigate to dashboard for now, in a real app we'd go to the next card
      navigate("/dashboard");
    }
  };
  
  if (loading) {
    return (
      <MobileLayout gradient="primary" className="flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading card details...</div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout gradient="primary" className="flex flex-col" withStatusBar={false}>
      {/* Nav Header */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white p-0"
          onClick={handleBackFromCardView}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-white font-poppins">Show Your Card</h2>
        <div className="w-8 h-8"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Card Content */}
      <div className="flex-grow flex flex-col items-center p-4">
        {/* Card Image/AR View */}
        {currentCard && (
          <CameraView
            originalPhrase={currentCard.originalPhrase}
            translatedPhrase={currentCard.translatedPhrase}
            className="mb-4"
          />
        )}
        
        {/* Translation and Options */}
        <div className="w-full bg-white rounded-xl p-4 mb-4">
          <p className="text-gray-800 font-medium mb-1">Phrase:</p>
          <p className="text-[#4ECDC4] font-bold text-lg mb-3">
            {currentCard?.originalPhrase || "Loading..."}
          </p>
          
          <p className="text-gray-800 font-medium mb-1">Translation:</p>
          <p className="text-gray-700 mb-4">
            {currentCard?.translatedPhrase || "Loading..."}
          </p>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm flex items-center"
              onClick={handlePronounce}
              disabled={isAudioPlaying}
            >
              <MoveUp className="h-4 w-4 mr-2" />
              Listen
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm flex items-center"
              onClick={handleSaveToVocabulary}
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Practice Options */}
        <div className="w-full">
          <p className="text-white font-medium mb-2">Practice your response:</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 p-3 rounded-xl text-white text-sm flex flex-col items-center"
              onClick={() => handleResponse("Hyvin kiitos")}
            >
              <span>Hyvin kiitos.</span>
              <span className="text-xs text-white/70">I'm good, thanks.</span>
            </Button>
            <Button
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 p-3 rounded-xl text-white text-sm flex flex-col items-center"
              onClick={() => handleResponse("Olen hyvä")}
            >
              <span>Olen hyvä!</span>
              <span className="text-xs text-white/70">I'm good!</span>
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
