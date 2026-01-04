import { useLocation } from "wouter";
import MobileLayout from "@/layouts/mobile-layout";
import { BirdMascot } from "@/components/ui/bird-mascot";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";

export default function WelcomeOptions() {
  const [, navigate] = useLocation();
  const { login, register } = useUser();
  
  const handleCreateAccount = () => {
    // In a real app, we would show a registration form
    // For demo purposes, auto-register a demo user
    register("demo_user", "password123", "Demo User")
      .then(() => navigate("/has-kit"))
      .catch(error => console.error("Registration error:", error));
  };
  
  const handleLogin = () => {
    // In a real app, we would show a login form
    // For demo purposes, auto-login as demo user
    login("demo_user", "password123")
      .then(() => navigate("/has-kit"))
      .catch(error => console.error("Login error:", error));
  };
  
  return (
    <MobileLayout gradient="secondary" className="flex flex-col items-center justify-between">
      {/* Blue Bird Mascot at Top */}
      <BirdMascot type="blue" size="xl" position="top-right" flipped={true} />
      
      <div className="flex-grow"></div>
      
      <div className="w-full max-w-xs text-center mb-8 px-6">
        <h1 className="text-5xl font-bold text-white font-poppins mb-2">chatt.ar</h1>
        <p className="text-white text-opacity-80">Chattin' like a pro.</p>
      </div>
      
      <div className="w-full max-w-xs space-y-3 mb-8 px-6">
        <Button
          className="w-full py-6 bg-white/25 hover:bg-white/40 rounded-full text-white font-poppins transition-all"
          onClick={handleCreateAccount}
        >
          Create an account
        </Button>
        <Button
          variant="outline"
          className="w-full py-6 bg-white hover:bg-white/90 rounded-full text-primary font-poppins font-medium transition-all"
          onClick={handleLogin}
        >
          Login
        </Button>
      </div>
      
      {/* Green Bird Mascot at Bottom */}
      <BirdMascot type="green" size="lg" position="bottom-left" />
    </MobileLayout>
  );
}
