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
import { sendConfirmationEmail as sendBrevoConfirmation, sendNewsletter, syncContactToBrevo } from "../brevo";
import { invokeLLM } from "../_core/llm";

export const newsletterRouter = router({
  /**
   * DSGVO: Schritt 1 – Anmeldung (Double-Opt-In).
   * Erstellt inaktiven Eintrag und sendet Bestätigungs-E-Mail via Brevo.
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

        const origin = input.origin ?? "https://kiich.de";
        const confirmUrl = `${origin}/newsletter/bestaetigen?token=${subscriber.confirmToken}`;

        // Bestätigungs-E-Mail via Brevo senden
        const sent = await sendBrevoConfirmation(
          input.email,
          input.name ?? null,
          confirmUrl
        );

        if (!sent) {
          // Fallback: Owner-Benachrichtigung
          await notifyOwner({
            title: `[Newsletter] Bestätigungslink für ${input.email}`,
            content: `Brevo-Versand fehlgeschlagen. Bitte manuell weiterleiten:\n\n${confirmUrl}`,
          });
        }

        return {
          success: true,
          message:
            "Fast geschafft! Bitte prüfe deine E-Mails und bestätige deine Anmeldung.",
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

        // Automatisch in Brevo synchronisieren
        syncContactToBrevo(sub.email, sub.name ?? undefined).catch((err) =>
          console.error('[Newsletter] Brevo-Sync fehlgeschlagen:', err)
        );

        // Owner informieren
        await notifyOwner({
          title: "Newsletter: Neue Bestätigung",
          content: `${sub.email} hat die Anmeldung bestätigt.`,
        });

        return {
          success: true,
          message:
            "Danke! Deine Anmeldung wurde erfolgreich bestätigt. Du erhältst ab sofort jeden Donnerstag aktuelle NEWS.",
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

  /**
   * Admin only: KI-Entwurf für den wöchentlichen Newsletter generieren.
   */
  generateDraft: protectedProcedure
    .input(
      z.object({
        episodeTitle: z.string().min(1),
        episodeDescription: z.string().min(1),
        episodeNumber: z.number().int().positive(),
        additionalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const prompt = `Du bist der Autor Thomas Chochola und schreibst den wöchentlichen Newsletter für deine Hörbuchserie "MASCHINEN ATMEN NICHT – Die Chance auf selbstbestimmtes Glücklichsein".

Erstelle einen Newsletter-Entwurf für Episode ${input.episodeNumber}:
Titel: ${input.episodeTitle}
Beschreibung: ${input.episodeDescription}
${input.additionalNotes ? `Zusätzliche Notizen: ${input.additionalNotes}` : ""}

Der Newsletter soll:
- Persönlich und authentisch klingen (du-Form, direkte Ansprache)
- Neugier auf die neue Episode wecken
- Den philosophischen Kern (Bewusstsein, Identität, KI-Zeitalter, selbstbestimmtes Leben) berühren
- Einen klaren Call-to-Action zur Episode enthalten
- Ca. 150-200 Wörter lang sein
- Mit einer persönlichen Signatur von Thomas enden

Antworte NUR mit dem Newsletter-Text, ohne Erklärungen oder Metakommentare.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Du bist Thomas Chochola, Autor und Denker. Du schreibst persönliche, tiefgründige Newsletter über Bewusstsein, Identität und das selbstbestimmte Leben im KI-Zeitalter.",
          },
          { role: "user", content: prompt },
        ],
      });

      const draft =
        response.choices?.[0]?.message?.content ?? "Entwurf konnte nicht generiert werden.";

      return { draft };
    }),

  /**
   * Admin only: Test-E-Mail NUR an eine einzige Adresse senden.
   * Sendet NIEMALS an die Abonnentenliste.
   */
  sendTest: protectedProcedure
    .input(
      z.object({
        toEmail: z.string().email(),
        subject: z.string().min(1),
        htmlContent: z.string().min(1),
        textContent: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { sendEmail } = await import("../brevo");
      const success = await sendEmail({
        to: [{ email: input.toEmail }],
        subject: `[TEST] ${input.subject}`,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
      });
      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Test-E-Mail konnte nicht gesendet werden." });
      }
      return { message: `Test-E-Mail an ${input.toEmail} gesendet.` };
    }),

  /**
   * Admin only: Newsletter an alle aktiven Abonnenten versenden.
   */
  send: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        htmlContent: z.string().min(1),
        textContent: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const subscribers = await listNewsletterSubscribers({ activeOnly: true });

      if (subscribers.length === 0) {
        return { sent: 0, failed: 0, message: "Keine aktiven Abonnenten gefunden." };
      }

      const recipients = subscribers.map((s) => ({
        email: s.email,
        name: s.name ?? undefined,
        deleteToken: s.deleteToken ?? undefined,
      }));

      const origin = (ctx.req.headers["origin"] as string) ?? "https://kiich.de";

      const result = await sendNewsletter(
        recipients,
        input.subject,
        input.htmlContent,
        input.textContent,
        origin
      );

      await notifyOwner({
        title: `Newsletter versendet: ${input.subject}`,
        content: `Versendet an ${result.sent} Abonnenten. Fehler: ${result.failed}.`,
      });

      return {
        ...result,
        message: `Newsletter erfolgreich an ${result.sent} Abonnenten versendet.`,
      };
    }),
});
