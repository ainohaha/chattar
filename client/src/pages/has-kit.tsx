import { useLocation } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";

export default function HasKit() {
  const [, navigate] = useLocation();
  
  const handleHasKit = () => {
    navigate("/scan");
  };
  
  const handleNoKit = () => {
    // In a real app, we would show kit purchase options
    // For this demo, we'll just show a message
    alert("You can purchase a kit from our website or continue with a digital kit!");
    navigate("/scan");
  };
  
  return (
    <MobileLayout className="bg-[#56CCF2] flex flex-col items-center p-6">
      {/* Progress Indicator */}
      <StepIndicator currentStep={1} totalSteps={5} />
      
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold text-white font-poppins mb-8 text-center">
          Do you have a ChattAR kit?
        </h2>
        
        {/* Kit Illustration */}
        <div className="relative w-48 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center mb-10">
          <div className="absolute w-full h-8 bg-[#6FCF97] rounded-t-xl top-0"></div>
          <div className="absolute w-16 h-16 border-4 border-[#6FCF97] rounded-xl top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-white">
            <span className="text-lg font-semibold text-[#4ECDC4]">moi/hello</span>
          </div>
        </div>
        
        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full py-6 bg-[#6FCF97] hover:bg-opacity-90 rounded-full text-white font-poppins transition-all"
            onClick={handleHasKit}
          >
            Yes I do!
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 bg-white hover:bg-opacity-90 rounded-full text-[#4ECDC4] font-poppins font-medium transition-all"
            onClick={handleNoKit}
          >
            Not yet
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
