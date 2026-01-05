import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";

export async function analyzeImage(imageBase64: string, targetLanguage: string = 'fi') {
  if (!process.env.OPENAI_API_KEY) {
    console.log("No OPENAI_API_KEY found, using mock data");
    return {
      objects: [
        {
          object: "Coffee Cup",
          translation: targetLanguage === 'fi' ? "Kahvikuppi" : "Coffee Cup",
          exampleSentence: targetLanguage === 'fi' ? "Minulla on kahvikuppi." : "I have a coffee cup.",
          sentenceTranslation: "I have a coffee cup.",
          position: { x: 0.5, y: 0.5 },
          confidence: 0.95
        }
      ]
    };
  }

  try {
    const prompt = `Analyze this image and identify ONLY the single most prominent object in the foreground (e.g. held in hand or centered). For this object, provide:
1. The object name in English
2. Translation to ${targetLanguage}
3. A simple example sentence using the object in ${targetLanguage}
4. English translation of that sentence
5. Estimated position (x, y coordinates from 0-1 representing relative position in image)

Exclude people, background items, and minor details. Focus strictly on the main subject.

Respond in strict JSON format:
{
  "objects": [
    {
      "object": "object_name",
      "translation": "translated_name",
      "exampleSentence": "sentence_in_target_language",
      "sentenceTranslation": "sentence_in_english", 
      "position": {"x": 0.5, "y": 0.3},
      "confidence": 0.9
    }
  ]
}`;

    // Ensure base64 string is just the data
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${cleanBase64}`,
                detail: "low"
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");

    const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("OpenAI analysis failed:", error);
    throw error;
  }
}