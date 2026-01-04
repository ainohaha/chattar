import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { Button } from "@/components/ui/button";
import { LanguageCard } from "@/components/ui/language-card";
import { useLesson } from "@/context/lesson-context";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, HelpCircle } from "lucide-react";

export default function CardReview() {
  const { cardId } = useParams<{ cardId: string }>();
  const [, navigate] = useLocation();
  const { loadCard, currentCard, currentLesson } = useLesson();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
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
  
  const handleBackFromCardReview = () => {
    if (currentLesson) {
      navigate(`/lesson/${currentLesson.id}`);
    } else {
      navigate("/dashboard");
    }
  };
  
  const handleLearnCard = () => {
    navigate(`/card-view/${cardId}`);
  };
  
  const handleSkipCard = () => {
    if (currentLesson && currentLesson.cards.length > 0) {
      const currentIndex = currentLesson.cards.findIndex(id => id.toString() === cardId);
      
      if (currentIndex >= 0 && currentIndex < currentLesson.cards.length - 1) {
        // Navigate to the next card
        navigate(`/card-review/${currentLesson.cards[currentIndex + 1]}`);
      } else {
        // End of lesson
        toast({
          title: "Lesson Complete",
          description: "You've completed all cards in this lesson!",
        });
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };
  
  const handleHelpWithCard = () => {
    toast({
      title: "Card Instructions",
      description: "Tap 'Learn' to study this card or 'Skip for now' to come back to it later.",
    });
  };
  
  if (loading) {
    return (
      <MobileLayout gradient="primary" className="flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading card...</div>
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
          onClick={handleBackFromCardReview}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-white font-poppins">Check Your Card</h2>
        <div className="w-8 h-8"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Card Content */}
      <div className="flex-grow flex flex-col items-center justify-between p-6">
        {/* Conversation Card */}
        {currentCard && (
          <LanguageCard
            originalPhrase={currentCard.originalPhrase}
            translatedPhrase={currentCard.translatedPhrase}
            className="mb-6"
          />
        )}
        
        {/* Option Buttons */}
        <div className="w-full space-y-3 mb-6">
          <Button
            className="w-full py-3 bg-[#6FCF97] hover:bg-opacity-90 rounded-xl text-white font-poppins transition-all"
            onClick={handleLearnCard}
          >
            Learn
          </Button>
          <Button
            variant="outline"
            className="w-full py-3 bg-white hover:bg-opacity-90 rounded-xl text-[#4ECDC4] font-poppins font-medium transition-all"
            onClick={handleSkipCard}
          >
            Skip for now
          </Button>
        </div>
        
        {/* Help Link */}
        <Button
          variant="link"
          className="text-white/70 text-sm font-medium hover:text-white"
          onClick={handleHelpWithCard}
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Need help?
        </Button>
      </div>
    </MobileLayout>
  );
}
