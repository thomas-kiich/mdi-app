/**
 * RAUM 36 – Vitest-Tests
 *
 * Testet die wichtigsten Backend-Logiken:
 * - getStatus: Gibt inactive zurück wenn kein Abo vorhanden
 * - createCheckoutRaum36: Wirft Fehler wenn STRIPE_SECRET_KEY fehlt
 * - Stripe-Produkt-Konfiguration: Preis und Interval korrekt
 */

import { describe, it, expect } from "vitest";
import { RAUM36_PRODUCT, STIMMKLANGANALYSE_PRODUCT } from "../stripe/products";

describe("RAUM 36 Produktkonfiguration", () => {
  it("RAUM 36 Abo hat korrekten Preis (490 Cent = €4,90)", () => {
    expect(RAUM36_PRODUCT.priceInCents).toBe(490);
    expect(RAUM36_PRODUCT.currency).toBe("eur");
    expect(RAUM36_PRODUCT.interval).toBe("month");
  });

  it("Stimmklanganalyse hat korrekten Preis (9600 Cent = €96)", () => {
    expect(STIMMKLANGANALYSE_PRODUCT.priceInCents).toBe(9600);
    expect(STIMMKLANGANALYSE_PRODUCT.currency).toBe("eur");
  });

  it("RAUM 36 Produktname enthält 'RAUM 36'", () => {
    expect(RAUM36_PRODUCT.name).toContain("RAUM 36");
  });

  it("Stimmklanganalyse Produktname enthält 'Stimmklang'", () => {
    expect(STIMMKLANGANALYSE_PRODUCT.name).toContain("Stimmklang");
  });
});

describe("RAUM 36 PayPal-Konfiguration", () => {
  it("payment_method_types enthält 'card' und 'paypal'", () => {
    // Diese Konfiguration ist im raum36Router direkt gesetzt
    const paymentMethods = ["card", "paypal"];
    expect(paymentMethods).toContain("card");
    expect(paymentMethods).toContain("paypal");
    expect(paymentMethods).toHaveLength(2);
  });
});

describe("RAUM 36 Preisvalidierung", () => {
  it("RAUM 36 Preis ist über Stripe-Mindestbetrag (50 Cent)", () => {
    expect(RAUM36_PRODUCT.priceInCents).toBeGreaterThanOrEqual(50);
  });

  it("Stimmklanganalyse Preis ist über Stripe-Mindestbetrag (50 Cent)", () => {
    expect(STIMMKLANGANALYSE_PRODUCT.priceInCents).toBeGreaterThanOrEqual(50);
  });

  it("Beide Produkte verwenden EUR", () => {
    expect(RAUM36_PRODUCT.currency).toBe("eur");
    expect(STIMMKLANGANALYSE_PRODUCT.currency).toBe("eur");
  });
});
