/**
 * E-Mail-Helper via Brevo (Transactional Email API)
 * Verwendet den BREVO_API_KEY aus den Umgebungsvariablen.
 */
import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";

// Absender – immer KIICH
const SENDER = { name: "KIICH", email: "yohn@kiich.de" };

export interface SendEmailOptions {
  to: { name?: string; email: string }[];
  bcc?: { name?: string; email: string }[];
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
        ...(opts.bcc && opts.bcc.length > 0 ? { bcc: opts.bcc } : {}),
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
              <p style="font-size:26px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;margin:0 0 28px 0;">WILLKOMMEN</p>
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
              <!-- Block 1 -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px 0;">
                <tr><td style="padding:20px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">1) MASCHINEN ATMEN NICHT</p>
                  <p style="margin:0 0 14px 0;font-size:13px;line-height:1.7;color:#aaa;">Das Hörbuch mit wöchentlich erscheinenden EPISODEN. Abonniere gerne den Newsletter für aktuelle Informationen.</p>
                  <a href="https://www.kiich.de/episoden" style="display:inline-block;padding:10px 22px;background-color:#e85d04;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">EPISODEN ANHÖREN →</a>
                </td></tr>
              </table>
              <!-- Block 2 -->
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
              <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px 0;">BREATH WELL!</p>
              <p style="font-size:14px;color:#888;margin:0;">Thomas</p>
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

/**
 * Bestätigungs-E-Mail nach Stimmklanganalyse-Kauf
 * Geht an den Käufer (Bestätigung + nächste Schritte)
 * und an Thomas (Benachrichtigung über neue Bestellung).
 */
export async function sendeStimmklangKaufBestaetigung(user: {
  name: string | null;
  email: string | null;
}): Promise<boolean> {
  if (!user.email) {
    console.warn("[Email] Keine E-Mail für Stimmklang-Bestätigung.");
    return false;
  }

  const vorname = user.name?.split(" ")[0] ?? "du";
  const ADMIN_EMAIL = "lkrforschung@gmail.com";
  const zeitpunkt = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

  // ── 1. Bestätigungs-E-Mail an den Käufer ──────────────────────────────────
  const htmlKaeufer = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deine Stimmklanganalyse – Buchungsbestätigung</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
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
              <p style="font-size:26px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;margin:0 0 28px 0;">BUCHUNG BESTÄTIGT</p>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 16px 0;">Willkommen – dein Zugang zur Stimmklanganalyse ist jetzt aktiv. Du kannst mit Tag 1 starten wenn du bereit bist.</p>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px 0;">Du findest in RAUM 36 den jeweiligen aktuellen Stand deiner Analyse angezeigt.</p>
              <p style="margin:0 0 28px 0;">
                <a href="https://www.kiich.de/stimmklang-start" style="display:inline-block;background:#e85d04;color:#ffffff;text-decoration:none;padding:14px 28px;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;">JETZT STARTEN</a>
              </p>
              <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px 0;">BREATH WELL!</p>
              <p style="font-size:14px;color:#888;margin:0;">Thomas</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
                Bei Fragen erreichst du Thomas unter
                <a href="mailto:lkrforschung@gmail.com" style="color:#555;text-decoration:underline;">lkrforschung@gmail.com</a><br/>
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

  const kaeuferOk = await sendEmail({
    to: [{ name: user.name ?? undefined, email: user.email }],
    subject: "Buchungsbestätigung: Stimmklanganalyse – KIICH",
    htmlContent: htmlKaeufer,
    textContent: `Buchungsbestätigung – Stimmklanganalyse\n\nHallo ${vorname},\n\ndeine Buchung ist eingegangen. Thomas Chochola wird sich in Kürze bei dir melden.\n\nNächste Schritte:\n1. Starte die Stimmklanganalyse in der KIICH-App (3 Tage)\n2. Thomas kontaktiert dich für den Coaching-Termin\n3. Finalcoaching mit Thomas\n\nZur App: https://www.kiich.de/stimmklanganalyse\n\nBei Fragen: lkrforschung@gmail.com`,
  });

  // ── 2. Admin-Benachrichtigung an Thomas ───────────────────────────────────
  const htmlAdmin = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Neue Stimmklanganalyse-Buchung</title></head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:26px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#e85d04;">II</span>CH
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:32px;">
              <p style="font-size:20px;font-weight:700;color:#e85d04;margin:0 0 20px 0;">🎤 Neue Stimmklanganalyse-Buchung</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                    <span style="font-size:16px;color:#fff;font-weight:600;">${user.name ?? "Unbekannt"}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">E-Mail</span><br/>
                    <span style="font-size:16px;color:#fff;">
                      <a href="mailto:${user.email}" style="color:#e85d04;text-decoration:none;">${user.email}</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Betrag</span><br/>
                    <span style="font-size:16px;color:#fff;font-weight:700;">€ 150,00</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Zeitpunkt</span><br/>
                    <span style="font-size:16px;color:#fff;">${zeitpunkt}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:13px;color:#888;line-height:1.6;">
                Bitte melde dich nach Abschluss der 3-tägigen Analyse beim Kunden für den Coaching-Termin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const adminOk = await sendEmail({
    to: [{ name: "Thomas Chochola", email: ADMIN_EMAIL }],
    subject: `🎤 Neue Stimmklanganalyse-Buchung: ${user.name ?? "Unbekannt"} (${user.email})`,
    htmlContent: htmlAdmin,
    textContent: `Neue Stimmklanganalyse-Buchung:\nName: ${user.name ?? "Unbekannt"}\nE-Mail: ${user.email}\nBetrag: € 150,00\nZeitpunkt: ${zeitpunkt}\n\nBitte melde dich nach den 3 Analysetagen beim Kunden.`,
  });

  return kaeuferOk && adminOk;
}

/**
 * Admin-Benachrichtigung bei neuer Registrierung
 * Sendet eine E-Mail an den KIICH-Admin wenn sich ein neuer User registriert.
 */
export async function sendeAdminRegistrierungsbenachrichtigung(user: {
  name: string | null;
  email: string | null;
  loginMethod: string | null;
}): Promise<boolean> {
  const ADMIN_EMAIL = "lkrforschung@gmail.com";
  const name = user.name ?? "Unbekannt";
  const email = user.email ?? "keine E-Mail";
  const methode = user.loginMethod ?? "unbekannt";
  const zeitpunkt = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

  const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Neue KIICH-Registrierung</title></head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:26px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#e85d04;">II</span>CH
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:32px;">
              <p style="font-size:20px;font-weight:700;color:#e85d04;margin:0 0 20px 0;">🎉 Neue Registrierung</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                    <span style="font-size:16px;color:#fff;font-weight:600;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">E-Mail</span><br/>
                    <span style="font-size:16px;color:#fff;">${email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Login via</span><br/>
                    <span style="font-size:16px;color:#fff;">${methode}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Zeitpunkt</span><br/>
                    <span style="font-size:16px;color:#fff;">${zeitpunkt}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return sendEmail({
    to: [{ name: "Thomas Chochola", email: ADMIN_EMAIL }],
    subject: `🎉 Neue KIICH-Registrierung: ${name}`,
    htmlContent,
    textContent: `Neue KIICH-Registrierung:\nName: ${name}\nE-Mail: ${email}\nLogin via: ${methode}\nZeitpunkt: ${zeitpunkt}`,
  });
}

/**
 * Bestätigungs-E-Mail nach RAUM 36 Abo-Kauf
 * Geht an den Käufer (Willkommen + nächste Schritte)
 * und an Thomas (Benachrichtigung über neues Mitglied).
 */
export async function sendeRaum36KaufBestaetigung(user: {
  name: string | null;
  email: string | null;
}): Promise<boolean> {
  if (!user.email) {
    console.warn("[Email] Keine E-Mail für RAUM 36-Bestätigung.");
    return false;
  }

  const vorname = user.name?.split(" ")[0] ?? "du";
  const ADMIN_EMAIL = "lkrforschung@gmail.com";
  const zeitpunkt = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

  // ── 1. Bestätigungs-E-Mail an den Käufer ──────────────────────────────────
  const htmlKaeufer = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen in RAUM 36</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
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
                <p style="font-size:26px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;margin:0 0 28px 0;">WILLKOMMEN in RAUM 36</p>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 20px 0;">Dein Zugang ist jetzt aktiv. Du hast Zugriff auf alle aktuellen Angebote in RAUM 36. Stelle gerne deine Fragen direkt an mich – mit Pseudonym oder mit deiner klaren Identität.</p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:#e85d04;border-radius:4px;">
                    <a href="https://www.kiich.de/raum36" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">RAUM 36 BETRETEN →</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 8px 0;">Ich freue mich sehr, dass du dabei bist.</p>
              <p style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px 0;">BREATH WELL!</p>
              <p style="font-size:14px;color:#888;margin:0;">Thomas</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="font-size:11px;color:#444;margin:0;line-height:1.6;">
                Du erhältst diese E-Mail, weil du RAUM 36 abonniert hast.<br/>
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

  const kaeuferOk = await sendEmail({
    to: [{ name: user.name ?? undefined, email: user.email }],
    subject: "Willkommen in RAUM 36 – dein Zugang ist aktiv",
    htmlContent: htmlKaeufer,
    textContent: `Willkommen in RAUM 36, ${vorname}!\n\nDein Zugang ist jetzt aktiv. Besuche RAUM 36 unter: https://www.kiich.de/raum36\n\nBei Fragen: lkrforschung@gmail.com\n\nKIICH – Dein Identitätssystem für das KI-Zeitalter`,
  });

  // ── 2. Admin-Benachrichtigung an Thomas ───────────────────────────────────
  const htmlAdmin = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Neues RAUM 36 Mitglied</title></head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:26px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#e85d04;">II</span>CH
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:32px;">
              <p style="font-size:20px;font-weight:700;color:#7c3aed;margin:0 0 20px 0;">🏛️ Neues RAUM 36 Mitglied</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                    <span style="font-size:16px;color:#fff;font-weight:600;">${user.name ?? "Unbekannt"}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">E-Mail</span><br/>
                    <span style="font-size:16px;color:#fff;">
                      <a href="mailto:${user.email}" style="color:#e85d04;text-decoration:none;">${user.email}</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Zeitpunkt</span><br/>
                    <span style="font-size:16px;color:#fff;">${zeitpunkt}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const adminOk = await sendEmail({
    to: [{ name: "Thomas Chochola", email: ADMIN_EMAIL }],
    subject: `🏛️ Neues RAUM 36 Mitglied: ${user.name ?? "Unbekannt"} (${user.email})`,
    htmlContent: htmlAdmin,
    textContent: `Neues RAUM 36 Mitglied:\nName: ${user.name ?? "Unbekannt"}\nE-Mail: ${user.email}\nZeitpunkt: ${zeitpunkt}`,
  });

  return kaeuferOk && adminOk;
}


/**
 * Voranmeldung zur Stimmklanganalyse
 * Sendet eine Benachrichtigung an Thomas (lkrforschung@gmail.com)
 * wenn sich jemand für die Stimmklanganalyse vormerken lässt.
 */
export async function sendeVoranmeldungStimmklang(data: {
  name: string;
  email: string;
  nachricht: string;
}): Promise<boolean> {
  const ADMIN_EMAIL = "lkrforschung@gmail.com";
  const zeitpunkt = new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

  const htmlAdmin = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Voranmeldung Stimmklanganalyse</title></head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:26px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#e85d04;">II</span>CH
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:32px;">
              <p style="font-size:20px;font-weight:700;color:#e85d04;margin:0 0 20px 0;">🎤 Voranmeldung: Stimmklanganalyse</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                    <span style="font-size:16px;color:#fff;font-weight:600;">${data.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">E-Mail</span><br/>
                    <span style="font-size:16px;color:#fff;">
                      <a href="mailto:${data.email}" style="color:#e85d04;text-decoration:none;">${data.email}</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Nachricht</span><br/>
                    <span style="font-size:15px;color:#ccc;line-height:1.6;">${data.nachricht.replace(/\n/g, "<br/>")}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Zeitpunkt</span><br/>
                    <span style="font-size:14px;color:#888;">${zeitpunkt}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:13px;color:#888;line-height:1.6;">
                Bitte nimm Kontakt mit dieser Person auf, sobald die Stimmklanganalyse in RAUM 36 verfügbar ist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return sendEmail({
    to: [{ name: "Thomas Chochola", email: ADMIN_EMAIL }],
    subject: `🎤 Voranmeldung Stimmklanganalyse: ${data.name} (${data.email})`,
    htmlContent: htmlAdmin,
    textContent: `Voranmeldung Stimmklanganalyse:\nName: ${data.name}\nE-Mail: ${data.email}\nNachricht: ${data.nachricht}\nZeitpunkt: ${zeitpunkt}`,
  });
}

/**
 * Neuigkeit-E-Mail an alle RAUM 36-Mitglieder
 * Wird von Thomas manuell aus dem Admin ausgelöst.
 */
export type Raum36NeuigkeitTyp = "training" | "wissenspool" | "technik" | "allgemein";

const NEUIGKEIT_CONFIG: Record<Raum36NeuigkeitTyp, { label: string; color: string; emoji: string }> = {
  training: { label: "NEUES TRAINING", color: "#e85d04", emoji: "⚡" },
  wissenspool: { label: "WISSENSPOOL", color: "#7c3aed", emoji: "🧠" },
  technik: { label: "NEUE FUNKTION", color: "#10b981", emoji: "🔧" },
  allgemein: { label: "NEUIGKEIT", color: "#f5a623", emoji: "📣" },
};

export async function sendeRaum36Neuigkeit(opts: {
  empfaenger: Array<{ name: string | null; email: string }>;
  typ: Raum36NeuigkeitTyp;
  titel: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
}): Promise<{ gesendet: number; fehlgeschlagen: number }> {
  const cfg = NEUIGKEIT_CONFIG[opts.typ];
  let gesendet = 0;
  let fehlgeschlagen = 0;

  for (const empfaenger of opts.empfaenger) {
    const vorname = empfaenger.name?.split(" ")[0] ?? "du";

    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.titel}</title>
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
                RAUM 36 – Mitglieder-Update
              </p>
            </td>
          </tr>

          <!-- Typ-Badge -->
          <tr>
            <td style="padding-bottom:16px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${cfg.color}20;border:1px solid ${cfg.color}40;border-radius:4px;padding:6px 14px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${cfg.color};">
                      ${cfg.emoji} ${cfg.label}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hauptinhalt -->
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
              <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 20px 0;">
                ${opts.titel}
              </p>
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 28px 0;white-space:pre-line;">
                ${opts.text}
              </p>

              <!-- Standard CTA Button – immer sichtbar -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 12px 0;">
                <tr>
                  <td style="background-color:#e85d04;border-radius:4px;">
                    <a href="https://www.kiich.de/raum36"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      RAUM 36 BETRETEN →
                    </a>
                  </td>
                </tr>
              </table>

              ${opts.linkUrl ? `
              <!-- Optionaler Spezial-Link -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 8px 0;">
                <tr>
                  <td style="background-color:${cfg.color};border-radius:4px;">
                    <a href="${opts.linkUrl}"
                       style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      ${opts.linkLabel ?? "Direkt zum Inhalt →"}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Signatur -->
              <p style="font-size:13px;color:#666;margin:28px 0 0 0;border-top:1px solid #222;padding-top:20px;">
                Thomas Chochola · KIICH
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
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

    const success = await sendEmail({
      to: [{ name: empfaenger.name ?? undefined, email: empfaenger.email }],
      subject: `${cfg.emoji} ${opts.titel} – RAUM 36`,
      htmlContent,
      textContent: `${opts.titel}\n\n${opts.text}${opts.linkUrl ? `\n\n${opts.linkLabel ?? "Jetzt ansehen"}: ${opts.linkUrl}` : ""}\n\nThomas Chochola · KIICH\nhttps://www.kiich.de/raum36`,
    });

    if (success) {
      gesendet++;
    } else {
      fehlgeschlagen++;
    }

    // Kurze Pause um Brevo-Rate-Limit zu vermeiden
    await new Promise((r) => setTimeout(r, 100));
  }

  return { gesendet, fehlgeschlagen };
}
