import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ArrowLeft, Languages, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { detectObjects, initObjectDetection } from "@/utils/object-detection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RealtimeTranslationProps {
  className?: string;
}

interface RecognizedObject {
  object: string;
  translation: string;
  exampleSentence: string;
  sentenceTranslation: string;
  position?: {
    x: number;
    y: number;
  };
}

export function RealtimeTranslation({ className }: RealtimeTranslationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recognizedObjects, setRecognizedObjects] = useState<RecognizedObject[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('fi');
  const [realtimeEnabled, setRealtimeEnabled] = useState(true); // Enable real-time by default
  const [showLabels, setShowLabels] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Language names mapping
  const languageNames = {
    'fi': 'Finnish',
    'ru': 'Russian', 
    'fr': 'French',
    'es': 'Spanish'
  };
  
  const labelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const instructionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { user } = useUser();

  // Initialize TensorFlow model and start camera when component mounts
  useEffect(() => {
    // Load the TensorFlow model when component mounts
    initObjectDetection().catch(error => {
      console.error("Failed to initialize object detection model:", error);
      toast({
        title: "Model Error",
        description: "Could not load the object detection model. Please try again.",
        variant: "destructive",
      });
    });
    
    startCamera();
    return () => {
      stopCamera();
    };
  }, [toast]);



  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 640, max: 3840 },
          height: { ideal: 1080, min: 480, max: 2160 },
          aspectRatio: { ideal: 16/9 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        
        // Start instruction fade-out timer
        instructionsTimeoutRef.current = setTimeout(() => {
          setShowInstructions(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setShowInstructions(true); // Reset instructions for next time
    
    // Clear timers
    if (instructionsTimeoutRef.current) {
      clearTimeout(instructionsTimeoutRef.current);
      instructionsTimeoutRef.current = null;
    }
  }, []);

  // Function to analyze a single frame using OpenAI Vision
  const analyzeCurrentFrame = useCallback(async () => {
    if (!isCameraOn || analyzing || !videoRef.current || !canvasRef.current) return;
    
    // Throttle API calls to prevent rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastAnalysisTimeRef.current;
    
    if (timeSinceLastCall < 1000) { // Min 1 second between calls for real-time
      return;
    }
    
    lastAnalysisTimeRef.current = now;
    
    try {
      setAnalyzing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      // Set canvas dimensions
      const scaleFactor = 0.5;
      const targetWidth = video.videoWidth * scaleFactor;
      const targetHeight = video.videoHeight * scaleFactor;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Use TensorFlow.js for object detection - no external API needed
      const detectedObjects = await detectObjects(videoRef.current, selectedLanguage);
      
      console.log(`TensorFlow detected ${detectedObjects.length} objects`);
      
      if (detectedObjects.length > 0) {
        setRecognizedObjects(detectedObjects);
        setShowLabels(true);
        
        // Clear any existing timeout since we have objects
        if (labelTimeoutRef.current) {
          clearTimeout(labelTimeoutRef.current);
          labelTimeoutRef.current = null;
        }
      } else {
        // Only hide labels after a short delay when no objects are detected
        // This prevents flickering when objects briefly disappear
        if (labelTimeoutRef.current) {
          clearTimeout(labelTimeoutRef.current);
        }
        
        labelTimeoutRef.current = setTimeout(() => {
          setRecognizedObjects([]);
          setShowLabels(false);
        }, 1000); // Short delay to prevent flickering
      }
    } catch (error) {
      console.error("Detection error:", error);
      // Don't show error toast for detection issues, just silently continue
      setRecognizedObjects([]);
      setShowLabels(false);
    } finally {
      setAnalyzing(false);
    }
  }, [isCameraOn, analyzing, selectedLanguage, toast]);

  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.history.back();
  }, []);



  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);

  // Effect to handle real-time analysis - placed after analyzeCurrentFrame is defined
  useEffect(() => {
    // Clear any existing interval
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }

    if (realtimeEnabled && isCameraOn) {
      // Set up an interval to analyze at regular intervals for real-time detection
      analyzeIntervalRef.current = setInterval(() => {
        if (!analyzing) {
          analyzeCurrentFrame();
        }
      }, 2000); // Analyze every 2 seconds for smooth real-time experience
    } else {
      // When real-time mode is disabled, hide any displayed labels
      setShowLabels(false);
    }

    // Cleanup function
    return () => {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
        analyzeIntervalRef.current = null;
      }
    };
  }, [realtimeEnabled, isCameraOn, analyzeCurrentFrame, analyzing]);

  return (
    <div className={cn("relative h-screen w-full overflow-hidden bg-black", className)}>
      {/* Full-screen Camera View */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Translation Labels with Pointers */}
      {showLabels && recognizedObjects.map((obj, index) => (
        <div key={index}>
          {/* Label with pointer */}
          <div
            className="absolute z-30"
            style={{
              left: obj.position ? `${obj.position.x * 100}%` : '50%',
              top: obj.position ? `${Math.max(5, obj.position.y * 100 - 15)}%` : `${20 + index * 20}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {/* Label container */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-black text-sm font-medium shadow-lg border border-white/30 relative">
              <div className="font-bold text-blue-600 text-base">{obj.object}</div>
              <div className="text-gray-800 font-semibold">{obj.translation}</div>
              
              {/* Pointer triangle */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/95"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Top gradient overlay with back button and language selector */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-20">
        {/* Back button in top-left */}
        <div className="absolute left-4 top-4">
          <Button
            onClick={handleBackClick}
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-full"
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Language selector in top-right */}
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm flex items-center gap-2 hover:bg-white/30 border-none"
              >
                <Languages className="h-4 w-4" />
                <span>{languageNames[selectedLanguage as keyof typeof languageNames]}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {Object.entries(languageNames).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={selectedLanguage === code ? "bg-primary/10" : ""}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>



      {/* Example Sentences at Bottom - positioned to avoid scrolling */}
      {showLabels && recognizedObjects.length > 0 && (
        <div className="absolute bottom-2 left-0 right-0 z-20">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg mx-3 px-3 py-2 border border-white/20">
            <div className="text-white text-xs">
              <div className="text-blue-300 font-medium mb-1">Example:</div>
              <div className="text-white font-medium leading-tight">{recognizedObjects[0].exampleSentence}</div>
              <div className="text-gray-300 text-xs mt-1 italic leading-tight">{recognizedObjects[0].sentenceTranslation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay with fade-out - positioned for mobile */}
      {showInstructions && (
        <div className="absolute bottom-16 left-0 right-0 text-center z-20 transition-opacity duration-500">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg mx-4 px-3 py-2">
            <p className="text-white text-xs">
              Point your camera at objects for automatic translation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}