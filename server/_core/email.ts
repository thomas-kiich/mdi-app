/**
 * E-Mail-Helper via Brevo (Transactional Email API)
 * Verwendet den BREVO_API_KEY aus den Umgebungsvariablen.
 */
import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";

// Absender – immer KIICH
const SENDER = { name: "KIICH", email: "noreply@kiich.de" };

export interface SendEmailOptions {
  to: { name?: string; email: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn("[Email] BREVO_API_KEY fehlt – E-Mail nicht gesendet.");
    return false;
  }
  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: SENDER,
        to: opts.to,
        subject: opts.subject,
        htmlContent: opts.htmlContent,
        textContent: opts.textContent ?? opts.subject,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      }
    );
    console.log(`[Email] Gesendet an ${opts.to.map((t) => t.email).join(", ")}: ${opts.subject}`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Email] Fehler beim Senden:", msg);
    return false;
  }
}

/**
 * Willkommens-E-Mail für neue KIICH-User
 */
export async function sendeWillkommensEmail(user: {
  name: string | null;
  email: string | null;
}): Promise<boolean> {
  if (!user.email) {
    console.warn("[Email] Kein E-Mail-Adresse für Willkommens-Mail vorhanden.");
    return false;
  }

  const vorname = user.name?.split(" ")[0] ?? "du";

  const htmlContent = `
<!DOCTYPE html>
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

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#e85d04;">II</span>CH
              </p>
              <p style="font-size:11px;letter-spacing:3px;color:#888;margin:6px 0 0 0;text-transform:uppercase;">
                Dein Identitätssystem für das KI-Zeitalter
              </p>
            </td>
          </tr>

          <!-- Hauptinhalt -->
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
              <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px 0;">
                Willkommen, ${vorname}.
              </p>
              <p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 20px 0;">
                Du bist jetzt Teil von KIICH – einem System, das dir hilft, deine Identität im KI-Zeitalter zu verstehen, zu stärken und zu gestalten.
              </p>
              <p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 28px 0;">
                Dein erster Schritt: Höre dir die aktuellen Episoden an und entdecke, was KIICH für dich bereithält.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="background-color:#e85d04;border-radius:4px;">
                    <a href="https://www.kiich.de/episoden"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Episoden anhören →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3 Punkte -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;margin-bottom:10px;">
                    <p style="margin:0;font-size:13px;color:#f5a623;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Stimmklang-Analyse</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#888;line-height:1.5;">Entdecke deinen persönlichen Wurzelklang durch eine einfache Stimmaufnahme.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                    <p style="margin:0;font-size:13px;color:#7c3aed;font-weight:700;letter-spacing:1px;text-transform:uppercase;">MOMENTAUFNAHME</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#888;line-height:1.5;">Dein KI-Tagebuch. Sprich frei – MA hört zu und spiegelt dir zurück, was wirklich wichtig war.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                    <p style="margin:0;font-size:13px;color:#10b981;font-weight:700;letter-spacing:1px;text-transform:uppercase;">YOHN-Training</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#888;line-height:1.5;">Die Methode 36 – Atemübung mit deinem persönlichen Ton für innere Stärke und Klarheit.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
                Du erhältst diese E-Mail, weil du dich bei KIICH registriert hast.<br/>
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
</html>
  `.trim();

  return sendEmail({
    to: [{ name: user.name ?? undefined, email: user.email }],
    subject: "Willkommen bei KIICH – dein Identitätssystem",
    htmlContent,
    textContent: `Willkommen bei KIICH, ${vorname}!\n\nDu bist jetzt Teil von KIICH – einem System, das dir hilft, deine Identität im KI-Zeitalter zu verstehen, zu stärken und zu gestalten.\n\nDein erster Schritt: https://www.kiich.de/episoden\n\nKIICH – Dein Identitätssystem für das KI-Zeitalter`,
  });
}
