/**
 * Stripe-Produktkonfiguration für KIICH
 *
 * RAUM 36 – Monatliches Abo: €4.90/Monat (recurring)
 * Stimmklanganalyse – Einmalzahlung: €150
 *
 * Stripe ist im TEST-Modus. Vor dem Launch Donnerstag
 * muss der Live-Key in Settings → Payment eingetragen werden.
 */

import Stripe from "stripe";
import { ENV } from "../_core/env";

// Singleton Stripe-Instanz
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt");
    }
    _stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

/**
 * Produkt-IDs werden beim ersten Checkout dynamisch erstellt
 * und in der Datenbank gecacht (oder direkt via Stripe API abgerufen).
 * Für den Test-Modus werden Produkte bei Bedarf erstellt.
 */

export const RAUM36_PRODUCT = {
  name: "RAUM 36 – Monatliches Mitglied",
  description:
    "Zugang zu RAUM 36: Wochenvideo von Thomas, Fragen direkt an Thomas, Wissenspool mit exklusiven Inhalten und Vitalmonitor-Zugang.",
  priceInCents: 490, // €4.90
  currency: "eur",
  interval: "month" as const,
};

export const STIMMKLANGANALYSE_PRODUCT = {
  name: "Stimmklanganalyse + Finalcoaching",
  description:
    "3-tägige Selbstanalyse mit persönlichem Abschluss-Coaching mit Thomas Chochola. Einmalzahlung.",
  priceInCents: 15000, // €150
  currency: "eur",
};

/**
 * Erstellt oder ruft den Stripe-Preis für RAUM 36 ab.
 * Cached den Preis-ID in der Umgebung für Wiederverwendung.
 */
export async function getRaum36PriceId(): Promise<string> {
  const stripe = getStripe();

  // Suche nach existierendem aktiven Preis
  const prices = await stripe.prices.list({
    active: true,
    type: "recurring",
    currency: "eur",
    limit: 100,
  });

  const existing = prices.data.find(
    (p) =>
      p.unit_amount === RAUM36_PRODUCT.priceInCents &&
      p.recurring?.interval === "month" &&
      p.metadata?.product_key === "raum36_abo"
  );

  if (existing) return existing.id;

  // Neues Produkt + Preis erstellen
  const product = await stripe.products.create({
    name: RAUM36_PRODUCT.name,
    description: RAUM36_PRODUCT.description,
    metadata: { product_key: "raum36_abo" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: RAUM36_PRODUCT.priceInCents,
    currency: RAUM36_PRODUCT.currency,
    recurring: { interval: RAUM36_PRODUCT.interval },
    metadata: { product_key: "raum36_abo" },
  });

  return price.id;
}

/**
 * Erstellt oder ruft den Stripe-Preis für Stimmklanganalyse ab.
 */
export async function getStimmklanganalysePriceId(): Promise<string> {
  const stripe = getStripe();

  const prices = await stripe.prices.list({
    active: true,
    type: "one_time",
    currency: "eur",
    limit: 100,
  });

  const existing = prices.data.find(
    (p) =>
      p.unit_amount === STIMMKLANGANALYSE_PRODUCT.priceInCents &&
      p.metadata?.product_key === "stimmklanganalyse"
  );

  if (existing) return existing.id;

  const product = await stripe.products.create({
    name: STIMMKLANGANALYSE_PRODUCT.name,
    description: STIMMKLANGANALYSE_PRODUCT.description,
    metadata: { product_key: "stimmklanganalyse" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: STIMMKLANGANALYSE_PRODUCT.priceInCents,
    currency: STIMMKLANGANALYSE_PRODUCT.currency,
    metadata: { product_key: "stimmklanganalyse" },
  });

  return price.id;
}
