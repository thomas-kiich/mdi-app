/**
 * Sendet Erinnerungs-E-Mail mit Bestätigungslink an Christine
 */

const token = 'd2e73765d87f2b878f854498917c01ce365f026768613bdcff4e2597a28cc27fba08bac8196d0af339ca65855c7b0ade';
const confirmUrl = `https://www.kiich.de/newsletter/bestaetigen?token=${token}`;
const apiKey = process.env.BREVO_API_KEY;

const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 32px 0;">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo_f314ec60.png" alt="KIICH" width="120" style="display:block;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px 0;border-bottom:1px solid #27272a;">
              <h1 style="margin:0;font-size:26px;font-weight:300;color:#ffffff;line-height:1.3;">
                Noch ein Schritt fehlt – deine KIICH-Anmeldung wartet
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">Hallo Christine,</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                vor einigen Tagen hast du dich für den wöchentlichen Newsletter von <strong style="color:#e4e4e7;">KIICH</strong> angemeldet – danke dafür.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Damit deine Anmeldung rechtlich gültig ist, fehlt noch ein einziger Klick auf den Bestätigungslink:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#b45309;border-radius:4px;">
                    <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:1px;font-family:Arial,sans-serif;text-transform:uppercase;">
                      Jetzt bestätigen →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Jeden Donnerstag erhältst du aktuelle NEWS zur Hörbuchserie <em style="color:#e4e4e7;">MASCHINEN ATMEN NICHT</em> sowie Gedanken zu Bewusstsein, Identität und selbstbestimmtem Leben im KI-Zeitalter.
              </p>
              <p style="margin:0;font-size:16px;color:#a1a1aa;line-height:1.7;">Wir freuen uns, wenn du dabei bist.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;font-family:Arial,sans-serif;">
                Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach.<br>
                <a href="${confirmUrl}" style="color:#52525b;word-break:break-all;">${confirmUrl}</a>
              </p>
            </td>
          </tr>
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

const textContent = `Hallo Christine,

vor einigen Tagen hast du dich für den wöchentlichen Newsletter von KIICH angemeldet – danke dafür.

Damit deine Anmeldung rechtlich gültig ist, fehlt noch ein einziger Klick auf den Bestätigungslink:

${confirmUrl}

Jeden Donnerstag erhältst du aktuelle NEWS zur Hörbuchserie MASCHINEN ATMEN NICHT sowie Gedanken zu Bewusstsein, Identität und selbstbestimmtem Leben im KI-Zeitalter.

Wir freuen uns, wenn du dabei bist.

Thomas Chochola · KIICH
Lindacher Weg 17 · D-93128 Regenstauf`;

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    sender: { email: 'newsletter@kiich.de', name: 'Thomas Chochola | KIICH' },
    to: [{ email: 'info@kreativwekstatt.bayern', name: 'Christine' }],
    subject: 'Noch ein Schritt fehlt – deine KIICH-Anmeldung wartet',
    htmlContent,
    textContent,
  }),
});

const text = await res.text();
console.log('Status:', res.status);
console.log('Antwort:', text);
if (res.ok) {
  console.log('✅ E-Mail erfolgreich gesendet!');
} else {
  console.log('❌ Fehler beim Senden');
}
