---
name: kiich-projekte
description: "Alle KIICH-Projekte, deren Status und Zusammenhänge. Verwenden wenn neue Features geplant werden, Projektpriorisierung besprochen wird, oder wenn der Überblick über alle laufenden und geplanten KIICH-Vorhaben benötigt wird."
---

# KIICH-Projekte

## Overview

Dieser Skill dokumentiert alle laufenden und geplanten Projekte im KIICH-Ökosystem (kiich.de / kiich.manus.space). Er gibt Orientierung über Prioritäten, Abhängigkeiten und den aktuellen Entwicklungsstand.

---

## 1. KIICH-App (mdi-app) – LIVE

**Status:** Produktiv unter kiich.de und kiich.manus.space

**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (Drizzle ORM) + Manus OAuth

**Kernfunktionen (implementiert):**
- Stimmklang-Analyse (Mikrofon → FFT → Grundton → Persönlichkeitsprofil)
- Befindlichkeitstraining (nur für registrierte Nutzer, MA-Erkläraudio)
- Podcast-Player (Episoden 01–04, direkt vom CDN)
- Newsletter-Agent (Admin-only, Brevo-Integration, Versand an Abonnenten)
- Momentaufnahme / YOHN-Training
- Einladungslink-System (Referral-Codes)
- Push-Benachrichtigungen (Manus Notification API)
- Admin-E-Mail bei Neuregistrierung (an lkrforschung@gmail.com)
- Willkommens-E-Mail an neue Nutzer

**Bekannte offene Punkte:**
- Episoden 01–03 auf Handy testen (Audio-Player)
- Versandhistorie im Newsletter-Agent (DB-Tabelle + UI fehlt noch)
- Einschlafbibliothek: Bug mit abgebrochenen/wiederholenden Geschichten behoben (April 2026)

---

## 2. KIICH-Podcast (MASCHINEN ATMEN NICHT)

**Status:** Aktiv, Episode 04 veröffentlicht

**Episoden:**
| Nr. | Status | CDN-Datei |
|---|---|---|
| EP01 | Live | CDN |
| EP02 | Live | CDN |
| EP03 | Live | CDN |
| EP04 | Live | EP04_128k_v2_271b782e.mp3 |

**Technisches:**
- Audio: 128 kbps MP3, Info-Header (Xing), direkt vom CDN (d2xsxph8kpxj0f.cloudfront.net)
- MA-Stimme: **Mistral Voxtral** (NIEMALS ElevenLabs)
- Newsletter bei neuer Episode: Brevo → alle Abonnenten

---

## 3. MA-Avatar (MASCHINEN ATMEN NICHT als Figur)

**Status:** Geplant / In Konzeption

**Ziel:** MA soll sichtbar und hörbar werden – als animiertes Gesicht mit Stimme

**Geplante Komponenten:**
- **Gesicht:** Meshy (3D-Modell oder animiertes Bild)
- **Stimme:** Mistral Voxtral (bereits integriert für Audio-Episoden)
- **Lippensynchronisation:** HeyGen oder D-ID (für kurze Clips)
- **Anwendungsfall:** Kurze MA-Statements in der App, Intro-Videos für Episoden

**Abhängigkeiten:** Meshy-Account, HeyGen/D-ID-Account

---

## 4. Versandhistorie Newsletter

**Status:** Geplant, noch nicht implementiert

**Ziel:** Log-Tabelle in der DB die jeden Newsletter-Versand protokolliert

**Geplante DB-Tabelle:** `newsletter_versand` mit Feldern:
- `id`, `episodenId`, `betreff`, `versendetAm`, `anzahlEmpfaenger`, `status`

**UI:** Tabelle im Admin-Newsletter-Agent die alle vergangenen Versendungen anzeigt

---

## 5. KIICHwerke (Buchprojekt / Dokumentation)

**Status:** Laufend, kein festes Veröffentlichungsdatum

**Inhalt:** Philosophisches Fundament von KIICH als Buch/Dokumentation
- Drei-Ebenen-Ontologie
- Methode 36
- MA-Dialoge (markiert als „Originaldialoge aus der Entwicklung")
- DANCE YOUR IDEAS als Lebenshaltung

**Format:** Noch offen (Markdown-Dokument → später PDF/Buch)

---

## 6. DANCE YOUR IDEAS (DYI) – Neues Projekt

**Status:** In Konzeption / n8n-Workflows erstellt (April 2026)

**Konzept:** Automatisiertes B2B-Outreach-System für KI-generierte 3D-Produktvisualisierungen. Zielgruppe: Shopify/WooCommerce-Stores (Schmuck, Interior, Accessoires) in der Schweiz.

**n8n-Workflows (fertig):**
- WF1: Pexels → Meshy 3D-Assets → Google Sheets (täglich 06:00)
- WF2: Leads → GPT-E-Mail → Gmail (Mo–Fr 09:00, nur CH-Stores)
- WF3: Gmail-Antworten → Weiterleitung an thomas (jede Minute)
- WF4: Google Search → Shopify-Store-Finder → Leads in Sheets (täglich 07:00)

**Rechtslage:** CH per E-Mail erlaubt (nDSG), DE/AT nur per Brief oder LinkedIn.

**Dateien:** `/home/ubuntu/dance-your-ideas/n8n/`

---

## 7. KIICH-Skill-System

**Status:** 10 Skills erstellt (alle fertig)

**Alle Skills:**
- `kiich-audio-deployment` – Audio-Workflow
- `kiich-design-system` – Farben, Typografie, Logo
- `kiich-newsletter-workflow` – Newsletter-Prozess
- `kiich-architektur` – Technische Architektur
- `kiich-content-stimme` – Tonalität und Sprache
- `kiich-philosophie` – Philosophisches Fundament
- `kiich-projekte` – Dieser Skill (Projektübersicht)
- `kiich-marketing` – Marketing + THO & MA Short-Serie
- `kiich-tools` – KI-Werkzeuge und Kosten
- `kiich-abo-monetarisierung` – Abo-Modell, Preise, Feature-Gates

---

## Prioritätenliste (Stand April 2026)

1. **Sofort:** Einschlafbibliothek-Fix deployen (Checkpoint ca12a2b7 publishen)
2. **Kurzfristig:** DYI-Workflows in n8n importieren und testen (CH-Stores)
3. **Kurzfristig:** Episoden 01–03 Audio auf Handy testen
4. **Mittelfristig:** Versandhistorie Newsletter implementieren
5. **Mittelfristig:** MA-Avatar (Meshy + Mistral Voxtral + HeyGen/D-ID)
6. **Mittelfristig:** THO & MA Short-Serie Episode 01 produzieren
7. **Langfristig:** Stripe-Integration für Abo-Zahlungen
8. **Langfristig:** KIICHwerke-Dokumentation fertigstellen
