import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVocabularySchema,
} from "@shared/schema";
import { z } from "zod";
import { handleImageAnalysis } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for user operations
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(validatedData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        progress: user.progress,
        preferredLanguage: user.preferredLanguage,
        targetLanguage: user.targetLanguage
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // API routes for kit operations
  app.get("/api/kits/qr/:qrCode", async (req: Request, res: Response) => {
    try {
      const { qrCode } = req.params;
      
      if (!qrCode) {
        return res.status(400).json({ message: "QR code is required" });
      }
      
      const kit = await storage.getKitByQrCode(qrCode);
      
      if (!kit) {
        return res.status(404).json({ message: "Kit not found" });
      }
      
      return res.status(200).json(kit);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/kits/:id", async (req: Request, res: Response) => {
    try {
      const kitId = parseInt(req.params.id);
      
      if (isNaN(kitId)) {
        return res.status(400).json({ message: "Invalid kit ID" });
      }
      
      const kit = await storage.getKit(kitId);
      
      if (!kit) {
        return res.status(404).json({ message: "Kit not found" });
      }
      
      return res.status(200).json(kit);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // API routes for lesson operations
  app.get("/api/kits/:kitId/lessons", async (req: Request, res: Response) => {
    try {
      const kitId = parseInt(req.params.kitId);
      
      if (isNaN(kitId)) {
        return res.status(400).json({ message: "Invalid kit ID" });
      }
      
      const lessons = await storage.getLessonsByKitId(kitId);
      return res.status(200).json(lessons);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/lessons/:id", async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.id);
      
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      return res.status(200).json(lesson);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // API routes for card operations
  app.get("/api/cards/:id", async (req: Request, res: Response) => {
    try {
      const cardId = parseInt(req.params.id);
      
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }
      
      const card = await storage.getCard(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      return res.status(200).json(card);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/kits/:kitId/cards", async (req: Request, res: Response) => {
    try {
      const kitId = parseInt(req.params.kitId);
      
      if (isNaN(kitId)) {
        return res.status(400).json({ message: "Invalid kit ID" });
      }
      
      const cards = await storage.getCardsByKitId(kitId);
      return res.status(200).json(cards);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // API routes for vocabulary operations
  app.post("/api/vocabularies", async (req: Request, res: Response) => {
    try {
      const validatedData = insertVocabularySchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if card exists
      const card = await storage.getCard(validatedData.cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Create new vocabulary
      const newVocabulary = await storage.createVocabulary(validatedData);
      return res.status(201).json(newVocabulary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vocabulary data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:userId/vocabularies", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const vocabularies = await storage.getVocabulariesByUserId(userId);
      
      // Get corresponding card details for each vocabulary item
      const vocabulariesWithCards = await Promise.all(
        vocabularies.map(async (vocabulary) => {
          const card = await storage.getCard(vocabulary.cardId);
          return {
            ...vocabulary,
            card
          };
        })
      );
      
      return res.status(200).json(vocabulariesWithCards);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/vocabularies/:id/mastered", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { mastered } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vocabulary ID" });
      }
      
      if (typeof mastered !== 'boolean') {
        return res.status(400).json({ message: "Mastered field must be a boolean" });
      }
      
      const updatedVocabulary = await storage.updateVocabularyMastered(id, mastered);
      
      if (!updatedVocabulary) {
        return res.status(404).json({ message: "Vocabulary not found" });
      }
      
      return res.status(200).json(updatedVocabulary);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Translation API mock endpoint
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;
      
      if (!text || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ 
          message: "Text, source language, and target language are required" 
        });
      }
      
      // Simple dictionary for demo purposes
      const finnishToEnglish: Record<string, string> = {
        "Hei": "Hello",
        "Miten menee?": "How are you?",
        "Hyvin kiitos": "I'm good, thanks",
        "Nimeni on": "My name is",
        "Olen hyvä": "I'm good",
        "Hauska tavata": "Nice to meet you",
        "Kiitos": "Thank you"
      };
      
      const englishToFinnish: Record<string, string> = {
        "Hello": "Hei",
        "How are you?": "Miten menee?",
        "I'm good, thanks": "Hyvin kiitos",
        "My name is": "Nimeni on",
        "I'm good": "Olen hyvä",
        "Nice to meet you": "Hauska tavata",
        "Thank you": "Kiitos"
      };
      
      let translation = "";
      
      if (sourceLanguage === "fi" && targetLanguage === "en") {
        translation = finnishToEnglish[text] || "Translation not available";
      } else if (sourceLanguage === "en" && targetLanguage === "fi") {
        translation = englishToFinnish[text] || "Käännös ei saatavilla";
      } else {
        translation = "Unsupported language pair";
      }
      
      return res.status(200).json({ translation });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Image analysis API endpoint
  app.post("/api/analyze-image", handleImageAnalysis);

  // OpenAI Vision API endpoint
  app.post("/api/openai-vision", async (req: Request, res: Response) => {
    try {
      const { image, targetLanguage } = req.body;
      
      if (!image || !targetLanguage) {
        return res.status(400).json({ error: "Missing image or targetLanguage" });
      }

      // Language names for the prompt
      const languageNames: Record<string, string> = {
        fi: "Finnish",
        ru: "Russian", 
        fr: "French",
        es: "Spanish"
      };

      const languageName = languageNames[targetLanguage] || "Finnish";

      // Call OpenAI GPT-4 Vision API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image and identify up to 3 common objects visible in the scene. For each object, provide:
1. The object name in English
2. Translation to ${languageName}
3. A simple example sentence using the object in ${languageName}
4. English translation of that sentence
5. Estimated position (x, y coordinates from 0-1 representing relative position in image)

Exclude people from the results. Focus on everyday objects like furniture, food, electronics, etc.

Respond in JSON format:
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
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      res.json(result);
    } catch (error) {
      console.error("OpenAI vision error:", error);
      res.status(500).json({ error: "Failed to analyze image with OpenAI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
