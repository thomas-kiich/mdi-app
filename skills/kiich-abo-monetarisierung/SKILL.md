---
name: kiich-abo-monetarisierung
description: "Abo-Modell, Preise, Feature-Gates und Monetarisierungsstrategie für KIICH (kiich.de). Verwenden wenn Abo-Tiers geändert werden, neue Features hinter Paywalls gestellt werden, Preise angepasst werden, Beta-Codes verwaltet werden, oder wenn die Monetarisierungsstrategie relevant ist."
---

# KIICH-Abo & Monetarisierung

## Abo-Tiers (Stand April 2026)

| Tier | Preis | Zielgruppe | Effektive Ebene |
|---|---|---|---|
| **free** | 0 € | Kennenlernen | free |
| **essential** | € 9,90/Monat | Täglicher Einsatz | essential |
| **complete** | € 19,90/Monat | Vollständiges KIICH-Erlebnis | complete |
| **pro** | € 49,90/Monat | Tiefe Identitätsarbeit | pro |
| **beta** | 0 € (eingeladen) | Beta-Tester | complete (Vollzugang) |
| **trial** | 0 € (7 Tage) | Alle neuen Nutzer | complete (Vollzugang) |

Preise in Cent in DB: `essential=990`, `complete=1990`, `pro=4990`.

---

## Feature-Gates (server/abo.ts → `FEATURE_GATES`)

| Feature | free | essential | complete | pro | beta |
|---|---|---|---|---|---|
| `aufnahmen_unbegrenzt` | – | ✓ | ✓ | ✓ | ✓ |
| `reflexions_summary` | – | ✓ | ✓ | ✓ | ✓ |
| `tts_vorlesen` | – | ✓ | ✓ | ✓ | ✓ |
| `obsidian_export` | – | ✓ | ✓ | ✓ | ✓ |
| `einschlaf_bibliothek` | – | ✓ | ✓ | ✓ | ✓ |
| `strategisches_summary` | – | – | ✓ | ✓ | ✓ |
| `yohn_training` | – | – | ✓ | ✓ | ✓ |
| `mdi_analyse` | – | – | ✓ | ✓ | ✓ |
| `archiv` | – | – | ✓ | ✓ | ✓ |
| `mdi_stimmklang_pro` | – | – | – | ✓ | – |

Free-Limits: 10 Aufnahmen/Monat, 5 TTS, 3 Geschichten.

---

## Nutzungslimits pro Tier

| Tier | Aufnahmen/Monat | TTS/Monat | Geschichten/Monat |
|---|---|---|---|
| free | 10 | 5 | 3 |
| trial | ∞ | ∞ | ∞ |
| essential | ∞ | 50 | 10 |
| complete | ∞ | ∞ | ∞ |
| pro | ∞ | ∞ | ∞ |
| beta | ∞ | ∞ | ∞ |
| expired | 0 | 0 | 0 |

---

## Beta-System

- Beta-Codes in DB-Tabelle `betaInvites`, vom Admin erstellt
- Beta läuft 60 Tage ab Einlösung
- Beta = complete-Vollzugang ohne Zahlung
- Einlösen: Nutzer gibt Code in App ein → `betaCodeEinloesen()` in `server/abo.ts`

---

## Zahlungsabwicklung

**Aktuell:** Kein Stripe integriert. Abo-Status wird manuell in der DB gesetzt.

**Geplant:** Stripe via `webdev_add_feature stripe`. Dann:
- Stripe Checkout für Upgrade
- Webhook für `invoice.paid` / `customer.subscription.deleted`
- Prozedur `stripe.createCheckoutSession` in `server/routers/abo.ts`

---

## Wichtige Regeln

1. Feature-Gate-Check immer über `hatFeature(aboInfo, 'feature_name')` aus `server/abo.ts`
2. Trial-Nutzer haben `effektiveEbene = "complete"` – nie `"trial"` für Feature-Checks verwenden
3. Abgelaufene Abos: `status = "expired"`, alle Limits auf 0 → Nutzer sieht Upgrade-Prompt
4. Preisänderungen: `EBENEN_PREISE` in `server/abo.ts` + `client/src/pages/Abo.tsx` synchron halten
5. Neue Features: zuerst in `FEATURE_GATES` eintragen, dann im Code prüfen

---

## Monetarisierungsstrategie

**Konversionspfad:** Trial (7 Tage, complete) → Essential (€9,90) → Complete (€19,90)

**Kernhebel:**
- Trial gibt vollen Zugang → Nutzer erlebt Wert bevor er zahlt
- Essential: TTS + Einschlafbibliothek sind die stärksten Retention-Features
- Complete: YOHN + MDI-Analyse + Archiv für ernsthafte Nutzer
- Pro: für Coaches/Therapeuten die KIICH professionell einsetzen

**Geplante Erweiterungen:**
- Jahresabo mit Rabatt (2 Monate gratis)
- Gruppenlizenzen für Coaches (5–10 Nutzer)
- Einmalzahlung für KIICHwerke-Buch/PDF


