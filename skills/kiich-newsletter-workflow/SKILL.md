---
name: kiich-newsletter-workflow
description: "Vollstaendiger Workflow fuer den KIICH-Newsletter. Verwenden wenn ein neuer Newsletter fuer eine KIICH-Episode erstellt oder versendet werden soll. Enthaelt Template-Aufbau, Brevo-Integration, Sicherheitsregeln und Admin-Prozess."
---

# KIICH Newsletter Workflow

## Admin-URL

`/admin/newsletter` (nur fuer eingeloggten Admin zugaenglich)

## 6-Schritt-Prozess

**Schritt 01** – Episodennummer, Titel, Beschreibung, Dauer, Erscheinungsdatum, Zitat (optional), BT-Block Titel + Beschreibung (optional) eingeben. Alle Felder werden in localStorage gespeichert.

**Schritt 02** – KI-Entwurf generieren: Newsletter im Stil von Thomas Chochola (persoenlich, philosophisch, du-Form, 150-200 Woerter). Entwurf kann manuell bearbeitet werden.

**Schritt 03** – BT-CTA-Schalter: Befindlichkeitstraining-Block aktivieren (optional).

**Schritt 04** – Vorschau: Live-HTML im iframe, Links oeffnen in neuem Tab. Oeffnet sich automatisch wenn gespeicherter Entwurf vorhanden.

**Schritt 05** – Test-E-Mail: IMMER NUR an Admin-E-Mail (ctx.user.email) – serverseitig erzwungen, kein Eingabefeld.

**Schritt 06** – Versand an alle aktiven Abonnenten. Bestaetigung erforderlich. Owner-Notification nach Versand.

## Newsletter-Template Aufbau

Header: KIICH-Logo (II in orange #d97706) + Episode-Badge
Meta-Zeile: Jahr MASCHINEN ATMEN NICHT Datum (orange)
Titel: Episodentitel (weiss, uppercase, 38px)
Teaser + Fliesstext + optionaler Zitat-Block (oranger Rand)
BT-Exklusiv-Block (optional)
Metadaten: Dauer, Erschienen, Format
CTA-Button: JETZT EPISODE XX HOEREN (orange)
Footer: KIICH-Logo + Links

## Schrift-Regel (KRITISCH)

Ausschließlich `font-family:Arial,sans-serif;` im Newsletter-HTML. **Kein Georgia, kein Serif.** Gilt für alle Textelemente (Teaser, Fließtext, Zitat-Block, Metadaten).

## Button-URLs

| Button | URL |
|---|---|
| "JETZT EPISODE XX HÖREN →" | `https://kiich.manus.space/episoden` |
| "JETZT IN DER APP ÖFFNEN →" | `https://kiich.manus.space/befindlichkeit` |
| Website (Footer) | `https://kiich.de` |

Alle Links haben `target="_blank"` und sind in der Vorschau klickbar (iframe hat `allow-popups`).

## Brevo-Integration

- API-Key: BREVO_API_KEY (Env-Variable)
- Abonnenten-Tabelle: newsletter_subscribers in der DB
- Betreff Test-E-Mail: [TEST] {subject}
- localStorage-Key: kiich_nl_draft_v1

## Sicherheitsregeln

- sendTest: Immer nur an Admin-E-Mail (ctx.user.email) - serverseitig erzwungen
- send: Nur fuer role === admin
- generateDraft: Nur fuer Admin
