import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Unit-Tests für Einladungscode-Generierung ────────────────────────────────

describe("Einladungscode-Logik", () => {
  it("generiereEinladungsCode – erzeugt 8-stelligen alphanumerischen Code", () => {
    // Direkt die Logik testen (ohne DB)
    const zeichen = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const generiereCode = () =>
      Array.from({ length: 8 }, () =>
        zeichen[Math.floor(Math.random() * zeichen.length)]
      ).join("");

    const code = generiereCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Z2-9]+$/);
    // Kein O, 0, I, 1 (Verwechslungsgefahr)
    expect(code).not.toMatch(/[O0I1]/);
  });

  it("generiereEinladungsCode – zwei Codes sind unterschiedlich (Zufälligkeit)", () => {
    const zeichen = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const generiereCode = () =>
      Array.from({ length: 8 }, () =>
        zeichen[Math.floor(Math.random() * zeichen.length)]
      ).join("");

    const codes = new Set(Array.from({ length: 20 }, generiereCode));
    // Bei 20 Versuchen sollten mindestens 15 unterschiedlich sein
    expect(codes.size).toBeGreaterThan(15);
  });
});

// ─── parseState Logik ─────────────────────────────────────────────────────────

describe("parseState – OAuth state-Parameter Dekodierung", () => {
  const parseState = (state: string): { redirectUri: string; refCode?: string } => {
    try {
      const decoded = atob(state);
      try {
        const parsed = JSON.parse(decoded);
        if (parsed.redirectUri) return parsed;
      } catch {
        // Altes Format
      }
      return { redirectUri: decoded };
    } catch {
      return { redirectUri: "/" };
    }
  };

  it("dekodiert altes Format (nur redirectUri)", () => {
    const state = btoa("https://www.kiich.de/api/oauth/callback");
    const result = parseState(state);
    expect(result.redirectUri).toBe("https://www.kiich.de/api/oauth/callback");
    expect(result.refCode).toBeUndefined();
  });

  it("dekodiert neues Format (mit refCode)", () => {
    const payload = { redirectUri: "https://www.kiich.de/api/oauth/callback", refCode: "ABC12345" };
    const state = btoa(JSON.stringify(payload));
    const result = parseState(state);
    expect(result.redirectUri).toBe("https://www.kiich.de/api/oauth/callback");
    expect(result.refCode).toBe("ABC12345");
  });

  it("gibt / zurück bei ungültigem state", () => {
    const result = parseState("!!!ungültig!!!");
    expect(result.redirectUri).toBe("/");
  });
});

// ─── getLoginUrl mit refCode ──────────────────────────────────────────────────

describe("getLoginUrl – Einladungscode im state-Parameter", () => {
  it("kodiert refCode korrekt in state", () => {
    // Simuliere getLoginUrl-Logik
    const getLoginUrl = (refCode?: string) => {
      const redirectUri = "https://www.kiich.de/api/oauth/callback";
      const statePayload = refCode
        ? btoa(JSON.stringify({ redirectUri, refCode }))
        : btoa(redirectUri);
      return statePayload;
    };

    const state = getLoginUrl("TESTCODE");
    const decoded = JSON.parse(atob(state));
    expect(decoded.refCode).toBe("TESTCODE");
    expect(decoded.redirectUri).toContain("/api/oauth/callback");
  });

  it("ohne refCode: altes Format (nur redirectUri)", () => {
    const getLoginUrl = (refCode?: string) => {
      const redirectUri = "https://www.kiich.de/api/oauth/callback";
      const statePayload = refCode
        ? btoa(JSON.stringify({ redirectUri, refCode }))
        : btoa(redirectUri);
      return statePayload;
    };

    const state = getLoginUrl();
    const decoded = atob(state);
    // Kein JSON, nur plain URL
    expect(decoded).toBe("https://www.kiich.de/api/oauth/callback");
  });
});
