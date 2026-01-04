import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";
import { useLesson } from "@/context/lesson-context";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmKit() {
  const { kitId } = useParams<{ kitId: string }>();
  const [, navigate] = useLocation();
  const { loadKit, currentKit } = useLesson();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (kitId) {
      setLoading(true);
      loadKit(parseInt(kitId))
        .then(kit => {
          if (!kit) {
            toast({
              title: "Kit Not Found",
              description: "Could not find the specified language kit.",
              variant: "destructive",
            });
            navigate("/has-kit");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error loading kit:", error);
          toast({
            title: "Loading Error",
            description: "Could not load the language kit details.",
            variant: "destructive",
          });
          navigate("/has-kit");
        });
    }
  }, [kitId, loadKit, navigate, toast]);
  
  const handleConfirmKit = () => {
    navigate("/dashboard");
  };
  
  const handleScanAgain = () => {
    navigate("/scan");
  };
  
  if (loading) {
    return (
      <MobileLayout className="bg-[#56CCF2] flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading kit details...</div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout className="bg-[#56CCF2] flex flex-col items-center p-6">
      {/* Progress Indicator */}
      <StepIndicator currentStep={4} totalSteps={5} />
      
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold text-white font-poppins mb-8 text-center">
          Is this your kit?
        </h2>
        
        {/* Kit Illustration with Flags */}
        <div className="relative w-48 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center mb-10">
          <div className="absolute w-full h-8 bg-[#6FCF97] rounded-t-xl top-0"></div>
          <div className="absolute w-24 h-16 top-12 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <div className="flex space-x-2 items-center">
              {/* Source Language Flag - Simplified as colored rectangles */}
              <div className="w-8 h-6 bg-blue-900 flex items-center justify-center overflow-hidden rounded">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-blue-900"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_33%,white_33%,white_66%,transparent_66%)]"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_33%,white_33%,white_66%,transparent_66%)]"></div>
                </div>
              </div>
              
              <div className="text-xl font-bold text-[#4ECDC4]">→</div>
              
              {/* Target Language Flag - Simplified as colored rectangles */}
              <div className="w-8 h-6 bg-white flex items-center justify-center overflow-hidden rounded">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-white"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-2 bg-blue-500"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {currentKit && (
            <div className="absolute bottom-4 text-center">
              <p className="text-sm font-semibold text-gray-800">{currentKit.name}</p>
              <p className="text-xs text-gray-600">
                {currentKit.sourceLanguage.toUpperCase()} → {currentKit.targetLanguage.toUpperCase()}
              </p>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full py-6 bg-[#6FCF97] hover:bg-opacity-90 rounded-full text-white font-poppins transition-all"
            onClick={handleConfirmKit}
          >
            Looks good!
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 bg-white hover:bg-opacity-90 rounded-full text-[#4ECDC4] font-poppins font-medium transition-all"
            onClick={handleScanAgain}
          >
            Nope, try again
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
