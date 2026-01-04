import { 
  users, 
  kits, 
  cards, 
  vocabularies, 
  lessons, 
  type User, 
  type InsertUser,
  type Kit,
  type InsertKit,
  type Card,
  type InsertCard,
  type Vocabulary,
  type InsertVocabulary,
  type Lesson,
  type InsertLesson
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: number, progress: number): Promise<User | undefined>;
  
  // Kit methods
  getKit(id: number): Promise<Kit | undefined>;
  getKitByQrCode(qrCode: string): Promise<Kit | undefined>;
  createKit(kit: InsertKit): Promise<Kit>;
  
  // Card methods
  getCard(id: number): Promise<Card | undefined>;
  getCardsByKitId(kitId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  
  // Vocabulary methods
  getVocabulary(id: number): Promise<Vocabulary | undefined>;
  getVocabulariesByUserId(userId: number): Promise<Vocabulary[]>;
  createVocabulary(vocabulary: InsertVocabulary): Promise<Vocabulary>;
  updateVocabularyMastered(id: number, mastered: boolean): Promise<Vocabulary | undefined>;
  
  // Lesson methods
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonsByKitId(kitId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private kits: Map<number, Kit>;
  private cards: Map<number, Card>;
  private vocabularies: Map<number, Vocabulary>;
  private lessons: Map<number, Lesson>;
  
  private userIdCounter: number;
  private kitIdCounter: number;
  private cardIdCounter: number;
  private vocabularyIdCounter: number;
  private lessonIdCounter: number;

  constructor() {
    this.users = new Map();
    this.kits = new Map();
    this.cards = new Map();
    this.vocabularies = new Map();
    this.lessons = new Map();
    
    this.userIdCounter = 1;
    this.kitIdCounter = 1;
    this.cardIdCounter = 1;
    this.vocabularyIdCounter = 1;
    this.lessonIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // Initialize with sample data
  private initializeData() {
    // Create a finnish-english kit
    const kit: InsertKit = {
      name: "Finnish Basics",
      description: "Learn basic Finnish phrases and words",
      sourceLanguage: "en",
      targetLanguage: "fi",
      qrCode: "finnish-basics-qr-code"
    };
    const createdKit = this.createKit(kit);
    
    // Create cards for the kit
    const cardsData = [
      { original: "Hello! How are you?", translated: "Hei! Miten menee?" },
      { original: "I'm good, thanks.", translated: "Hyvin kiitos." },
      { original: "What is your name?", translated: "Mikä sinun nimesi on?" },
      { original: "My name is...", translated: "Nimeni on..." },
      { original: "Nice to meet you", translated: "Hauska tavata" },
      { original: "Where are you from?", translated: "Mistä olet kotoisin?" },
      { original: "I am from...", translated: "Olen kotoisin..." },
      { original: "Excuse me", translated: "Anteeksi" },
      { original: "Thank you", translated: "Kiitos" },
      { original: "You're welcome", translated: "Ole hyvä" }
    ];
    
    const createdCards: Card[] = [];
    cardsData.forEach((cardData, index) => {
      const card: InsertCard = {
        kitId: createdKit.id,
        originalPhrase: cardData.original,
        translatedPhrase: cardData.translated,
        category: "Greetings",
        difficulty: Math.floor(index / 3) + 1
      };
      createdCards.push(this.createCard(card));
    });
    
    // Create lessons
    const lesson1: InsertLesson = {
      kitId: createdKit.id,
      title: "Greetings and Introductions",
      description: "Learn basic Finnish greetings",
      order: 1,
      cards: createdCards.slice(0, 5).map(card => card.id)
    };
    this.createLesson(lesson1);
    
    const lesson2: InsertLesson = {
      kitId: createdKit.id,
      title: "Personal Information",
      description: "Learn how to share personal information",
      order: 2,
      cards: createdCards.slice(5).map(card => card.id)
    };
    this.createLesson(lesson2);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProgress(userId: number, progress: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, progress };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Kit methods
  async getKit(id: number): Promise<Kit | undefined> {
    return this.kits.get(id);
  }
  
  async getKitByQrCode(qrCode: string): Promise<Kit | undefined> {
    return Array.from(this.kits.values()).find(
      (kit) => kit.qrCode === qrCode,
    );
  }
  
  async createKit(insertKit: InsertKit): Promise<Kit> {
    const id = this.kitIdCounter++;
    const kit: Kit = { ...insertKit, id };
    this.kits.set(id, kit);
    return kit;
  }
  
  // Card methods
  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }
  
  async getCardsByKitId(kitId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.kitId === kitId,
    );
  }
  
  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    const card: Card = { ...insertCard, id };
    this.cards.set(id, card);
    return card;
  }
  
  // Vocabulary methods
  async getVocabulary(id: number): Promise<Vocabulary | undefined> {
    return this.vocabularies.get(id);
  }
  
  async getVocabulariesByUserId(userId: number): Promise<Vocabulary[]> {
    return Array.from(this.vocabularies.values()).filter(
      (vocabulary) => vocabulary.userId === userId,
    );
  }
  
  async createVocabulary(insertVocabulary: InsertVocabulary): Promise<Vocabulary> {
    const id = this.vocabularyIdCounter++;
    const vocabulary: Vocabulary = { 
      ...insertVocabulary, 
      id, 
      savedAt: new Date() 
    };
    this.vocabularies.set(id, vocabulary);
    return vocabulary;
  }
  
  async updateVocabularyMastered(id: number, mastered: boolean): Promise<Vocabulary | undefined> {
    const vocabulary = await this.getVocabulary(id);
    if (!vocabulary) return undefined;
    
    const updatedVocabulary: Vocabulary = { ...vocabulary, mastered };
    this.vocabularies.set(id, updatedVocabulary);
    return updatedVocabulary;
  }
  
  // Lesson methods
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async getLessonsByKitId(kitId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((lesson) => lesson.kitId === kitId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }
}

export const storage = new MemStorage();
