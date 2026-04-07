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
