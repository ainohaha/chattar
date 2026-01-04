import { useState } from "react";
import { useLocation } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { Button } from "@/components/ui/button";
import { RealtimeTranslation } from "@/components/realtime-translation";
import { BirdMascot } from "@/components/ui/bird-mascot";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RealtimeTranslationPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  const handleHelpToggle = () => {
    setShowHelp(prev => !prev);
    
    if (!showHelp) {
      toast({
        title: "Camera Translation",
        description: "Point your camera at objects around you to see them translated in real-time!"
      });
    }
  };
  
  return (
    <MobileLayout gradient="primary" className="flex flex-col" withStatusBar={false}>
      {/* Nav Header */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white p-0"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-white font-poppins">Realtime Translation</h2>
        <Button
          variant="ghost"
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white p-0"
          onClick={handleHelpToggle}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex flex-col">
        {showHelp ? (
          <div className="p-6 text-white">
            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm relative">
              <BirdMascot type="blue" size="sm" position="top-right" />
              
              <h3 className="text-xl font-bold mb-4">How to Use Camera Translation</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Point your camera at objects around you</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Tap the camera button to analyze what you see</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>The app will identify objects and show translations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>You'll also see example sentences using the translated words</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>Use zoom controls to get a better view if needed</span>
                </li>
              </ul>
              
              <Button
                className="mt-6 w-full"
                onClick={handleHelpToggle}
              >
                Got it!
              </Button>
            </div>
          </div>
        ) : (
          <RealtimeTranslation />
        )}
      </div>
    </MobileLayout>
  );
}