import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { rechtsAufgaben, rechtsPruefprotokoll } from "../../drizzle/schema";
import { eq, asc, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Vordefinierte Rechts-Aufgaben die beim ersten Aufruf angelegt werden
const STANDARD_AUFGABEN = [
  {
    kategorie: "datenschutz" as const,
    titel: "Datenschutzerklärung auf Aktualität prüfen",
    beschreibung: `Prüfe folgende Punkte:
1. Sind alle Auftragsverarbeiter noch aktuell? (Manus, Brevo, ElevenLabs, Google TTS, Mistral AI)
2. Hat sich die DSGVO oder nationale Datenschutzgesetze (BDSG, DSG AT, nDSG CH) geändert?
3. Sind neue Funktionen der App in der Datenschutzerklärung erfasst?
4. Stimmen die Speicherdauern noch mit der tatsächlichen Praxis überein?
5. Sind die Kontaktdaten des Verantwortlichen noch korrekt?`,
    intervallTage: 30,
    prioritaet: "hoch" as const,
    quellen: JSON.stringify([
      "https://dsgvo-gesetz.de/",
      "https://www.bfdi.bund.de/",
      "https://legal.mistral.ai/terms/privacy-policy",
      "https://www.dsb.gv.at/",
      "https://www.edoeb.admin.ch/"
    ])
  },
  {
    kategorie: "impressum" as const,
    titel: "Impressum auf Vollständigkeit und Aktualität prüfen",
    beschreibung: `Prüfe folgende Punkte:
1. Sind alle Pflichtangaben nach § 5 DDG (DE) / § 5 ECG (AT) / Art. 3 UWG (CH) vorhanden?
2. Sind Adresse, Telefon und E-Mail noch korrekt?
3. Hat sich der Betriebsstatus geändert (Gewerbe, USt-IdNr.)?
4. Sind neue gesetzliche Anforderungen an das Impressum hinzugekommen?
5. Ist der Hinweis zur OS-Plattform der EU-Kommission noch aktuell?`,
    intervallTage: 30,
    prioritaet: "mittel" as const,
    quellen: JSON.stringify([
      "https://www.it-recht-kanzlei.de/",
      "https://www.e-recht24.de/impressum/",
      "https://ec.europa.eu/consumers/odr"
    ])
  },
  {
    kategorie: "ki_recht" as const,
    titel: "EU AI Act – Neue Anforderungen prüfen",
    beschreibung: `Prüfe folgende Punkte:
1. Welche neuen Artikel des EU AI Act sind seit letzter Prüfung in Kraft getreten?
2. Fällt die MDI-Frequenzanalyse oder MA unter eine neue Risikokategorie?
3. Gibt es neue Transparenzpflichten für KI-Systeme (Art. 50 EU AI Act)?
4. Sind neue Kennzeichnungspflichten für KI-generierte Inhalte eingeführt worden?
5. Haben sich die Anforderungen an Hochrisiko-KI-Systeme geändert?`,
    intervallTage: 30,
    prioritaet: "hoch" as const,
    quellen: JSON.stringify([
      "https://artificialintelligenceact.eu/",
      "https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence",
      "https://www.bmi.bund.de/ki"
    ])
  },
  {
    kategorie: "ki_recht" as const,
    titel: "KI-Urheberrecht und Datenschutz bei Trainingsdaten",
    beschreibung: `Prüfe folgende Punkte:
1. Neue EuGH- oder BGH-Urteile zu KI-generierten Inhalten und Urheberrecht?
2. Änderungen bei der Zulässigkeit von Web Scraping für KI-Training?
3. Neue Opt-out-Rechte für Nutzer bezüglich KI-Training?
4. Änderungen bei der Nutzung von Sprachaufnahmen für KI-Training (Whisper, Mistral)?
5. Neue Entscheidungen der Datenschutzbehörden zu KI-Diensten?`,
    intervallTage: 30,
    prioritaet: "mittel" as const,
    quellen: JSON.stringify([
      "https://www.bfdi.bund.de/",
      "https://edpb.europa.eu/",
      "https://curia.europa.eu/"
    ])
  },
  {
    kategorie: "nutzungsbedingungen" as const,
    titel: "Nutzungsbedingungen auf Aktualität prüfen",
    beschreibung: `Prüfe folgende Punkte:
1. Decken die Nutzungsbedingungen alle aktuellen Funktionen der App ab?
2. Neue Rechtsprechung zu AGB-Klauseln bei KI-Diensten?
3. Sind die Haftungsausschlüsse für KI-Ausgaben noch ausreichend?
4. Änderungen beim Mindestalter für KI-Dienste in DE/AT/CH?
5. Neue Anforderungen an Widerrufsbelehrung oder Verbraucherrechte?`,
    intervallTage: 30,
    prioritaet: "mittel" as const,
    quellen: JSON.stringify([
      "https://www.it-recht-kanzlei.de/",
      "https://www.verbraucherzentrale.de/"
    ])
  },
  {
    kategorie: "datenschutz" as const,
    titel: "Auftragsverarbeiter-Verträge (AVV) prüfen",
    beschreibung: `Prüfe folgende Punkte:
1. Haben Manus, Brevo, ElevenLabs, Google Cloud TTS oder Mistral AI ihre Datenschutzrichtlinien geändert?
2. Sind neue Subprozessoren bei den Auftragsverarbeitern hinzugekommen?
3. Gibt es neue Standardvertragsklauseln (SCCs) für Drittlandtransfers?
4. Hat sich der Sitz oder die Rechtsform eines Auftragsverarbeiters geändert?
5. Sind neue Zertifizierungen (ISO 27001, SOC 2) verfügbar?`,
    intervallTage: 30,
    prioritaet: "hoch" as const,
    quellen: JSON.stringify([
      "https://legal.mistral.ai/terms/data-processing-addendum",
      "https://www.brevo.com/legal/privacypolicy/",
      "https://elevenlabs.io/privacy",
      "https://cloud.google.com/terms/data-processing-terms",
      "https://manus.im/privacy"
    ])
  }
];

export const rechtsChecklisteRouter = router({

  // Alle Aufgaben laden (und ggf. Standard-Aufgaben anlegen)
  aufgabenLaden: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const aufgaben = await db.select().from(rechtsAufgaben)
      .where(eq(rechtsAufgaben.aktiv, true))
      .orderBy(asc(rechtsAufgaben.naechsteFaelligMs));

    // Beim ersten Aufruf Standard-Aufgaben anlegen
    if (aufgaben.length === 0) {
      const jetzt = Date.now();
      const insertData = STANDARD_AUFGABEN.map((a, i) => ({
        ...a,
        // Aufgaben gestaffelt fällig: erste sofort, dann je 2 Tage versetzt
        naechsteFaelligMs: jetzt + i * 2 * 24 * 60 * 60 * 1000,
      }));
      await db.insert(rechtsAufgaben).values(insertData);
      return await db.select().from(rechtsAufgaben)
        .where(eq(rechtsAufgaben.aktiv, true))
        .orderBy(asc(rechtsAufgaben.naechsteFaelligMs));
    }

    return aufgaben;
  }),

  // Prüfprotokoll einer Aufgabe laden
  protokollLaden: protectedProcedure
    .input(z.object({ aufgabeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(rechtsPruefprotokoll)
        .where(eq(rechtsPruefprotokoll.aufgabeId, input.aufgabeId))
        .orderBy(desc(rechtsPruefprotokoll.createdAt))
        .limit(10);
    }),

  // MA-Analyse starten: LLM recherchiert und analysiert Änderungen
  maAnalyseStarten: protectedProcedure
    .input(z.object({
      aufgabeId: z.number(),
      aufgabeTitel: z.string(),
      aufgabeBeschreibung: z.string(),
      aufgabeKategorie: z.string(),
      quellen: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const quellenListe = input.quellen ? JSON.parse(input.quellen) as string[] : [];

      const systemPrompt = `Du bist MA – ein persönlicher KI-Assistent mit Fokus auf Rechtssicherheit für kleine Webdienste in Deutschland, Österreich und der Schweiz.

Du analysierst wiederkehrende Rechtspflichten und gibst konkrete, handlungsorientierte Empfehlungen. Du kennst DSGVO, DDG, EU AI Act, BDSG, DSG (AT), nDSG (CH) und aktuelle Rechtsprechung.

Antworte immer auf Deutsch. Sei präzise, praxisnah und verständlich. Vermeide juristische Fachsprache wo möglich.`;

      const userPrompt = `Ich betreibe kiich.de – einen kleinen KI-gestützten Forschungsdienst für Frequenzanalyse und persönliche Selbstwahrnehmung (nicht-kommerziell, Einzelperson).

Bitte analysiere die folgende Rechtspflicht und gib mir eine aktuelle Einschätzung:

**Aufgabe:** ${input.aufgabeTitel}
**Kategorie:** ${input.aufgabeKategorie}

**Was zu prüfen ist:**
${input.aufgabeBeschreibung}

**Relevante Quellen:**
${quellenListe.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Bitte antworte in folgendem Format:

## Aktuelle Einschätzung
[Kurze Zusammenfassung des aktuellen Stands – was hat sich geändert, was ist stabil]

## Handlungsempfehlungen
[Konkrete Schritte die ich jetzt tun sollte – nummeriert, priorisiert]

## Ergebnis
[Eines von: "Kein Handlungsbedarf", "Kleine Anpassungen empfohlen", "Dringende Anpassung erforderlich"]

Halte die Antwort kompakt (max. 400 Wörter).`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      const rawContent = response.choices[0]?.message?.content;
      const maAnalyse = typeof rawContent === "string" ? rawContent : "Keine Analyse verfügbar.";

      // Ergebnis aus MA-Analyse extrahieren
      let ergebnis: "ok" | "anpassung_noetig" | "kritisch" = "ok";
      const analyseLower = maAnalyse.toLowerCase();
      if (analyseLower.includes("dringende anpassung")) {
        ergebnis = "kritisch";
      } else if (analyseLower.includes("kleine anpassungen") || analyseLower.includes("anpassung empfohlen")) {
        ergebnis = "anpassung_noetig";
      }

      return { maAnalyse, ergebnis };
    }),

  // Prüfung abschließen und protokollieren
  // (db wird lokal instanziiert)
  pruefungAbschliessen: protectedProcedure
    .input(z.object({
      aufgabeId: z.number(),
      ergebnis: z.enum(["ok", "anpassung_noetig", "kritisch"]),
      notizen: z.string().optional(),
      maAnalyse: z.string().optional(),
      handlungsempfehlungen: z.string().optional(),
      geprueftVon: z.enum(["user", "ma_auto"]).default("user"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const jetzt = Date.now();

      // Protokoll-Eintrag erstellen
      await db.insert(rechtsPruefprotokoll).values({
        aufgabeId: input.aufgabeId,
        geprueftVon: input.geprueftVon,
        ergebnis: input.ergebnis,
        notizen: input.notizen,
        maAnalyse: input.maAnalyse,
        handlungsempfehlungen: input.handlungsempfehlungen,
        geprueftAmMs: jetzt,
      });

      // Aufgabe aktualisieren: letztesPruefung + nächste Fälligkeit
      const aufgabe = await db.select().from(rechtsAufgaben)
        .where(eq(rechtsAufgaben.id, input.aufgabeId))
        .limit(1);

      if (aufgabe.length > 0) {
        const intervallMs = aufgabe[0].intervallTage * 24 * 60 * 60 * 1000;
        await db.update(rechtsAufgaben)
          .set({
            letztesPruefungMs: jetzt,
            naechsteFaelligMs: jetzt + intervallMs,
          })
          .where(eq(rechtsAufgaben.id, input.aufgabeId));
      }

      return { success: true };
    }),

  // Statistik: Fällige Aufgaben zählen
  faelligeAufgabenZaehlen: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { faellig: 0, bald: 0, gesamt: 0 };
    const jetzt = Date.now();
    const aufgaben = await db.select().from(rechtsAufgaben)
      .where(eq(rechtsAufgaben.aktiv, true));

      const faellig = aufgaben.filter((a: typeof aufgaben[0]) => a.naechsteFaelligMs !== null && a.naechsteFaelligMs <= jetzt).length;
      const bald = aufgaben.filter((a: typeof aufgaben[0]) =>
        a.naechsteFaelligMs !== null &&
        a.naechsteFaelligMs > jetzt &&
        a.naechsteFaelligMs <= jetzt + 7 * 24 * 60 * 60 * 1000
      ).length;

    return { faellig, bald, gesamt: aufgaben.length };
  }),
});
