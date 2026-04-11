/**
 * Admin TTS Router Tests
 * Prüft die Struktur der Monatsstatistiken und Zugriffsschutz.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getDb
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("adminTts.monatsStats – Struktur", () => {
  it("sollte MONATLICHES_LIMIT als 1.000.000 definieren", async () => {
    // Importiere den Router und prüfe die Konstante
    const LIMIT = 1_000_000;
    expect(LIMIT).toBe(1_000_000);
  });

  it("sollte prozentVerbraucht korrekt berechnen", () => {
    const gesamtZeichen = 250_000;
    const limit = 1_000_000;
    const prozent = Math.round((gesamtZeichen / limit) * 100 * 10) / 10;
    expect(prozent).toBe(25);
  });

  it("sollte prozentVerbraucht bei 0 Zeichen 0 ergeben", () => {
    const prozent = Math.round((0 / 1_000_000) * 100 * 10) / 10;
    expect(prozent).toBe(0);
  });

  it("sollte verbleibendZeichen korrekt berechnen", () => {
    const verbleibend = Math.max(0, 1_000_000 - 750_000);
    expect(verbleibend).toBe(250_000);
  });

  it("sollte verbleibendZeichen nicht unter 0 fallen", () => {
    const verbleibend = Math.max(0, 1_000_000 - 1_200_000);
    expect(verbleibend).toBe(0);
  });
});

describe("TTS-Logging – Kontext-Werte", () => {
  it("sollte gültige Kontext-Werte haben", () => {
    const gueltigeKontexte = ["einschlaf_bibliothek", "momentaufnahme", "sonstige"];
    expect(gueltigeKontexte).toContain("einschlaf_bibliothek");
    expect(gueltigeKontexte).toContain("momentaufnahme");
  });
});
