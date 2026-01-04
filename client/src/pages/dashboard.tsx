import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLesson } from "@/context/lesson-context";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Menu, Signal, Wifi, Battery, Home, BookOpen, Camera, Database, ChevronRight } from "lucide-react";
import greenBird from "@assets/Group 12.png";
import blueBird from "@assets/Group 17.png";
import chattarLogo from "@assets/chat ar.png";
import profilePic from "@assets/aino.jpg";

interface Lesson {
  id: number;
  kitId: number;
  title: string;
  description?: string;
  order: number;
  cards: number[];
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { currentKit, loadKit } = useLesson();
  const { user } = useUser();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // If no current kit is set, use the demo kit with ID 1
    const getKitAndLessons = async () => {
      setLoading(true);
      
      try {
        let kit = currentKit;
        if (!kit) {
          kit = await loadKit(1);
        }
        
        if (kit) {
          // Fetch lessons for the kit
          const response = await fetch(`/api/kits/${kit.id}/lessons`);
          if (response.ok) {
            const lessonsData = await response.json();
            setLessons(lessonsData);
          } else {
            toast({
              title: "Lessons Not Found",
              description: "Could not load lessons for this kit.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Kit Not Found",
            description: "No language kit is currently selected.",
            variant: "destructive",
          });
          navigate("/has-kit");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Loading Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    getKitAndLessons();
  }, [currentKit, loadKit, navigate, toast]);
  
  const handleStartLesson = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-white">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col bg-gray-50">
      {/* Mobile Status Bar */}
      <div className="bg-[#5B67F7] px-4 py-2 flex items-center justify-between text-white text-sm">
        <span className="font-medium">9:41</span>
        <div className="flex items-center space-x-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div>

      {/* App Header */}
      <div className="bg-[#5B67F7] px-4 py-4 flex items-center justify-between">
        <img 
          src={chattarLogo} 
          alt="Chattar Logo" 
          className="h-7 object-contain"
          style={{ width: '126px', height: '27px' }}
        />
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={profilePic} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <Menu className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Welcome Text */}
        <div className="px-2">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Tervetuloa<br />
            takaisin, Aino.
          </h2>
        </div>

        {/* Course Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Course Image */}
          <div className="relative h-48 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400">
            {/* Scenic background elements */}
            <div className="absolute inset-0">
              {/* Sky */}
              <div className="w-full h-2/3 bg-gradient-to-b from-blue-100 to-blue-200"></div>
              {/* Water */}
              <div className="w-full h-1/3 bg-gradient-to-b from-blue-400 to-blue-500"></div>
              {/* Buildings silhouette */}
              <div className="absolute bottom-16 left-0 right-0 flex items-end justify-center space-x-1 opacity-60">
                <div className="w-6 h-12 bg-gray-600"></div>
                <div className="w-4 h-16 bg-gray-700"></div>
                <div className="w-8 h-10 bg-gray-600"></div>
                <div className="w-6 h-18 bg-gray-700"></div>
                <div className="w-5 h-14 bg-gray-600"></div>
                <div className="w-7 h-20 bg-gray-700"></div>
              </div>
              {/* People silhouettes */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <div className="w-3 h-8 bg-gray-800 rounded-t-full opacity-70"></div>
                <div className="w-3 h-10 bg-gray-800 rounded-t-full opacity-70"></div>
                <div className="w-3 h-7 bg-gray-800 rounded-t-full opacity-70"></div>
                <div className="w-3 h-9 bg-gray-800 rounded-t-full opacity-70"></div>
              </div>
            </div>

            {/* Lesson Number */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-400">
              <span className="text-xl font-bold text-gray-800">1</span>
            </div>
          </div>
          
          {/* Course Content */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900 leading-tight">Johdatus suomen</p>
                <p className="text-xl font-bold text-gray-900">kieleen vauvoille</p>
              </div>
              <Button 
                onClick={() => navigate("/has-kit")}
                className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-blue-600"
              >
                START
              </Button>
            </div>
          </div>
        </div>
        
        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Review Vocab Card */}
          <button 
            onClick={() => navigate("/offline-vocabulary")}
            className="bg-blue-400 rounded-2xl p-4 text-white relative overflow-hidden text-left"
            style={{ height: '140px' }}
          >
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-xl font-bold leading-tight">Review</h3>
              <h3 className="text-xl font-bold leading-tight">vocab</h3>
            </div>
            {/* Large green bird in bottom right */}
            <img 
              src={greenBird} 
              alt="Green bird" 
              className="absolute bottom-4 right-4 w-16 h-16 z-20 object-contain"
            />
          </button>

          {/* Live Chattar Card */}
          <button 
            onClick={() => navigate("/realtime-translation")}
            className="bg-green-400 rounded-2xl p-4 text-white relative overflow-hidden text-left"
            style={{ height: '140px' }}
          >
            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-xl font-bold leading-tight">Live</h3>
              <h3 className="text-xl font-bold leading-tight">chattar</h3>
            </div>
            {/* Large blue bird in top right */}
            <img 
              src={blueBird} 
              alt="Blue bird" 
              className="absolute top-4 right-4 w-[4.75rem] h-[4.75rem] z-20 object-contain"
            />
          </button>
        </div>
        
        {/* Promotion Card */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🇫🇮</span>
                </div>
                <span className="text-sm font-medium">SUOMI 2</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                  SUPER SPRING SALE!
                </div>
                <div className="text-xs mt-1">MAR 1 - APR 1</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-xs mb-1">UP TO</div>
              <div className="text-3xl font-bold">50% OFF</div>
            </div>
            <Button className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-100">
              CHECK IT OUT
            </Button>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>

        {/* Cultural Image Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="h-48 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl mb-2">🏰</div>
                <p className="text-lg font-semibold">Helsinki Cathedral</p>
                <p className="text-sm opacity-90">Finnish Architecture</p>
              </div>
            </div>
          </div>
          
          {/* Page indicators */}
          <div className="flex justify-center space-x-2 py-3">
            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        
        {/* Available Lessons */}
        {lessons.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Lessons</h3>
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="mb-3 overflow-hidden">
                <div className="flex items-center p-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <span className="font-bold">{lesson.order}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{lesson.title}</h4>
                    <p className="text-xs text-gray-500">{lesson.description || `Lesson ${lesson.order}`}</p>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-[#4ECDC4] hover:bg-[#3dbbb3]"
                    onClick={() => handleStartLesson(lesson.id)}
                  >
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-2 py-3 flex justify-around">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center w-16 text-[#4ECDC4]"
          onClick={() => navigate("/dashboard")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center w-16 text-gray-400"
          onClick={() => {
            if (lessons.length > 0) {
              handleStartLesson(lessons[0].id);
            }
          }}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Cards</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center w-16 text-gray-400"
          onClick={() => navigate("/realtime-translation")}
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs mt-1">Camera</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center w-16 text-gray-400"
          onClick={() => navigate("/offline-vocabulary")}
        >
          <Database className="h-5 w-5" />
          <span className="text-xs mt-1">Vocabulary</span>
        </Button>
      </div>
    </div>
  );
}
