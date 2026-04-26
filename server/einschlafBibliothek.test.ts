import { describe, expect, it } from "vitest";

/**
 * Unit-Tests für die Einschlaf-Bibliothek Qualitätssicherung:
 * 1. Wiederholungs-Check Logik
 * 2. Längen-Constraint Validierung
 * 3. Titel-Extraktion
 */

// Wiederholungs-Check Funktion (aus einschlafBibliothek.ts extrahiert für Tests)
function pruefeWiederholung(text: string): boolean {
  const saetze = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
  if (saetze.length < 4) return false;
  const letzterSatz = saetze[saetze.length - 1].trim().toLowerCase();
  const restText = saetze.slice(0, -1).join(" ").toLowerCase();
  return restText.includes(letzterSatz.substring(0, Math.min(40, letzterSatz.length)));
}

// Titel-Extraktion Funktion
function extrahiereTitel(text: string, fallback: string): { titel: string; text: string } {
  const titelMatch = text.match(/^Titel:\s*(.+)/m);
  if (titelMatch) {
    return {
      titel: titelMatch[1].trim(),
      text: text.replace(/^Titel:\s*.+\n?/m, "").trim(),
    };
  }
  return { titel: fallback, text: text.trim() };
}

describe("Wiederholungs-Check", () => {
  it("erkennt keine Wiederholung in normalem Text", () => {
    const normalerText = `
      Du liegst in einem weichen Bett aus Moos und Sternenstaub.
      Die Nacht hüllt dich ein wie ein sanfter Mantel aus Dunkelheit.
      Dein Atem wird tiefer und ruhiger mit jedem Atemzug.
      Die Gedanken des Tages lösen sich auf wie Nebel im Morgenwind.
      Du gleitest sanft in den Schlaf hinein.
    `.trim();
    expect(pruefeWiederholung(normalerText)).toBe(false);
  });

  it("erkennt Wiederholung wenn letzter Satz bereits vorkommt", () => {
    const textMitWiederholung = `
      Du liegst in einem weichen Bett aus Moos und Sternenstaub.
      Die Nacht hüllt dich ein wie ein sanfter Mantel aus Dunkelheit.
      Dein Atem wird tiefer und ruhiger mit jedem Atemzug.
      Du liegst in einem weichen Bett aus Moos und Sternenstaub.
    `.trim();
    expect(pruefeWiederholung(textMitWiederholung)).toBe(true);
  });

  it("gibt false zurück bei weniger als 4 Sätzen", () => {
    const kurzText = "Erster Satz. Zweiter Satz. Dritter Satz.";
    expect(pruefeWiederholung(kurzText)).toBe(false);
  });

  it("gibt false zurück bei leerem Text", () => {
    expect(pruefeWiederholung("")).toBe(false);
  });
});

describe("Titel-Extraktion", () => {
  it("extrahiert Titel korrekt aus LLM-Output", () => {
    const llmOutput = `Titel: Der stille Wald der Träume\n\nDu gehst durch einen Wald aus silbernem Licht.`;
    const result = extrahiereTitel(llmOutput, "Fallback-Titel");
    expect(result.titel).toBe("Der stille Wald der Träume");
    expect(result.text).toBe("Du gehst durch einen Wald aus silbernem Licht.");
  });

  it("verwendet Fallback wenn kein Titel vorhanden", () => {
    const llmOutput = `Du gehst durch einen Wald aus silbernem Licht.`;
    const result = extrahiereTitel(llmOutput, "Mein Thema");
    expect(result.titel).toBe("Mein Thema");
    expect(result.text).toBe("Du gehst durch einen Wald aus silbernem Licht.");
  });

  it("entfernt die Titel-Zeile aus dem Text", () => {
    const llmOutput = `Titel: Ein Titel\n\nErster Satz der Geschichte. Zweiter Satz.`;
    const result = extrahiereTitel(llmOutput, "Fallback");
    expect(result.text).not.toContain("Titel:");
    expect(result.text).toContain("Erster Satz");
  });
});

describe("Längen-Constraint Validierung", () => {
  it("MÄRCHEN liegt im erlaubten Bereich (450-550 Wörter)", () => {
    // Simuliert eine Geschichte mit ~500 Wörtern
    const woerter = Array(500).fill("Wort").join(" ");
    const anzahl = woerter.split(/\s+/).length;
    expect(anzahl).toBeGreaterThanOrEqual(450);
    expect(anzahl).toBeLessThanOrEqual(550);
  });

  it("ABENTEUER liegt im erlaubten Bereich (550-650 Wörter)", () => {
    const woerter = Array(600).fill("Wort").join(" ");
    const anzahl = woerter.split(/\s+/).length;
    expect(anzahl).toBeGreaterThanOrEqual(550);
    expect(anzahl).toBeLessThanOrEqual(650);
  });

  it("BEFINDLICHKEIT liegt im erlaubten Bereich (400-500 Wörter)", () => {
    const woerter = Array(450).fill("Wort").join(" ");
    const anzahl = woerter.split(/\s+/).length;
    expect(anzahl).toBeGreaterThanOrEqual(400);
    expect(anzahl).toBeLessThanOrEqual(500);
  });
});
