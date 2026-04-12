/**
 * Kontakt-Router – Datenschutzanfragen (Art. 15–22 DSGVO)
 * Sendet Anfragen per E-Mail an den Betreiber via Brevo
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { sendEmail } from "../brevo";
import { notifyOwner } from "../_core/notification";

const OWNER_EMAIL = "LKRforschung@gmail.com";

const ANFRAGE_TYPEN: Record<string, string> = {
  auskunft: "Auskunft (Art. 15 DSGVO)",
  berichtigung: "Berichtigung (Art. 16 DSGVO)",
  loeschung: "Löschung (Art. 17 DSGVO)",
  einschraenkung: "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
  widerspruch: "Widerspruch (Art. 21 DSGVO)",
  datenuebertragbarkeit: "Datenübertragbarkeit (Art. 20 DSGVO)",
  sonstiges: "Sonstiges",
};

export const kontaktRouter = router({
  /**
   * Datenschutzanfrage einreichen – sendet E-Mail an Betreiber und Bestätigung an Absender
   */
  datenschutzAnfrage: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Bitte gib deinen Namen an.").max(200),
        email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
        anfrageTyp: z.enum([
          "auskunft",
          "berichtigung",
          "loeschung",
          "einschraenkung",
          "widerspruch",
          "datenuebertragbarkeit",
          "sonstiges",
        ]),
        nachricht: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const typLabel = ANFRAGE_TYPEN[input.anfrageTyp] ?? input.anfrageTyp;
      const timestamp = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

      // E-Mail an Betreiber
      const ownerHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:32px;border-radius:12px;">
          <h2 style="color:#f97316;margin-top:0;">📋 Neue Datenschutzanfrage</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#a1a1aa;width:160px;">Eingang:</td><td style="padding:8px 0;">${timestamp}</td></tr>
            <tr><td style="padding:8px 0;color:#a1a1aa;">Name:</td><td style="padding:8px 0;">${input.name}</td></tr>
            <tr><td style="padding:8px 0;color:#a1a1aa;">E-Mail:</td><td style="padding:8px 0;"><a href="mailto:${input.email}" style="color:#f97316;">${input.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#a1a1aa;">Anfragetyp:</td><td style="padding:8px 0;font-weight:bold;color:#fff;">${typLabel}</td></tr>
          </table>
          ${input.nachricht ? `<div style="margin-top:16px;padding:16px;background:#18181b;border-radius:8px;border-left:3px solid #f97316;"><p style="margin:0;color:#a1a1aa;font-size:12px;margin-bottom:8px;">NACHRICHT:</p><p style="margin:0;">${input.nachricht.replace(/\n/g, "<br/>")}</p></div>` : ""}
          <p style="margin-top:24px;font-size:12px;color:#52525b;">Bitte antworte innerhalb von 30 Tagen gemäß Art. 12 Abs. 3 DSGVO.</p>
        </div>
      `;

      // Bestätigungs-E-Mail an Absender
      const confirmHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:32px;border-radius:12px;">
          <h2 style="color:#f97316;margin-top:0;">✅ Deine Anfrage ist eingegangen</h2>
          <p>Hallo ${input.name},</p>
          <p>wir haben deine Datenschutzanfrage erhalten und werden sie gemäß Art. 12 Abs. 3 DSGVO innerhalb von <strong>30 Tagen</strong> bearbeiten.</p>
          <div style="margin:24px 0;padding:16px;background:#18181b;border-radius:8px;">
            <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;">DEINE ANFRAGE:</p>
            <p style="margin:0;font-weight:bold;color:#fff;">${typLabel}</p>
            ${input.nachricht ? `<p style="margin:8px 0 0;color:#a1a1aa;">${input.nachricht.replace(/\n/g, "<br/>")}</p>` : ""}
          </div>
          <p>Bei Rückfragen erreichst du uns unter: <a href="mailto:${OWNER_EMAIL}" style="color:#f97316;">${OWNER_EMAIL}</a></p>
          <p style="margin-top:32px;font-size:12px;color:#52525b;">Thomas Chochola / KIICHwerke · Lindacher Weg 17 · D-93128 Regenstauf</p>
        </div>
      `;

      const [ownerSent, confirmSent] = await Promise.all([
        sendEmail({
          to: [{ email: OWNER_EMAIL, name: "Thomas Chochola" }],
          subject: `[KIICH Datenschutz] ${typLabel} von ${input.name}`,
          htmlContent: ownerHtml,
          replyTo: { email: input.email, name: input.name },
        }),
        sendEmail({
          to: [{ email: input.email, name: input.name }],
          subject: `Deine Datenschutzanfrage bei KIICH – Eingangsbestätigung`,
          htmlContent: confirmHtml,
        }),
      ]);

      // Fallback: Owner-Benachrichtigung wenn Brevo fehlschlägt
      if (!ownerSent) {
        await notifyOwner({
          title: `[Datenschutz] ${typLabel} von ${input.name}`,
          content: `E-Mail: ${input.email}\nAnfragetyp: ${typLabel}\n\n${input.nachricht ?? ""}`,
        });
      }

      return { success: true, ownerSent, confirmSent };
    }),
});
