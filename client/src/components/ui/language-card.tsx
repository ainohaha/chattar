import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Speaker, BookmarkPlus, BookmarkCheck } from "lucide-react";

interface LanguageCardProps {
  originalPhrase: string;
  translatedPhrase: string;
  onPronounce?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  className?: string;
  responseOptions?: Array<{
    text: string;
    translation: string;
    onSelect?: () => void;
  }>;
}

export function LanguageCard({
  originalPhrase,
  translatedPhrase,
  onPronounce,
  onSave,
  isSaved = false,
  className,
  responseOptions,
}: LanguageCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3 flex-shrink-0">
              <div className="h-5 w-5" />
            </div>
            <div className="flex-grow">
              <p className="text-green-500 font-medium mb-1">{originalPhrase}</p>
              <p className="text-gray-500 text-sm">{translatedPhrase}</p>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            {onPronounce && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={onPronounce}
              >
                <Speaker className="h-4 w-4" />
                Listen
              </Button>
            )}
            
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={onSave}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {responseOptions && responseOptions.length > 0 && (
        <div className="mt-4">
          <p className="text-white font-medium mb-2">Practice your response:</p>
          <div className="grid grid-cols-2 gap-3">
            {responseOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl text-white text-sm flex flex-col items-center"
                onClick={option.onSelect}
              >
                <span>{option.text}</span>
                <span className="text-xs text-white/70">{option.translation}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
