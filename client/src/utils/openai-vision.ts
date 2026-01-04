import { apiRequest } from "@/lib/queryClient";

// Language display names for the UI
export const languageNames: Record<string, string> = {
  fi: "Finnish",
  ru: "Russian", 
  fr: "French",
  es: "Spanish"
};

// Interface for detected objects with OpenAI
export interface DetectedObject {
  object: string;
  translation: string;
  exampleSentence: string;
  sentenceTranslation: string;
  position: { x: number; y: number };
  confidence: number;
}

/**
 * Detect objects using OpenAI GPT-4 Vision API
 * @param imageDataUrl Base64 image data URL
 * @param targetLanguage Target language code (e.g., 'fi' for Finnish)
 * @returns Array of detected objects with translations
 */
export async function detectObjectsWithOpenAI(
  imageDataUrl: string,
  targetLanguage: string = 'fi'
): Promise<DetectedObject[]> {
  try {
    const response = await apiRequest<{ objects: DetectedObject[] }>({
      url: "/api/openai-vision",
      method: "POST",
      body: JSON.stringify({
        image: imageDataUrl,
        targetLanguage
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.objects || [];
  } catch (error) {
    console.error("Error detecting objects with OpenAI:", error);
    return [];
  }
}