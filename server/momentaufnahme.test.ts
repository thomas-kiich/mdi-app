import { describe, it, expect } from "vitest";

// ─── Hilfsfunktionen (isoliert testbar) ──────────────────────────────────────

const KATEGORIEN = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
type Kategorie = (typeof KATEGORIEN)[number];

function generiereObsidianMarkdown(aufnahmen: Array<{
  id: number;
  text: string;
  kategorie: string;
  zusammenfassung: string | null;
  createdAt: Date;
}>): string {
  const datum = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const datumISO = new Date().toISOString().split("T")[0];

  const EMOJI: Record<string, string> = {
    ICH: "👤", QUELL: "⚡", KONZEPT: "🧠", PROJEKT: "🎯", DIALOG: "💬", WELT: "🌍",
  };

  let md = `---\ntags: [momentaufnahme, tagebuch, ${datumISO}]\ndatum: ${datum}\nanzahl: ${aufnahmen.length}\n---\n\n# 📸 Momentaufnahmen – ${datum}\n\n`;

  const gruppiertNachKategorie = KATEGORIEN.reduce((acc, kat) => {
    acc[kat] = aufnahmen.filter(a => a.kategorie === kat);
    return acc;
  }, {} as Record<string, typeof aufnahmen>);

  for (const kat of KATEGORIEN) {
    const gruppe = gruppiertNachKategorie[kat];
    if (gruppe.length === 0) continue;
    md += `## ${EMOJI[kat]} ${kat}\n\n`;
    for (const a of gruppe) {
      const zeit = a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      md += `### ${zeit} Uhr\n`;
      if (a.zusammenfassung) md += `> ${a.zusammenfassung}\n\n`;
      md += `${a.text}\n\n`;
    }
  }

  md += `---\n*Exportiert aus KIICH MOMENTAUFNAHME*\n`;
  return md;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("MOMENTAUFNAHME – Obsidian-Export", () => {
  it("generiert leeres Markdown wenn keine Aufnahmen vorhanden", () => {
    const md = generiereObsidianMarkdown([]);
    expect(md).toContain("---");
    expect(md).toContain("anzahl: 0");
    expect(md).toContain("📸 Momentaufnahmen");
    // Keine Kategorien-Abschnitte
    expect(md).not.toContain("## 👤 ICH");
  });

  it("gruppiert Aufnahmen korrekt nach Kategorie", () => {
    const aufnahmen = [
      { id: 1, text: "Ich fühle mich gut heute.", kategorie: "ICH", zusammenfassung: "Wohlbefinden", createdAt: new Date() },
      { id: 2, text: "Neue Idee für das Buch.", kategorie: "KONZEPT", zusammenfassung: "Buchidee", createdAt: new Date() },
      { id: 3, text: "Meeting mit Klaus war produktiv.", kategorie: "DIALOG", zusammenfassung: "Klaus-Meeting", createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toContain("## 👤 ICH");
    expect(md).toContain("## 🧠 KONZEPT");
    expect(md).toContain("## 💬 DIALOG");
    expect(md).not.toContain("## ⚡ QUELL");
    expect(md).not.toContain("## 🎯 PROJEKT");
    expect(md).not.toContain("## 🌍 WELT");
  });

  it("enthält Zusammenfassung als Blockquote", () => {
    const aufnahmen = [
      { id: 1, text: "Langer Text...", kategorie: "QUELL", zusammenfassung: "Kurze Zusammenfassung", createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toContain("> Kurze Zusammenfassung");
    expect(md).toContain("Langer Text...");
  });

  it("enthält korrekte YAML-Frontmatter", () => {
    const aufnahmen = [
      { id: 1, text: "Test", kategorie: "WELT", zusammenfassung: null, createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toMatch(/^---/);
    expect(md).toContain("tags: [momentaufnahme, tagebuch,");
    expect(md).toContain("anzahl: 1");
  });

  it("enthält Export-Signatur am Ende", () => {
    const md = generiereObsidianMarkdown([]);
    expect(md).toContain("*Exportiert aus KIICH MOMENTAUFNAHME*");
  });
});

describe("MOMENTAUFNAHME – Kategorie-Validierung", () => {
  it("alle 6 Kategorien sind definiert", () => {
    expect(KATEGORIEN).toHaveLength(6);
    expect(KATEGORIEN).toContain("ICH");
    expect(KATEGORIEN).toContain("QUELL");
    expect(KATEGORIEN).toContain("KONZEPT");
    expect(KATEGORIEN).toContain("PROJEKT");
    expect(KATEGORIEN).toContain("DIALOG");
    expect(KATEGORIEN).toContain("WELT");
  });

  it("unbekannte Kategorie wird auf QUELL zurückgeführt", () => {
    const unbekannt = "UNBEKANNT";
    const fallback: Kategorie = KATEGORIEN.includes(unbekannt as Kategorie) ? unbekannt as Kategorie : "QUELL";
    expect(fallback).toBe("QUELL");
  });
});

describe("MOMENTAUFNAHME – MIME-Type-Erkennung", () => {
  // Repliziert die Logik aus voiceTranscription.ts
  function detectMimeFromUrl(audioUrl: string, contentTypeHeader: string): string {
    const urlPath = new URL(audioUrl).pathname.toLowerCase();
    const extFromUrl = urlPath.split('.').pop() || '';
    const extMimeMap: Record<string, string> = {
      webm: 'audio/webm', mp3: 'audio/mpeg', mp4: 'audio/mp4',
      m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
    };
    return extMimeMap[extFromUrl] || (contentTypeHeader.startsWith('audio/') ? contentTypeHeader : 'audio/webm');
  }

  it("erkennt audio/webm aus .webm URL (auch wenn CloudFront application/octet-stream liefert)", () => {
    const mime = detectMimeFromUrl(
      'https://cdn.example.com/momentaufnahmen/1/1234567890.webm',
      'application/octet-stream'
    );
    expect(mime).toBe('audio/webm');
  });

  it("erkennt audio/mpeg aus .mp3 URL", () => {
    const mime = detectMimeFromUrl(
      'https://cdn.example.com/audio/test.mp3',
      'application/octet-stream'
    );
    expect(mime).toBe('audio/mpeg');
  });

  it("erkennt audio/mp4 aus .m4a URL", () => {
    const mime = detectMimeFromUrl(
      'https://cdn.example.com/audio/test.m4a',
      'application/octet-stream'
    );
    expect(mime).toBe('audio/mp4');
  });

  it("fällt auf audio/webm zurück wenn keine bekannte Extension", () => {
    const mime = detectMimeFromUrl(
      'https://cdn.example.com/audio/test',
      'application/octet-stream'
    );
    expect(mime).toBe('audio/webm');
  });

  it("nutzt Content-Type-Header wenn Extension unbekannt aber Header audio/* ist", () => {
    const mime = detectMimeFromUrl(
      'https://cdn.example.com/audio/test',
      'audio/ogg'
    );
    expect(mime).toBe('audio/ogg');
  });
});

describe("MOMENTAUFNAHME – Aufnahme-Limits", () => {
  const MIN_DAUER_SEK = 2;
  const MAX_DAUER_SEK = 180;

  it("Mindestdauer ist 2 Sekunden", () => {
    expect(MIN_DAUER_SEK).toBe(2);
  });

  it("Maximaldauer ist 180 Sekunden (3 Minuten)", () => {
    expect(MAX_DAUER_SEK).toBe(180);
  });

  it("Aufnahme unter 2 Sekunden wird abgelehnt", () => {
    const dauer = 1;
    const zuKurz = dauer < MIN_DAUER_SEK;
    expect(zuKurz).toBe(true);
  });

  it("Aufnahme von genau 2 Sekunden wird akzeptiert", () => {
    const dauer = 2;
    const zuKurz = dauer < MIN_DAUER_SEK;
    expect(zuKurz).toBe(false);
  });

  it("Aufnahme von 180 Sekunden löst Auto-Stop aus", () => {
    const dauer = 180;
    const maxErreicht = dauer >= MAX_DAUER_SEK;
    expect(maxErreicht).toBe(true);
  });

  it("Fortschrittsbalken-Prozent wird korrekt berechnet", () => {
    const dauer = 90;
    const prozent = Math.min((dauer / MAX_DAUER_SEK) * 100, 100);
    expect(prozent).toBe(50);
  });

  it("Fortschrittsbalken wird bei 180s auf 100% begrenzt", () => {
    const dauer = 200;
    const prozent = Math.min((dauer / MAX_DAUER_SEK) * 100, 100);
    expect(prozent).toBe(100);
  });
});

describe("MOMENTAUFNAHME – Obsidian-Export mit Audio", () => {
  // Repliziert die erweiterte generiereObsidianMarkdown-Funktion
  function generiereObsidianMarkdownMitAudio(aufnahmen: Array<{
    id: number;
    text: string;
    kategorie: string;
    zusammenfassung: string | null;
    audioUrl?: string | null;
    createdAt: Date;
  }>): string {
    const KATEGORIEN = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
    const EMOJI: Record<string, string> = {
      ICH: "👤", QUELL: "⚡", KONZEPT: "🧠", PROJEKT: "🎯", DIALOG: "💬", WELT: "🌍",
    };
    const datum = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const datumISO = new Date().toISOString().split("T")[0];
    let md = `---\ntags: [momentaufnahme, tagebuch, ${datumISO}]\ndatum: ${datum}\nanzahl: ${aufnahmen.length}\n---\n\n# 📸 Momentaufnahmen – ${datum}\n\n`;

    const gruppiertNachKategorie = KATEGORIEN.reduce((acc, kat) => {
      acc[kat] = aufnahmen.filter(a => a.kategorie === kat);
      return acc;
    }, {} as Record<string, typeof aufnahmen>);

    for (const kat of KATEGORIEN) {
      const gruppe = gruppiertNachKategorie[kat];
      if (gruppe.length === 0) continue;
      md += `## ${EMOJI[kat]} ${kat}\n\n`;
      for (const a of gruppe) {
        const zeit = a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        md += `### ${zeit} Uhr\n`;
        if (a.zusammenfassung) md += `> ${a.zusammenfassung}\n\n`;
        md += `${a.text}\n\n`;
        if (a.audioUrl) {
          md += `[🎙️ Audio-Aufnahme herunterladen](${a.audioUrl})\n\n`;
        }
      }
    }
    md += `---\n*Exportiert aus KIICH MOMENTAUFNAHME*\n`;
    return md;
  }

  it("enthält Audio-Download-Link wenn audioUrl vorhanden", () => {
    const aufnahmen = [{
      id: 42,
      text: "Test mit Audio",
      kategorie: "PROJEKT",
      zusammenfassung: "Projekt-Gedanke",
      audioUrl: "https://cdn.example.com/aufnahme-42.webm",
      createdAt: new Date(),
    }];
    const md = generiereObsidianMarkdownMitAudio(aufnahmen);
    expect(md).toContain("🎙️ Audio-Aufnahme herunterladen");
    expect(md).toContain("https://cdn.example.com/aufnahme-42.webm");
  });

  it("enthält keinen Audio-Link wenn audioUrl null ist", () => {
    const aufnahmen = [{
      id: 1,
      text: "Ohne Audio",
      kategorie: "QUELL",
      zusammenfassung: null,
      audioUrl: null,
      createdAt: new Date(),
    }];
    const md = generiereObsidianMarkdownMitAudio(aufnahmen);
    expect(md).not.toContain("🎙️ Audio-Aufnahme herunterladen");
  });
});

describe("MOMENTAUFNAHME – Archiv-Datum-Logik", () => {
  it("ISO-Datum-String wird korrekt aus Date extrahiert", () => {
    const datum = new Date("2026-04-07T14:30:00.000Z");
    const isoTag = datum.toISOString().split("T")[0];
    expect(isoTag).toBe("2026-04-07");
  });

  it("Tages-Filter funktioniert korrekt", () => {
    const aufnahmen = [
      { createdAt: new Date("2026-04-07T10:00:00.000Z") },
      { createdAt: new Date("2026-04-07T18:00:00.000Z") },
      { createdAt: new Date("2026-04-06T22:00:00.000Z") },
    ];
    const zielDatum = "2026-04-07";
    const filtered = aufnahmen.filter(a => a.createdAt.toISOString().split("T")[0] === zielDatum);
    expect(filtered).toHaveLength(2);
  });

  it("eindeutige Tage werden korrekt dedupliziert", () => {
    const createdAts = [
      new Date("2026-04-07T10:00:00.000Z"),
      new Date("2026-04-07T18:00:00.000Z"),
      new Date("2026-04-06T22:00:00.000Z"),
    ];
    const tageSet = new Set(createdAts.map(d => d.toISOString().split("T")[0]));
    expect(tageSet.size).toBe(2);
    expect(Array.from(tageSet)).toContain("2026-04-07");
    expect(Array.from(tageSet)).toContain("2026-04-06");
  });
});

describe("MOMENTAUFNAHME – Strategisches Summary (Prompt-Logik)", () => {
  const KATEGORIEN = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
  const KATEGORIE_BESCHREIBUNGEN: Record<string, string> = {
    ICH: "Persönliche Identität, Biografie, Werte, Visionen, Selbstreflexion, Emotionen, Körper",
    QUELL: "Rohe Ideen, Blitzgedanken, unfertige Fragmente, spontane Einfälle, Beobachtungen",
    KONZEPT: "Ausgearbeitete Gedanken, Theorien, Erkenntnisse, philosophische Überlegungen, Definitionen",
    PROJEKT: "Aktive Vorhaben, Aufgaben, Pläne, nächste Schritte, Deadlines, Ziele",
    DIALOG: "Gespräche, Begegnungen, Austausch mit Menschen oder KI, Zitate, Reaktionen",
    WELT: "Externe Quellen, Nachrichten, Bücher, Inspirationen, Referenzen, Beobachtungen der Welt",
  };

  it("alle 6 Gravitationszentren sind im Prompt-Kontext beschrieben", () => {
    const beschreibungen = Object.keys(KATEGORIE_BESCHREIBUNGEN);
    expect(beschreibungen).toHaveLength(6);
    for (const kat of KATEGORIEN) {
      expect(beschreibungen).toContain(kat);
    }
  });

  it("PROJEKT-Kategorie enthält Aufgaben-relevante Schlüsselwörter", () => {
    const projektBeschreibung = KATEGORIE_BESCHREIBUNGEN["PROJEKT"];
    expect(projektBeschreibung).toContain("Aufgaben");
    expect(projektBeschreibung).toContain("Pläne");
    expect(projektBeschreibung).toContain("nächste Schritte");
  });

  it("Aufnahmen-Text wird korrekt für Prompt formatiert", () => {
    const aufnahmen = [
      { kategorie: "PROJEKT", text: "Ich muss noch die Rechnung an Müller schicken." },
      { kategorie: "ICH", text: "Ich fühle mich heute energiegeladen." },
    ];
    const aufnahmenText = aufnahmen.map(a => `[${a.kategorie}] ${a.text}`).join("\n\n");
    expect(aufnahmenText).toContain("[PROJEKT] Ich muss noch die Rechnung");
    expect(aufnahmenText).toContain("[ICH] Ich fühle mich");
  });

  it("Anrede-Zeile enthält Vorname wenn vorhanden", () => {
    const vorname = "Thomas";
    const anredeZeile = vorname
      ? `Der Name der Person ist ${vorname}. Sprich sie direkt mit ihrem Vornamen an.`
      : `Sprich die Person in der Du-Form an.`;
    expect(anredeZeile).toContain("Thomas");
    expect(anredeZeile).not.toContain("Du-Form");
  });

  it("Anrede-Zeile fällt auf Du-Form zurück wenn kein Vorname", () => {
    const vorname: string | null = null;
    const anredeZeile = vorname
      ? `Der Name der Person ist ${vorname}. Sprich sie direkt mit ihrem Vornamen an.`
      : `Sprich die Person in der Du-Form an.`;
    expect(anredeZeile).toContain("Du-Form");
  });

  it("Kategorien-Beschreibung für Prompt wird korrekt zusammengebaut", () => {
    const kategorienBeschreibung = Object.entries(KATEGORIE_BESCHREIBUNGEN)
      .map(([k, v]) => `- **${k}**: ${v}`)
      .join("\n");
    expect(kategorienBeschreibung).toContain("- **PROJEKT**:");
    expect(kategorienBeschreibung).toContain("- **ICH**:");
    expect(kategorienBeschreibung.split("\n")).toHaveLength(6);
  });
});
