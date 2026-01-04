import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { BirdMascot } from "@/components/ui/bird-mascot";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  const [, navigate] = useLocation();
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // Show the button after a short delay for a better UX
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleContinue = () => {
    navigate("/options");
  };
  
  return (
    <MobileLayout gradient="primary" className="flex flex-col items-center justify-center">
      <div className="w-full max-w-xs text-center px-6">
        <h1 className="text-5xl font-bold text-white font-poppins mb-4">chatt.ar</h1>
        <p className="text-white text-opacity-80 text-lg">Language learning made real.</p>
      </div>
      
      {/* Bird Mascots */}
      <BirdMascot type="green" size="lg" position="bottom-left" />
      <BirdMascot type="blue" size="lg" position="bottom-right" flipped={true} />
      
      {/* Continue Button - fades in after delay */}
      <div className={`absolute bottom-16 transition-opacity duration-500 ${showButton ? "opacity-100" : "opacity-0"}`}>
        {showButton && (
          <Button 
            variant="outline" 
            className="bg-white/20 text-white hover:bg-white/30 rounded-full px-8 py-2"
            onClick={handleContinue}
          >
            Get Started
          </Button>
        )}
      </div>
    </MobileLayout>
  );
}
