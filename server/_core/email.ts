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
              <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px 0;">
                Buchung bestätigt, ${vorname}.
              </p>
              <p style="font-size:13px;letter-spacing:2px;color:#e85d04;text-transform:uppercase;font-weight:700;margin:0 0 24px 0;">
                Stimmklanganalyse · € 150
              </p>

              <p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 20px 0;">
                Deine Buchung ist eingegangen. Thomas Chochola wird sich in Kürze per E-Mail
                bei dir melden, um einen Termin für das persönliche Coaching-Gespräch zu vereinbaren.
              </p>

              <!-- Nächste Schritte -->
              <p style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;margin:0 0 16px 0;">Was jetzt passiert</p>

              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;margin-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:#e85d04;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Schritt 1 – Starte die Analyse</p>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#888;line-height:1.5;">
                      Öffne die KIICH-App und starte die Stimmklanganalyse. Führe die Aufnahme
                      an 3 aufeinanderfolgenden Tagen durch.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;margin-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:#e85d04;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Schritt 2 – Thomas meldet sich</p>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#888;line-height:1.5;">
                      Nach deinen 3 Analysetagen kontaktiert Thomas dich per E-Mail für
                      einen 45-minütigen Coaching-Termin.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d16;border:1px solid #1e1e2e;border-radius:8px;">
                    <p style="margin:0;font-size:12px;color:#e85d04;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Schritt 3 – Finalcoaching</p>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#888;line-height:1.5;">
                      Thomas erklärt dir dein Ergebnis und zeigt dir, wie du deinen Stimmklang
                      für den Rest deines Lebens im Alltag nützen kannst.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0 0 0;">
                <tr>
                  <td style="background-color:#e85d04;border-radius:4px;">
                    <a href="https://www.kiich.de/stimmklanganalyse"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Zur Stimmklanganalyse →
                    </a>
                  </td>
                </tr>
              </table>
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
              <p style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px 0;">
                Willkommen in RAUM 36, ${vorname}.
              </p>
              <p style="font-size:13px;letter-spacing:2px;color:#7c3aed;text-transform:uppercase;font-weight:700;margin:0 0 24px 0;">
                Abo aktiviert
              </p>

              <p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 20px 0;">
                Dein Zugang zu RAUM 36 ist jetzt aktiv. Du hast Zugriff auf alle exklusiven Inhalte,
                Übungen und Praktiken, die Thomas Chochola speziell für RAUM 36-Mitglieder bereitstellt.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="background-color:#7c3aed;border-radius:4px;">
                    <a href="https://www.kiich.de/raum36"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      RAUM 36 betreten →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;line-height:1.7;color:#666;margin:0;">
                Bei Fragen erreichst du Thomas unter
                <a href="mailto:lkrforschung@gmail.com" style="color:#e85d04;text-decoration:none;">lkrforschung@gmail.com</a>
              </p>
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
