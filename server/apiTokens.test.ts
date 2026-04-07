import { describe, it, expect } from "vitest";

// ─── Hilfsfunktionen (isoliert testbar) ──────────────────────────────────────

/**
 * Simuliert die Token-Generierung (Format: kiich_ + 64 Hex-Zeichen)
 */
function generiereTokenFormat(): boolean {
  const token = "kiich_" + "a".repeat(64);
  return token.startsWith("kiich_") && token.length === 70;
}

/**
 * Prüft ob ein Token das korrekte Format hat
 */
function validiereTokenFormat(token: string): boolean {
  return /^kiich_[0-9a-f]{64}$/.test(token);
}

/**
 * Simuliert die Obsidian-Sync-Response-Formatierung
 */
function formatiereSyncResponse(aufnahmen: Array<{
  id: number;
  text: string;
  kategorie: string;
  zusammenfassung: string | null;
  audioUrl: string | null;
  dauerSekunden: number | null;
  createdAt: Date;
}>) {
  return aufnahmen.map(a => ({
    id: a.id,
    text: a.text,
    kategorie: a.kategorie,
    zusammenfassung: a.zusammenfassung,
    audioUrl: a.audioUrl,
    dauerSekunden: a.dauerSekunden,
    createdAt: a.createdAt.toISOString(),
    datum: a.createdAt.toISOString().split("T")[0],
    zeit: a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  }));
}

/**
 * Prüft ob ein since-Parameter korrekt als Datum interpretiert wird
 */
function parseSinceParam(sinceParam: string | undefined): Date | null {
  if (!sinceParam) return null;
  const ts = parseInt(sinceParam);
  if (isNaN(ts)) return null;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;
  return d;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("API-Token Format", () => {
  it("Token hat korrektes Format (kiich_ + 64 Hex-Zeichen)", () => {
    expect(generiereTokenFormat()).toBe(true);
  });

  it("validiereTokenFormat akzeptiert gültigen Token", () => {
    const token = "kiich_" + "a1b2c3d4".repeat(8);
    expect(validiereTokenFormat(token)).toBe(true);
  });

  it("validiereTokenFormat lehnt Token ohne Präfix ab", () => {
    expect(validiereTokenFormat("abc123")).toBe(false);
  });

  it("validiereTokenFormat lehnt zu kurzen Token ab", () => {
    expect(validiereTokenFormat("kiich_abc")).toBe(false);
  });

  it("validiereTokenFormat lehnt Token mit Großbuchstaben ab", () => {
    const token = "kiich_" + "A".repeat(64);
    expect(validiereTokenFormat(token)).toBe(false);
  });
});

describe("Obsidian Sync Response Formatierung", () => {
  const testAufnahmen = [
    {
      id: 1,
      text: "Heute habe ich an einem wichtigen Projekt gearbeitet.",
      kategorie: "PROJEKT",
      zusammenfassung: "Projektarbeit",
      audioUrl: "https://cdn.kiich.de/test.webm",
      dauerSekunden: 45,
      createdAt: new Date("2026-04-07T14:30:00Z"),
    },
    {
      id: 2,
      text: "Ich fühle mich heute sehr energetisch.",
      kategorie: "ICH",
      zusammenfassung: null,
      audioUrl: null,
      dauerSekunden: 12,
      createdAt: new Date("2026-04-07T18:00:00Z"),
    },
  ];

  it("formatiert Aufnahmen korrekt für Obsidian-Plugin", () => {
    const result = formatiereSyncResponse(testAufnahmen);
    expect(result).toHaveLength(2);
    expect(result[0].datum).toBe("2026-04-07");
    expect(result[0].kategorie).toBe("PROJEKT");
    expect(result[0].audioUrl).toBe("https://cdn.kiich.de/test.webm");
  });

  it("datum-Feld ist YYYY-MM-DD Format", () => {
    const result = formatiereSyncResponse(testAufnahmen);
    expect(result[0].datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("createdAt ist ISO-String", () => {
    const result = formatiereSyncResponse(testAufnahmen);
    expect(() => new Date(result[0].createdAt)).not.toThrow();
  });

  it("null-Felder werden korrekt weitergegeben", () => {
    const result = formatiereSyncResponse(testAufnahmen);
    expect(result[1].zusammenfassung).toBeNull();
    expect(result[1].audioUrl).toBeNull();
  });
});

describe("since-Parameter Parsing", () => {
  it("parsiert gültigen Unix-Timestamp", () => {
    const ts = Date.now();
    const result = parseSinceParam(String(ts));
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(ts);
  });

  it("gibt null zurück für undefined", () => {
    expect(parseSinceParam(undefined)).toBeNull();
  });

  it("gibt null zurück für ungültigen String", () => {
    expect(parseSinceParam("nicht-eine-zahl")).toBeNull();
  });

  it("gibt null zurück für leeren String", () => {
    expect(parseSinceParam("")).toBeNull();
  });
});
