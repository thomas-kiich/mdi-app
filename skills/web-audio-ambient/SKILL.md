---
name: web-audio-ambient
description: Synthetische Ambient-Klänge (Wasser, Regen, Wind, weißes Rauschen) via Web Audio API in React-Webapps. Verwenden wenn eine React-App Hintergrundgeräusche, Entspannungsklänge oder Ambient-Audio ohne externe Audiodateien benötigt. Kein MP3/WAV nötig, funktioniert immer im Browser. Enthält fertigen useAmbientSound-Hook mit 4 Presets (water, rain, wind, white) und Fade-in/Fade-out.
---

# Web Audio Ambient

Fertiger React-Hook für synthetische Ambient-Klänge ohne externe Dateien.

## Schnellstart

1. Template kopieren: `templates/useAmbientSound.ts` → `client/src/hooks/useAmbientSound.ts`
2. Hook importieren und verwenden:

```tsx
import { useAmbientSound } from "@/hooks/useAmbientSound";

const { start, stop } = useAmbientSound("water"); // "water" | "rain" | "wind" | "white"

<Button onClick={start}>Starten</Button>
<Button onClick={stop}>Stoppen</Button>
```

3. Cleanup erfolgt automatisch beim Unmount.

## Presets

| Preset  | Klang                        | Bandpass | LFO     | Einsatz                        |
|---------|------------------------------|----------|---------|-------------------------------|
| `water` | Sanftes Wasserplätschern     | 600 Hz   | 0.08 Hz | Entspannung, Meditation       |
| `rain`  | Gleichmäßiger Regen          | –        | –       | Fokus, Schlaf                 |
| `wind`  | Sanfter Wind                 | 300 Hz   | 0.05 Hz | Natur-Atmosphäre              |
| `white` | Neutrales weißes Rauschen    | –        | –       | Konzentration, Tinnitus-Maske |

## Technik

Signal-Kette: **White Noise Buffer (looped)** → Bandpass (optional) → Lowpass → Highpass → Master Gain → Output

- LFO (Sine Oscillator) moduliert den Master Gain für natürliches Fließen
- Fade-in/Fade-out über `linearRampToValueAtTime`
- `isPlayingRef` verhindert doppeltes Starten
- `AudioContext` wird bei `stop()` geschlossen und bei `start()` neu erstellt

## Wichtige Hinweise

- `start()` direkt in einem User-Interaction-Handler aufrufen (Button-Klick), NICHT in `useEffect` – Browser blockieren `AudioContext` ohne User-Gesture
- Für TypeScript: `setInterval`-Typ-Konflikte mit `@types/node` → `let interval: any` oder `window.setInterval()` verwenden
- Das Preset `water` wurde in KIICH (kiich.de) für die 3-Minuten-Entspannungsphase der Stimmklanganalyse erfolgreich eingesetzt und als „sehr gut gelungen" bewertet

## Anpassung

Parameter direkt im `PRESETS`-Objekt in der Template-Datei ändern:
- `bandpassFreq`: Zentrum des Klangcharakters (höher = heller, tiefer = dumpfer)
- `lfoFreq`: Modulationsgeschwindigkeit (0.05–0.2 Hz für natürliches Fließen)
- `masterVolume`: Lautstärke (0.2–0.5 empfohlen)
- `fadeIn` / `fadeOut`: Übergangszeiten in Sekunden
