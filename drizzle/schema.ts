import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

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

/**
 * ERLEDIGUNGEN – kurzfristige Aufgaben/To-Dos
 * Manuell eingetragen oder aus KI-Strategie übernommen.
 * Können als erledigt markiert und gelöscht werden.
 */
export const erledigungen = mysqlTable("erledigungen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Text der Aufgabe */
  text: text("text").notNull(),
  /** Gravitationszentrum (optional, aus Strategie-Analyse übernommen) */
  kategorie: mysqlEnum("kategorie", ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"]).default("PROJEKT"),
  /** true = erledigt */
  erledigt: boolean("erledigt").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Erledigung = typeof erledigungen.$inferSelect;
export type InsertErledigung = typeof erledigungen.$inferInsert;

/**
 * VISIONEN – langfristige Ziele
 * Manuell eingetragen, dauerhaft gespeichert.
 */
export const visionen = mysqlTable("visionen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Text der Vision */
  text: text("text").notNull(),
  /** Optionale Kategorie */
  kategorie: mysqlEnum("kategorie", ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"]).default("QUELL"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vision = typeof visionen.$inferSelect;
export type InsertVision = typeof visionen.$inferInsert;

/**
 * ERINNERUNGEN – zeitbasierte Benachrichtigungen
 * Nutzer spricht oder tippt eine Erinnerung mit Zeitangabe.
 * MA extrahiert Zeit + Inhalt per LLM und speichert sie.
 * Zum Fälligkeitszeitpunkt erscheint ein Popup + MA liest vor.
 */
export const erinnerungen = mysqlTable("erinnerungen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Inhalt der Erinnerung (z.B. "Max anrufen") */
  text: text("text").notNull(),
  /** Originaler Sprachbefehl des Nutzers */
  originalText: text("originalText"),
  /** Fälligkeitszeitpunkt als UTC-Timestamp (ms) – bigint wegen ms-Größe */
  faelligkeitMs: bigint("faelligkeitMs", { mode: "number" }).notNull(),
  /** true = bereits ausgelöst/angezeigt */
  ausgeloest: boolean("ausgeloest").default(false).notNull(),
  /** true = vom Nutzer bestätigt/gelöscht */
  bestaetigt: boolean("bestaetigt").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Erinnerung = typeof erinnerungen.$inferSelect;
export type InsertErinnerung = typeof erinnerungen.$inferInsert;

/**
 * PUSH_SUBSCRIPTIONS – Web Push Notification Subscriptions
 * Speichert die Browser-Push-Subscription pro Nutzer/Gerät.
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Push-Endpoint URL des Browsers */
  endpoint: text("endpoint").notNull(),
  /** P256DH Key */
  p256dh: text("p256dh").notNull(),
  /** Auth Key */
  auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * EINKAUFSLISTE – persönliche Einkaufsliste
 * Artikel hinzufügen, abhaken, löschen.
 * MA kann die Liste vorlesen.
 */
export const einkaufsliste = mysqlTable("einkaufsliste", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Name des Artikels (z.B. "Milch", "Äpfel") */
  artikel: text("artikel").notNull(),
  /** Optionale Menge/Einheit (z.B. "2 Liter", "1 kg") */
  menge: varchar("menge", { length: 64 }),
  /** true = bereits in den Einkaufswagen gelegt / gekauft */
  gekauft: boolean("gekauft").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Einkaufsliste = typeof einkaufsliste.$inferSelect;
export type InsertEinkaufsliste = typeof einkaufsliste.$inferInsert;

/**
 * RECHTS_AUFGABEN – Wiederkehrende Rechtspflichten
 * Monatliche Checkliste für Datenschutz, Impressum, KI-Rechtsänderungen.
 * MA prüft und analysiert automatisch.
 */
export const rechtsAufgaben = mysqlTable("rechts_aufgaben", {
  id: int("id").autoincrement().primaryKey(),
  /** Kategorie: datenschutz | impressum | ki_recht | nutzungsbedingungen | sonstiges */
  kategorie: mysqlEnum("kategorie", ["datenschutz", "impressum", "ki_recht", "nutzungsbedingungen", "sonstiges"]).notNull(),
  /** Titel der Aufgabe */
  titel: varchar("titel", { length: 255 }).notNull(),
  /** Detaillierte Beschreibung was zu prüfen ist */
  beschreibung: text("beschreibung").notNull(),
  /** Prüfintervall in Tagen (z.B. 30 = monatlich) */
  intervallTage: int("intervallTage").default(30).notNull(),
  /** Letzter Prüfzeitpunkt als UTC-Timestamp (ms) */
  letztesPruefungMs: bigint("letztesPruefungMs", { mode: "number" }),
  /** Nächste fällige Prüfung als UTC-Timestamp (ms) */
  naechsteFaelligMs: bigint("naechsteFaelligMs", { mode: "number" }).notNull(),
  /** Aktiv/inaktiv */
  aktiv: boolean("aktiv").default(true).notNull(),
  /** Priorität: hoch | mittel | niedrig */
  prioritaet: mysqlEnum("prioritaet", ["hoch", "mittel", "niedrig"]).default("mittel").notNull(),
  /** Externe Quellen/Links zum Prüfen (JSON-Array als Text) */
  quellen: text("quellen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RechtsAufgabe = typeof rechtsAufgaben.$inferSelect;
export type InsertRechtsAufgabe = typeof rechtsAufgaben.$inferInsert;

/**
 * RECHTS_PRUEFPROTOKOLL – Prüfhistorie
 * Jede abgeschlossene Prüfung wird hier dokumentiert.
 * MA-Analyse und Handlungsempfehlungen werden gespeichert.
 */
export const rechtsPruefprotokoll = mysqlTable("rechts_pruefprotokoll", {
  id: int("id").autoincrement().primaryKey(),
  aufgabeId: int("aufgabeId").notNull(),
  /** Wer hat geprüft: user | ma_auto */
  geprueftVon: mysqlEnum("geprueftVon", ["user", "ma_auto"]).default("user").notNull(),
  /** Ergebnis: ok | anpassung_noetig | kritisch */
  ergebnis: mysqlEnum("ergebnis", ["ok", "anpassung_noetig", "kritisch"]).notNull(),
  /** Notizen des Nutzers oder MA-Analyse */
  notizen: text("notizen"),
  /** MA-generierte Zusammenfassung der gefundenen Änderungen */
  maAnalyse: text("maAnalyse"),
  /** Konkrete Handlungsempfehlungen von MA */
  handlungsempfehlungen: text("handlungsempfehlungen"),
  /** Prüfzeitpunkt als UTC-Timestamp (ms) */
  geprueftAmMs: bigint("geprueftAmMs", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RechtsPruefprotokoll = typeof rechtsPruefprotokoll.$inferSelect;
export type InsertRechtsPruefprotokoll = typeof rechtsPruefprotokoll.$inferInsert;

/**
 * RITUALE_EINSTELLUNGEN – Persönliche Ritual-Konfiguration
 * Bewegungspausen-Timer + Morgenerwachen-Wecker mit MA-Sprachbegrüßung.
 */
export const ritualeEinstellungen = mysqlTable("rituale_einstellungen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),

  // --- Bewegungspausen-Timer ---
  /** Timer aktiv? */
  pausenTimerAktiv: boolean("pausenTimerAktiv").default(false).notNull(),
  /** Arbeitsintervall in Minuten (Standard: 45) */
  arbeitsMinuten: int("arbeitsMinuten").default(45).notNull(),
  /** Pausenlänge in Minuten (Standard: 5) */
  pausenMinuten: int("pausenMinuten").default(5).notNull(),
  /** Push-Benachrichtigung bei Pause? */
  pausenPushAktiv: boolean("pausenPushAktiv").default(true).notNull(),
  /** Zeitraum aktiv: von (Uhrzeit HH:MM, z.B. '08:00') */
  pausenVon: varchar("pausenVon", { length: 5 }).default("08:00"),
  /** Zeitraum aktiv: bis (Uhrzeit HH:MM, z.B. '18:00') */
  pausenBis: varchar("pausenBis", { length: 5 }).default("18:00"),

  // --- Morgenerwachen-Wecker ---
  /** Wecker aktiv? */
  weckerAktiv: boolean("weckerAktiv").default(false).notNull(),
  /** Weckzeit (HH:MM, z.B. '06:30') */
  weckzeit: varchar("weckzeit", { length: 5 }).default("06:30"),
  /** Wochentage als Bitmask: Bit 0=Mo, 1=Di, 2=Mi, 3=Do, 4=Fr, 5=Sa, 6=So */
  weckTage: int("weckTage").default(31).notNull(),
  /** Morgentext für MA-Sprachbegrüßung (von Nutzer verfasst) */
  morgentext: text("morgentext"),
  /** URL der Hintergrundmusik (CDN-Link oder externer Link) */
  morgenMusikUrl: text("morgenMusikUrl"),
  /** Musikname/Titel zur Anzeige */
  morgenMusikTitel: varchar("morgenMusikTitel", { length: 255 }),
  /** Lautstärke der Musik 0-100 */
  musikLautstaerke: int("musikLautstaerke").default(40).notNull(),
  /** MA-Stimme aktiv? */
  maStimmeAktiv: boolean("maStimmeAktiv").default(true).notNull(),
  /** Letzter Weckzeitpunkt (UTC ms) – zur Duplikat-Vermeidung */
  letzterWeckMs: bigint("letzterWeckMs", { mode: "number" }),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RitualeEinstellungen = typeof ritualeEinstellungen.$inferSelect;
export type InsertRitualeEinstellungen = typeof ritualeEinstellungen.$inferInsert;


/**
 * RITUAL_LOGS – Protokoll abgeschlossener Rituale (für Streak-Berechnung)
 * Jeder Eintrag repräsentiert ein durchgeführtes Ritual an einem Tag.
 */
export const ritualLogs = mysqlTable("ritual_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Typ des Rituals: 'morgen' | 'pause' | 'atem' | 'dankbarkeit' | 'abend' */
  typ: mysqlEnum("typ", ["morgen", "pause", "atem", "dankbarkeit", "abend"]).notNull(),
  /** Datum als ISO-String 'YYYY-MM-DD' (Lokalzeit des Nutzers) */
  datum: varchar("datum", { length: 10 }).notNull(),
  /** Optionale Notiz zum Ritual */
  notiz: text("notiz"),
  /** Zeitstempel UTC ms */
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RitualLog = typeof ritualLogs.$inferSelect;
export type InsertRitualLog = typeof ritualLogs.$inferInsert;

/**
 * DANKBARKEIT – Tägliche Dankbarkeits-Einträge
 * 3 Dankbarkeits-Felder + Stimmungswert + optionaler Abend-Reflexionstext.
 */
export const dankbarkeit = mysqlTable("dankbarkeit", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Datum als ISO-String 'YYYY-MM-DD' */
  datum: varchar("datum", { length: 10 }).notNull(),
  /** Dankbarkeits-Eintrag 1 */
  eintrag1: text("eintrag1"),
  /** Dankbarkeits-Eintrag 2 */
  eintrag2: text("eintrag2"),
  /** Dankbarkeits-Eintrag 3 */
  eintrag3: text("eintrag3"),
  /** Stimmungswert 1-5 (1=sehr schlecht, 5=ausgezeichnet) */
  stimmung: int("stimmung"),
  /** Abend-Reflexion: Was war heute bedeutsam? */
  abendReflexion: text("abendReflexion"),
  /** MA-generierter Abschlusstext für den Abend */
  maAbschluss: text("maAbschluss"),
  /** Zeitstempel UTC ms */
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Dankbarkeit = typeof dankbarkeit.$inferSelect;
export type InsertDankbarkeit = typeof dankbarkeit.$inferInsert;

/**
 * TRAINING FREIGABEN – Granulare Steuerung welche Trainingskategorien/-einheiten sichtbar sind
 * categoryId: z.B. 'ambient', 'breathing', 'voice', 'movement', 'befindlichkeit'
 * itemId: optional – wenn gesetzt, nur diese Einheit freischalten (z.B. 'metabolic')
 *         wenn null, die gesamte Kategorie freischalten
 */
export const trainingFreigaben = mysqlTable('training_freigaben', {
  id: int('id').autoincrement().primaryKey(),
  categoryId: varchar('categoryId', { length: 50 }).notNull(),
  itemId: varchar('itemId', { length: 50 }),
  enabled: boolean('enabled').notNull().default(false),
  label: varchar('label', { length: 100 }),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type TrainingFreigabe = typeof trainingFreigaben.$inferSelect;
export type InsertTrainingFreigabe = typeof trainingFreigaben.$inferSelect;

/**
 * USER TRAINING FREIGABEN – Nutzer-spezifische Trainingsfreigaben
 * Überschreiben die globalen Freigaben für einzelne Nutzer.
 * enabled=true: Modul für diesen Nutzer freigeschaltet (auch wenn global gesperrt)
 * enabled=false: Modul für diesen Nutzer gesperrt (auch wenn global freigeschaltet)
 */
export const userTrainingFreigaben = mysqlTable('user_training_freigaben', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  categoryId: varchar('categoryId', { length: 50 }).notNull(),
  itemId: varchar('itemId', { length: 50 }),
  enabled: boolean('enabled').notNull().default(true),
  label: varchar('label', { length: 100 }),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type UserTrainingFreigabe = typeof userTrainingFreigaben.$inferSelect;
export type InsertUserTrainingFreigabe = typeof userTrainingFreigaben.$inferInsert;


/**
 * PODCAST EPISODEN – Zentrale Datenverwaltung für alle Hörbuch-Episoden
 * Neue Episoden können über das Admin-Panel hinzugefügt werden.
 * audioUrl: CDN-URL der MP3-Datei (wird über /api/audio-proxy gestreamt)
 * isLatest: Markiert die aktuellste Episode (wird auf der Startseite hervorgehoben)
 * sortOrder: Aufsteigende Reihenfolge (1 = älteste, höchste = neueste)
 */
export const podcastEpisodes = mysqlTable('podcast_episodes', {
  id: int('id').autoincrement().primaryKey(),
  /** Episodennummer, z.B. "01", "02" */
  episodeNumber: varchar('episodeNumber', { length: 10 }).notNull(),
  /** Untertitel-Schlagwort in Großbuchstaben, z.B. "BEFEHL ERTEILT!" */
  catchphrase: varchar('catchphrase', { length: 100 }).notNull(),
  /** Langer Untertitel / Teaser-Text */
  subtitle: text('subtitle').notNull(),
  /** CDN-URL der MP3-Datei */
  audioUrl: text('audioUrl').notNull(),
  /** CDN-URL des Cover-Bildes */
  coverImageUrl: text('coverImageUrl').notNull(),
  /** Zusammenfassungstext (Inhalt dieser Episode) */
  description: text('description'),
  /** Ob dies die aktuellste/hervorgehobene Episode ist */
  isLatest: boolean('isLatest').notNull().default(false),
  /** Sortierreihenfolge (niedrig = älter, hoch = neuer) */
  sortOrder: int('sortOrder').notNull().default(0),
  /** Optionale YouTube-URL */
  youtubeUrl: text('youtubeUrl'),
  /** Optionale Spotify-URL */
  spotifyUrl: text('spotifyUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type InsertPodcastEpisode = typeof podcastEpisodes.$inferInsert;

/**
 * VITAL EINTRÄGE – Tägliche Vitalwerte pro Nutzer
 *
 * DSGVO Art. 9 – Besondere Kategorien personenbezogener Daten (Gesundheitsdaten).
 * Zugriff ist strikt auf den jeweiligen Nutzer selbst beschränkt.
 * Coach-Zugriff nur nach expliziter Einwilligung (→ coachingEinwilligungen).
 *
 * datum: ISO-String 'YYYY-MM-DD' (Lokalzeit des Nutzers).
 */
export const vitalEintraege = mysqlTable("vital_eintraege", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  datum: varchar("datum", { length: 10 }).notNull(),
  ruhepuls: int("ruhepuls"),
  hrv: int("hrv"),
  apnoeAus: varchar("apnoeAus", { length: 10 }),
  apnoeEin: varchar("apnoeEin", { length: 10 }),
  bolt: int("bolt"),
  temperatur: varchar("temperatur", { length: 10 }),
  gewicht: varchar("gewicht", { length: 10 }),
  anmerkungen: text("anmerkungen"),
  tagesplan: text("tagesplan"),
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
},
(table) => ({
  idxUserIdDatum: index("idx_vital_eintraege_userId_datum").on(table.userId, table.datum),
  idxUserId: index("idx_vital_eintraege_userId").on(table.userId),
})
);
export type VitalEintrag = typeof vitalEintraege.$inferSelect;
export type InsertVitalEintrag = typeof vitalEintraege.$inferInsert;

/**
 * COACHING EINWILLIGUNGEN – DSGVO-konforme Opt-in Einwilligung
 *
 * Art. 9 Abs. 2 lit. a DSGVO: Explizite Einwilligung zur Verarbeitung
 * besonderer Kategorien personenbezogener Daten (Gesundheitsdaten).
 *
 * coachId: User-ID des Coaches (= Thomas, OWNER)
 * widerrufenAtMs: null = Einwilligung aktiv
 */
export const coachingEinwilligungen = mysqlTable("coaching_einwilligungen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  coachId: int("coachId").notNull(),
  eingewilligtAtMs: bigint("eingewilligtAtMs", { mode: "number" }).notNull(),
  widerrufenAtMs: bigint("widerrufenAtMs", { mode: "number" }),
  einwilligungsText: text("einwilligungsText").notNull(),
  ipAdresse: varchar("ipAdresse", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
},
(table) => ({
  idxCoachIdWiderrufenAtMs: index("idx_coaching_einwilligungen_coachId_widerrufenAtMs").on(table.coachId, table.widerrufenAtMs),
  idxCoachId: index("idx_coaching_einwilligungen_coachId").on(table.coachId),
  idxUserId: index("idx_coaching_einwilligungen_userId").on(table.userId),
})
);
export type CoachingEinwilligung = typeof coachingEinwilligungen.$inferSelect;
export type InsertCoachingEinwilligung = typeof coachingEinwilligungen.$inferInsert;

/**
 * Strategischer Backlog für KIICH-Vorhaben.
 * Admin-seitig verwaltbar unter /admin/backlog.
 */
export const backlogItems = mysqlTable("backlog_items", {
  id: int("id").autoincrement().primaryKey(),
  titel: varchar("titel", { length: 255 }).notNull(),
  beschreibung: text("beschreibung"),
  kategorie: mysqlEnum("kategorie", [
    "feature",
    "content",
    "marketing",
    "technik",
    "strategie",
    "sonstiges"
  ]).default("sonstiges").notNull(),
  prioritaet: mysqlEnum("prioritaet", ["hoch", "mittel", "niedrig"]).default("mittel").notNull(),
  status: mysqlEnum("status", ["offen", "in_arbeit", "erledigt", "verworfen"]).default("offen").notNull(),
  /** Optionaler Zieldatum-Hinweis (z.B. "Q2 2026") */
  zieldatum: varchar("zieldatum", { length: 64 }),
  /** Wer hat den Eintrag erstellt */
  erstelltVon: varchar("erstelltVon", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BacklogItem = typeof backlogItems.$inferSelect;
export type InsertBacklogItem = typeof backlogItems.$inferInsert;

/**
 * RAUM 36 – Subscriptions
 * Speichert den Stripe-Subscription-Status und den Pseudonym des Nutzers.
 * Stripe ist die einzige Quelle der Wahrheit für Zahlungsstatus.
 */
export const raum36Subscriptions = mysqlTable("raum36_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Stripe Customer ID für API-Abfragen */
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  /** Stripe Subscription ID für Statusabfragen */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  /** Gecachter Status für schnelle Abfragen – wird via Webhook aktualisiert */
  status: mysqlEnum("status", ["active", "inactive", "cancelled", "past_due"]).default("inactive").notNull(),
  /** Pseudonym des Nutzers im RAUM 36 (frei wählbar, einmalig) */
  pseudonym: varchar("pseudonym", { length: 64 }),
  /** Zeitpunkt der ersten Aktivierung */
  activatedAt: timestamp("activatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Raum36Subscription = typeof raum36Subscriptions.$inferSelect;
export type InsertRaum36Subscription = typeof raum36Subscriptions.$inferInsert;

/**
 * RAUM 36 – Wochenvideo-Posts (nur Thomas kann posten)
 */
export const raum36Posts = mysqlTable("raum36_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** Titel des Wochenvideos */
  titel: varchar("titel", { length: 255 }).notNull(),
  /** Beschreibung / Begleittext */
  beschreibung: text("beschreibung"),
  /** YouTube-URL oder direkter Video-Link */
  videoUrl: varchar("videoUrl", { length: 512 }),
  /** Optionaler Thumbnail-URL */
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  /** Nur sichtbar wenn published=true */
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Raum36Post = typeof raum36Posts.$inferSelect;
export type InsertRaum36Post = typeof raum36Posts.$inferInsert;

/**
 * RAUM 36 – Fragen von Mitgliedern (nur Thomas antwortet)
 * Alle Fragen und Antworten sind für alle Mitglieder sichtbar (mit Pseudonym).
 */
export const raum36Fragen = mysqlTable("raum36_fragen", {
  id: int("id").autoincrement().primaryKey(),
  /** Nutzer-ID des Fragestellers */
  userId: int("userId").notNull(),
  /** Pseudonym des Fragestellers (aus raum36_subscriptions) */
  pseudonym: varchar("pseudonym", { length: 64 }).notNull(),
  /** Die Frage */
  frage: text("frage").notNull(),
  /** Antwort von Thomas (null = noch nicht beantwortet) */
  antwort: text("antwort"),
  /** Zeitpunkt der Antwort */
  beantwortetAt: timestamp("beantwortetAt"),
  /** Sichtbar für alle Mitglieder */
  sichtbar: boolean("sichtbar").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Raum36Frage = typeof raum36Fragen.$inferSelect;
export type InsertRaum36Frage = typeof raum36Fragen.$inferInsert;

/**
 * RAUM 36 – Wissenspool (spezielle Podcasts, Fakten, Ressourcen)
 * Nur Thomas kann Einträge erstellen.
 */
export const raum36Wissenspool = mysqlTable("raum36_wissenspool", {
  id: int("id").autoincrement().primaryKey(),
  /** Titel des Eintrags */
  titel: varchar("titel", { length: 255 }).notNull(),
  /** Beschreibung */
  beschreibung: text("beschreibung"),
  /** Typ: podcast, artikel, fakt, video, tool, audio */
  typ: mysqlEnum("typ", ["podcast", "artikel", "fakt", "video", "tool", "audio", "sonstiges"]).default("sonstiges").notNull(),
  /** URL zum externen Inhalt (optional) */
  url: varchar("url", { length: 512 }),
  /** S3-CDN-URL der hochgeladenen Audio-Datei (optional) */
  audioUrl: varchar("audioUrl", { length: 512 }),
  /** Nur sichtbar wenn published=true */
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Raum36Wissenspool = typeof raum36Wissenspool.$inferSelect;
export type InsertRaum36Wissenspool = typeof raum36Wissenspool.$inferInsert;

/**
 * Stimmklanganalyse – Bestellungen (Einmalzahlung €96)
 * Stripe ist die Quelle der Wahrheit für den Zahlungsstatus.
 */
export const stimmklanganalyseOrders = mysqlTable("stimmklanganalyse_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  /** Stripe Customer ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  /** Gecachter Status */
  status: mysqlEnum("status", ["pending", "paid", "cancelled", "refunded"]).default("pending").notNull(),
  /** Zeitpunkt der Zahlung */
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type StimmklanganalyseOrder = typeof stimmklanganalyseOrders.$inferSelect;
export type InsertStimmklanganalyseOrder = typeof stimmklanganalyseOrders.$inferInsert;
