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

/**
 * Gespeicherte Tages-Summaries — damit das letzte Summary beim nächsten Öffnen sofort sichtbar ist.
 * Pro User wird immer nur das letzte Summary gespeichert (upsert auf userId).
 */
export const tagesSummaries = mysqlTable("tages_summaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  text: text("text").notNull(),
  datum: varchar("datum", { length: 100 }).notNull(),
  /** ISO-Datum YYYY-MM-DD für Archiv-Abfragen und Upsert-Logik */
  datumISO: varchar("datumISO", { length: 10 }).notNull().default("2026-01-01"),
  anzahlAufnahmen: int("anzahlAufnahmen").default(0).notNull(),
  /** Strategisches Summary (Aufgaben/To-Dos nach Gravitationszentren) */
  strategischesText: text("strategischesText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TagesSummary = typeof tagesSummaries.$inferSelect;
export type InsertTagesSummary = typeof tagesSummaries.$inferInsert;

/**
 * TTS-Nutzungslog — erfasst alle Google Cloud TTS Aufrufe.
 * Dient zur Überwachung des monatlichen Zeichenkontingents (1 Mio. gratis).
 * Alle User zusammen teilen das Kontingent → globale Auswertung nötig.
 */
export const ttsNutzungslog = mysqlTable("tts_nutzungslog", {
  id: int("id").autoincrement().primaryKey(),
  /** User-ID (null = System-Aufruf) */
  userId: int("userId"),
  /** Anzahl der verarbeiteten Zeichen */
  zeichen: int("zeichen").notNull(),
  /** Kontext: 'einschlaf_bibliothek' | 'momentaufnahme' | 'sonstige' */
  kontext: varchar("kontext", { length: 64 }).notNull().default("sonstige"),
  /** Stimme (für spätere Auswertung bei Stimmwechsel) */
  stimme: varchar("stimme", { length: 64 }).default("de-DE-Chirp3-HD-Zephyr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TtsNutzungslog = typeof ttsNutzungslog.$inferSelect;
export type InsertTtsNutzungslog = typeof ttsNutzungslog.$inferInsert;

/**
 * EMPFEHLUNGSSYSTEM (Referral)
 * Jeder User hat einen eindeutigen Einladungscode.
 * Wenn jemand über diesen Code beitritt, wird die Verbindung gespeichert
 * und der Einladende erhält eine Benachrichtigung.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** User der die Einladung ausgesprochen hat */
  referrerId: int("referrerId").notNull(),
  /** User der über den Einladungslink beigetreten ist */
  referredUserId: int("referredUserId").notNull().unique(),
  /** Zeitpunkt des Beitritts */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Einladungscodes – ein Code pro User, wird beim ersten Abruf generiert.
 * Der Code ist ein kurzer alphanumerischer String (8 Zeichen).
 */
export const einladungsCodes = mysqlTable("einladungs_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Eindeutiger Einladungscode (8 alphanumerische Zeichen) */
  code: varchar("code", { length: 16 }).notNull().unique(),
  /** Anzahl der erfolgreichen Einladungen */
  anzahlEinladungen: int("anzahlEinladungen").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EinladungsCode = typeof einladungsCodes.$inferSelect;
export type InsertEinladungsCode = typeof einladungsCodes.$inferInsert;

/**
 * FAQ-Fragen – öffentlich einreichbar, von Admin beantwortbar.
 * Workflow:
 * 1. Nutzer stellt Frage (name optional, email optional) → status: "offen"
 * 2. Admin beantwortet → status: "beantwortet", antwort gesetzt
 * 3. Öffentliche FAQ-Seite zeigt nur beantwortete Fragen
 */
export const faqFragen = mysqlTable("faq_fragen", {
  id: int("id").autoincrement().primaryKey(),
  /** Name des Fragestellers (optional) */
  name: varchar("name", { length: 128 }),
  /** E-Mail des Fragestellers (optional, für Benachrichtigung) */
  email: varchar("email", { length: 320 }),
  /** Die gestellte Frage */
  frage: text("frage").notNull(),
  /** Antwort von Thomas/Admin */
  antwort: text("antwort"),
  /** Status: offen | beantwortet | archiviert */
  status: mysqlEnum("status", ["offen", "beantwortet", "archiviert"]).default("offen").notNull(),
  /** Soll diese Frage öffentlich in der FAQ erscheinen? */
  oeffentlich: boolean("oeffentlich").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaqFrage = typeof faqFragen.$inferSelect;
export type InsertFaqFrage = typeof faqFragen.$inferInsert;

/**
 * ABONNEMENT-SYSTEM
 *
 * Vier Ebenen:
 * - free:      kostenlos | max. 10 Aufnahmen/Monat | kein TTS | kein Schlaf-Modus | kein Summary
 * - essential: € 9,90/Monat | unbegrenzte Aufnahmen | Reflexions-Summary | Obsidian-Export | TTS
 * - complete:  € 19,90/Monat | alles + Strategisches Summary | YOHN-Training | MDI-Analyse | Archiv
 * - pro:       € 49,90/Monat | alles + persönliche MDI-Stimmklanganalyse | individuelle Trainingsempfehlungen
 *
 * Beta-Phase:
 * - beta: kostenloser Vollzugang (= complete) für eingeladene Beta-Nutzer
 *
 * Status-Lifecycle:
 *   trial → active (nach Zahlung) | trial → expired (nach 7 Tagen ohne Zahlung)
 *   active → cancelled (Kündigung, läuft bis Periodenende) | active → expired
 *
 * Stripe-Integration: stripeCustomerId und stripeSubscriptionId werden nach
 * erfolgreicher Zahlung gesetzt. Bis dahin null (Trial/Beta-Phase).
 */
export const abonnements = mysqlTable("abonnements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Aktuelle Ebene: free | essential | complete | pro | beta */
  ebene: mysqlEnum("ebene", ["free", "essential", "complete", "pro", "beta"]).default("free").notNull(),
  /** Status des Abonnements */
  status: mysqlEnum("status", ["trial", "active", "cancelled", "expired", "beta"]).default("trial").notNull(),
  /** Beginn der 7-Tage-Testphase (= Registrierungszeitpunkt) */
  trialStartedAt: timestamp("trialStartedAt").defaultNow().notNull(),
  /** Ende der Testphase (trialStartedAt + 7 Tage) */
  trialEndsAt: timestamp("trialEndsAt").notNull(),
  /** Beginn des aktuellen Abrechnungszeitraums (nach Trial) */
  currentPeriodStart: timestamp("currentPeriodStart"),
  /** Ende des aktuellen Abrechnungszeitraums */
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  /** Stripe Customer ID (nach erster Zahlung gesetzt) */
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  /** Stripe Subscription ID (nach erster Zahlung gesetzt) */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Abonnement = typeof abonnements.$inferSelect;
export type InsertAbonnement = typeof abonnements.$inferInsert;

/**
 * NUTZUNGSLIMITS – Rate-Limiting pro User und Monat
 * 
 * Wird bei jeder Aufnahme und TTS-Generierung geprüft und inkrementiert.
 * Limits nach Ebene:
 * - Ebene I:   3 Aufnahmen/Monat, 0 TTS-Generierungen, kein Schlaf-Modus
 * - Ebene II:  9 Aufnahmen/Monat, 20 TTS-Generierungen, Schlaf-Modus
 * - Ebene III: unbegrenzt (999999)
 * - Trial:     wie Ebene III (voller Zugang für 7 Tage)
 */
export const nutzungsLimits = mysqlTable("nutzungs_limits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Abrechnungsmonat im Format YYYY-MM */
  monat: varchar("monat", { length: 7 }).notNull(),
  /** Anzahl erstellter Aufnahmen in diesem Monat */
  aufnahmenCount: int("aufnahmenCount").default(0).notNull(),
  /** Anzahl TTS-Generierungen (MA-Stimme) in diesem Monat */
  ttsCount: int("ttsCount").default(0).notNull(),
  /** Anzahl generierter Einschlaf-Geschichten in diesem Monat */
  geschichtenCount: int("geschichtenCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NutzungsLimit = typeof nutzungsLimits.$inferSelect;
export type InsertNutzungsLimit = typeof nutzungsLimits.$inferInsert;

/**
 * BETA-EINLADUNGEN
 *
 * Einladungscodes für die geschlossene Beta-Phase.
 * Admin generiert Codes, Nutzer lösen sie ein und erhalten Beta-Zugang (= complete).
 *
 * Workflow:
 * 1. Admin erstellt Code (optional mit Ziel-E-Mail und Notiz)
 * 2. Nutzer gibt Code beim Login/Profil ein
 * 3. Abonnement wird auf ebene=beta, status=beta gesetzt
 * 4. Beta-Zugang gilt bis betaEndsAt (Standard: 60 Tage)
 */
export const betaInvites = mysqlTable("beta_invites", {
  id: int("id").autoincrement().primaryKey(),
  /** Eindeutiger Einladungscode (z.B. KIICH-BETA-XXXX) */
  code: varchar("code", { length: 32 }).notNull().unique(),
  /** Optionale Ziel-E-Mail (nur zur Information, kein Pflichtfeld) */
  email: varchar("email", { length: 320 }),
  /** Optionale Notiz für den Admin (z.B. Name des Eingeladenen) */
  notiz: varchar("notiz", { length: 256 }),
  /** User-ID des Einlösenden (null = noch nicht eingelöst) */
  usedByUserId: int("usedByUserId"),
  /** Zeitpunkt der Einlösung */
  usedAt: timestamp("usedAt"),
  /** Ablaufdatum des Beta-Zugangs (Standard: 60 Tage nach Einlösung) */
  betaEndsAt: timestamp("betaEndsAt"),
  /** Ist der Code noch gültig? (Admin kann deaktivieren) */
  aktiv: boolean("aktiv").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BetaInvite = typeof betaInvites.$inferSelect;
export type InsertBetaInvite = typeof betaInvites.$inferInsert;
