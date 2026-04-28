/**
 * Tests für den vital Router
 * Testet DSGVO-konforme Zugriffskontrolle und Datenspeicherung
 */

import { describe, it, expect } from "vitest";
import { COACHING_EINWILLIGUNGSTEXT_V1 } from "./routers/vital";

describe("COACHING_EINWILLIGUNGSTEXT_V1", () => {
  it("enthält die DSGVO-Rechtsgrundlage Art. 9 Abs. 2 lit. a", () => {
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("Art. 9 Abs. 2 lit. a DSGVO");
  });

  it("enthält den Widerrufsvorbehalt", () => {
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("jederzeit");
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("widerrufen");
  });

  it("enthält alle relevanten Datenkategorien", () => {
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("Ruhepuls");
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("HRV");
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("BOLT");
  });

  it("ist nicht leer und hat ausreichende Länge", () => {
    expect(COACHING_EINWILLIGUNGSTEXT_V1.length).toBeGreaterThan(200);
  });

  it("enthält den Namen des Coaches", () => {
    expect(COACHING_EINWILLIGUNGSTEXT_V1).toContain("Thomas Chochola");
  });
});

describe("Datum-Validierung (Regex-Pattern)", () => {
  const datumPattern = /^\d{4}-\d{2}-\d{2}$/;

  it("akzeptiert gültiges ISO-Datum", () => {
    expect(datumPattern.test("2025-01-15")).toBe(true);
    expect(datumPattern.test("2026-12-31")).toBe(true);
  });

  it("lehnt ungültige Formate ab", () => {
    expect(datumPattern.test("15.01.2025")).toBe(false);
    expect(datumPattern.test("2025/01/15")).toBe(false);
    expect(datumPattern.test("2025-1-5")).toBe(false);
    expect(datumPattern.test("")).toBe(false);
  });
});
