import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Kit {
  id: number;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  qrCode: string;
}

interface Card {
  id: number;
  kitId: number;
  originalPhrase: string;
  translatedPhrase: string;
  category?: string;
  difficulty: number;
}

interface Lesson {
  id: number;
  kitId: number;
  title: string;
  description?: string;
  order: number;
  cards: number[]; // Array of card IDs
}

interface Vocabulary {
  id: number;
  userId: number;
  cardId: number;
  savedAt: string;
  mastered: boolean;
  card?: Card;
}

interface LessonContextType {
  currentKit: Kit | null;
  currentLesson: Lesson | null;
  currentCard: Card | null;
  vocabulary: Vocabulary[];
  isLoading: boolean;
  loadKit: (kitId: number) => Promise<Kit | null>;
  loadKitByQrCode: (qrCode: string) => Promise<Kit | null>;
  loadLesson: (lessonId: number) => Promise<Lesson | null>;
  loadCard: (cardId: number) => Promise<Card | null>;
  saveToVocabulary: (userId: number, cardId: number) => Promise<void>;
  loadVocabulary: (userId: number) => Promise<Vocabulary[]>;
  setCurrentCard: (card: Card | null) => void;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonProvider({ children }: { children: ReactNode }) {
  const [currentKit, setCurrentKit] = useState<Kit | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const loadKit = async (kitId: number): Promise<Kit | null> => {
    try {
      const response = await fetch(`/api/kits/${kitId}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const kitData = await response.json();
        setCurrentKit(kitData);
        return kitData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading kit:", error);
      return null;
    }
  };
  
  const loadKitByQrCode = async (qrCode: string): Promise<Kit | null> => {
    try {
      const response = await fetch(`/api/kits/qr/${qrCode}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const kitData = await response.json();
        setCurrentKit(kitData);
        return kitData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading kit by QR code:", error);
      return null;
    }
  };
  
  const loadLesson = async (lessonId: number): Promise<Lesson | null> => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const lessonData = await response.json();
        setCurrentLesson(lessonData);
        return lessonData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading lesson:", error);
      return null;
    }
  };
  
  const loadCard = async (cardId: number): Promise<Card | null> => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const cardData = await response.json();
        setCurrentCard(cardData);
        return cardData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading card:", error);
      return null;
    }
  };
  
  const saveVocabularyMutation = useMutation({
    mutationFn: async (data: { userId: number; cardId: number }) => {
      const response = await apiRequest("POST", "/api/vocabularies", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/vocabularies`] });
      toast({
        title: "Saved to Vocabulary",
        description: "Card has been saved to your vocabulary bank.",
      });
      
      // Update local vocabulary state
      loadVocabulary(data.userId);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save to vocabulary. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const saveToVocabulary = async (userId: number, cardId: number) => {
    await saveVocabularyMutation.mutateAsync({ userId, cardId });
  };
  
  const loadVocabulary = async (userId: number): Promise<Vocabulary[]> => {
    try {
      const response = await fetch(`/api/users/${userId}/vocabularies`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const vocabularyData = await response.json();
        setVocabulary(vocabularyData);
        return vocabularyData;
      }
      
      return [];
    } catch (error) {
      console.error("Error loading vocabulary:", error);
      return [];
    }
  };
  
  return (
    <LessonContext.Provider
      value={{
        currentKit,
        currentLesson,
        currentCard,
        vocabulary,
        isLoading: false,
        loadKit,
        loadKitByQrCode,
        loadLesson,
        loadCard,
        saveToVocabulary,
        loadVocabulary,
        setCurrentCard,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error("useLesson must be used within a LessonProvider");
  }
  return context;
}
