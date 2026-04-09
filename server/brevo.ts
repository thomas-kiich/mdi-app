/**
 * Brevo (formerly Sendinblue) E-Mail-Helper
 * Verwendet die Brevo REST API v3 für transaktionale E-Mails und Newsletter-Versand
 * Absender: newsletter@kiich.de
 */

const BREVO_API_URL = "https://api.brevo.com/v3";
const SENDER_EMAIL = "newsletter@kiich.de";
const SENDER_NAME = "Thomas Chochola | KIICH";

function getApiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("BREVO_API_KEY ist nicht gesetzt");
  return key;
}

interface EmailRecipient {
  email: string;
  name?: string;
  deleteToken?: string;
}

interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailRecipient;
}

/**
 * Sendet eine einzelne E-Mail über die Brevo API
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "api-key": getApiKey(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
        replyTo: options.replyTo ?? { email: SENDER_EMAIL, name: SENDER_NAME },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Brevo] E-Mail-Fehler:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Brevo] Netzwerkfehler:", err);
    return false;
  }
}

/**
 * Sendet die Double-Opt-In Bestätigungs-E-Mail
 */
export async function sendConfirmationEmail(
  email: string,
  name: string | null,
  confirmUrl: string
): Promise<boolean> {
  const greeting = "HALLO!";

  const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter bestätigen – KIICH</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo_f314ec60.png" alt="KIICH" width="120" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Titel -->
          <tr>
            <td style="padding:0 0 24px 0;border-bottom:1px solid #27272a;">
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#ffffff;line-height:1.3;">
                Noch ein Schritt zur Anmeldung
              </h1>
            </td>
          </tr>
          <!-- Inhalt -->
          <tr>
            <td style="padding:32px 0;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                ${greeting},
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Du hast dich für den wöchentlichen Newsletter von <strong style="color:#e4e4e7;">KIICH</strong> angemeldet. Jeden Donnerstag erhältst du aktuelle NEWS zur Hörbuchserie <em style="color:#e4e4e7;">MASCHINEN ATMEN NICHT</em> sowie Gedanken zu Bewusstsein, Identität und selbstbestimmtem Leben im KI-Zeitalter.
              </p>
              <p style="margin:0 0 32px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Klicke bitte auf den Button, um die Anmeldung rechtlich freizugeben:
              </p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#b45309;border-radius:4px;">
                    <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:1px;font-family:Arial,sans-serif;text-transform:uppercase;">
                      Jetzt freigeben →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Hinweis -->
          <tr>
            <td style="padding:24px 0 0 0;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;font-family:Arial,sans-serif;">
                Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – es passiert nichts weiter.<br>
                Dieser Link ist 48 Stunden gültig.<br><br>
                <a href="${confirmUrl}" style="color:#52525b;word-break:break-all;">${confirmUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0 0;">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo_f314ec60.png" alt="KIICH" width="80" style="display:block;border:0;margin-bottom:8px;" />
              <p style="margin:0;font-size:11px;color:#3f3f46;font-family:Arial,sans-serif;">
                Thomas Chochola · Lindacher Weg 17 · D-93128 Regenstauf<br>
                <a href="https://kiich.de/datenschutz" style="color:#3f3f46;">Datenschutz</a> · 
                <a href="https://kiich.de/impressum" style="color:#3f3f46;">Impressum</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textContent = `${greeting},

Du hast dich für den wöchentlichen Newsletter von KIICH angemeldet.

Klicke bitte auf den folgenden Link, um die Anmeldung rechtlich freizugeben:
${confirmUrl}

Dieser Link ist 48 Stunden gültig.

Falls du dich nicht angemeldet hast, ignoriere diese E-Mail.

Thomas Chochola · KIICH
Lindacher Weg 17 · D-93128 Regenstauf`;

  return sendEmail({
    to: [{ email, name: name ?? undefined }],
    subject: "Noch ein Schritt zur Anmeldung – KIICH",
    htmlContent,
    textContent,
  });
}

/**
 * Sendet den Newsletter an eine Liste von Empfängern.
 * Pro Empfänger wird {{unsubscribeUrl}} durch den individuellen Abmelde-Link ersetzt.
 */
export async function sendNewsletter(
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  textContent: string,
  baseUrl: string = "https://www.kiich.de"
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Jeden Empfänger einzeln versenden damit der Abmelde-Link individuell ist
  for (const recipient of recipients) {
    const unsubscribeUrl = recipient.deleteToken
      ? `${baseUrl}/newsletter/abmelden?token=${recipient.deleteToken}`
      : `${baseUrl}/newsletter/abmelden`;

    const personalHtml = htmlContent
      .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl);
    const personalText = textContent
      .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl);

    const success = await sendEmail({
      to: [{ email: recipient.email, name: recipient.name }],
      subject,
      htmlContent: personalHtml,
      textContent: personalText,
    });
    if (success) {
      sent++;
    } else {
      failed++;
    }
    // Kurze Pause zwischen Versendungen
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return { sent, failed };
}

/**
 * Testet die Brevo-Verbindung (für Vitest)
 */
export async function testBrevoConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${BREVO_API_URL}/account`, {
      headers: {
        "api-key": getApiKey(),
        Accept: "application/json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
