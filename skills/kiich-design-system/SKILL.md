---
name: kiich-design-system
description: "Design-System und visuelle Identität für das KIICH-Projekt (kiich.manus.space / kiich.de). Verwenden bei allen UI-Änderungen, neuen Seiten, Komponenten oder wenn Farben, Typografie, Logo-Regeln oder der visuelle Stil von KIICH relevant sind."
---

# KIICH Design System

## Kernidentität

**KIICH** steht für *2 minds ∿ 1 source* – Plattform für Persönlichkeitsentfaltung im KI-Zeitalter. Visueller Stil: **Neo-Brutalist Dark** – tiefes Schwarz, orange Akzente, keine runden Ecken, klare Hierarchien.

## Farbpalette

| Token | Hex | Verwendung |
|---|---|---|
| Orange (Primär) | `#d97706` / `#FF6B00` | CTAs, Akzente, Highlights, Logo-II |
| Gold | `#f5a623` | Sekundäre Akzente |
| Hintergrund | `#000000` | Seitenhintergrund |
| Karte | `#111111` | Karten-Hintergrund (Newsletter) |
| Trennlinie | `#27272a` | Borders |
| Text sekundär | `#71717a` / `#a8a29e` | Muted Text |
| Weiß | `#ffffff` | Primärer Text |

**CSS-Variablen (Tailwind/OKLCH):**
- `--primary: oklch(0.65 0.22 45)` (Orange)
- `--background: oklch(0 0 0)` (Schwarz)
- `--radius: 0rem` (Neo-Brutalist: keine runden Ecken)

## Logo-Regel (KRITISCH)

```
K  [II]  CH
```

- **K** und **CH**: weiß
- **[II]**: **immer orange `#d97706`** – niemals rot
- HTML: `K<span style="color:#d97706;">II</span>CH`
- Header: font-size 26px | Footer: font-size 22px | font-weight 900 | letter-spacing -1px

## Typografie

| Schrift | Verwendung |
|---|---|
| Inter | UI-Text, Buttons, Labels |
| Playfair Display | Dekorative Überschriften |
| Cinzel | Ceremonielle Titel |
| Philosopher | Philosophische Zitate |
| Arial | Newsletter-HTML (kein Google Fonts in E-Mails) |
| ~~Georgia~~ | **NICHT VERWENDEN** – durch Arial ersetzt |

## Thema & Radius

- Immer **Dark Mode** (`defaultTheme="dark"`) – kein Theme-Switcher
- `--radius: 0rem` für die App-UI
- Newsletter-Buttons: `border-radius: 4px` (E-Mail-Client-Kompatibilität)

## Newsletter-Schrift-Regel (KRITISCH)

Im Newsletter-HTML ausschließlich `font-family:Arial,sans-serif;` verwenden – **kein Georgia, kein Serif**. Gilt für Teaser, Fließtext, Zitat-Block und alle Absätze. Klare, unverschnörkelte Schrift ist KIICH-Standard.

## MA – Das Gesicht von KIICH

MA ist die KI-Figur des Projekts, entwickelt aus dem Buchcover "Maschinen atmen nicht".

- **Visuell:** 3D-Gesicht (halb Maschine, halb Mensch) – erstellt mit **Meshy** aus dem Buchcover
- **Stimme:** Ausschließlich **Mistral Voxtral** – NIEMALS ElevenLabs oder andere TTS-Dienste
- **Charakter:** Ruhig, präzise, leicht maschinell – die Stimme zwischen den Frequenzen
- **Akzentfarbe Befindlichkeit:** `text-violet-400` (Violet als spezifischer Akzent für diese Seite)

## Login-Hinweis (Standard)

Für geschützte Seiten (Befindlichkeit, Momentaufnahme etc.):

> *"Dieses Training steht dir als registrierter Nutzer kostenfrei zur Verfügung."*

Button: **"Einloggen →"** mit `bg-violet-600 hover:bg-violet-500 rounded-full`

## Seiten-Übersicht

| Route | Seite | Schutz |
|---|---|---|
| `/` | Home (Landing) | öffentlich |
| `/episoden` | Podcast-Player | öffentlich |
| `/befindlichkeit` | Befindlichkeitstraining | Login |
| `/momentaufnahme/app` | Momentaufnahme | Login |
| `/wissen` | Wissensdatenbank | öffentlich |
| `/einschlafen` | Einschlaf-Bibliothek | öffentlich |
| `/abo` | Abonnement | öffentlich |
| `/admin/newsletter` | Newsletter-Agent | Admin |
| `/admin/episoden` | Episoden-Verwaltung | Admin |
| `/admin/training` | Training-Freigaben | Admin |
