# MOMENTAUFNAHME – Feature-Dokumentation

> **Status:** Entwickelt, aber bewusst aus kiich.de (v1.0) ausgeblendet.  
> **Geplante Integration:** devkiich.de (nächste Entwicklungsphase)  
> **Branch:** `feature/momentaufnahme` (eingefroren, sicher auf GitHub)  
> **Zuletzt aktualisiert:** Mai 2026

---

## Was ist MOMENTAUFNAHME?

MOMENTAUFNAHME ist eine Sprachnotiz-App innerhalb der KIICH-Plattform. Nutzer sprechen kurze Gedanken, Gefühle, Aufgaben oder Ideen ein – die KI transkribiert sie, ordnet sie einem **Gravitationszentrum** zu und generiert täglich ein persönliches **Tages-Summary**. Optional können alle Aufnahmen in **Obsidian** (einem lokalen Notiz-Tool) synchronisiert werden.

Das Feature ist vollständig entwickelt und getestet. Es wurde aus der ersten öffentlichen Version von kiich.de herausgehalten, um den Launch-Fokus zu wahren.

---

## Architektur-Übersicht

```
Frontend (React)          Backend (tRPC)                  Datenbank
─────────────────         ─────────────────────────────   ─────────────────────
Momentaufnahme.tsx   →    momentaufnahmeRouter             momentaufnahmen
MomentaufnahmeTeaser.tsx  ├── speichern                   tages_summaries
MomentaufnahmeArchiv.tsx  ├── heute                       api_tokens
ObsidianVerbinden.tsx     ├── obsidianExport
                          ├── generiereReflexionsSummary
                          ├── generiereStrategischesSummary
                          ├── summaryArchiv
                          ├── obsidianExportTag
                          └── loeschen

REST-Endpunkte (Express)
├── POST /api/audio/upload        (Sprachaufnahme → S3)
├── GET  /api/obsidian/sync       (Obsidian-Plugin-Sync)
└── GET  /api/obsidian/ping       (Verbindungstest)
```

---

## Frontend-Dateien

| Datei | Pfad | Beschreibung |
|---|---|---|
| `Momentaufnahme.tsx` | `client/src/pages/` | Haupt-App: Aufnahme, Transkription, Kategorisierung, Summary |
| `MomentaufnahmeTeaser.tsx` | `client/src/pages/` | Öffentliche Landing-Page (für nicht-eingeloggte Besucher) |
| `MomentaufnahmeArchiv.tsx` | `client/src/pages/` | Archiv aller vergangenen Tages-Summaries |
| `ObsidianVerbinden.tsx` | `client/src/pages/` | API-Token-Verwaltung für Obsidian-Plugin |
| `TrialBanner.tsx` | `client/src/components/` | Abo-Hinweis-Banner (geteilt mit EinschlafBibliothek) |

### Routen in App.tsx

```tsx
<Route path="/momentaufnahme"          component={MomentaufnahmeTeaser} />
<Route path="/momentaufnahme/app"      component={Momentaufnahme} />
<Route path="/momentaufnahme/archiv"   component={MomentaufnahmeArchiv} />
<Route path="/momentaufnahme/obsidian" component={ObsidianVerbinden} />
```

---

## Backend-Dateien

| Datei | Pfad | Beschreibung |
|---|---|---|
| `momentaufnahme.ts` | `server/routers/` | Alle tRPC-Prozeduren für MOMENTAUFNAHME |
| `momentaufnahme.test.ts` | `server/` | Vitest-Tests (Obsidian-Export, Summary-Generierung) |
| `audioUpload.ts` | `server/routes/` | Express-Route für Audio-Upload nach S3 |
| `obsidianSync.ts` | `server/routes/` | Express-Route für Obsidian-Plugin-API |
| `apiTokens.test.ts` | `server/` | Tests für API-Token-Verwaltung |

---

## Datenbankschema

### Tabelle: `momentaufnahmen`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INT (PK) | Auto-increment |
| `userId` | INT | Fremdschlüssel → users.id |
| `text` | TEXT | Transkribierter Sprachtext |
| `kategorie` | ENUM | `ICH` \| `QUELL` \| `KONZEPT` \| `PROJEKT` \| `DIALOG` \| `WELT` |
| `zusammenfassung` | TEXT | KI-generierte 1-Satz-Zusammenfassung |
| `audioUrl` | VARCHAR(512) | S3-URL der Originaldatei |
| `dauerSekunden` | INT | Aufnahmedauer |
| `createdAt` | TIMESTAMP | Erstellungszeitpunkt |

### Tabelle: `tages_summaries`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INT (PK) | Auto-increment |
| `userId` | INT | Fremdschlüssel → users.id |
| `text` | TEXT | KI-generiertes Reflexions-Summary (fließend) |
| `datum` | VARCHAR(100) | Lesbares Datum (z.B. „18. Mai 2026") |
| `datumISO` | VARCHAR(10) | ISO-Datum YYYY-MM-DD |
| `anzahlAufnahmen` | INT | Anzahl der Aufnahmen an diesem Tag |
| `strategischesText` | TEXT | Strategisches Summary (Aufgaben/To-Dos) |
| `createdAt` | TIMESTAMP | Erstellungszeitpunkt |
| `updatedAt` | TIMESTAMP | Letztes Update (Upsert-Logik) |

### Tabelle: `api_tokens`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INT (PK) | Auto-increment |
| `userId` | INT | Fremdschlüssel → users.id |
| `token` | VARCHAR(128) | Sicherer zufälliger Token (64 Hex-Zeichen), unique |
| `name` | VARCHAR(128) | Nutzer-definierter Name (z.B. „Obsidian MacBook") |
| `lastUsedAt` | TIMESTAMP | Letzter Verwendungszeitpunkt |
| `revokedAt` | TIMESTAMP | Widerrufszeitpunkt (null = aktiv) |
| `createdAt` | TIMESTAMP | Erstellungszeitpunkt |

---

## Abo-Integration

MOMENTAUFNAHME ist in das KIICH-Abo-System integriert. Die Zugangsregeln sind in `server/abo.ts` definiert:

| Feature | Free | Essential | Complete | Pro | Beta |
|---|---|---|---|---|---|
| Aufnahmen/Monat | 10 | Unbegrenzt | Unbegrenzt | Unbegrenzt | Unbegrenzt |
| Reflexions-Summary | ✗ | ✅ | ✅ | ✅ | ✅ |
| Strategisches Summary | ✗ | ✗ | ✅ | ✅ | ✅ |
| Obsidian-Export | ✗ | ✅ | ✅ | ✅ | ✅ |

---

## Gravitationszentren (Kategorien)

Die KI ordnet jede Aufnahme automatisch einem der 6 Gravitationszentren zu:

| Kürzel | Bedeutung |
|---|---|
| `ICH` | Persönliche Gefühle, Befindlichkeit, Selbstreflexion |
| `QUELL` | Spirituelle Impulse, tiefe Erkenntnisse, Inspiration |
| `KONZEPT` | Ideen, Gedanken, kreative Einfälle |
| `PROJEKT` | Aufgaben, To-Dos, konkrete Vorhaben |
| `DIALOG` | Beziehungen, Gespräche, soziale Interaktionen |
| `WELT` | Beobachtungen der Außenwelt, gesellschaftliche Themen |

---

## Obsidian-Integration

MOMENTAUFNAHME kann mit dem lokalen Notiz-Tool **Obsidian** synchronisiert werden:

1. Nutzer erstellt einen API-Token unter `/momentaufnahme/obsidian`
2. Token wird im Obsidian-Plugin eingetragen
3. Plugin ruft `GET /api/obsidian/sync?since=<ISO-Datum>` auf
4. Server liefert alle Aufnahmen als JSON
5. Plugin schreibt sie als Markdown-Dateien in den Obsidian-Vault

Das generierte Markdown-Format enthält YAML-Frontmatter mit Tags `[momentaufnahme, tagebuch, YYYY-MM-DD]` und ist vollständig kompatibel mit dem Obsidian-Ökosystem.

---

## Aktivierung für devkiich.de

Um MOMENTAUFNAHME auf devkiich.de zu aktivieren, sind folgende Schritte nötig:

1. **Routen einblenden** in `client/src/App.tsx` – die Routen sind bereits vorhanden, müssen nur sichtbar gemacht werden (kein Code-Schreiben nötig)
2. **Navigation ergänzen** – Link zu `/momentaufnahme` in der Hauptnavigation von devkiich.de hinzufügen
3. **Login-Redirect anpassen** – in `server/_core/oauth.ts` ist bereits ein Redirect auf `/momentaufnahme?willkommen=1` nach Erstregistrierung vorbereitet
4. **Feature-Flag aktivieren** – in `server/db.ts` das `momentaufnahme`-Flag in `PREMIUM_FEATURES` für devkiich.de freischalten

**Geschätzter Aufwand:** 30–60 Minuten mit Manus.

---

## Tests

Alle Tests laufen mit `pnpm test`:

- `server/momentaufnahme.test.ts` – Obsidian-Export-Format, Summary-Generierung, Datum-Filterung
- `server/apiTokens.test.ts` – API-Token-Sync-Response-Format
- `server/abo.test.ts` – Feature-Gates für alle Abo-Ebenen

---

## Bekannte offene Punkte (für devkiich.de)

- **Echtzeit-Transkription:** Aktuell wird Audio nach der Aufnahme transkribiert. Eine Live-Transkription während der Aufnahme wäre UX-technisch besser.
- **Push-Notifications:** Tägliche Erinnerung „Hast du heute schon deine Momentaufnahme gemacht?" via Web Push (VAPID-Keys sind bereits konfiguriert).
- **Kategorien-Korrektur:** Nutzer können die KI-zugewiesene Kategorie noch nicht manuell korrigieren.
- **Mehrsprachigkeit:** Transkription funktioniert auf Deutsch, aber die Kategorie-Zuweisung ist auf Deutsch optimiert.
