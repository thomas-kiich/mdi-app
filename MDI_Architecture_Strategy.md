# Architektur- und Entwicklungsstrategie für das MDI-Projekt (Paralleluniversen)

Das MDI-Projekt (Multidimensionales Identitätssystem) hat sich zu einem vielschichtigen Ökosystem entwickelt. Es umfasst verschiedene Module wie die Stimmklanganalyse, das Method 36 Training, Podcast-Episoden und tiefgreifende philosophische Dokumentationen (KIICHwerke). Um diese "Paralleluniversen" unabhängig voneinander voranzutreiben und gleichzeitig eine nahtlose Integration zu gewährleisten, ist eine klare Architektur- und Entwicklungsstrategie erforderlich.

## 1. Modularisierung durch Component-Driven Design

Die Kernstrategie basiert auf einer strikten Trennung der einzelnen Module in eigenständige React-Komponenten. Jedes "Paralleluniversum" erhält einen eigenen abgeschlossenen Bereich im Code, der unabhängig entwickelt und getestet werden kann.

| Modul (Universum) | Hauptkomponente | Verantwortlichkeit |
| :--- | :--- | :--- |
| **Stimmklanganalyse** | `AnalysisResult.tsx`, `AudioRecorder.tsx` | Erfassung, Analyse und Visualisierung der Stimme. |
| **Method 36 Training** | `Method36Trainer.tsx` | Takt vs. Pulsation, Atemtraining, visuelle und auditive Führung. |
| **Szenario / Podcast** | `PodcastFeature.tsx` | Bereitstellung von narrativen Inhalten und Hörbüchern. |
| **Live Scanner** | `SpectralScanner.tsx` | Echtzeit-Visualisierung von Frequenzen. |
| **Dashboard (Hub)** | `Dashboard.tsx`, `Home.tsx` | Zentraler Knotenpunkt, der alle Module verbindet und den Zugang steuert. |

## 2. Der "Hub"-Ansatz für die Navigation

Anstatt alle Module starr miteinander zu verketten, dient das **Dashboard** (auf der Startseite) als zentraler Hub. Jedes Modul ist über diesen Hub erreichbar. Dies ermöglicht es, neue Module (z. B. zukünftige Episoden oder erweiterte Trainings) hinzuzufügen, ohne die bestehende Navigation oder andere Module zu beeinträchtigen.

*   **Unabhängigkeit:** Ein Fehler im Podcast-Modul blockiert nicht die Stimmklanganalyse.
*   **Erweiterbarkeit:** Neue "Paralleluniversen" können als neue Karten im Dashboard eingefügt werden.

## 3. Datenfluss und State-Management

Um die Module zu koppeln (z. B. die Übergabe der ermittelten Frequenz von der Analyse an das Training), verwenden wir einen zentralisierten State im Haupt-Hub (`Home.tsx`).

1.  **Isolierte interne States:** Jedes Modul verwaltet seinen eigenen internen Zustand (z. B. der Timer im Training oder die FFT-Daten im Scanner).
2.  **Gemeinsame Daten:** Daten, die zwischen Modulen ausgetauscht werden müssen (wie die `detectedFrequency`), werden im Hub gespeichert und als "Props" an die jeweiligen Module weitergegeben.

## 4. Versionskontrolle und Checkpoints (Sicherheitsnetz)

Wie wir gerade bei der Wiederherstellung gesehen haben, ist ein robustes Sicherheitsnetz unerlässlich.

*   **Regelmäßige Checkpoints:** Vor jeder größeren Änderung an einem Modul oder der Integration eines neuen Features wird ein System-Checkpoint erstellt.
*   **Feature-Isolierung:** Neue Features werden zunächst in der isolierten Komponente entwickelt und getestet, bevor sie in den Hub (die Startseite) integriert werden.

## 5. Philosophische Verankerung (KIICHwerke)

Die inhaltliche Entwicklung (die KIICHwerke) bildet das Fundament. Die technische Umsetzung muss diese philosophischen Konzepte widerspiegeln.

*   **Takt vs. Pulsation:** Das Method 36 Training muss diese Dynamik abbilden (z. B. durch die Implementierung von Herzratenvariabilität in der Animation, anstatt eines starren Metronoms).
*   **Mensch vs. Maschine:** Die Schnittstellen (UI) müssen so gestaltet sein, dass sie die menschliche Autonomie betonen (z. B. selbstbestimmte Trainingszeiten).

## Nächste Schritte zur Implementierung

1.  **Konsolidierung des Dashboards:** Das Dashboard (`Dashboard.tsx`) sollte weiter ausgebaut werden, um als echter, stabiler Hub für alle Module zu fungieren.
2.  **Entkopplung von Home.tsx:** Derzeit ist `Home.tsx` sehr groß und übernimmt viele Aufgaben. Wir sollten erwägen, die Logik weiter in Unterkomponenten auszulagern, um die Übersichtlichkeit zu erhöhen.
3.  **Definition klarer Schnittstellen (APIs):** Wenn Module Daten austauschen (z. B. Analyse -> Training), müssen die Datenformate (Props) strikt definiert sein, um Fehler bei Aktualisierungen zu vermeiden.
