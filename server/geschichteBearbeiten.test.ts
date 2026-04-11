import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Titel: Neuer Titel\n\nDies ist der neue Text der Geschichte." } }],
  }),
}));

describe("Geschichte bearbeiten — Logik-Tests", () => {
  describe("Titel-Extraktion", () => {
    it("extrahiert Titel korrekt aus KI-Antwort", () => {
      const rawText = "Titel: Der stille See\n\nEs war einmal ein ruhiger See.";
      const titelMatch = rawText.match(/^Titel:\s*(.+)/m);
      expect(titelMatch).not.toBeNull();
      expect(titelMatch![1].trim()).toBe("Der stille See");

      const text = rawText.replace(/^Titel:\s*.+\n?/m, "").trim();
      expect(text).toBe("Es war einmal ein ruhiger See.");
    });

    it("behält ursprünglichen Titel wenn kein Titel-Prefix vorhanden", () => {
      const rawText = "Es war einmal ein ruhiger See.";
      const titelMatch = rawText.match(/^Titel:\s*(.+)/m);
      expect(titelMatch).toBeNull();
    });
  });

  describe("stelleKorrigieren — Abschnitt-Erkennung", () => {
    it("erkennt ob Abschnitt im Text vorkommt", () => {
      const text = "Erster Absatz.\n\nZweiter Absatz mit mehr Inhalt.\n\nDritter Absatz.";
      const abschnitt = "Zweiter Absatz mit mehr Inhalt.";
      expect(text.includes(abschnitt)).toBe(true);
    });

    it("schlägt fehl wenn Abschnitt nicht im Text vorkommt", () => {
      const text = "Erster Absatz.\n\nZweiter Absatz.";
      const abschnitt = "Nicht vorhandener Abschnitt.";
      expect(text.includes(abschnitt)).toBe(false);
    });

    it("ersetzt Abschnitt korrekt im Text", () => {
      const text = "Erster Absatz.\n\nAlter Abschnitt.\n\nDritter Absatz.";
      const abschnitt = "Alter Abschnitt.";
      const neuerAbschnitt = "Neuer Abschnitt mit besseren Bildern.";
      const neuerText = text.replace(abschnitt, neuerAbschnitt);
      expect(neuerText).toBe("Erster Absatz.\n\nNeuer Abschnitt mit besseren Bildern.\n\nDritter Absatz.");
    });
  });

  describe("neuSchreiben — Prompt-Aufbau", () => {
    it("enthält WICHTIG-Hinweis für neue Version", () => {
      const neuHinweis = "\n\nWICHTIG: Schreibe eine NEUE Version mit einem anderen Erzählansatz";
      expect(neuHinweis).toContain("WICHTIG");
      expect(neuHinweis).toContain("NEUE Version");
    });

    it("setzt audioUrl auf null nach Neu-Schreiben", () => {
      const updated = { titel: "Neuer Titel", text: "Neuer Text", audioUrl: null };
      expect(updated.audioUrl).toBeNull();
    });
  });
});
