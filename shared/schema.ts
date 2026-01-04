import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  progress: integer("progress").default(0),
  preferredLanguage: text("preferred_language").default("en"),
  targetLanguage: text("target_language").default("fi"),
});

export const kits = pgTable("kits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  qrCode: text("qr_code").notNull().unique(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  kitId: integer("kit_id").notNull(),
  originalPhrase: text("original_phrase").notNull(),
  translatedPhrase: text("translated_phrase").notNull(),
  category: text("category"),
  difficulty: integer("difficulty").default(1),
});

export const vocabularies = pgTable("vocabularies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardId: integer("card_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
  mastered: boolean("mastered").default(false),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  kitId: integer("kit_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  cards: jsonb("cards").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  preferredLanguage: true,
  targetLanguage: true,
});

export const insertKitSchema = createInsertSchema(kits).pick({
  name: true,
  description: true,
  sourceLanguage: true,
  targetLanguage: true,
  qrCode: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  kitId: true,
  originalPhrase: true,
  translatedPhrase: true,
  category: true,
  difficulty: true,
});

export const insertVocabularySchema = createInsertSchema(vocabularies).pick({
  userId: true,
  cardId: true,
  mastered: true,
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  kitId: true,
  title: true,
  description: true,
  order: true,
  cards: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertKit = z.infer<typeof insertKitSchema>;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type User = typeof users.$inferSelect;
export type Kit = typeof kits.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Vocabulary = typeof vocabularies.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
