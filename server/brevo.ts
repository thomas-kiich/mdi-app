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
              <p style="margin:0;font-size:11px;letter-spacing:4px;color:#b45309;text-transform:uppercase;font-family:Arial,sans-serif;">
                KIICH · MDI SYSTEM
              </p>
            </td>
          </tr>
          <!-- Titel -->
          <tr>
            <td style="padding:0 0 24px 0;border-bottom:1px solid #27272a;">
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#ffffff;line-height:1.3;">
                Bitte bestätige deine<br>Newsletter-Anmeldung
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
                Klicke auf den Button, um deine Anmeldung zu bestätigen:
              </p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#b45309;border-radius:4px;">
                    <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:1px;font-family:Arial,sans-serif;text-transform:uppercase;">
                      Anmeldung bestätigen →
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

Bitte bestätige deine Anmeldung unter folgendem Link:
${confirmUrl}

Dieser Link ist 48 Stunden gültig.

Falls du dich nicht angemeldet hast, ignoriere diese E-Mail.

Thomas Chochola · KIICH
Lindacher Weg 17 · D-93128 Regenstauf`;

  return sendEmail({
    to: [{ email, name: name ?? undefined }],
    subject: "Bitte bestätige deinen Newsletter – KIICH",
    htmlContent,
    textContent,
  });
}

/**
 * Sendet den Newsletter an eine Liste von Empfängern
 */
export async function sendNewsletter(
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ sent: number; failed: number }> {
  // Brevo erlaubt max. 50 Empfänger pro API-Aufruf im kostenlosen Plan
  // Wir senden in Batches
  const BATCH_SIZE = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const success = await sendEmail({
      to: batch,
      subject,
      htmlContent,
      textContent,
    });
    if (success) {
      sent += batch.length;
    } else {
      failed += batch.length;
    }
    // Kurze Pause zwischen Batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
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
