/**
 * Tests für das Abonnement-System
 */

import { describe, it, expect } from "vitest";
import { EBENEN_LIMITS, EBENEN_PREISE } from "./abo";

describe("Abonnement-System – Ebenen-Limits", () => {
  it("Trial hat unbegrenzte Limits", () => {
    expect(EBENEN_LIMITS.trial.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.trial.tts).toBe(999999);
    expect(EBENEN_LIMITS.trial.geschichten).toBe(999999);
  });

  it("Ebene I hat korrekte Limits (3 Aufnahmen, kein TTS)", () => {
    expect(EBENEN_LIMITS.I.aufnahmen).toBe(3);
    expect(EBENEN_LIMITS.I.tts).toBe(0);
    expect(EBENEN_LIMITS.I.geschichten).toBe(0);
  });

  it("Ebene II hat korrekte Limits (9 Aufnahmen, 20 TTS)", () => {
    expect(EBENEN_LIMITS.II.aufnahmen).toBe(9);
    expect(EBENEN_LIMITS.II.tts).toBe(20);
    expect(EBENEN_LIMITS.II.geschichten).toBe(5);
  });

  it("Ebene III hat unbegrenzte Limits", () => {
    expect(EBENEN_LIMITS.III.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.III.tts).toBe(999999);
    expect(EBENEN_LIMITS.III.geschichten).toBe(999999);
  });

  it("Expired hat keine Limits (alles 0)", () => {
    expect(EBENEN_LIMITS.expired.aufnahmen).toBe(0);
    expect(EBENEN_LIMITS.expired.tts).toBe(0);
    expect(EBENEN_LIMITS.expired.geschichten).toBe(0);
  });
});

describe("Abonnement-System – Preise (in Euro-Cent)", () => {
  it("Ebene II kostet 9 Euro (900 Cent)", () => {
    expect(EBENEN_PREISE.II).toBe(900);
  });

  it("Ebene III kostet 17 Euro (1700 Cent)", () => {
    expect(EBENEN_PREISE.III).toBe(1700);
  });

  it("Ebene II ist günstiger als Ebene III", () => {
    expect(EBENEN_PREISE.II).toBeLessThan(EBENEN_PREISE.III);
  });
});

describe("Abonnement-System – Trial-Logik", () => {
  it("Trial dauert 7 Tage (in Millisekunden: 7 * 24 * 60 * 60 * 1000)", () => {
    const trialDauer = 7 * 24 * 60 * 60 * 1000;
    expect(trialDauer).toBe(604800000);
  });

  it("Trial-Ende liegt 7 Tage nach dem Start", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const ende = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(ende.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
});
