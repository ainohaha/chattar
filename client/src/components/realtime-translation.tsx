import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ArrowLeft, Languages, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { detectObjectsWithOpenAI } from "@/utils/openai-vision";
import { initObjectDetection, detectObjects } from "@/utils/object-detection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RealtimeTranslationProps {
  className?: string;
  showBackButton?: boolean;
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

export function RealtimeTranslation({ className, showBackButton = true }: RealtimeTranslationProps) {
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
  const requestRef = useRef<number>();

  const semanticLabelRef = useRef<RecognizedObject | null>(null); // Store latest OpenAI result
  const smoothedPositionRef = useRef<{ x: number, y: number } | null>(null);
  const missingFramesRef = useRef<number>(0);


  // Helper for linear interpolation
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const { toast } = useToast();
  const { user } = useUser();

  // Start camera and load local model when component mounts
  useEffect(() => {
    initObjectDetection().then(() => {
      console.log("Local TF.js model loaded");
    });

    startCamera();
    return () => {
      stopCamera();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [toast]);

  // Fast Loop: Local Object tracking (60 FPS)
  const animate = useCallback(async () => {
    if (videoRef.current && videoRef.current.readyState === 4 && isCameraOn) {
      const localDetections = await detectObjects(videoRef.current);

      // If we have a semantic label, map it to the most prominent local object
      // For simplicity, we assume the largest local object is the one we analyzed
      if (localDetections.length > 0) {
        // Reset missing frames on detection
        missingFramesRef.current = 0;

        // Find largest object (most prominent)
        const prominent = localDetections.reduce((prev, current) => {
          return (prev.bbox[2] * prev.bbox[3] > current.bbox[2] * current.bbox[3]) ? prev : current;
        });

        // Normalize coordinates (0-1) for rendering
        // bbox is [x, y, width, height]
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        const normalizedPos = {
          x: (prominent.bbox[0] + prominent.bbox[2] / 2) / videoWidth,
          y: (prominent.bbox[1]) / videoHeight
        };

        // Smooth the position using LERP
        if (smoothedPositionRef.current) {
          smoothedPositionRef.current = {
            x: lerp(smoothedPositionRef.current.x, normalizedPos.x, 0.2), // Adjust 0.2 for smoothing amount
            y: lerp(smoothedPositionRef.current.y, normalizedPos.y, 0.2)
          };
        } else {
          smoothedPositionRef.current = normalizedPos;
        }

        const renderPos = smoothedPositionRef.current;

        if (semanticLabelRef.current) {
          setRecognizedObjects([{
            ...semanticLabelRef.current,
            position: renderPos
          }]);
          setShowLabels(true);
        } else {
          setRecognizedObjects([{
            object: "Analyzing...",
            translation: "...",
            exampleSentence: "...",
            sentenceTranslation: "...",
            position: renderPos
          }]);
          setShowLabels(true);
        }
      } else {
        // Increment missing frames counter
        missingFramesRef.current += 1;

        // Grace period: Keep showing object for 30 frames (~0.5s) even if lost
        if (missingFramesRef.current < 30 && smoothedPositionRef.current && semanticLabelRef.current) {
          // Keep showing the last known position (maybe drift it slightly towards center or just hold)
          // For now, just hold
          const renderPos = smoothedPositionRef.current;

          setRecognizedObjects([{
            ...semanticLabelRef.current,
            position: renderPos
          }]);
          setShowLabels(true);

        } else {
          // Lost for too long, reset everything
          if (missingFramesRef.current > 30) {
            smoothedPositionRef.current = null;
            setRecognizedObjects([]);
            setShowLabels(false);
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isCameraOn]);

  useEffect(() => {
    if (isCameraOn) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
  }, [isCameraOn, animate]);



  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 640, max: 3840 },
          height: { ideal: 1080, min: 480, max: 2160 },
          aspectRatio: { ideal: 16 / 9 }
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

  // Function to analyze a single frame using Gemini Vision API
  const analyzeCurrentFrame = useCallback(async () => {
    if (!isCameraOn || analyzing || !videoRef.current || !canvasRef.current) return;

    // Throttle API calls to prevent rate limiting and save costs
    const now = Date.now();
    const timeSinceLastCall = now - lastAnalysisTimeRef.current;

    if (timeSinceLastCall < 2000) { // Strict 2s throttle as requested
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

      // Set canvas dimensions - strictly smaller for faster upload
      const scaleFactor = 0.4; // Further reduce resolution for speed
      const targetWidth = video.videoWidth * scaleFactor;
      const targetHeight = video.videoHeight * scaleFactor;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'medium';
      context.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Get base64 image data - lower quality for speed
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.6);

      // Call Gemini Vision API
      const detectedObjects = await detectObjectsWithOpenAI(imageDataUrl, selectedLanguage);

      console.log(`Gemini detected ${detectedObjects.length} objects`);

      if (detectedObjects.length > 0) {
        // Update the semantic label REFerence
        // The fast loop will pick this up on the next frame and apply it to the local position
        semanticLabelRef.current = detectedObjects[0];

        // We DON'T setRecognizedObjects here anymore to avoid jitter
        // setRecognizedObjects(detectedObjects); 
        // setShowLabels(true);

        // Clear any existing timeout since we have objects
        if (labelTimeoutRef.current) {
          clearTimeout(labelTimeoutRef.current);
          labelTimeoutRef.current = null;
        }
      } else {
        // Only hide labels after a short delay when no objects are detected
        if (labelTimeoutRef.current) {
          clearTimeout(labelTimeoutRef.current);
        }

        labelTimeoutRef.current = setTimeout(() => {
          setRecognizedObjects([]);
          setShowLabels(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Detection error:", error);

      // Handle rate limiting
      if (error?.message?.includes("429") || error?.status === 429) {
        // Add artificial delay by advancing the last analysis time
        // Use retryAfter from server if available, else try to parse from message
        let retryAfter = (error as any)?.retryAfter;

        if (!retryAfter && error.message) {
          const match = error.message.match(/"retryAfter":\s*(\d+)/);
          if (match) {
            retryAfter = parseInt(match[1]);
          }
        }

        retryAfter = retryAfter || 30;
        console.log(`Rate limit hit, backing off for ${retryAfter}s`);

        lastAnalysisTimeRef.current = Date.now() + (retryAfter * 1000);

        // toast({
        //   title: "Rate Limit Reached",
        //   description: "Slowing down requests to Gemini...",
        //   variant: "default", // distinct from error
        // });
      }
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

  // Effect to handle real-time analysis
  useEffect(() => {
    // Clear any existing interval
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }

    if (realtimeEnabled && isCameraOn) {
      // Set up an interval to analyze at regular intervals
      // We use a longer interval for API-based detection
      analyzeIntervalRef.current = setInterval(() => {
        if (!analyzing) {
          analyzeCurrentFrame();
        }
      }, 2000); // Check every 2 seconds (Goldilocks zone)


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
        {showBackButton && (
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
        )}

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