/**
 * Tests für das Abonnement-System (4-Stufen-Modell: free/essential/complete/pro/beta)
 */

import { describe, it, expect } from "vitest";
import {
  EBENEN_LIMITS,
  EBENEN_PREISE,
  PLAENE,
  hatFeature,
  getEffektiveEbene,
  generiereBeataCode,
} from "./abo";

// ─── Limits ───────────────────────────────────────────────────────────────────

describe("Abonnement-System – Ebenen-Limits", () => {
  it("Trial hat unbegrenzte Limits", () => {
    expect(EBENEN_LIMITS.trial.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.trial.tts).toBe(999999);
    expect(EBENEN_LIMITS.trial.geschichten).toBe(999999);
  });

  it("Free hat 10 Aufnahmen, kein TTS, keine Geschichten", () => {
    expect(EBENEN_LIMITS.free.aufnahmen).toBe(10);
    expect(EBENEN_LIMITS.free.tts).toBe(0);
    expect(EBENEN_LIMITS.free.geschichten).toBe(0);
  });

  it("Essential hat unbegrenzte Aufnahmen, 50 TTS, 10 Geschichten", () => {
    expect(EBENEN_LIMITS.essential.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.essential.tts).toBe(50);
    expect(EBENEN_LIMITS.essential.geschichten).toBe(10);
  });

  it("Complete hat unbegrenzte Limits", () => {
    expect(EBENEN_LIMITS.complete.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.complete.tts).toBe(999999);
    expect(EBENEN_LIMITS.complete.geschichten).toBe(999999);
  });

  it("Pro hat unbegrenzte Limits", () => {
    expect(EBENEN_LIMITS.pro.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.pro.tts).toBe(999999);
    expect(EBENEN_LIMITS.pro.geschichten).toBe(999999);
  });

  it("Beta hat unbegrenzte Limits (= Complete)", () => {
    expect(EBENEN_LIMITS.beta.aufnahmen).toBe(999999);
    expect(EBENEN_LIMITS.beta.tts).toBe(999999);
    expect(EBENEN_LIMITS.beta.geschichten).toBe(999999);
  });

  it("Expired hat keine Limits (alles 0)", () => {
    expect(EBENEN_LIMITS.expired.aufnahmen).toBe(0);
    expect(EBENEN_LIMITS.expired.tts).toBe(0);
    expect(EBENEN_LIMITS.expired.geschichten).toBe(0);
  });
});

// ─── Preise ───────────────────────────────────────────────────────────────────

describe("Abonnement-System – Preise (in Euro-Cent)", () => {
  it("Essential kostet € 9,90 (990 Cent)", () => {
    expect(EBENEN_PREISE.essential).toBe(990);
  });

  it("Complete kostet € 19,90 (1990 Cent)", () => {
    expect(EBENEN_PREISE.complete).toBe(1990);
  });

  it("Pro kostet € 49,90 (4990 Cent)", () => {
    expect(EBENEN_PREISE.pro).toBe(4990);
  });

  it("Essential ist günstiger als Complete", () => {
    expect(EBENEN_PREISE.essential).toBeLessThan(EBENEN_PREISE.complete);
  });

  it("Complete ist günstiger als Pro", () => {
    expect(EBENEN_PREISE.complete).toBeLessThan(EBENEN_PREISE.pro);
  });
});

// ─── Feature-Gates ────────────────────────────────────────────────────────────

describe("Abonnement-System – Feature-Gates", () => {
  it("Free hat KEIN Reflexions-Summary", () => {
    expect(hatFeature("free", "reflexions_summary")).toBe(false);
  });

  it("Essential hat Reflexions-Summary", () => {
    expect(hatFeature("essential", "reflexions_summary")).toBe(true);
  });

  it("Essential hat KEIN strategisches Summary", () => {
    expect(hatFeature("essential", "strategisches_summary")).toBe(false);
  });

  it("Complete hat strategisches Summary", () => {
    expect(hatFeature("complete", "strategisches_summary")).toBe(true);
  });

  it("Complete hat KEIN MDI-Stimmklang-Pro", () => {
    expect(hatFeature("complete", "mdi_stimmklang_pro")).toBe(false);
  });

  it("Pro hat MDI-Stimmklang-Pro", () => {
    expect(hatFeature("pro", "mdi_stimmklang_pro")).toBe(true);
  });

  it("Beta hat alle Complete-Features", () => {
    expect(hatFeature("beta", "reflexions_summary")).toBe(true);
    expect(hatFeature("beta", "strategisches_summary")).toBe(true);
    expect(hatFeature("beta", "yohn_training")).toBe(true);
    expect(hatFeature("beta", "archiv")).toBe(true);
  });

  it("Beta hat KEIN MDI-Stimmklang-Pro (nur Pro)", () => {
    expect(hatFeature("beta", "mdi_stimmklang_pro")).toBe(false);
  });
});

// ─── Effektive Ebene ──────────────────────────────────────────────────────────

describe("Abonnement-System – Effektive Ebene", () => {
  it("Aktiver Trial gibt complete zurück", () => {
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 Tage in der Zukunft
    const ebene = getEffektiveEbene({ ebene: "free", status: "trial", trialEndsAt });
    expect(ebene).toBe("complete");
  });

  it("Abgelaufener Trial gibt free zurück", () => {
    const trialEndsAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // gestern
    const ebene = getEffektiveEbene({ ebene: "free", status: "trial", trialEndsAt });
    expect(ebene).toBe("free");
  });

  it("Beta-Status gibt beta zurück", () => {
    const trialEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const ebene = getEffektiveEbene({ ebene: "beta", status: "beta", trialEndsAt });
    expect(ebene).toBe("beta");
  });

  it("Aktives Essential-Abo gibt essential zurück", () => {
    const trialEndsAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const ebene = getEffektiveEbene({ ebene: "essential", status: "active", trialEndsAt });
    expect(ebene).toBe("essential");
  });
});

// ─── Trial-Logik ──────────────────────────────────────────────────────────────

describe("Abonnement-System – Trial-Logik", () => {
  it("Trial dauert 7 Tage (604800000 ms)", () => {
    const trialDauer = 7 * 24 * 60 * 60 * 1000;
    expect(trialDauer).toBe(604800000);
  });

  it("Trial-Ende liegt 7 Tage nach dem Start", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const ende = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(ende.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("Beta-Zugang dauert 60 Tage", () => {
    const betaDauer = 60 * 24 * 60 * 60 * 1000;
    expect(betaDauer).toBe(5184000000);
  });
});

// ─── Beta-Code-Format ─────────────────────────────────────────────────────────

describe("Abonnement-System – Beta-Code-Format", () => {
  it("Generierter Beta-Code beginnt mit KIICH-BETA-", () => {
    const code = generiereBeataCode();
    expect(code).toMatch(/^KIICH-BETA-[0-9A-F]{8}$/);
  });

  it("Jeder generierte Beta-Code ist einzigartig", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generiereBeataCode()));
    expect(codes.size).toBe(20);
  });
});

// ─── Pläne-Struktur ───────────────────────────────────────────────────────────

describe("Abonnement-System – Pläne-Struktur", () => {
  it("Es gibt genau 4 Pläne", () => {
    expect(PLAENE).toHaveLength(4);
  });

  it("Pläne sind in aufsteigender Preisreihenfolge", () => {
    const preise = PLAENE.map(p => p.preis);
    expect(preise).toEqual([0, 990, 1990, 4990]);
  });

  it("Genau ein Plan ist als highlight markiert (Complete)", () => {
    const highlights = PLAENE.filter(p => p.highlight);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].id).toBe("complete");
  });

  it("Alle Pläne haben id, name, preis, features und cta", () => {
    for (const plan of PLAENE) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(typeof plan.preis).toBe("number");
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.cta).toBeTruthy();
    }
  });
});
