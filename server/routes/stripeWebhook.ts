/**
 * Stripe Webhook Handler
 *
 * Verarbeitet folgende Events:
 * - checkout.session.completed: Aktiviert RAUM 36 Abo oder Stimmklanganalyse-Bestellung
 * - customer.subscription.deleted: Deaktiviert RAUM 36 Abo
 * - customer.subscription.updated: Aktualisiert Abo-Status
 * - invoice.payment_failed: Markiert Abo als past_due
 *
 * Route: POST /api/stripe/webhook
 * Muss BEFORE express.json() registriert werden (raw body für Signaturverifikation)
 */

import express from "express";
import Stripe from "stripe";
import { getStripe } from "../stripe/products";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { raum36Subscriptions, stimmklanganalyseOrders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const router = express.Router();

router.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    // Test-Event-Erkennung (für Webhook-Verifikation in Stripe Dashboard)
    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        ENV.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error("[Webhook] Signaturverifikation fehlgeschlagen:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Test-Events sofort bestätigen
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Webhook] Event: ${event.type} (${event.id})`);

    const db = await getDb();
    if (!db) {
      console.error("[Webhook] DB nicht verfügbar");
      return res.status(500).send("DB error");
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.user_id ?? "0");
          const product = session.metadata?.product;

          if (!userId) {
            console.warn("[Webhook] checkout.session.completed: Kein user_id in metadata");
            break;
          }

          if (product === "raum36_abo") {
            // RAUM 36 Abo aktivieren
            const existing = await db
              .select()
              .from(raum36Subscriptions)
              .where(eq(raum36Subscriptions.userId, userId))
              .limit(1);

            if (existing.length > 0) {
              await db
                .update(raum36Subscriptions)
                .set({
                  status: "active",
                  stripeCustomerId: session.customer as string ?? null,
                  stripeSubscriptionId: session.subscription as string ?? null,
                  activatedAt: new Date(),
                })
                .where(eq(raum36Subscriptions.userId, userId));
            } else {
              await db.insert(raum36Subscriptions).values({
                userId,
                status: "active",
                stripeCustomerId: session.customer as string ?? null,
                stripeSubscriptionId: session.subscription as string ?? null,
                activatedAt: new Date(),
              });
            }

            console.log(`[Webhook] RAUM 36 Abo aktiviert für userId=${userId}`);
            await notifyOwner({
              title: "RAUM 36: Neues Mitglied",
              content: `Nutzer ${session.metadata?.customer_name ?? "Unbekannt"} (${session.metadata?.customer_email ?? ""}) hat RAUM 36 abonniert.`,
            });
          } else if (product === "stimmklanganalyse") {
            // Stimmklanganalyse-Bestellung aktivieren
            const existing = await db
              .select()
              .from(stimmklanganalyseOrders)
              .where(eq(stimmklanganalyseOrders.userId, userId))
              .limit(1);

            if (existing.length > 0) {
              await db
                .update(stimmklanganalyseOrders)
                .set({
                  status: "paid",
                  stripeCustomerId: session.customer as string ?? null,
                  stripePaymentIntentId: session.payment_intent as string ?? null,
                  paidAt: new Date(),
                })
                .where(eq(stimmklanganalyseOrders.userId, userId));
            } else {
              await db.insert(stimmklanganalyseOrders).values({
                userId,
                status: "paid",
                stripeCustomerId: session.customer as string ?? null,
                stripePaymentIntentId: session.payment_intent as string ?? null,
                paidAt: new Date(),
              });
            }

            console.log(`[Webhook] Stimmklanganalyse bezahlt für userId=${userId}`);
            await notifyOwner({
              title: "Stimmklanganalyse: Neue Bestellung",
              content: `Nutzer ${session.metadata?.customer_name ?? "Unbekannt"} (${session.metadata?.customer_email ?? ""}) hat die Stimmklanganalyse gebucht.`,
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const subId = subscription.id;

          await db
            .update(raum36Subscriptions)
            .set({ status: "cancelled" })
            .where(eq(raum36Subscriptions.stripeSubscriptionId, subId));

          console.log(`[Webhook] RAUM 36 Abo gekündigt: ${subId}`);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const subId = subscription.id;
          const stripeStatus = subscription.status;

          // Stripe-Status auf lokalen Status mappen
          let localStatus: "active" | "inactive" | "cancelled" | "past_due" = "inactive";
          if (stripeStatus === "active") localStatus = "active";
          else if (stripeStatus === "canceled") localStatus = "cancelled";
          else if (stripeStatus === "past_due") localStatus = "past_due";

          await db
            .update(raum36Subscriptions)
            .set({ status: localStatus })
            .where(eq(raum36Subscriptions.stripeSubscriptionId, subId));

          console.log(`[Webhook] RAUM 36 Abo-Status aktualisiert: ${subId} → ${localStatus}`);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = (invoice as any).subscription as string | null;

          if (subId) {
            await db
              .update(raum36Subscriptions)
              .set({ status: "past_due" })
              .where(eq(raum36Subscriptions.stripeSubscriptionId, subId));

            console.log(`[Webhook] Zahlung fehlgeschlagen für Abo: ${subId}`);
          }
          break;
        }

        default:
          console.log(`[Webhook] Unbehandeltes Event: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error("[Webhook] Verarbeitungsfehler:", err.message);
      res.status(500).send("Webhook processing error");
    }
  }
);

export default router;
