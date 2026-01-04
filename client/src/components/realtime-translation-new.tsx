import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Undo, Languages, Video, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { detectObjectsWithOpenAI, languageNames } from "@/utils/openai-vision";
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
  const [realtimeEnabled, setRealtimeEnabled] = useState(false); // Start with manual mode
  const [showLabels, setShowLabels] = useState(false);
  
  const { toast } = useToast();
  const { user } = useUser();
  
  const labelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
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
  }, []);

  // Function to analyze a single frame using OpenAI Vision
  const analyzeCurrentFrame = useCallback(async () => {
    if (!isCameraOn || analyzing || !videoRef.current || !canvasRef.current) return;
    
    // Throttle API calls to prevent rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastAnalysisTimeRef.current;
    
    if (timeSinceLastCall < 3000) { // Min 3 seconds between calls
      console.log("Please wait before analyzing again...");
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
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Use OpenAI Vision API
      const detectedObjects = await detectObjectsWithOpenAI(imageDataUrl, selectedLanguage);
      
      console.log(`OpenAI detected ${detectedObjects.length} objects`);
      
      if (detectedObjects.length > 0) {
        setRecognizedObjects(detectedObjects);
        setShowLabels(true);
        
        // Clear any previous timeout
        if (labelTimeoutRef.current) {
          clearTimeout(labelTimeoutRef.current);
        }
        
        // Show labels for 6 seconds
        labelTimeoutRef.current = setTimeout(() => {
          setShowLabels(false);
        }, 6000);
      } else {
        setRecognizedObjects([]);
        setShowLabels(false);
        toast({
          title: "No Objects Found",
          description: "Could not recognize any objects in the camera view.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setRecognizedObjects([]);
      setShowLabels(false);
      toast({
        title: "Analysis Error",
        description: "An error occurred while analyzing the camera feed.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [isCameraOn, analyzing, selectedLanguage, toast]);

  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.history.back();
  }, []);

  const handleCaptureClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!analyzing) {
      analyzeCurrentFrame();
    }
  }, [analyzing, analyzeCurrentFrame]);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);

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
      
      {/* Translation Labels */}
      {showLabels && recognizedObjects.map((obj, index) => (
        <div
          key={index}
          className="absolute bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-black text-sm font-medium shadow-md max-w-[200px] z-30"
          style={{
            left: obj.position ? `${obj.position.x * 100}%` : '50%',
            top: obj.position ? `${Math.max(0, obj.position.y * 100 - 30)}%` : `${20 + index * 30}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="font-bold text-blue-600">{obj.object}</div>
          <div className="text-gray-700">{obj.translation}</div>
          {obj.exampleSentence && (
            <div className="text-xs text-gray-500 mt-1 italic">
              "{obj.exampleSentence}"
            </div>
          )}
        </div>
      ))}

      {/* Top gradient overlay with language selector */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-20">
        <div className="absolute left-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm flex items-center gap-2 hover:bg-white/30 border-none"
              >
                <Languages className="h-4 w-4" />
                <span>{languageNames[selectedLanguage]}</span>
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

      {/* Bottom gradient overlay with controls */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-20">
        {/* Back button */}
        <div className="absolute left-4 bottom-6">
          <Button
            onClick={handleBackClick}
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            variant="outline"
            size="sm"
          >
            <Undo className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Capture button */}
        <div className="absolute right-4 bottom-6">
          <Button
            onClick={handleCaptureClick}
            className="bg-blue-500/60 backdrop-blur-sm text-white border-blue-400/30 hover:bg-blue-600/60"
            variant="outline"
            size="lg"
            disabled={!isCameraOn || analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Capture & Translate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-40 left-0 right-0 text-center z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg mx-6 px-4 py-2">
          <p className="text-white text-sm">
            Point your camera at objects and tap "Capture & Translate" to identify them
          </p>
        </div>
      </div>
    </div>
  );
}