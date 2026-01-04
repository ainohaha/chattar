import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { BirdMascot } from "@/components/ui/bird-mascot";
import { Button } from "@/components/ui/button";
import { useLesson } from "@/context/lesson-context";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [, navigate] = useLocation();
  const { loadLesson, currentLesson, loadCard } = useLesson();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (lessonId) {
      setLoading(true);
      loadLesson(parseInt(lessonId))
        .then(lesson => {
          if (!lesson) {
            toast({
              title: "Lesson Not Found",
              description: "Could not find the specified lesson.",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error loading lesson:", error);
          toast({
            title: "Loading Error",
            description: "Could not load the lesson details.",
            variant: "destructive",
          });
          navigate("/dashboard");
        });
    }
  }, [lessonId, loadLesson, navigate, toast]);
  
  const handleCloseLessonCard = () => {
    navigate("/dashboard");
  };
  
  const handleStartLesson = async () => {
    if (currentLesson && currentLesson.cards.length > 0) {
      try {
        // Load the first card in the lesson
        const firstCardId = currentLesson.cards[0];
        const card = await loadCard(firstCardId);
        
        if (card) {
          navigate(`/card-review/${card.id}`);
        } else {
          toast({
            title: "Card Not Found",
            description: "Could not load the lesson card.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error starting lesson:", error);
        toast({
          title: "Start Error",
          description: "Could not start the lesson.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Empty Lesson",
        description: "This lesson has no cards to study.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <MobileLayout gradient="primary" className="flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading lesson...</div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout gradient="primary" className="flex flex-col" withStatusBar={false}>
      {/* Close Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white p-0 z-10"
        onClick={handleCloseLessonCard}
      >
        <X className="h-5 w-5" />
      </Button>
      
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-poppins mb-6">Aloitetaan!</h2>
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#4ECDC4] text-3xl font-bold mx-auto mb-6">
            {currentLesson?.order || 1}
          </div>
          <p className="text-white text-opacity-90 mb-1">{currentLesson?.title || "Loading..."}</p>
          <p className="text-white text-opacity-90">{currentLesson?.description || ""}</p>
          
          <Button
            className="mt-8 px-8 py-2 bg-white text-[#4ECDC4] rounded-full font-medium hover:bg-white/90"
            onClick={handleStartLesson}
          >
            Begin Lesson
          </Button>
        </div>
        
        {/* Bird Mascots */}
        <div className="mt-16 flex justify-between w-full">
          <BirdMascot type="green" size="lg" position="bottom-left" />
          <BirdMascot type="blue" size="lg" position="bottom-right" flipped={true} />
        </div>
      </div>
    </MobileLayout>
  );
}
