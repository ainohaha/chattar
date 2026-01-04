import { useLocation } from "wouter";
import { useLesson } from "@/context/lesson-context";
import { QRScanner } from "@/components/qr-scanner";
import { useToast } from "@/hooks/use-toast";

export default function ScanQR() {
  const [, navigate] = useLocation();
  const { loadKitByQrCode } = useLesson();
  const { toast } = useToast();
  
  const handleQRCodeScanned = async (qrCode: string) => {
    try {
      const kit = await loadKitByQrCode(qrCode);
      
      if (kit) {
        navigate(`/confirm-kit/${kit.id}`);
      } else {
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code doesn't match any language kit.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      toast({
        title: "Scan Failed",
        description: "There was an error scanning the QR code. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <QRScanner onScan={handleQRCodeScanned} />
  );
}
