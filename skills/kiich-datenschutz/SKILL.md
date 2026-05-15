---
name: kiich-datenschutz
description: Datenschutz- und Cookie-Dokumentation für KIICH (kiich.de / kiich.manus.space). Verwenden wenn Datenschutzfragen beantwortet werden, die Datenschutzerklärung aktualisiert wird, neue Cookies oder localStorage-Einträge hinzugefügt werden, Cookie-Consent-Anforderungen geprüft werden, oder wenn technische Informationen zur Datenspeicherung benötigt werden (z.B. für Tamino als Datenschutzrechtsexperte).
---

# KIICH Datenschutz & Cookie-Dokumentation

## Rechtlicher Rahmen

KIICH unterliegt der **DSGVO** (EU 2016/679) und dem deutschen **TTDSG** (§ 25). Alle eingesetzten Speichertechnologien sind nach aktuellem Stand **technisch notwendig** – ein klassisches Opt-in-Cookie-Banner ist für die eigenen Technologien nicht zwingend erforderlich.

Ausnahme: Google Fonts (siehe Drittanbieter-Verbindungen).

Relevante Quellen:
- § 25 TTDSG: Einwilligungspflicht für nicht-notwendige Cookies/Storage
- LG München I, Az. 3 O 17493/20: Google Fonts ohne Einwilligung rechtswidrig
- WebKit ITP: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/

---

## Cookies (serverseitig gesetzt)

### `app_session_id` – Authentifizierungs-Cookie

| Eigenschaft | Wert |
|---|---|
| Gesetzt durch | Server (Express, `/api/oauth/callback`) |
| Lebensdauer | 1 Jahr (`maxAge: ONE_YEAR_MS`) |
| Flags | `HttpOnly`, `Secure`, `SameSite=None` |
| Inhalt | Signiertes JWT: `openId`, `appId`, `name` |
| Zweck | Login-Session – ohne dieses Cookie kein Zugang zur App |
| Kategorie | **Technisch notwendig** |
| Tracking | Nein |
| Drittanbieter | Nein |

**Cookie-Refresh:** Bei jedem authentifizierten API-Request (`/api/trpc`) wird das Cookie automatisch mit neuem `maxAge: 1 Jahr` erneuert. Verhindert iOS Safari ITP-Löschung nach 7 Tagen Inaktivität.

Code-Referenz: `server/_core/context.ts` (Refresh), `server/_core/oauth.ts` (Erstausstellung), `server/_core/cookies.ts` (Optionen)

### `sidebar_state` – UI-Präferenz-Cookie

| Eigenschaft | Wert |
|---|---|
| Gesetzt durch | Browser (JavaScript, `document.cookie`) |
| Lebensdauer | 7 Tage |
| Zweck | Sidebar auf- oder zugeklappt |
| Kategorie | **Technisch notwendig** (Nutzerpräferenz) |

Code-Referenz: `client/src/components/ui/sidebar.tsx`

---

## localStorage (clientseitig)

localStorage ist kein Cookie im technischen Sinne, unterliegt aber nach h.M. denselben Einwilligungsanforderungen wenn nicht technisch notwendig. Alle KIICH-Einträge sind technisch notwendig.

| Schlüssel | Zweck | Kategorie |
|---|---|---|
| `kiich_ma_consent` | Einwilligung zur Mikrofon-Nutzung (Zeitstempel) | Technisch notwendig |
| `kiich_dsgvo_consent` | Zeitstempel der DSGVO-Einwilligung | Technisch notwendig |
| `kiich_auto_tts_erinnerungen` | TTS-Erinnerungen an/aus | Nutzerpräferenz |
| `kiich_briefing_zeit` | Uhrzeit für Morgen-Briefing | Nutzerpräferenz |
| `mdi_longitudinal_data` | 7-Tage-Messdaten Stimmklanganalyse (lokal, nicht auf Server) | Kernfunktion |
| `mdi_training_history` | Trainingshistorie (lokal, nicht auf Server) | Kernfunktion |
| `mdi_tagesplan_data` | Tagesplan-Daten (lokal) | Kernfunktion |
| `mdi_vitals_data` | Vitalwerte (lokal) | Kernfunktion |
| `mdi-favorites` | Favoriten im Spektral-Scanner | Nutzerpräferenz |
| `mdi_onboarding_completed` | Onboarding-Tour gesehen | Technisch notwendig |
| `theme` | Hell/Dunkel-Modus | Nutzerpräferenz |
| `sidebar-width` | Breite der Sidebar | Nutzerpräferenz |
| `manus-runtime-user-info` | Gecachte Nutzerinfo (Name, E-Mail) für schnellen Zugriff | Technisch notwendig |
| `kiich_nl_draft_v1` | Newsletter-Entwurf (nur Admin-Bereich) | Technisch notwendig |
| `yohn_water_volume` | Lautstärke YOHN-Trainer | Nutzerpräferenz |

---

## Drittanbieter-Verbindungen

### Google Fonts ⚠️ Handlungsbedarf

- URL: `fonts.googleapis.com`, `fonts.gstatic.com`
- Was passiert: Beim ersten Seitenaufruf wird die IP-Adresse des Nutzers an Google-Server (USA) übertragen
- Kein Cookie, aber Datentransfer in Drittland
- Rechtslage: Nach LG München I (Az. 3 O 17493/20) ohne Einwilligung rechtswidrig
- Empfehlung: Schriftarten lokal hosten (`@font-face` mit `.woff2`-Dateien) oder in Datenschutzerklärung mit Rechtsgrundlage (Art. 6 Abs. 1 lit. f DSGVO) nennen
- Code-Referenz: `client/index.html` Zeilen 93–95

### Manus OAuth

- URL: `api.manus.im`
- Zweck: Login-Authentifizierung
- Datentransfer: `openId`, Name, E-Mail beim Login
- In Datenschutzerklärung als Auftragsverarbeiter nennen

### Stripe

- URL: `stripe.com` (nur beim Checkout, neuer Tab)
- Zweck: Zahlungsabwicklung RAUM 36 Abo (€4,90/Monat) und Stimmklanganalyse (€96)
- Stripe setzt eigene Cookies im Checkout-Tab (eigenverantwortlicher Verantwortlicher)
- In Datenschutzerklärung als eigenverantwortlichen Verantwortlichen nennen

---

## Cookie vs. localStorage – Vergleich

| Merkmal | Cookie | localStorage |
|---|---|---|
| Automatisch zum Server gesendet | Ja | Nein |
| Zugriff durch JavaScript | Nur ohne `HttpOnly` | Ja |
| Lebensdauer steuerbar | Ja (maxAge/Expires) | Bis manuell gelöscht |
| Einwilligungspflicht | Ja (wenn nicht notwendig) | Ja nach h.M. (wenn nicht notwendig) |
| iOS Safari ITP-Risiko | Ja (7-Tage-Löschung bei Inaktivität) | Nein |

---

## Prozess: Neue Speichertechnologie hinzufügen

1. Prüfen ob technisch notwendig oder Komfort/Tracking
2. Diesen Skill aktualisieren (Tabellen ergänzen)
3. `client/src/pages/Datenschutz.tsx` aktualisieren (Cookie-Tabelle dort)
4. Bei nicht-notwendigen Technologien: Cookie-Consent-Banner implementieren

---

## Bekannte Probleme & Lösungen

### iOS Safari: Nutzer muss sich täglich neu anmelden

Ursache: iOS Safari ITP löscht Cookies von Nicht-PWA-Websites nach 7 Tagen Inaktivität, wenn das Gerät täglich heruntergefahren wird.

Implementierter Fix (seit Mai 2026): Cookie-Refresh bei jedem API-Request in `server/_core/context.ts`

Dauerhafte Lösung für Nutzer: KIICH als PWA installieren ("Zum Home-Bildschirm hinzufügen" in Safari) – dann greift ITP nicht mehr.


## Datensicherheit & Verschlüsselung (seit Mai 2026)

### Field-Level Encryption (AES-256-GCM)

Sensible Gesundheitsdaten werden mit AES-256-GCM verschlüsselt und mit eindeutigen Initialization Vectors (IV) gespeichert.

**Verschlüsselte Felder:**
- `vitalEintraege.bolt` – BOLT-Messwerte
- `vitalEintraege.boltMcp` – Maximum Comfortable Pause
- `vitalEintraege.boltCp` – Control Pause
- `vitalEintraege.ruhepuls` – Ruhepuls
- `vitalEintraege.hrv` – Heart Rate Variability
- `vitalEintraege.anmerkungen` – Notizen

**Implementierung:**
- `server/_core/encryption.ts` – Encryption/Decryption Utilities
- `encryptField()` / `decryptField()` – Einzelne Felder
- `encryptObject()` / `decryptObject()` – Mehrere Felder
- 11 Unit-Tests in `server/encryption.test.ts` (alle bestanden)

**Rechtsgrundlage:** DSGVO Art. 32 Abs. 1 lit. b (Datensicherheit)

---

### Audit-Logging

Alle Zugriffe auf Gesundheitsdaten werden protokolliert.

**Audit-Log-Tabelle:** `audit_logs`
- `userId` – Wer hat zugegriffen
- `action` – read | update | delete | export | access
- `dataType` – vital_eintrag, bolt_measurement, coaching_consent, etc.
- `reason` – user_self_access | coaching_access | admin_access | data_export | account_deletion | compliance_check
- `ipAddress` – Quell-IP
- `userAgent` – Browser/Client-Info
- `details` – JSON mit zusätzlichen Informationen
- `createdAt` – Zeitstempel

**Retention:** 90 Tage, dann automatisch gelöscht

**Implementierung:**
- `server/_core/auditLog.ts` – Logging Utilities
- `logAudit()` – Protokolliert einen Zugriff
- `getAuditLogs()` – Ruft Logs für einen Nutzer ab
- `cleanupOldAuditLogs()` – Löscht Logs älter als 90 Tage (via Heartbeat)

**Rechtsgrundlage:** DSGVO Art. 32 Abs. 1 lit. b (Fähigkeit zur Wiederherstellung)

---

### Datenlöschung (Art. 17 DSGVO – Recht auf Vergessenwerden)

**Funktion:** `deleteUserAndAllData(userId)`

Löscht einen Nutzer und alle damit verbundenen Daten kaskadierend über 16 Tabellen:
- `vitalEintraege`
- `momentaufnahmen`
- `coachingEinwilligungen`
- `einladungsCodes`
- `tagesSummaries`
- `erinnerungen`
- `erledigungen`
- `dankbarkeit`
- `einkaufsliste`
- `einschlafBibliothek`
- `apiTokens`
- `pushSubscriptions`
- `raum36Subscriptions`
- `stimmklanganalyseOrders`
- `referrals`
- `users`

**Audit-Log:** Löschung wird protokolliert (Audit-Logs werden NICHT gelöscht)

**Implementierung:** `server/_core/dataDelete.ts`

---

### Datenexport (Art. 20 DSGVO – Datenportabilität)

**Funktion:** `exportUserData(userId)`

Exportiert alle Daten eines Nutzers als strukturiertes JSON-Objekt:
- User-Profil
- Vital-Einträge
- Momentaufnahmen
- Coaching-Einwilligungen
- Tages-Summaries
- Erinnerungen
- Erledigungen
- Dankbarkeits-Einträge
- Einkaufsliste
- Einschlaf-Bibliothek
- RAUM 36 Subscriptions
- Stimmklanganalyse Orders

**Audit-Log:** Export wird protokolliert

**Implementierung:** `server/_core/dataDelete.ts`


---

## Health Screening & Sorgfaltspflichten (seit Mai 2026)

### Rechtlicher Rahmen (§ 630e BGB)

KIICH schließt mit Nutzern einen zivilrechtlichen Dienstleistungsvertrag ab und hat entsprechende Sorgfalts- und Aufklärungspflichten. Vor der Aktivierung von RAUM 36 müssen Kontraindikationen abgefragt werden.

**Rechtsgrundlage:**
- § 630e BGB: Sorgfaltspflichten bei Dienstleistungen
- DSGVO Art. 9 Abs. 2 lit. h: Verarbeitung von Gesundheitsdaten für Gesundheitsversorgung

---

### Kontraindikationen-Screening

**Tabelle:** `health_screenings`

**Physische Kontraindikationen** (Automatischer Ausschluss):
- Bluthochdruck (≥ 140/90 mmHg)
- Asthma oder chronische Atemwegserkrankungen
- Herzrhythmusstörungen oder Herzerkrankungen
- Epilepsie oder Anfallsleiden
- Schwangerschaft
- Kürzliche Operation oder Verletzung (< 6 Wochen)

**Befindlichkeitsstörungen** (Ärztliches Attest erforderlich):
- Angststörung, Panikstörung
- Depression oder depressive Episode
- Schlafstörungen
- Psychische Erkrankung (allgemein)
- Substanzmissbrauch oder Suchterkrankung

---

### Workflow

1. **Nutzer kauft RAUM 36 Abo** → Checkout-Seite
2. **Health Screening Modal** → Standardliste Kontraindikationen
3. **Evaluierung:**
   - Nur physische Kontraindikationen → **Automatischer Ausschluss** (Status: `excluded_physical`)
   - Befindlichkeitsstörungen → **Upload ärztliches Attest erforderlich** (Status: `pending_attestation`)
   - Keine Kontraindikationen → **Genehmigt** (Status: `approved`)
4. **Ärztliches Attest Upload** → Freigabe (Status: `approved_with_attestation`)

---

### Datenspeicherung & Verschlüsselung

**Verschlüsselte Felder:**
- `notes` – Nutzer-Notizen (AES-256-GCM)
- `physicianName` – Arzt-Name aus Attest
- `attestationDate` – Datum des Attests

**Retention:** 1 Jahr nach Genehmigung, dann automatisch gelöscht

**Audit-Trail:** Alle Screening-Abfragen werden protokolliert (Art. 32 DSGVO)

---

### Implementierung

**Service:** `server/_core/healthScreening.ts`
- `evaluateHealthScreening()` – Bewertet Screening
- `saveHealthScreening()` – Speichert Screening ab
- `getLatestHealthScreening()` – Ruft aktuelles Screening ab
- `isUserApprovedForRaum36()` – Prüft Genehmigung
- `uploadAttestationAndApprove()` – Lädt Attest hoch

**Router:** `server/routers/healthScreening.ts`
- `submitScreening` – Startet Screening
- `getLatest` – Ruft aktuelles Screening ab
- `isApprovedForRaum36` – Prüft Genehmigung
- `uploadAttestation` – Lädt Attest hoch

**Tests:** `server/healthScreening.test.ts` (16 Tests, alle bestanden)

---

### Haftungsschutz

**Disclaimer:** Nutzer muss Haftungsausschluss akzeptieren
- Bestätigung wird in `disclaimerAccepted` gespeichert
- Screening ist ungültig ohne Bestätigung

**Dokumentation:** Alle Screening-Daten werden verschlüsselt und 1 Jahr aufbewahrt als Nachweis der Sorgfaltspflicht
