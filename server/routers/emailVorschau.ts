/**
 * E-Mail-Vorschau-Router (Admin only)
 * Gibt HTML-Vorschau aller E-Mail-Templates zurück und ermöglicht Test-Versand.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { sendEmail, sendeRaum36Neuigkeit, Raum36NeuigkeitTyp } from "../_core/email";
import { getDb } from "../db";
import { users, raum36Subscriptions, newsletterSubscribers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
  }
  return next({ ctx });
});

// ── Hilfsfunktion: HTML-Vorschau generieren ──────────────────────────────────

function getWillkommensHtml(_vorname = "Thomas"): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen bei KIICH</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
              <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">Dein Identitätssystem für das KI-Zeitalter</p>
            </td>
          </tr>
          <!-- Hauptinhalt -->
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">

              <!-- Überschrift -->
              <p style="font-size:26px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;margin:0 0 28px 0;">WILLKOMMEN</p>

              <!-- Einleitungstext -->
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px 0;">Du kannst jetzt die KIICH Plattform nützen – ein Angebot, das dir Unterstützung und Überblick zu der Herausforderung des Mensch Seins im Zeitalter völlig neuer technologischer Möglichkeiten geben soll.</p>

              <!-- Newsletter-Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:#e85d04;border-radius:4px;">
                    <a href="https://www.kiich.de/newsletter" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">ZUM NEWSLETTER →</a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;font-weight:700;color:#e85d04;letter-spacing:2px;text-transform:uppercase;margin:0 0 20px 0;">Die Angebote im Detail:</p>

              <!-- Block 1: MASCHINEN ATMEN NICHT -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px 0;">
                <tr><td style="padding:20px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">1) MASCHINEN ATMEN NICHT</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Das Hörbuch mit wöchentlich erscheinenden EPISODEN. Abonniere gerne den Newsletter für aktuelle Informationen.</p>
                  <a href="https://www.kiich.de/episoden" style="display:inline-block;padding:10px 22px;background-color:#e85d04;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">EPISODEN ANHÖREN →</a>
                </td></tr>
              </table>

              <!-- Block 2: RAUM 36 -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px 0;">
                <tr><td style="padding:20px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">2) RAUM 36</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Hier findest du interaktive Möglichkeiten zu den besten Trainingsmethoden auf Basis optimaler Atmung. Es stehen dir wertvolle Werkzeuge wie ein persönlicher VITALMONITOR zur Verfügung, um dein Alltagsverhalten zu dokumentieren und Rückschlüsse über deinen Entwicklungsstand abzurufen.</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Zudem kannst du direkt Fragen stellen – mit Pseudonym oder mit deiner öffentlichen Klarstellung wer du bist. Allemal beantwortet dir Thomas deine Fragen detailgenau.</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Weiterführend kannst du tiefe Einblicke in deinen Stimmklang und den daraus resultierenden Talenten und Möglichkeiten abrufen. Stets auf Basis der verwendeten wissenschaftlichen wie empirischen Quellen.</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Im WISSENSPOOL werden ständig neue Informationen über Audios zur Verfügung gestellt, auch inspiriert durch die aufgeworfenen Fragen der RAUM 36 Mitglieder.</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">In einem eigenen Bereich zeige ich dir meinen persönlichen ethischen Umgang mit KI und gebe dir auch konkrete Anleitungen wie du KI in deinem Alltag nützen kannst.</p>
                  <p style="margin:0 0 16px 0;font-size:13px;line-height:1.7;color:#aaa;">Das Kernstück ist das Trainingscenter von METHODE 36 – hier erhältst du detailgenaue Instruktionen zu den vielfältigen Trainingsangeboten.</p>
                  <a href="https://www.kiich.de/raum36" style="display:inline-block;padding:10px 22px;background-color:#e85d04;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">Zum RAUM 36 →</a>
                </td></tr>
              </table>

              <!-- Signatur -->
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 8px 0;">Jedenfalls freue ich mich sehr über dein Dabei sein.</p>
              <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px 0;">BREATHE WELL!</p>
              <p style="font-size:14px;color:#888;margin:0;">Thomas</p>

            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">Du erhältst diese E-Mail, weil du dich bei KIICH registriert hast.<br/>
                <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a> · <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getRaum36AntwortHtml(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><title>Thomas hat deine Frage beantwortet</title></head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
          <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">RAUM 36</p>
        </td></tr>
        <!-- Hauptinhalt -->
        <tr><td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
          <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 20px 0;">Thomas hat deine Frage beantwortet</p>
          <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px 0;">Bitte klicke auf den untenstehenden Button und freue dich auf die Antwort auf deine Frage die du Thomas gestellt hattest.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0;">
            <tr><td style="background-color:#e85d04;border-radius:4px;">
              <a href="https://www.kiich.de/raum36" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">ZUM RAUM 36 →</a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">Du erhältst diese E-Mail weil du Mitglied im RAUM 36 bist.<br/>
            <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a> · <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getRaum36KaufHtml(vorname = "Thomas"): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><title>Willkommen in RAUM 36</title></head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a10;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#fff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
          <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">Dein Identitätssystem für das KI-Zeitalter</p>
        </td></tr>
        <tr><td style="background:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
          <p style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">WILLKOMMEN in RAUM 36</p>
          <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px;">Dein Zugang ist jetzt aktiv. Du hast Zugriff auf alle aktuellen Angebote in RAUM 36. Stelle gerne deine Fragen direkt an mich – mit Pseudonym oder mit deiner klaren Identität.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#e85d04;border-radius:4px;">
              <a href="https://www.kiich.de/raum36" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;">RAUM 36 BETRETEN →</a>
            </td></tr>
          </table>
          <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 8px;">Ich freue mich sehr, dass du dabei bist.</p>
          <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px;">BREATHE WELL!</p>
          <p style="font-size:14px;color:#888;margin:0;">Thomas</p>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
            <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a> · <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getStimmklangKaufHtml(vorname = "Thomas"): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><title>Buchungsbestätigung Stimmklanganalyse</title></head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a10;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#fff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
          <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">Stimmklanganalyse</p>
        </td></tr>
        <tr><td style="background:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
          <p style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">BUCHUNG BESTÄTIGT</p>
          <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px;">Danke vielmals für deine Anmeldung. Ich melde mich zeitnah bei dir und erkläre dir den detailgenauen Ablauf des Rituals zu deinen Stimmfrequenzen.</p>
          <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px;">BREATHE WELL!</p>
          <p style="font-size:14px;color:#888;margin:0;">Thomas</p>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
            Bei Fragen: <a href="mailto:lkrforschung@gmail.com" style="color:#555;">lkrforschung@gmail.com</a><br/>
            <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a> · <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getAdminRegistrierungHtml(name = "Max Mustermann", email = "max@beispiel.de"): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><title>Neue KIICH-Registrierung</title></head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a10;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#fff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
          <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">Admin-Benachrichtigung</p>
        </td></tr>
        <tr><td style="background:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
          <p style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px;">🎉 Neue Registrierung</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:12px 16px;background:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
              <p style="margin:0;font-size:13px;color:#888;">Name: <span style="color:#e5e5e5;">${name}</span></p>
              <p style="margin:4px 0 0;font-size:13px;color:#888;">E-Mail: <span style="color:#f5a623;">${email}</span></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Neuigkeit-Vorschau-HTML (Beispieldaten) ─────────────────────────────────

function getRaum36NeuigkeitHtml(
  titelParam?: string,
  textParam?: string,
  linkUrlParam?: string,
  linkLabelParam?: string,
  typLabelParam?: string
): string {
  const typLabel = typLabelParam || "NEUES TRAINING";
  const cfg = { label: typLabel, color: "#e85d04", emoji: "⚡" };
  const vorname = "Thomas";
  const titel = titelParam || "YOHN-Atemübung: Neue Variante verfügbar";
  const text = textParam || "Im RAUM 36 steht dir ab sofort eine neue Variante der YOHN-Atemübung zur Verfügung. Die erweiterte Sequenz integriert die Lichtfarben-Auswahl direkt in den Atemrhythmus – für eine tiefere Resonanzwirkung.";
  // Relative URLs (z.B. "/raum36?tab=methode") automatisch mit Basis-URL ergänzen
  const rawLinkUrl = linkUrlParam || "/raum36?tab=methode";
  const linkUrl = rawLinkUrl.startsWith("http") ? rawLinkUrl : `https://www.kiich.de${rawLinkUrl.startsWith("/") ? rawLinkUrl : "/" + rawLinkUrl}`;
  const linkLabel = linkLabelParam || "Jetzt im RAUM 36 ansehen";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titel}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
              <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">RAUM 36 – Mitglieder-Update</p>
            </td>
          </tr>

          <!-- Typ-Badge -->
          <tr>
            <td style="padding-bottom:16px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${cfg.color}1a;border:1px solid ${cfg.color}55;border-radius:4px;padding:6px 14px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${cfg.color};text-transform:uppercase;">${cfg.emoji} ${cfg.label}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hauptinhalt -->
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
              <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 20px 0;line-height:1.3;">${titel}</p>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px 0;">${text}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${cfg.color};border-radius:4px;">
                    <a href="${linkUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${linkLabel} →</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:11px;color:#555;margin:10px 0 0 0;word-break:break-all;">🔗 ${linkUrl}</p>
            </td>
          </tr>

          <!-- Signatur -->
          <tr>
            <td style="padding-top:28px;padding-bottom:16px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top:1px solid #1e1e2e;padding-top:20px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">Thomas Chochola</p>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#888;letter-spacing:1px;">KIICH · Gründer & Entwickler</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:8px;">
              <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
                Du erhältst diese E-Mail als RAUM 36-Mitglied.<br/>
                <a href="https://www.kiich.de/raum36" style="color:#555;text-decoration:underline;">Zum RAUM 36</a>
                &nbsp;·&nbsp;
                <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a>
                &nbsp;·&nbsp;
                <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Feld-Definitionen pro Template ──────────────────────────────────────────
export type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "email";
  defaultValue: string;
  placeholder?: string;
};

const TEMPLATE_FIELDS: Record<string, TemplateField[]> = {
  willkommen: [
    { key: "vorname", label: "Vorname", type: "text", defaultValue: "Thomas", placeholder: "Vorname des Empfängers" },
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "Willkommen bei KIICH – dein Identitätssystem", placeholder: "E-Mail-Betreff" },
  ],
  raum36_antwort: [
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "Thomas hat deine Frage im RAUM 36 beantwortet", placeholder: "E-Mail-Betreff" },
  ],
  raum36_kauf: [
    { key: "vorname", label: "Vorname", type: "text", defaultValue: "Thomas", placeholder: "Vorname des Empfängers" },
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "Willkommen in RAUM 36 – dein Zugang ist aktiv", placeholder: "E-Mail-Betreff" },
  ],
  stimmklang_kauf: [
    { key: "vorname", label: "Vorname", type: "text", defaultValue: "Thomas", placeholder: "Vorname des Empfängers" },
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "Buchungsbestätigung: Stimmklanganalyse – KIICH", placeholder: "E-Mail-Betreff" },
  ],
  admin_registrierung: [
    { key: "name", label: "Name des Nutzers", type: "text", defaultValue: "Max Mustermann", placeholder: "Vollständiger Name" },
    { key: "email", label: "E-Mail des Nutzers", type: "email", defaultValue: "max@beispiel.de", placeholder: "E-Mail-Adresse" },
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "🎉 Neue KIICH-Registrierung: Max Mustermann", placeholder: "E-Mail-Betreff" },
  ],
  raum36_neuigkeit: [
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "⚡ Neues Training verfügbar – RAUM 36", placeholder: "E-Mail-Betreff" },
    { key: "typLabel", label: "Typ-Badge (oben)", type: "text", defaultValue: "NEUES TRAINING", placeholder: "z.B. NEUES TRAINING / WISSENSPOOL / TECHNIK" },
    { key: "titel", label: "Titel", type: "text", defaultValue: "YOHN-Atemübung: Neue Variante verfügbar", placeholder: "Hauptüberschrift der E-Mail" },
    { key: "text", label: "Text", type: "textarea", defaultValue: "Im RAUM 36 steht dir ab sofort eine neue Variante der YOHN-Atemübung zur Verfügung. Die erweiterte Sequenz integriert die Lichtfarben-Auswahl direkt in den Atemrhythmus – für eine tiefere Resonanzwirkung.", placeholder: "Beschreibungstext" },
    { key: "linkUrl", label: "Link-URL", type: "text", defaultValue: "/raum36?tab=methode", placeholder: "/raum36?tab=methode&training=XXXXX" },
    { key: "linkLabel", label: "Link-Beschriftung", type: "text", defaultValue: "Jetzt im RAUM 36 ansehen", placeholder: "Button-Text" },
  ],
  newsletter_bestaetigung: [
    { key: "betreff", label: "Betreff", type: "text", defaultValue: "Noch ein Schritt zur Anmeldung – KIICH", placeholder: "E-Mail-Betreff" },
  ],
};

// ── Hilfsfunktion: HTML aus Feldern generieren ────────────────────────────────
function buildHtml(templateId: string, fields: Record<string, string>): string {
  switch (templateId) {
    case "willkommen":
      return getWillkommensHtml(fields.vorname || "Thomas");
    case "raum36_antwort":
      return getRaum36AntwortHtml();
    case "raum36_kauf":
      return getRaum36KaufHtml(fields.vorname || "Thomas");
    case "stimmklang_kauf":
      return getStimmklangKaufHtml(fields.vorname || "Thomas");
    case "admin_registrierung":
      return getAdminRegistrierungHtml(fields.name || "Max Mustermann", fields.email || "max@beispiel.de");
    case "raum36_neuigkeit":
      return getRaum36NeuigkeitHtml(
        fields.titel || undefined,
        fields.text || undefined,
        fields.linkUrl || undefined,
        fields.linkLabel || undefined,
        fields.typLabel || undefined
      );
    case "newsletter_bestaetigung":
      return getNewsletterBestaetigungHtml();
    default:
      return "";
  }
}

function getNewsletterBestaetigungHtml(): string {
  const confirmUrl = "https://www.kiich.de/newsletter/bestaetigen?token=BEISPIEL-TOKEN";
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><title>Newsletter bestätigen – KIICH</title></head>
<body style="margin:0;padding:0;background:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a10;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#fff;margin:0;">K<span style="color:#e85d04;">II</span>CH</p>
          <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">Newsletter</p>
        </td></tr>
        <tr><td style="background:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
          <p style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">ANMELDUNG BESTÄTIGEN</p>
          <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px;">Du hast dich für den KIICH-Newsletter angemeldet. Bitte klicke auf den Button um deine Anmeldung zu bestätigen. Dieser Link ist 48 Stunden gültig.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="background:#e85d04;border-radius:4px;">
              <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;">ANMELDUNG BESTÄTIGEN →</a>
            </td></tr>
          </table>
          <p style="font-size:12px;color:#555;line-height:1.6;margin:0;">Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – es passiert nichts weiter.</p>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
            <a href="https://www.kiich.de/datenschutz" style="color:#555;text-decoration:underline;">Datenschutz</a> · <a href="https://www.kiich.de/impressum" style="color:#555;text-decoration:underline;">Impressum</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Alle Templates als Konstante ─────────────────────────────────────────────
export const EMAIL_TEMPLATES = [
  {
    id: "willkommen",
    label: "Willkommens-E-Mail",
    beschreibung: "Geht an neue KIICH-Nutzer nach der Registrierung",
    empfaenger: "Nutzer",
    betreff: "Willkommen bei KIICH – dein Identitätssystem",
    getHtml: () => getWillkommensHtml("Thomas"),
  },
  {
    id: "raum36_antwort",
    label: "RAUM 36 – Frage beantwortet",
    beschreibung: "Geht an Mitglied wenn Thomas eine Frage beantwortet",
    empfaenger: "Mitglied",
    betreff: "Thomas hat deine Frage im RAUM 36 beantwortet",
    getHtml: () => getRaum36AntwortHtml(),
  },
  {
    id: "raum36_kauf",
    label: "RAUM 36 – Kaufbestätigung",
    beschreibung: "Geht an Käufer nach erfolgreichem RAUM 36-Abo",
    empfaenger: "Käufer",
    betreff: "Willkommen in RAUM 36 – dein Zugang ist aktiv",
    getHtml: () => getRaum36KaufHtml("Thomas"),
  },
  {
    id: "stimmklang_kauf",
    label: "Stimmklanganalyse – Kaufbestätigung",
    beschreibung: "Geht an Käufer nach Buchung der Stimmklanganalyse",
    empfaenger: "Käufer",
    betreff: "Buchungsbestätigung: Stimmklanganalyse – KIICH",
    getHtml: () => getStimmklangKaufHtml("Thomas"),
  },
  {
    id: "admin_registrierung",
    label: "Admin – Neue Registrierung",
    beschreibung: "Geht an Thomas bei jeder neuen KIICH-Registrierung",
    empfaenger: "Thomas (Admin)",
    betreff: "🎉 Neue KIICH-Registrierung: Max Mustermann",
    getHtml: () => getAdminRegistrierungHtml(),
  },
  {
    id: "raum36_neuigkeit",
    label: "RAUM 36 – Neuigkeit",
    beschreibung: "Manuell von Thomas versendetes Update an alle aktiven RAUM 36-Mitglieder",
    empfaenger: "Mitglied",
    betreff: "⚡ Neues Training verfügbar – RAUM 36",
    getHtml: () => getRaum36NeuigkeitHtml(),
  },
  {
    id: "newsletter_bestaetigung",
    label: "Newsletter – Anmeldebestätigung",
    beschreibung: "Double-Opt-In Bestätigungsmail nach Newsletter-Anmeldung",
    empfaenger: "Interessent",
    betreff: "Noch ein Schritt zur Anmeldung – KIICH",
    getHtml: () => getNewsletterBestaetigungHtml(),
  },
] as const;
export type EmailTemplateId = typeof EMAIL_TEMPLATES[number]["id"];
// ── Router ────────────────────────────────────────────────────────────────────
export const emailVorschauRouter = router({
  /** Alle Templates als Metadaten (ohne HTML) */
  getTemplates: adminProcedure.query(() => {
    return EMAIL_TEMPLATES.map(({ id, label, beschreibung, empfaenger, betreff }) => ({
      id,
      label,
      beschreibung,
      empfaenger,
      betreff,
    }));
  }),

  /** Felder-Definition für ein Template */
  getTemplateFields: adminProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ input }) => {
      return TEMPLATE_FIELDS[input.templateId] ?? [];
    }),

  /** HTML-Vorschau eines Templates mit optionalen Feld-Werten */
  getVorschau: adminProcedure
    .input(z.object({
      templateId: z.string(),
      fields: z.record(z.string(), z.string()).optional(),
    }))
    .query(({ input }) => {
      const template = EMAIL_TEMPLATES.find((t) => t.id === input.templateId);
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template nicht gefunden" });
      const fields = input.fields ?? {};
      const html = Object.keys(fields).length > 0
        ? buildHtml(input.templateId, fields)
        : template.getHtml();
      const betreff = fields.betreff || template.betreff;
      return { html, betreff, label: template.label };
    }),

  /** Empfänger-Anzahl für Massen-Versand abfragen */
  getEmpfaengerAnzahl: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const raum36Rows = await db
        .select({ email: users.email })
        .from(raum36Subscriptions)
        .leftJoin(users, eq(raum36Subscriptions.userId, users.id))
        .where(eq(raum36Subscriptions.status, "active"));
      const raum36Count = raum36Rows.filter((r) => r.email != null).length;

      const kiichRows = await db
        .select({ email: users.email })
        .from(users);
      const kiichCount = kiichRows.filter((r) => r.email != null).length;

      const newsletterRows = await db
        .select({ email: newsletterSubscribers.email })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.active, true));
      const newsletterCount = newsletterRows.length;

      return { raum36Count, kiichCount, newsletterCount };
    }),

  /** Massen-Versand an RAUM 36-Mitglieder / KIICH-Nutzer / Newsletter (mit Deduplizierung) */
    sendeAnGruppe: adminProcedure
    .input(z.object({
      // gruppen ist jetzt ein Array – mehrere Gruppen werden in einem einzigen deduplizierten Versand zusammengeführt
      gruppen: z.array(z.enum(["raum36", "kiich", "newsletter"])).min(1),
      fields: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Alle drei Gruppen laden
      const raum36Rows = await db
        .select({ name: users.name, email: users.email })
        .from(raum36Subscriptions)
        .leftJoin(users, eq(raum36Subscriptions.userId, users.id))
        .where(eq(raum36Subscriptions.status, "active"));
      const raum36Set = new Set(
        raum36Rows.filter((r) => r.email != null).map((r) => r.email!.toLowerCase())
      );
      const kiichRows = await db.select({ name: users.name, email: users.email }).from(users);
      const kiichSet = new Set(
        kiichRows.filter((r) => r.email != null).map((r) => r.email!.toLowerCase())
      );
      const newsletterRows = await db
        .select({ name: newsletterSubscribers.name, email: newsletterSubscribers.email })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.active, true));
      const newsletterSet = new Set(newsletterRows.map((r) => r.email.toLowerCase()));
      // Alle gewählten Gruppen zusammenführen
      type EmpRow = { name: string | null; email: string };
      const quelleRows: EmpRow[] = [];
      if (input.gruppen.includes("raum36")) {
        quelleRows.push(...raum36Rows.filter((r) => r.email != null).map((r) => ({ name: r.name ?? null, email: r.email! })));
      }
      if (input.gruppen.includes("kiich")) {
        quelleRows.push(...kiichRows.filter((r) => r.email != null).map((r) => ({ name: r.name ?? null, email: r.email! })));
      }
      if (input.gruppen.includes("newsletter")) {
        quelleRows.push(...newsletterRows.map((r) => ({ name: r.name ?? null, email: r.email })));
       }
      // Deduplizierung: jede E-Mail-Adresse nur einmal (case-insensitive)
      const seenEmails = new Set<string>();
      const empfaenger: Array<{ name: string | null; email: string; gruppen: string[] }> = [];
      for (const row of quelleRows) {
        const key = row.email.toLowerCase();
        if (seenEmails.has(key)) continue;
        seenEmails.add(key);
        const gruppen: string[] = [];
        if (raum36Set.has(key)) gruppen.push("RAUM 36");
        if (kiichSet.has(key)) gruppen.push("KIICH");
        if (newsletterSet.has(key)) gruppen.push("Newsletter");
        empfaenger.push({ ...row, gruppen });
      }

      if (empfaenger.length === 0) {
        return { gesendet: 0, fehlgeschlagen: 0, empfaengerAnzahl: 0, empfaengerListe: [] };
      }

      const f = input.fields;
      const result = await sendeRaum36Neuigkeit({
        empfaenger: empfaenger.map((e) => ({ name: e.name, email: e.email })),
        typ: (f.typLabel?.toLowerCase().includes("wissen") ? "wissenspool"
          : f.typLabel?.toLowerCase().includes("technik") ? "technik"
          : f.typLabel?.toLowerCase().includes("allgemein") ? "allgemein"
          : "training") as Raum36NeuigkeitTyp,
        titel: f.titel || "Neuigkeit aus dem RAUM 36",
        text: f.text || "",
        linkUrl: f.linkUrl || undefined,
        linkLabel: f.linkLabel || undefined,
      });

      return {
        ...result,
        empfaengerAnzahl: empfaenger.length,
        empfaengerListe: empfaenger.map((e) => ({
          email: e.email,
          name: e.name ?? "",
          gruppen: e.gruppen,
        })),
      };
    }),

  /** Test-E-Mail mit angepassten Feldern senden */
  sendTestEmail: adminProcedure
    .input(z.object({
      templateId: z.string(),
      empfaengerEmail: z.string().email(),
      fields: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const template = EMAIL_TEMPLATES.find((t) => t.id === input.templateId);
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template nicht gefunden" });
      const fields = input.fields ?? {};
      const html = Object.keys(fields).length > 0
        ? buildHtml(input.templateId, fields)
        : template.getHtml();
      const betreff = fields.betreff || template.betreff;
      const success = await sendEmail({
        to: [{ name: "Thomas Chochola", email: input.empfaengerEmail }],
        subject: `[TEST] ${betreff}`,
        htmlContent: html,
      });
      return { success };
    }),
});
