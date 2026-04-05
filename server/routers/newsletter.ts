import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  confirmNewsletterSubscription,
  deleteNewsletterData,
  getNewsletterSubscriberCount,
  listNewsletterSubscribers,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { invokeLLM } from "../_core/llm";

/**
 * Sendet die Double-Opt-In Bestätigungs-E-Mail via LLM-generiertem Text
 * und Manus Notification API.
 */
async function sendConfirmationEmail(opts: {
  email: string;
  name?: string | null;
  confirmUrl: string;
  unsubscribeUrl: string;
}) {
  // Wir nutzen notifyOwner als Kanal – in Produktion sollte hier ein
  // echter E-Mail-Dienst (z. B. Resend) eingebunden werden.
  // Für jetzt: Owner-Benachrichtigung mit allen Infos.
  await notifyOwner({
    title: `[Newsletter] Bestätigung angefordert: ${opts.email}`,
    content: `
Neue Newsletter-Anmeldung – bitte Bestätigungslink manuell weiterleiten:

An: ${opts.email}
Name: ${opts.name ?? "–"}

Bestätigungslink:
${opts.confirmUrl}

Abmeldelink:
${opts.unsubscribeUrl}
    `.trim(),
  });
}

export const newsletterRouter = router({
  /**
   * DSGVO: Schritt 1 – Anmeldung (Double-Opt-In).
   * Erstellt inaktiven Eintrag und sendet Bestätigungs-E-Mail.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
        name: z.string().max(255).optional(),
        source: z.string().max(64).optional(),
        /** Frontend übergibt window.location.origin für korrekte Callback-URLs */
        origin: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // IP-Adresse für Einwilligungsnachweis (Art. 7 DSGVO)
      const signupIp =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        ctx.req.socket?.remoteAddress ||
        null;

      try {
        const subscriber = await subscribeToNewsletter({
          email: input.email,
          name: input.name,
          source: input.source ?? "website",
          signupIp: signupIp ?? undefined,
        });

        const origin = input.origin ?? "https://kiich.manus.space";
        const confirmUrl = `${origin}/newsletter/bestaetigen?token=${subscriber.confirmToken}`;
        const unsubscribeUrl = `${origin}/newsletter/abmelden?token=${subscriber.deleteToken}`;

        // Bestätigungs-E-Mail senden
        await sendConfirmationEmail({
          email: input.email,
          name: input.name,
          confirmUrl,
          unsubscribeUrl,
        });

        return {
          success: true,
          message: "Fast geschafft! Bitte prüfe deine E-Mails und bestätige deine Anmeldung.",
        };
      } catch (err: any) {
        if (err.message === "ALREADY_SUBSCRIBED") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Diese E-Mail-Adresse ist bereits aktiv angemeldet.",
          });
        }
        console.error("[Newsletter] Subscribe error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Anmeldung fehlgeschlagen. Bitte versuche es später erneut.",
        });
      }
    }),

  /**
   * DSGVO: Schritt 2 – Bestätigung per Token (Double-Opt-In).
   */
  confirm: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const sub = await confirmNewsletterSubscription(input.token);

        // Owner informieren
        await notifyOwner({
          title: "Newsletter: Neue Bestätigung",
          content: `${sub.email} hat die Anmeldung bestätigt.`,
        });

        return {
          success: true,
          message: "Danke! Deine Anmeldung wurde erfolgreich bestätigt. Du wirst ab sofort informiert.",
        };
      } catch (err: any) {
        if (err.message === "INVALID_TOKEN") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ungültiger oder abgelaufener Bestätigungslink.",
          });
        }
        if (err.message === "ALREADY_CONFIRMED") {
          return {
            success: true,
            message: "Deine Anmeldung war bereits bestätigt.",
          };
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Bestätigung fehlgeschlagen. Bitte versuche es erneut.",
        });
      }
    }),

  /**
   * DSGVO: Abmeldung per Token (aus E-Mail-Link).
   */
  unsubscribe: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const result = await unsubscribeFromNewsletter(input.token);
        return {
          success: true,
          message: `${result.email} wurde erfolgreich abgemeldet.`,
        };
      } catch (err: any) {
        if (err.message === "INVALID_TOKEN") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ungültiger Abmeldelink.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Abmeldung fehlgeschlagen.",
        });
      }
    }),

  /**
   * DSGVO Art. 17: Vollständige Datenlöschung per Token.
   */
  deleteData: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const result = await deleteNewsletterData(input.token);
        return {
          success: true,
          message: `Alle gespeicherten Daten für ${result.email} wurden vollständig gelöscht.`,
        };
      } catch (err: any) {
        if (err.message === "INVALID_TOKEN") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ungültiger Löschlink.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Datenlöschung fehlgeschlagen.",
        });
      }
    }),

  /**
   * Admin only: Alle Abonnenten auflisten.
   */
  list: protectedProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins dürfen die Abonnentenliste einsehen.",
        });
      }
      return listNewsletterSubscribers({ activeOnly: input.activeOnly });
    }),

  /**
   * Öffentlich: Abonnenten-Zähler für Social Proof.
   */
  count: publicProcedure.query(async () => {
    return getNewsletterSubscriberCount();
  }),
});
