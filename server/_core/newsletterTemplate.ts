/**
 * KIICH Newsletter Template Generator
 * Erstellt HTML-Newsletter im bewährten Design (EPISODE 01-06)
 * 
 * Design-Regeln:
 * - Font: Arial, sans-serif (KRITISCH – kein Georgia, kein Serif)
 * - Farben: Orange (#d97706), Weiß (#ffffff), Dunkelgrau (#0a0a10)
 * - Logo: KIICH mit "II" in Orange
 * - Struktur: Header → Meta-Zeile → Titel → Teaser → Fließtext → Zitat-Block → Metadaten → CTA-Button → Footer
 */

export interface NewsletterData {
  episodeNumber: number;
  episodeTitle: string;
  episodeDescription: string;
  teaser: string;
  mainText: string;
  quote?: string;
  duration: string;
  publishedDate: string;
  deleteToken?: string;
}

export function generateNewsletterHTML(data: NewsletterData): string {
  const currentYear = new Date().getFullYear();
  const deleteLink = data.deleteToken 
    ? `https://kiich.de/newsletter/loeschen?token=${data.deleteToken}`
    : "https://kiich.de/newsletter/loeschen";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EPISODE ${data.episodeNumber} – ${data.episodeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a10;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a10;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER: Logo + Episode Badge -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="font-size:28px;font-weight:900;letter-spacing:6px;color:#ffffff;margin:0;">
                K<span style="color:#d97706;">II</span>CH
              </p>
              <p style="font-size:11px;letter-spacing:3px;color:#d97706;margin:8px 0 0 0;text-transform:uppercase;">
                EPISODE ${String(data.episodeNumber).padStart(2, '0')}
              </p>
            </td>
          </tr>

          <!-- META-ZEILE: Jahr | MASCHINEN ATMEN NICHT | Datum -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="font-size:12px;letter-spacing:2px;color:#d97706;margin:0;text-transform:uppercase;">
                ${currentYear} • MASCHINEN ATMEN NICHT • ${data.publishedDate}
              </p>
            </td>
          </tr>

          <!-- TITEL: Episode Title -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="font-size:38px;font-weight:900;color:#ffffff;margin:0;line-height:1.2;text-transform:uppercase;letter-spacing:1px;">
                ${data.episodeTitle}
              </h1>
            </td>
          </tr>

          <!-- TEASER + FLIESSTEXT -->
          <tr>
            <td style="background-color:#111118;border:1px solid #222230;border-radius:12px;padding:40px 36px;">
              
              <!-- Teaser -->
              <p style="font-size:16px;font-weight:600;line-height:1.6;color:#d97706;margin:0 0 20px 0;">
                ${data.teaser}
              </p>

              <!-- Fließtext -->
              <p style="font-size:15px;line-height:1.8;color:#aaa;margin:0 0 24px 0;white-space:pre-wrap;">
${data.mainText}
              </p>

              <!-- Zitat-Block (optional) -->
              ${data.quote ? `
              <div style="border-left:4px solid #d97706;padding-left:16px;margin:24px 0;font-style:italic;color:#bbb;font-size:14px;line-height:1.7;">
                "${data.quote}"
              </div>
              ` : ''}

              <!-- Metadaten -->
              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #222230;">
                <p style="font-size:12px;color:#888;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">
                  📻 Dauer: ${data.duration} | Format: Hörbuch
                </p>
              </div>

            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding:40px 0;">
              <table cellpadding="0" cellspacing="0" style="background-color:#d97706;border-radius:8px;">
                <tr>
                  <td style="padding:16px 40px;">
                    <a href="https://kiich.manus.space/episoden" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      JETZT EPISODE ${String(data.episodeNumber).padStart(2, '0')} HÖREN →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:40px;border-top:1px solid #222230;text-align:center;">
              <p style="font-size:12px;color:#888;margin:0 0 16px 0;">
                <a href="https://kiich.de" style="color:#d97706;text-decoration:none;">KIICH.de</a> 
                | 
                <a href="https://kiich.manus.space/befindlichkeit" style="color:#d97706;text-decoration:none;">Befindlichkeitstraining</a>
              </p>
              <p style="font-size:11px;color:#666;margin:0 0 12px 0;">
                © ${currentYear} KIICH – Dein Identitätssystem für das KI-Zeitalter
              </p>
              <p style="font-size:10px;color:#555;margin:0;">
                <a href="${deleteLink}" style="color:#d97706;text-decoration:none;">Abmelden</a> 
                | 
                <a href="https://kiich.de/datenschutz" style="color:#d97706;text-decoration:none;">Datenschutz</a>
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

export function generateNewsletterText(data: NewsletterData): string {
  return `${data.episodeTitle}

${data.teaser}

${data.mainText}

${data.quote ? `"${data.quote}"` : ''}

Dauer: ${data.duration}
Format: Hörbuch

JETZT EPISODE ${String(data.episodeNumber).padStart(2, '0')} HÖREN
https://kiich.manus.space/episoden

---
KIICH – Dein Identitätssystem für das KI-Zeitalter
https://kiich.de`;
}
