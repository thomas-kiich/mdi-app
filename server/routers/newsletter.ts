import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getNewsletterSubscriberCount,
  listNewsletterSubscribers,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const newsletterRouter = router({
  /**
   * Public: Subscribe an email address to the newsletter.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
        name: z.string().max(255).optional(),
        source: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const subscriber = await subscribeToNewsletter({
          email: input.email,
          name: input.name,
          source: input.source ?? "website",
        });

        // Notify the owner about the new subscriber
        await notifyOwner({
          title: "Neuer Newsletter-Abonnent",
          content: `${input.email}${input.name ? ` (${input.name})` : ""} hat sich für den Newsletter angemeldet.`,
        });

        return {
          success: true,
          reactivated: (subscriber as any).reactivated ?? false,
          message: (subscriber as any).reactivated
            ? "Willkommen zurück! Deine Anmeldung wurde reaktiviert."
            : "Danke! Du wirst ab sofort über neue Episoden informiert.",
        };
      } catch (err: any) {
        if (err.message === "ALREADY_SUBSCRIBED") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Diese E-Mail-Adresse ist bereits angemeldet.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Anmeldung fehlgeschlagen. Bitte versuche es später erneut.",
        });
      }
    }),

  /**
   * Public: Unsubscribe an email address from the newsletter.
   */
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      await unsubscribeFromNewsletter(input.email);
      return { success: true, message: "Du wurdest erfolgreich abgemeldet." };
    }),

  /**
   * Admin only: List all subscribers.
   */
  list: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen die Abonnentenliste einsehen." });
      }
      return listNewsletterSubscribers({ activeOnly: input.activeOnly });
    }),

  /**
   * Public: Get subscriber count (for social proof display).
   */
  count: publicProcedure.query(async () => {
    return getNewsletterSubscriberCount();
  }),
});
