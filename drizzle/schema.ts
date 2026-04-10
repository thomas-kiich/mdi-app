import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Vom Nutzer eingegebener Vorname für persönliche Anrede in MA-Summaries */
  vorname: varchar("vorname", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Newsletter subscribers table – DSGVO-konform.
 *
 * Double-Opt-In Ablauf:
 * 1. Nutzer trägt sich ein → active=false, confirmToken gesetzt, Bestätigungs-E-Mail gesendet
 * 2. Nutzer klickt Bestätigungslink → active=true, confirmedAt gesetzt, confirmToken gelöscht
 *
 * Löschrecht (Art. 17 DSGVO):
 * - deleteToken ermöglicht tokenbasierte Datenlöschung ohne Login
 *
 * Einwilligungsnachweis (Art. 7 DSGVO):
 * - signupIp und confirmedAt dokumentieren Zeitpunkt und Herkunft der Einwilligung
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  /** Source of signup: 'website', 'podcast', etc. */
  source: varchar("source", { length: 64 }).default("website"),

  /** DSGVO: Double-Opt-In – erst nach Bestätigung aktiv */
  active: boolean("active").default(false).notNull(),

  /** DSGVO: Token für E-Mail-Bestätigung (wird nach Bestätigung gelöscht) */
  confirmToken: varchar("confirmToken", { length: 128 }),

  /** DSGVO: Zeitpunkt der Bestätigung (Einwilligungsnachweis) */
  confirmedAt: timestamp("confirmedAt"),

  /** DSGVO: Token für Abmeldung / Datenlöschung per Link */
  deleteToken: varchar("deleteToken", { length: 128 }),

  /** DSGVO: IP-Adresse bei Anmeldung (Einwilligungsnachweis, Art. 7) */
  signupIp: varchar("signupIp", { length: 45 }),

  /** Whether the welcome email has been sent */
  welcomeEmailSent: boolean("welcomeEmailSent").default(false).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * MOMENTAUFNAHME – Sprachnotizen
 * Jede Aufnahme wird transkribiert, einem Gravitationszentrum zugeordnet
 * und als Obsidian-Markdown exportierbar gespeichert.
 */
export const momentaufnahmen = mysqlTable("momentaufnahmen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Transkribierter Text der Sprachaufnahme */
  text: text("text").notNull(),
  /** KI-zugeordnetes Gravitationszentrum: ICH | QUELL | KONZEPT | PROJEKT | DIALOG | WELT */
  kategorie: mysqlEnum("kategorie", ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"]).default("QUELL").notNull(),
  /** Kurze KI-generierte Zusammenfassung (1 Satz) */
  zusammenfassung: text("zusammenfassung"),
  /** S3-URL der Originalaudio-Datei */
  audioUrl: varchar("audioUrl", { length: 512 }),
  /** Dauer der Aufnahme in Sekunden */
  dauerSekunden: int("dauerSekunden"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Momentaufnahme = typeof momentaufnahmen.$inferSelect;
export type InsertMomentaufnahme = typeof momentaufnahmen.$inferInsert;

/**
 * API-Tokens für externe Integrationen (z.B. Obsidian Plugin)
 * Jeder Nutzer kann mehrere benannte Tokens erstellen und widerrufen.
 */
export const apiTokens = mysqlTable("api_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Sicherer zufälliger Token (64 Hex-Zeichen) */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** Nutzer-definierter Name (z.B. "Obsidian MacBook") */
  name: varchar("name", { length: 128 }).notNull(),
  /** Letzter Verwendungszeitpunkt */
  lastUsedAt: timestamp("lastUsedAt"),
  /** Widerrufszeitpunkt – null = aktiv */
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = typeof apiTokens.$inferInsert;

/**
 * Premium-Freischaltungen – Admin-Schalter
 * Steuert welche Premium-Bereiche auf der Website zugänglich sind.
 * Wird vom Admin per Klick im Admin-Panel gesteuert.
 */
export const premiumSettings = mysqlTable("premium_settings", {
  id: int("id").autoincrement().primaryKey(),
  /** Eindeutiger Schlüssel des Bereichs: 'momentaufnahme' | 'befindlichkeitstraining' | 'trainingscenter' */
  feature: varchar("feature", { length: 64 }).notNull().unique(),
  /** true = freigeschaltet, false = gesperrt */
  enabled: boolean("enabled").default(false).notNull(),
  /** Optionale Notiz für den Admin */
  note: text("note"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumSetting = typeof premiumSettings.$inferSelect;
export type InsertPremiumSetting = typeof premiumSettings.$inferInsert;

/**
 * EINSCHLAF-BIBLIOTHEK
 * KI-generierte Einschlaf-Geschichten in drei Kategorien:
 * - MAERCHEN: Personalisierte Märchen für Kinder/Jugendliche
 * - ABENTEUER: Held-Metaphern für Erwachsene (individuelle Aufgabenstellung als Heldenreise)
 * - BEFINDLICHKEIT: Thematische Einschlaf-Metaphern (Angst, Beziehung, Zukunft etc.)
 */
export const einschlafBibliothek = mysqlTable("einschlaf_bibliothek", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Kategorie der Geschichte */
  kategorie: mysqlEnum("kategorie", ["MAERCHEN", "ABENTEUER", "BEFINDLICHKEIT"]).notNull(),
  /** Zielgruppe */
  zielgruppe: mysqlEnum("zielgruppe", ["KIND", "JUGENDLICHER", "ERWACHSENER"]).default("ERWACHSENER").notNull(),
  /** Thema/Unterkategorie z.B. 'Angst vor der Zukunft', 'Beziehungssorgen', 'Prüfungsangst' */
  thema: varchar("thema", { length: 128 }).notNull(),
  /** Optionaler Personalisierungstext (z.B. konkrete Herausforderung des Users) */
  personalisierung: text("personalisierung"),
  /** KI-generierter Titel der Geschichte */
  titel: varchar("titel", { length: 256 }).notNull(),
  /** Vollständiger KI-generierter Text */
  text: text("text").notNull(),
  /** S3-URL der ElevenLabs-Audio-Datei (optional, wird beim ersten Abspielen generiert) */
  audioUrl: varchar("audioUrl", { length: 512 }),
  /** Dauer in Sekunden (nach Audio-Generierung gesetzt) */
  dauerSekunden: int("dauerSekunden"),
  /** Favorit des Users */
  favorit: boolean("favorit").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EinschlafBibliothek = typeof einschlafBibliothek.$inferSelect;
export type InsertEinschlafBibliothek = typeof einschlafBibliothek.$inferInsert;
