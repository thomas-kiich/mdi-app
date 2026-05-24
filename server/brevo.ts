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
  const htmlContent = `<!DOCTYPE html>
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
          <p style="font-size:12px;color:#555;line-height:1.6;margin:0;">Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – es passiert nichts weiter.<br/><a href="${confirmUrl}" style="color:#555;word-break:break-all;">${confirmUrl}</a></p>
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

  const textContent = `ANMELDUNG BESTÄTIGEN

Du hast dich für den KIICH-Newsletter angemeldet.
Bitte klicke auf den folgenden Link um deine Anmeldung zu bestätigen:
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

    const emailOptions: Parameters<typeof sendEmail>[0] = {
      to: [{ email: recipient.email, name: recipient.name }],
      subject,
      htmlContent: personalHtml,
      textContent: personalText,
    };

    const success = await sendEmail(emailOptions);
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
 * Fügt einen Kontakt zu Brevo hinzu oder aktualisiert ihn (upsert).
 * Wird automatisch nach jeder bestätigten Newsletter-Anmeldung aufgerufen.
 */
export async function syncContactToBrevo(
  email: string,
  name?: string | null
): Promise<boolean> {
  try {
    const apiKey = getApiKey();

    // 1. Kontakt anlegen/aktualisieren
    const body: Record<string, unknown> = {
      email,
      updateEnabled: true,
    };
    if (name) {
      const parts = name.trim().split(' ');
      body.attributes = {
        FIRSTNAME: parts[0] ?? '',
        LASTNAME: parts.slice(1).join(' ') ?? '',
      };
    }

    const createRes = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 201 = created, 204 = updated, 400 = already exists – alles ok
    if (!createRes.ok && createRes.status !== 400) {
      const err = await createRes.text();
      console.error('[Brevo] Kontakt anlegen fehlgeschlagen:', err);
      return false;
    }

    // 2. Zur Newsletter-Liste (ID 2) hinzufügen
    const listRes = await fetch(`${BREVO_API_URL}/contacts/lists/2/contacts/add`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ emails: [email] }),
    });

    if (!listRes.ok && listRes.status !== 400) {
      const err = await listRes.text();
      console.error('[Brevo] Zur Liste hinzufügen fehlgeschlagen:', err);
      return false;
    }

    console.log(`[Brevo] Kontakt synchronisiert: ${email}`);
    return true;
  } catch (err) {
    console.error('[Brevo] syncContactToBrevo Fehler:', err);
    return false;
  }
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
