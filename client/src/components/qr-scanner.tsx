import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    let scanner: Worker | null = null;

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
          setIsScanning(true);
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

    const scanQRCode = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Here we would typically use a QR code scanning library
        // For this example, we'll simulate finding a QR code after a delay
        setTimeout(() => {
          if (isScanning) {
            // Simulate QR code data (in a real app, this would come from a library)
            onScan("finnish-basics-qr-code");
            setIsScanning(false);
          }
        }, 3000);
      }

      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    if (isScanning) {
      startCamera();
      animationFrameId = requestAnimationFrame(scanQRCode);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (scanner) {
        scanner.terminate();
      }
      setIsCameraOn(false);
      setIsScanning(false);
    };
  }, [isScanning, onScan, toast]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full hidden"
      />
      
      {/* QR Code Frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64 border-2 border-white/60 rounded-lg overflow-hidden">
          {/* Corner Guides */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
          
          {/* Scanner Line Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-0.5 w-full bg-primary opacity-70 absolute top-1/2 animate-pulse" 
                 style={{ boxShadow: "0 0 8px 2px rgba(78, 205, 196, 0.8)" }}></div>
          </div>
        </div>
      </div>
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-center">
        <h2 className="text-xl font-bold text-white font-poppins bg-black/30 px-6 py-2 rounded-full">
          Scan your kit QR code
        </h2>
      </div>
      
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 p-0 flex items-center justify-center"
        onClick={() => navigate("/has-kit")}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
      
      {/* Help Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
        <Button
          variant="ghost"
          className="bg-white/20 hover:bg-white/30 text-white py-2 px-6 rounded-full"
          onClick={() => {
            toast({
              title: "Scanning Instructions",
              description: "Position the QR code inside the frame and hold steady.",
            });
          }}
        >
          Need help?
        </Button>
      </div>
    </div>
  );
}
