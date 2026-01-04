import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CameraViewProps {
  originalPhrase: string;
  translatedPhrase: string;
  className?: string;
}

export function CameraView({
  originalPhrase,
  translatedPhrase,
  className,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraOn(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOn(false);
    };
  }, [toast]);

  return (
    <div className={cn("w-full h-56 bg-white rounded-xl shadow-lg overflow-hidden", className)}>
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
        />
        
        {/* AR Translation Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-xs">
            <p className="text-primary font-medium mb-1">{originalPhrase}</p>
            <p className="text-gray-500 text-sm">{translatedPhrase}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
