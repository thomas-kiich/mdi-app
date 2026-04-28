# MDI App Development Tasks

## Visualization & UI
- [x] Implement spectral resonance matrix (C=Green)
- [x] Integrate Hans Cousto frequencies
- [x] Implement rainbow gradient (E-Violet to F-Red)
- [x] Implement custom color palette (E-BlueViolet to F-Magenta)
- [x] Align Tone E to Y-axis in matrix
- [x] Implement Sound Body visualization (Silhouette + Wave)
- [x] Implement "Inner Field / Outer Field" toggle switch
- [x] Refine Sound Body: Dual-sided waves (up/down + left/right symmetry)
- [x] Refine Sound Body: Full-spectrum colors in the wave (not just purple)
- [x] Refine Sound Body: Improve human silhouette (more visible, aesthetic)
- [x] Remove color square from result view
- [x] Move Hz/Cent details to collapsible "Expert Mode"
- [x] Add Nose Root marker (Center of Spirit)
- [x] Add Soles line (Horizontal marker)
- [x] Implement "Key-Lock" principle: Mirror Outer Field with offset
- [x] Strict Boundary Enforcement: Wave MUST stop exactly at Nose Root (Top) and Soles (Bottom).
- [x] Implement Vertical Aura Contour (Navel-Anchored)
- [x] Expert Mode Toggle
- [x] Fix Upper Wave Alignment (Navel Anchor)
- [x] Ensure Left-Side Aura Visibility (Explicit calculation)
- [x] Implement "Ganzheit" (Wholeness) view mode
- [x] Implement "Art Mode" (Seelenbild) visualization
- [x] Implement Vision Mode interface
- [x] Implement 7-Day Longitudinal Measurement Logic
- [x] Implement Interpretation Framework (Deutung)
- [x] Implement Interactive Connection Story (Initial Version)
- [x] Refine Connection Story (Slower, Meditative, Pointillism)

## Logic & Analysis
- [x] Fix quint correction logic
- [x] Fix aggregation logic
- [x] Fix frequency display (dominant tone logic)
- [x] Refine Frequency Logic: Calculate true average of measured frequencies for the dominant tone
- [ ] Debug: Why F# displays 183.58Hz (F) and 0 cent? Ensure precise calculation.

## Live Spectral Scanner (Refinement)
- [x] **Create `SpectralScanner.tsx` Component**:
  - [x] Implement a canvas-based real-time spectrogram (waterfall plot).
  - [x] Use `useAudioAnalyzer` hook to get raw FFT data.
  - [x] Map frequencies to Y-axis logarithmically (musical scale: C2 to C6).
  - [x] Map amplitude to brightness/opacity.
  - [x] Map frequency to COLOR using the MDI Cosmic Octave palette (C=Green, G=Orange, etc.).
  - [x] Implement scrolling logic (new data pushes old data to the left/up).
- [x] **Integrate into `Home.tsx`**:
  - [x] Add a "Live Spektrum" button to the main menu.
  - [x] Create a modal or dedicated view for the scanner.
  - [x] Ensure microphone permissions are handled correctly.
- [x] **Refine `SpectralScanner.tsx`**:
  - [x] **Vocal Zoom**: Change default frequency range to C2 (65Hz) - C5 (523Hz) to focus on human voice.
  - [x] **Slow Motion**: Set default scroll speed to 1px/frame.
  - [x] **High-Frequency Boost**: Implement spectral tilt correction (+3dB/octave) to make high notes visible.
  - [x] **Organic Blur**: Add vertical blur to smooth out frequency bins.
- [x] **Implement 'Deep Black' Mode**:
  - [x] **High Noise Gate**: Increase amplitude threshold significantly (e.g., from 10 to 40) to filter background noise.
  - [x] **Contrast Boost**: Increase opacity curve for active frequencies.
  - [x] **Clear Background**: Ensure canvas fill is pure black (#000000) every frame.
- [x] **Invert Logic**:
  - [x] **Pure Black Background**: Remove any fill logic that creates "holes".
  - [x] **Additive Color**: Only draw pixels where FFT amplitude > threshold.
  - [x] **Result**: "Painting with light" on a black canvas.
- [x] **Debug**:
  - [x] **Fix Subtractive Logic**: Ensure no black pixels are drawn over active colors.
  - [x] **Ensure Additive Drawing**: Only draw colors where signal > threshold.
- [x] **Rewrite Rendering**:
  - [x] **Discard Shift Logic**: Remove `putImageData` based scrolling which may carry artifacts.
  - [x] **Explicit Buffer**: Implement a robust manual buffer or circular drawing.
  - [x] **Force Black**: Explicitly clear background to black before drawing.
- [x] **Overhaul: Radar Scanner Mode**:
  - [x] **Moving Scanline**: Draw a vertical line moving L->R instead of shifting image.
  - [x] **Additive Mixing**: Use `globalCompositeOperation = 'lighter'`.
  - [x] **Cache Busting**: Use dark blue background temporarily to verify update.
- [x] **Red Alert Test**:
  - [x] **Force Red Background**: Set background to bright red to confirm update propagation.
  - [x] **Version Label**: Add 'VERSION TEST' label.
- [x] **Finalize**:
  - [x] **Revert Red Alert**: Set background back to Deep Black (#000000).
  - [x] **Remove Test Label**: Clean up UI.
- [x] **Fix Inverted Visualization**:
  - [x] **Remove Compositing**: Switch from `lighter` to `source-over`.
  - [x] **Strict Drawing**: Only draw colored pixels where amplitude > threshold.
  - [x] **Clear Background**: Ensure canvas is cleared with black before each scan step.
- [x] **Implement Hard Cut Debug Mode**:
  - [x] **High Threshold**: Increase amplitude threshold to 100.
  - [x] **Disable Boost**: Remove high-frequency boost.
  - [x] **Linear Mapping**: Use linear amplitude mapping.
- [x] **Implement Safe Mode Scanner**:
  - [x] **Manual Array**: Use a JS array to store history, redraw full canvas every frame.
  - [x] **Invert Amplitude**: Test if `255 - value` fixes the black cutout issue.
  - [x] **Remove Radar**: Go back to classic waterfall scrolling but implemented manually.
- [x] **Sharpen Visualization**:
  - [x] **Exponential Contrast**: Apply `pow(value, 3)` to darken noise and highlight peaks.
  - [x] **Peak Detection**: Only draw local maxima to create thin lines instead of broad bands.

## General
- [x] Fix audio playback
- [x] Verify color mappings
- [ ] Final user verification

## Live Spectral Scanner (Enhancements)
- [x] **Snapshot Export**:
  - [x] Add a "Camera" button to the UI.
  - [x] Implement canvas-to-blob conversion and download as PNG.
  - [x] Ensure the filename includes a timestamp (e.g., `MDI-Spektrum-2026-03-04.png`).
- [x] **Interactive Frequency Analysis**:
  - [x] Add click handler to the canvas.
  - [x] On click, find the nearest frequency bin and display its Hz value and musical note (e.g., "440Hz - A4").
  - [x] Show a tooltip or overlay with this information.
- [x] **3D Tunnel Mode**:
  - [x] Create a new visualization mode toggle (2D / 3D).
  - [x] Implement a perspective projection where new frequency lines appear at the center/far distance and move towards the viewer (or vice versa).
  - [x] Use the same color/frequency logic but map Y-axis to radial distance or tunnel walls.

- [x] **Harmonic Resonance Audio Synthesis**:
  - [x] Implement a Web Audio API synthesizer function.
  - [x] Create a "Warm Drone" sound using multiple oscillators (Fundamental + Octave + Fifth).
  - [x] Apply a Low-Pass Filter to soften the sound.
  - [x] Implement an Envelope (ADSR) with slow Attack (2s) and long Release (8s) for a total of ~12s.
  - [x] Add a "Play Tone" button to the interactive tooltip in the Spectral Scanner.

- [x] **Fix Tone-Color Mapping and Navigation**:
  - [x] Verify `tones.ts` against user requirements (E=Blauviolett, C=Grün, etc.).
  - [x] Ensure `SpectralScanner.tsx` uses the correct color from `tones.ts`.
  - [x] Add a "Zur Animation" (To Animation) button in `SpectralScanner.tsx` that navigates to `/animation`.

- [x] **Method 36 Training Module**:
  - [x] Create `Method36Trainer.tsx` component.
  - [x] Implement 36 BPM timer logic (1 beat = 1.666s).
  - [x] Create visual circle animation (Grow 1 beat, Hold 1 beat, Shrink 3 beats, Hold 1 beat).
  - [x] Implement audio synthesis for the specific fundamental tone during the "Shrink" phase (3 beats).
  - [x] Add a subtle "heartbeat" sound on every beat.
  - [x] Integrate "Start Training" button in `SpectralScanner.tsx` that passes the detected frequency to the trainer.

- [x] **Link Analysis Result to Live Scanner**:
  - [x] Locate the Analysis Result component/page.
  - [x] Add a "Weiter zum Live-Scanner & Training" button.
  - [x] Ensure the button opens the `SpectralScanner` component.

- [x] **Fix Audio Context and Scanner Visualization Errors**:
  - [x] Debug and fix AudioContext initialization issues (3 red errors).
  - [x] Hard-code black background and colored lines for scanner visualization to prevent inversion.
  - [x] Ensure "Method 36" button visibility even on minor errors.
  - [x] Verify `SpectralScanner.tsx` logic for error handling and cleanup.

- [x] **Refine Method 36 Trainer**:
  - [x] Extend tone duration to full 3 beats (approx. 5 seconds) in `Method36Trainer.tsx`.
  - [x] Update text from "TÖNEN" to "MANTRA YOHN TÖNEN".
  - [x] Verify and fix pitch calculation/display logic in `SpectralScanner.tsx` to ensure correct note names.

- [x] **Refine Method 36 Trainer (A=432Hz)**:
  - [x] Recalculate all frequencies in `tones.ts` based on A4 = 432 Hz.
  - [x] Update `getToneFromFrequency` logic to use 432 Hz reference.
  - [x] Ensure displayed note names match the new frequency map.

- [x] **Fix Data Transfer from Analysis to Trainer**:
  - [x] Update `Home.tsx` to pass the analyzed frequency to `SpectralScanner`.
  - [x] Modify `SpectralScanner.tsx` to accept an `initialFrequency` or `forcedFrequency` prop.
  - [x] Ensure `Method36Trainer` uses this forced frequency if available, instead of live detection.
- [x] **Fix Frequency Deviation Logic in Analysis**: Ensure the calculated frequency matches the identified tone (e.g., F) and that deviation (cents) is capped or corrected so it doesn't shift the tone to another note (like A).
- [x] **Refine Method 36 Trainer (Sync, Duration, Gong)**:
  - [x] **Progress Ring**: Ensure the ring starts at 12 o'clock and completes a full circle in exactly 10 seconds (6 beats) without jumping.
  - [x] **Tone Duration**: Extend the mantra tone to last the full 3 beats (approx. 5 seconds) with a smooth release.
  - [x] **Gong Signals**: Replace heartbeat with a synthetic gong sound to mark the "Inhale" and "Hold" phase transitions.
- [x] **Refine Method 36 Trainer (Sync, Octave, Gong)**:
  - [x] **Raise Octave**: Double the base frequency (x2) to raise the tone by one octave.
  - [x] **Shorten Gong**: Reduce the gong release time significantly for a short "ping".
  - [x] **Hard Sync Ring**: Bind the ring progress directly to the internal loop timer (elapsed time) instead of CSS animation.
- [x] **Final Polish: Audio Level and Ring Sync**:
  - [x] **Lower Audio Gain**: Reduce master gain to 0.2 to prevent clipping/distortion.
  - [x] **Force Ring Sync**: Use CSS transition with exact 10s duration triggered by React state for perfect sync.
- [x] **Fix Analysis Visualization and Audio Distortion**:
  - [x] **Method 36 Audio**: Reduce harmonic complexity and lower gain to 10% to prevent distortion.
  - [x] **Analysis Visualization**: Fix AudioContext initialization in Home.tsx to restore live waveform during recording.

- [x] **Refine Audio Quality and Add Octave Toggle**
    - [x] Implement Low-Pass Filter for softer sound
    - [x] Add Octave Toggle (Male/Female)
    - [x] Further reduce audio gain to prevent clipping

- [x] **Final Fixes: Audio Detune and Cycle Counter**
    - [x] Adjust oscillator detune and release envelope to eliminate beating and clipping at the end of the tone.
    - [x] Rewrite cycle counter logic to increment exactly once per 10-second cycle, ensuring stability.

- [ ] **Restore Voice Visualization in Analysis:** Ensure live frequency visualization during recording.
- [ ] **Research: Voice Vibration & Cellular Health:** Gather scientific data on the effects of sound on cells.
- [ ] **Draft Content: 'Maschinen atmen nicht':** Write chapters on Voice vs. AI and cellular resonance.

- [x] Move uploaded audio files (training_07min.wav, training_12min.wav, training_21min.wav) to `client/public` so they are accessible by the browser.

- [x] Implement "Zurück zur Übersicht" button on the congratulation screen in `Method36Trainer.tsx`.
- [x] Make feature cards on the start page clickable and open a modal with placeholders for NotebookLM audio and content.
- [x] Implement onboarding tour with video placeholder that shows only on first visit.

- [x] Implement sharing functionality on the result screen (InterpretationView) and the congratulation screen (Method36Trainer).
- [x] Adjust logo on Home page: remove circular crop, increase size slightly, and move it down for better harmony with text.

- [x] Create a new "Training Center" menu/dashboard to select between different breathing techniques.
- [x] Implement "Stoffwechselatmung" (Metabolic Breathing) module:
    - [x] Rhythm: 2 beats Inhale (High Gong) : 4 beats Exhale (Low Gong) based on 36 BPM (1 beat = 1.666s).
    - [x] Endless mode (Start/Stop toggle), no fixed duration.
    - [x] Minimalist visualization for continuous breathing.
    - [x] Separate audio logic for High/Low Gongs.
- [x] Refactor existing "Yohnatmung" to be a distinct module within the Training Center.

- [x] Create a new main "Dashboard" view as the starting point, replacing the direct analysis wizard start.
- [x] Implement "Dashboard" with 3 main pillars:
    - [x] Analysis: The existing voice analysis flow.
    - [x] Training Center: Direct access to breathing techniques.
    - [x] Laboratory (Scanner): Direct access to the Spectral Scanner.
- [x] Integrate "Interval Training" as a third module in the Training Center.
- [x] Update navigation to allow returning to the Dashboard from any sub-module.

- [x] Debug and fix the red error notification appearing on the bottom left of the Dashboard/Home page.

- [x] Implement "Scanner-Training Bridge":
    - [x] Add "Freeze/Snapshot" button to SpectralScanner to capture current peak frequency.
    - [x] Add "Work with this Frequency" button in SpectralScanner (visible when frozen).
    - [x] Redirect to TrainingCenter with the captured frequency as a parameter.
    - [x] Update TrainingCenter/Method36Trainer/MetabolicBreathingTrainer to accept a custom frequency (instead of just the user's fundamental).
- [x] Restore the full Analysis Result screen with color aura visualization after completing the analysis process.

- [x] Implement PDF Certificate generation:
    - [x] Design a high-quality A4 layout for the certificate.
    - [x] Include Logo, Frequency, Tone, Color, Aura visualization, and key attributes.
    - [x] Add a "Download Certificate" button in the result view.
    - [x] Use `html2canvas` and `jspdf` to generate the PDF.

- [ ] Fix missing Aura visualization in Analysis Result and PDF Certificate:
    - [ ] Debug why `toneDistribution` is empty or not passed correctly.
    - [ ] Ensure `SoundBody` receives valid data.
- [ ] Add a "Back" button to the Certificate view.

- [ ] Implement the "Knowledge Pool" (Wissenspool) section:
    - [ ] Create a new `KnowledgePool.tsx` component.
    - [ ] Structure content into "The Method", "Frequencies & Colors", and "Instructions".
    - [ ] Integrate the `KnowledgePool` into the Dashboard and navigation.
    - [ ] Populate the "Frequencies & Colors" section with data from `TONES` and `frequencyData`.

- [ ] Fix the question transition in the Analysis flow: Ensure the new question appears immediately or the old one is hidden during the transition to the next recording step.
- [ ] Restore the human silhouette in the Aura visualization (SoundBody component) to provide better context for the color aura.

- [x] Add visual feedback (pulsating waves) to AmbientTrainer during playback
- [x] Add volume control slider to AmbientTrainer

- [x] Fix pulsating waves visibility in AmbientTrainer

- [x] Make AmbientTrainer waves audio-reactive using Web Audio API
- [x] Make AmbientTrainer waves color dynamic based on user's dominant tone

- [x] Fix audio playback in AmbientTrainer broken by Web Audio API CORS

- [x] Redesign ToneColorExplorer to a 24x4 grid layout with uniform bars and no gaps
- [x] Implement hover interactions to display segment codes (e.g., '01/25') in ToneColorExplorer
- [x] Integrate audio playback on hover with volume mapped to intensity percentage in ToneColorExplorer

- [x] Debug and fix ToneColorExplorer to ensure the 24x4 matrix redesign is visible in the application

- [ ] Update SpectralMatrix inside MDI Scanner to use the 24x4 grid layout with hover interactions

- [ ] Implement Harmony-Paths (Quinten/Terzen) highlighting on hover in ToneColorExplorer
- [x] Implement Detail-View Modal on click in ToneColorExplorer
- [x] Update SpectralScanner (Frequenzlabor) to use the 24x4 grid layout

- [x] Fix missing color results on the analysis page
- [x] Update Frequenzlabor in MDI Scanner to use the new 24x4 matrix

- [x] Change title to 'LICHTKLANG MATRIX' in ToneColorExplorer
- [x] Implement sustained audio playback on hover in ToneColorExplorer
- [x] Integrate live microphone frequency highlighting in ToneColorExplorer when used in SpectralScanner

- [ ] Remove interval markers (Terz/Quinte) from ToneColorExplorer.tsx
- [ ] Add 'DIESEN TON VERWENDEN' button to freeze live tone in ToneColorExplorer.tsx
- [ ] Add link to YOHN training from the frozen tone in ToneColorExplorer.tsx
- [ ] Add instructions text to the ToneColorExplorer.tsx

- [ ] Remove live Hz indicator from SpectralScanner.tsx
- [ ] Update instructions text in ToneColorExplorer.tsx
- [ ] Check if analysis results are saved for later viewing

- [ ] Add download reminder to results page
- [ ] Create Analysis History Component to view past results
- [ ] Integrate Analysis History into Dashboard

- [ ] Remove "only possible once" text near download button in Home.tsx / CertificateView.tsx

- [ ] Read data from Google Sheet: https://docs.google.com/spreadsheets/d/1z-CFsye-So7tAtxmmFYX6hRRe8zw7YOjQKtducZMeEI/edit?usp=sharing
- [ ] Integrate data into the app (e.g., update frequencyData.json or Wissenspool)

- [ ] Parse Google Sheet data for the 24 MDI types
- [ ] Update frequencyData.json with new descriptions (Short: Typ + Metaphorik, Detailed: Qualitäten + Synonyme)
- [ ] Update UI components to reflect the new data structure

- [ ] Extract data from uploaded PDF: /home/ubuntu/upload/frequenztafelMETHODE36-Table1.pdf
- [ ] Parse PDF data into JSON format
- [ ] Update frequencyData.json with new descriptions (Short: Typ + Metaphorik, Detailed: Qualitäten + Synonyme)
- [ ] Update UI components to reflect the new data structure

- [ ] Update exact frequency values in frequencyData.json
- [ ] Update column titles in FrequencyTable.tsx (TYP, LICHT, KLANG, QUALITÄT, SYNONYME)
- [ ] Remove color text from Licht column in FrequencyTable.tsx
- [ ] Update labels in Home.tsx and CertificateView.tsx to match "Qualität" and "Synonyme"

- [ ] Fix typos in frequencyData.json (VERGANGENHEIT)
- [ ] Add 'TON' field to frequencyData.json based on PDF
- [ ] Update FrequencyTable.tsx to include 'TON' column
- [ ] Change frequency text color to white in FrequencyTable.tsx

- [ ] Implement post-training feedback survey in Method36Trainer.tsx

- [ ] Change "Frequenzanalyse" to "Stimmklanganalyse" on Dashboard
- [ ] Update description for Stimmklanganalyse on Dashboard
- [ ] Update description for Trainingscenter on Dashboard

- [ ] Change "Stimmklanganalyse" to "Stimmklang -<br/>Analyse" in Dashboard.tsx
- [ ] Change "Analyse Starten" button style to match others (outline, text-white, border-zinc-700)

- [ ] Change "Schlaf" text to "Schlaf -<br/>Optimierung" in Dashboard.tsx
- [ ] Change "Session starten" button style to match others (outline, text-white, border-zinc-700) in Dashboard.tsx

- [ ] Change main title to "METHODE 36 von Thomas Chochola" in Dashboard.tsx
- [ ] Replace subtitle text with "GRUNDLAGEN..." in Dashboard.tsx

- [ ] Update GRUNDLAGEN text in Dashboard.tsx

- [ ] Make "von Thomas Chochola" a smaller subtitle under "METHODE 36"
- [ ] Update GRUNDLAGEN text with the new scientific explanation

- [ ] Create a manual backup checkpoint of the current stable state

- [ ] Remove "GRUNDLAGEN" from Dashboard.tsx

- [ ] Insert author description in 'MASCHINEN ATMEN NICHT' section in Dashboard.tsx

- [ ] Update podcast description in Home.tsx to reflect the new "Hörbuch im Podcast-Format" concept

- [ ] Update podcast description to include "KI-generierter Kompetenz"

- [ ] Update Impressum with user data

- [x] Fix typo in Type 19 synonyms: FÜHRE -> FÜHRER
- [x] Fix typo in Type 29 (or 20/other type) synonyms: LEHRE -> LEHRER
- [x] Replace all arrows (-> or similar) with vertical bars (|) before the last term in synonyms for all types

-- [x] Reduce volume of background water sound in YOHN trainer (Method36Trainer)
- [x] Remove Lichtklang Matrix (ToneColorExplorer) from Voice Analysis Result (InterpretationView)
- [x] Increase the volume of the sound played when clicking a segment in ToneColorExplorer

-- [x] Hide duration selection bar in YOHN trainer when training is active
- [x] Set MDI logo as PWA app icon

- [x] Remove remaining Lichtklang Matrix from voice analysis results
- [x] Add Nabelpunkt, Herzpunkt, and Zirbeldrüse markers and labels to Aura visualization

- [x] Fix Nabelpunkt position in Aura visualization (move it up)
- [x] Move Herzpunkt and Nabelpunkt up by half their distance in SoundBody.tsx
- [x] Thicken the outline of the human silhouette in SoundBody.tsx
- [x] Fix human silhouette proportions (hips, legs, torso) in SoundBody.tsx
- [x] Align wave origin to Nabelpunkt and span exactly one octave to Zirbeldrüse
- [x] Remove lower wave and update gradients
- [x] Replace simple human sketch with an anatomical SVG silhouette in SoundBody.tsx
- [x] Position and label Nabel, Herz, and Zirbeldrüse markers accurately on the new silhouette
- [x] Adjust wave logic to span exactly from Nabel to the midpoint between Nabel and Zirbeldrüse (Herzpunkt)
- [x] Copy provided sketch image to project public directory
- [x] Update SoundBody.tsx to use the image as background
- [x] Adjust wave logic to span exactly from Nabel to Zirbeldrüse line
- [x] Remove duplicate SVG labels and markers in SoundBody.tsx
- [x] Align wave origin to Nabel line and span to Zirbeldrüse line
- [x] Adjust wave logic to use exactly 25 points for a full 24-frequency octave
- [x] Write and run a script to extract exact Y-coordinates of the grey wave lines from the image
- [x] Apply the exact coordinates to SoundBody.tsx
- [x] Refactor SoundBody.tsx to include the background image directly inside the main SVG
- [x] Adjust wave coordinates to match the image's internal coordinate system
- [x] Inspect SoundBody.tsx to understand how colors/frequencies are mapped to the wave points
- [x] Adjust logic to shift the frequency array so the Lebensklang is at index 0
- [x] Inspect SoundBody.tsx to check how percentage values are mapped to width
- [x] Fix the mapping logic to ensure width corresponds to the correct tone percentage
- [x] Inspect SoundBody.tsx to trace why the base tone position shifted
- [x] Fix the logic to guarantee the Lebensklang is exactly at index 0 (Nabelpunkt) with correct width and color
- [x] Inspect SoundBody.tsx to trace how domIndex is calculated and applied
- [x] Fix the array shifting logic to correctly position the Lebensklang at index 0
- [x] Read frequencyData.json to extract the correct mapping of MDI IDs (1-24) to Tone names
- [x] Update mdiToToneMapping.ts with the correct mapping
- [x] Refactor SoundBody.tsx to use a 24-element array and accept dominantToneId
- [x] Update Home.tsx to pass the correct ID to SoundBody
- [x] Swap the order of SoundBody and HarmonicSpectrumChart in Home.tsx
- [x] Edit HarmonicSpectrumChart to use metaphor terms instead of color names
- [x] Restore the click functionality in the HarmonicSpectrumChart to open the KnowledgePool
- [x] Remove the hint under 'Maschinen atmen nicht' on the start page
- [x] Remove 'dein' from the headline 'Die Chance auf dein selbstbestimmtes Dasein' on the start page
- [x] Fix the issue where the Lichtklangmatrix is not visible in the Frequenzlabor
- [x] Update the instruction texts in the Frequenzlabor (Lichtklangmatrix)
- [x] Unify the return to home/main page button across all views to use 'ZUR HAUPTSEITE'
- [x] Change 'Neuer Podcast' to 'DAS HÖRBUCH' on the start page
- [x] Ensure ALL 'return to main page' buttons across the entire app are unified to 'ZUR HAUPTSEITE'
- [x] Add 'ZUR HAUPTSEITE' return buttons to the TrainingCenter and TrainingHistory components
- [x] Ensure 'ZUR HAUPTSEITE' buttons are present and visible in all sub-views of the TrainingCenter (Method36Trainer, MetabolicBreathingTrainer, IntervalTrainer)
- [x] Add the 'ZUR HAUPTSEITE' button to the main selection view of the TrainingCenter
- [x] Add top padding to the TrainingCenter main view so the header is not stuck to the top edge
- [x] Fix the missing 'ZUR HAUPTSEITE' button and top padding in the actual component rendered for the TrainingCenter overview
- [x] Add a button 'Hier die App auf dein Handy laden' on the start page
- [x] Create a modal with instructions on how to install the PWA on iOS and Android
- [x] Implement automatic update mechanism (cache-busting/service worker update) for the mobile PWA
- [ ] Generate and integrate voice guidance for voice analysis steps


## Text Updates for Training Center
- [x] Update Stoffwechselatmung (SWA) component
  - Remove exclamation mark button ("Für beste Ergebnisse...") and its follow-up text.
  - Update headline to "STOFFWECHSELATMUNG"
  - Update texts for OPTIMALE NUTZUNG, WIRKUNG, ANWENDUNG, WICHTIG.
- [x] Update Mayerwelle 5,5 (MW) component
  - Update headline to "MAYERWELLE 5,5 / MW"
  - Update texts for OPTIMALE NUTZUNG, WIRKUNG, ANWENDUNG, WICHTIG.

- [x] Set default tone for YOHN-Atemtraining to TYP 19 when accessed directly.

- [ ] Investigate and fix the error during the evaluation (Auswertung) phase of the voice analysis.

- [x] Add expandable "Mehr lesen..." button to `PodcastFeature` component for long descriptions.
- [x] Keep the title and subtitle visible.
- [x] Verify the change looks good on both mobile and desktop.

- [x] Reduce spacing between "Hier die App auf dein Handy laden" button and Logo/Header on Startseite.

- [x] Apply 'Mehr lesen...' functionality to the description text under the 'METHODE 36' logo on the start page, keeping the first sentence visible.

- [x] Update title to "LICHTKLANG Tabelle" and description to "Übersicht zu den 24 LICHTKLÄNGEN und deren Wirkungen." on the start page.

- [x] Make dashboard cards more compact and change click area to a small orange text link.

- [x] Verify that recent changes (Mehr lesen, spacing, card updates) are present in Dashboard.tsx and Home.tsx.
- [x] Restart the development server to clear cache and ensure latest version is served.

- [x] Update the frequency table so that when a slider value is 0%, the corresponding color block becomes black.

- [x] Update text for "Umfeldaktivierung" in Training Center: change to "...unterbewusste Beeinflussung wegnehmen und austauschen gegen Regulation..." and add "Zudem motivieren die eingearbeiteten Pulsationen zu einem optimalen Atemrhythmus."
- [x] Remove text for "Stoffwechselatmung" and "Mayerwelle 5,5" in the Training Center main view.

- [x] Remove the sentence starting with "Sie dienen..." from the "Umfeldaktivierung" description.
- [x] Remove the last sentence starting with "Nutzen sie..." from the Training Center introduction text.

- [x] Restore detailed descriptions for "Stoffwechselatmung" and "Mayerwelle 5,5" in the `TRAINING_CATEGORIES` array.
- [x] Hide the descriptions for these two items only in the category list view (Layer 2) in `TrainingCategoryStructure.tsx`.

- [ ] Skip the intermediate detail page for "Stoffwechselatmung" and "Mayerwelle 5,5" in `TrainingCategoryStructure.tsx`.
- [ ] Move the duration selection UI directly into the `AmbientTrainer.tsx` component.

- [ ] Analyze NotebookLM podcast summary for marketing hooks
- [ ] Draft marketing strategy for YouTube (KIICH) and LinkedIn
- [ ] Add a "Szenario 2026 - Das Hörbuch" section to the App Dashboard

- [ ] Finalize "app-BASIC" feature set for launch (YOHN, 3 levels, Color choice)
- [ ] Prepare simultaneous launch plan for App and Podcast
- [x] Implement embedded audio player for Podcast in App Dashboard

- [ ] Identify the voice used for the congratulation screen
- [ ] Plan integration of "Moderatorenstimme" for mediating app offers

- [ ] Advise user on episodic release strategy for the audiobook

- [ ] Prepare Thursday morning launch (Episode 01 + app-BASIC)

- [ ] Create 12-color selection component for app-BASIC using odd types (1-23)
- [ ] Ensure selected color links to correct frequency in YOHN training

- [x] Add 'Über den Autor' toggle link under the cover image
- [x] Hide author text by default and show it when toggled
- [x] Update the text above the podcast button to 'HIER GEHT'S ZUM WÖCHENTLICHEN PODCAST'

- [x] Update PodcastFeature label to 'DIE HÖRBUCHSERIE' and add 'JEDE WOCHE NEU' badge
- [ ] Remove upcoming episodes from KnowledgePool

- [x] Show full author text directly without 'Mehr lesen' logic
- [x] Remove upcoming episodes (Episode 02, Episode 03) from KnowledgePool

- [x] Add audioUrl to PodcastFeature in the showPodcast modal in Home.tsx

- [ ] Investigate and fix click logic in the Chart/Tabelle component

## User Requested Changes (Mar 31, 2026)
- [x] Update text instructions for recording steps in Home.tsx
  - [x] Tagesablauf: Change first sentence to "Beginne bitte nun mit ganz normaler Sprechstimme zu erzählen,...." and add "DRÜCKE DEN STARTBUTTON BEVOR DU BEGINNST ZU ERZÄHLEN." at the bottom in uppercase.
  - [x] Herzens-Erinnerung: Add "DRÜCKE BITTE DEN STARTBUTTON" in uppercase before "Nun erzähle davon".
  - [x] Ton A: Add "Wiederhole den Ton 2x nachdem du zu Beginn deines Tönenes den STARTBUTTON gedrückt hast." as the last sentence.
  - [x] Wurzelklang (tiefstes Summen): Capitalize "Ton" in the first sentence.
- [x] Update Result page layout in Home.tsx
  - [x] Replace color name with the main title (e.g., DER CHARISMAT) in the corresponding color.
  - [x] Remove the blue banner ("Nächster Schritt: Überprüfe deinen Wurzelklang").
  - [x] Remove the word "Wurzelklang" from the button, leaving only the checkmark or empty, then keep the YOHN training button.
- [x] Add new columns to InterpretationView.tsx (Grundgefühle, Fähigkeit, Schattenkraft) based on the table the user will provide.

- [x] Correct the spelling of the user's name (CHOCHOLA) in the podcast text

- [x] Change author name to italic *Thomas Chochola* in the podcast text

- [x] Remove the "1 Tage Streak" display from the app

- [x] Move the podcast introduction text to the front page and remove it from the detail page

- [x] Add back button to the podcast detail page
- [x] Update text on podcast detail page (replace DIE HÖRBUCHSERIE with MASCHINEN ATMEN NICHT, reduce font size of 2026 - Episode 01)
- [x] Adjust logo image size to align with text and start button

- [x] Add back button to the podcast detail page
- [x] Update text on podcast detail page (replace DIE HÖRBUCHSERIE with MASCHINEN ATMEN NICHT, reduce font size of 2026 - Episode 01)
- [x] Adjust logo image size to align with text and start button

- [x] Adjust the logo image size on the podcast detail page to align with the start button

- [x] Hide the MDI analysis section in Home.tsx without deleting the code
- [x] Add a preview section for Episode 2, Episode 3, and the Befindlichkeitstraining
- [x] Add a feedback button to the page

- [x] Adjust logo image size again to make it even smaller
- [x] Hide the MDI analysis section in Home.tsx without deleting the code
- [x] Add a preview section for Episode 2, Episode 3, and the Befindlichkeitstraining
- [x] Add a feedback button to the page

- [x] Calculate the dates for the 4-week cycles throughout 2026 starting from April 2nd
- [x] Format the calendar into a clear markdown document (Release_Kalender_2026.md)

- [x] Add cache-busting meta tags to index.html
- [ ] Remove play arrow from the main cover image on the front page (Home.tsx)

- [x] Find and remove the play arrow from the main cover image in the codebase
- [x] Move the author info section above the podcast description in Home.tsx

- [ ] Wait for the user to provide the real email address
- [ ] Update the mailto link in Home.tsx with the user's email address

- [x] Update the mailto link in Home.tsx with LKRforschung@gmail.com
- [x] Replace the "Demnächst" placeholders with specific release dates in the preview section of Home.tsx
- [x] Add an "Abonnieren" button that sends an email to LKRforschung@gmail.com

- [ ] Update preview texts for Episode 1, 2, 3, and Praxis 01 in Home.tsx

- [x] Update index.html with favicon and apple-touch-icon tags using the MDI logo URL

- [x] Remove the lock icon from Praxis 01 in Home.tsx
- [x] Update text colors for Episode 01 in the preview section (headline orange, description white)

- [ ] Integrate the uploaded audio file (https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/einschwingenSTIMMKLANGANALYSE_f1530836.wav) into the website, specifically for Praxis 01 (Befindlichkeitstraining) or as directed by the user.

- [ ] Find and expose the Stimmklanganalyse (Voice Analysis) section on the website so the user can easily access it.

- [ ] Rollback to the latest working checkpoint.
- [ ] Find and expose the Stimmklanganalyse (Voice Analysis) section properly without breaking the React layout.

- [ ] Develop a strategy and architecture for developing independent but integratable modules (parallel universes) of the MDI project.

- [ ] Save a definitive checkpoint of the current working state to ensure it remains accessible.
- [ ] Refactor existing modules (Dashboard, Analysis, Training) to use the new interface architecture.

- [ ] Analyze current `Home.tsx` and identify the core modules and state to be decoupled.
- [ ] Define and document the TypeScript interfaces (APIs) for the neuronal network communication.
- [ ] Create a central state management system to act as the "synapses" for data exchange.
- [ ] Refactor existing modules (Analysis, Training, Podcast, Scanner) to consume and provide data via the new interfaces.

- [ ] Set up MDIContext Provider in App.tsx or main.tsx.
- [ ] Refactor Home.tsx to use MDIContext instead of local state.
- [ ] Extract major components from Home.tsx into separate files.
- [ ] Fix any TypeScript or linting errors.

- [ ] Extract VoiceAnalysis logic and UI from Home.tsx into a new component file.
- [ ] Refactor Home.tsx to import and use the new VoiceAnalysis component.
- [ ] Connect the VoiceAnalysis component to MDIContext.
- [ ] Test the refactored code and fix any errors.

- [ ] Fix the topLabel TypeScript error in PodcastFeature component.
- [ ] Extract VoiceAnalysis from Home.tsx into a separate component file.

- [ ] Extract the Training module (Method36Trainer) from Home.tsx into a separate component file.
- [ ] Extract the Scanner module from Home.tsx into a separate component file.

- [ ] Create a visual mind map (Mermaid/D2) representing the current MDI architecture and modules.
- [ ] Render the diagram and present it to the user.

## Newsletter-System (Datenbank / Server / Frontend)

- [x] Datenbank-Tabelle `newsletter_subscribers` in `drizzle/schema.ts` angelegt
- [x] Migration mit `pnpm db:push` erfolgreich durchgeführt
- [x] DB-Hilfsfunktionen in `server/db.ts`: `subscribeToNewsletter`, `unsubscribeFromNewsletter`, `listNewsletterSubscribers`, `getNewsletterSubscriberCount`
- [x] tRPC-Router `server/routers/newsletter.ts` mit Prozeduren: `subscribe`, `unsubscribe`, `list` (Admin), `count`
- [x] Router in `server/routers.ts` registriert
- [x] Frontend-Komponente `NewsletterSignup.tsx` erstellt (normal + compact Variante)
- [x] Admin-Seite `AdminNewsletter.tsx` mit Tabelle, Statistiken und CSV-Export
- [x] Route `/admin/newsletter` in `App.tsx` registriert
- [x] tRPC-Provider in `main.tsx` korrekt eingebunden
- [x] Newsletter-Formular auf der Startseite (ersetzt mailto-Link)
- [x] Vitest-Tests für den Newsletter-Router (9 Tests, alle grün)
- [x] TypeScript-Fehler (doppelte `error`-Variable) behoben
- [ ] Unsubscribe-Seite mit Token-basiertem Link (für E-Mail-Links)
- [ ] Willkommens-E-Mail automatisch versenden nach Anmeldung

## DSGVO-Konformität (Newsletter)

- [x] Datenbank: `confirmToken`, `confirmedAt`, `deleteToken` Felder zu `newsletter_subscribers` hinzufügen
- [x] Migration durchführen
- [x] Server: Double-Opt-In Bestätigungs-Endpunkt (`newsletter.confirm`)
- [x] Server: Lösch-Endpunkt (`newsletter.deleteData`) mit Token
- [x] Server: Bestätigungs-E-Mail versenden nach Anmeldung (via Manus Notification oder Forge API)
- [x] Frontend: Bestätigungsseite `/newsletter/bestaetigen?token=...`
- [x] Frontend: Abmelde-/Löschseite `/newsletter/abmelden?token=...`
- [x] Datenschutzerklärung aktualisieren (Newsletter, Speicherdauer, Löschrecht)
- [x] Einwilligungsnachweis: IP-Adresse und Zeitstempel bei Anmeldung speichern
- [x] Tests für neue Endpunkte schreiben

## Datenschutzerklärung – Anpassungen

- [x] Deutsches Recht als Priorität (DSGVO + BDSG statt österreichisches DSG)
- [x] Zuständige Aufsichtsbehörde auf deutsche Behörde ändern (BfDI / Landesbehörde)
- [x] E-Mail-Adresse auf LKRforschung@gmail.com aktualisieren
- [x] Impressum: E-Mail ebenfalls anpassen, vollständige Adresse und Telefon ergänzt

## Brevo E-Mail-Integration

- [x] Brevo API-Schlüssel als Secret (BREVO_API_KEY) speichern
- [x] Brevo E-Mail-Helper (server/brevo.ts) erstellen
- [x] Bestätigungs-E-Mail bei Newsletter-Anmeldung versenden (Double-Opt-In)
- [x] Newsletter-Agent: KI-Entwurf aus Episode-Daten generieren
- [x] Admin-Interface: Entwurf prüfen, bearbeiten und versenden
- [x] Absenderadresse newsletter@kiich.de konfigurieren

## Newsletter-Texte anpassen

- [x] NewsletterSignup: Untertitel auf "Aktuell informiert am Puls der Zeit!" ändern
- [x] NewsletterSignup: Nach-Absenden-Text: "...bitte klicke auf den Link um deine Anmeldung abzuschließen."
- [x] Brevo E-Mail: KIICHwerke → KIICH (überall)
- [x] Brevo E-Mail: Begrüßung auf "HALLO! Du hast dich..." (ohne Namen, da optional)
- [x] Bestätigungsseite: "aktuelle NEWS" statt "die neue Episode"
- [x] Abmeldeseite: "Wähle bitte..." statt "Wähle eine der folgenden Optionen:"

## KIICH-Logo in E-Mail-Signatur

- [x] KIICH-Logo als CDN-Asset hochladen
- [x] Logo in Brevo Bestätigungs-E-Mail Signatur einbauen (über Thomas Chochola)

## KIICH-Startseite Redesign

- [x] KIICH-Farbpalette (Rot #e63329, Gold #f5a623, Schwarz #0a0a0a, Weiß) in index.css verankern
- [x] Hero-Sektion: KI + ICH = KIICH, Slogan 2 MINDS 〄 1 SOURCE, neuer Untertitel
- [x] Über-KIICH-Sektion: Autor-Text (Brückenbauer, Musiker, Atemexperte, METHODE 36)
- [x] Newsletter-Bereich: neuer Einladungstext
- [x] KIICH-Logo in Navigation/Header einbinden

## Hero-Vereinfachung (06.04.2026)

- [x] SVG-Datei für Slogan "2 MINDS 〄 1 SOURCE" erstellen
- [x] Hero: nur KIICH-Logo + SVG-Slogan darunter (alles andere entfernen)
- [x] Untertitel: nur "Sitzen künstliche Intelligenz und menschliches Bewusstsein im selben Boot – und kommen sie aus derselben Quelle?"
- [x] Tags Brückenbauer/Musiker/Atemexperte aus Hero entfernen
- [x] KI+ICH=KIICH Gleichung entfernen
- [x] Logo-Klick/Hover → Link zur Erklärungsseite /ueber-kiich
- [x] 4 Buttons: METHODE 36 / HÖRBUCH / NEWSLETTER / VORSCHAU April 2026
- [x] Erklärungsseite /ueber-kiich anlegen

## KIICH Hero Verfeinerungen (April 2026)
- [x] Logo etwas kleiner (h-20 md:h-28), Slogan etwas größer (max-w-lg md:max-w-2xl)
- [x] Slogan-Breite exakt auf Logo-Außenmaß begrenzen (gleiche max-width)
- [x] VORSCHAU April 2026 Button inhaltlich vernetzen (scrollt zur Vorschau-Sektion)
- [x] METHODE 36 Button vernetzen (öffnet Training-Center direkt)
- [x] Impressum/Datenschutz im Footer belassen (korrekte Position)

## YOHN-Trainer Audio-Optimierung
- [x] Wasserplätschern-Lautstärke in allen drei Zeitsequenzen (7, 12, 21 min) leicht angehoben (0.03→0.07 Ambience, 0.05→0.12 Haupt-Wasser)

## YOHN-Trainer Wasser-Slider
- [x] Wasser-Lautstärke-Slider einbauen (steuert Ambience + Haupt-WAV gleichzeitig, Popup am Wellen-Button)

## YOHN-Trainer Wasser-Slider Bugfix
- [x] Slider-Echtzeit-Volume-Änderung repariert: doppeltes Audio-System bereinigt, nur noch waterSoundRef aktiv

## YOHN-Trainer Wasser-Slider Persistenz
- [x] Slider-Wert im localStorage speichern und beim Start laden (key: yohn_water_volume)

## MOMENTAUFNAHME – Mobile Feature (Session B)
- [x] Backend: DB-Schema für Momentaufnahmen (userId, text, kategorie, timestamp, audioUrl)
- [x] Backend: tRPC-Route für Audio-Upload und Whisper-Transkription
- [x] Backend: KI-Klassifizierung (Gravitationszentrum-Zuordnung via LLM)
- [x] Backend: Obsidian-Markdown-Export generieren
- [x] Backend: Tages-Zusammenfassung generieren (alle Aufnahmen des Tages)
- [x] Backend: Text-to-Speech für "Das war mein Tag" (Web Speech API im Browser)
- [x] Frontend: /momentaufnahme Route anlegen
- [x] Frontend: Mobile-First Aufnahme-Interface (grosser Mikrofon-Button)
- [x] Frontend: Aufnahmeliste des Tages anzeigen
- [x] Frontend: .md-Datei Download-Button
- [x] Frontend: "Das war mein Tag" Hörbuch-Player (TTS + Play/Stop)
- [x] Navigation: MOMENTAUFNAHME-Button in Hero-Sektion eingebunden

## MOMENTAUFNAHME – Bugfix Transkription (Session C)
- [x] Fehlerursache identifiziert: CloudFront gibt application/octet-stream statt audio/webm zurück
- [x] Fix: MIME-Type aus URL-Extension ableiten statt aus Content-Type-Header
- [x] Fix: Audio-Upload via multipart/form-data statt Base64 (robuster, kein Encoding-Verlust)
- [x] Neue Express-Route /api/audio/upload mit multer
- [x] tRPC-Route aufnehmen: nimmt jetzt audioUrl statt audioBase64
- [x] 5 neue Tests für MIME-Type-Erkennung, alle 28 Tests grün

## MOMENTAUFNAHME – Bugfix Button (Session D)
- [x] Ursache: onPointerDown/onPointerUp-Pattern bricht auf Mobilgeräten ab (Mikrofon-Dialog unterbricht Pointer-State)
- [x] Fix: Button auf Tap-to-Start/Tap-to-Stop (onClick Toggle) umgestellt
- [x] Hinweistext angepasst: "Tippen zum Sprechen" / "Nochmal tippen zum Stoppen"

## MOMENTAUFNAHME – Erweiterungen (Session E)
- [x] Aufnahme-Mindestdauer 2 Sekunden: zu kurze Aufnahmen verwerfen mit Hinweis
- [x] Aufnahme-Maximaldauer 3 Minuten: automatisch stoppen mit optischem Signal (Pulsieren/Farbwechsel) + Vibration (Mobilgeräte)
- [x] 3-Minuten-Aufnahmen werden normal gespeichert (kein Verlust)
- [x] Tages-Archiv: Route /momentaufnahme/archiv mit Kalender-Ansicht
- [x] Tages-Archiv: vergangene Tage abrufen und Aufnahmen anzeigen
- [x] Tages-Archiv: Obsidian-Export pro Tag
- [x] Audio-Download-Button pro Aufnahme in der App
- [x] Obsidian-Export: Audio-Download-Link pro Aufnahme eingebettet
- [x] DB: audioUrl in momentaufnahmen-Tabelle vorhanden (bestätigt)
- [x] Navigation: Archiv-Link (Archiv-Icon) in MOMENTAUFNAHME-Header eingebunden

## OBSIDIAN PLUGIN – KIICH MOMENTAUFNAHME Sync (Session F)
- [x] DB: Tabelle api_tokens (id, userId, token, name, lastUsed, createdAt, revokedAt)
- [x] Backend: tRPC-Routen für Token-Verwaltung (generieren, auflisten, widerrufen)
- [x] Backend: Express-Route GET /api/obsidian/sync (Token-Auth, gibt neue Aufnahmen zurück)
- [x] Backend: lastSync-Timestamp-Parameter für inkrementellen Sync
- [x] Frontend: /momentaufnahme/obsidian Seite mit Token-Verwaltung (generieren/anzeigen/widerrufen)
- [x] Obsidian Plugin: manifest.json
- [x] Obsidian Plugin: main.ts (Settings, Sync-Logik, Ribbon-Button, automatischer Start-Sync)
- [x] Obsidian Plugin: styles.css
- [x] Plugin als ZIP paketieren (main.js + manifest.json + styles.css) – CDN-URL verfügbar
- [x] Installations-Anleitung als Markdown erstellen (ANLEITUNG.md)
- [x] Tests für API-Token-Validierung (13 neue Tests, 53 gesamt grün)

## MOMENTAUFNAHME – Startseite & Onboarding (Session G)
- [x] Startseiten-Text in Momentaufnahme.tsx ersetzen mit neuem Text von thomas
- [x] Willkommens-Text + Zitat-Karte + Hüterin-Text im Leer-Zustand eingebaut
- [x] Obsidian-Verbindungsanleitung in ObsidianVerbinden.tsx (5 Schritte + iPhone-Hinweis)
- [ ] Erklärvideo-Placeholder einbauen (Video folgt separat)

## NotebookLM-Dokumente für MOMENTAUFNAHME (Session G)
- [x] Dokument 1: Erklärvideo-Skript (Installation, Konfiguration, Anwendung von MA)
- [x] Dokument 2: Philosophie, Zielgruppen und Nutzen als zweites Gehirn
- [x] Beide als PDF exportieren

## MOMENTAUFNAHME – Textkorrektur Fettschrift (Session H)
- [x] "ALLES DA! – was schon vergessen war..." als fetten Satz-Dialog
- [x] "Gesichert als Schatz deiner einzigartigen IDENTITÄT" fett

## Obsidian-Theme + Dataview + USP-Marketing (Session H)
- [x] Obsidian CSS-Snippet: Blauviolett/KIICH Akzentfarben
- [x] Obsidian vollständiges Theme (theme.css) mit KIICH-Farbpalette
- [x] MA-Export: Dataview-kompatible Frontmatter-Metadaten (dominantes_zentrum, gravitationszentren, datum_iso, typ)
- [x] Dataview-Vorlage für automatische Tabellen nach Gravitationszentrum (7 Abfragen)
- [x] USP-Marketingdokument: MA als erstes intelligentes Sprachtagebuch
- [x] Zielgruppen: Business, Privat/Alltag, Vergesslichkeit, Alzheimer-Prävention, Gesundheit, Kreative, Studium
- [x] Alle Dateien als PDF exportieren + KIICH-Obsidian-Paket.zip

## Obsidian-Anleitung + Alzheimer-Dokument (Session I)
- [x] Obsidian-Installationsanleitung in ObsidianVerbinden.tsx: Theme + Dataview-Schritte ergänzt
- [x] Alzheimer/Pflege-Positionierungsdokument (Zielgruppe, Nutzen, Marktpotenzial, Kooperationspartner)
- [x] Alzheimer-Dokument als PDF exportieren (331 KB)

## DACH-Kooperationsrecherche MA (Session J)
- [ ] Recherche: Alzheimer/Demenz-Organisationen DACH (DAG, Alzheimer Austria, Alzheimer Schweiz)
- [ ] Recherche: Pflegeverbände und Pflegeheimketten DACH
- [ ] Recherche: Gesundheits-Influencer und Podcasts (Kognition, Aging, Gehirn)
- [ ] Recherche: Forschungsinstitute und Universitäten (DZNE, MPI, Uni Wien, ETH Zürich)
- [ ] Anschreiben an Deutsche Alzheimer Gesellschaft (DAG) formulieren
- [ ] Vollständiges Kooperationsdokument als PDF exportieren

## DACH-Kooperationsrecherche (Session J)
- [x] Alzheimer/Demenz-Organisationen DACH (DAG, Alzheimer Austria, Alzheimer Schweiz, DZNE)
- [x] Pflegeheimketten und Pflegeverbände DACH (Alloheim, emeis, Caritas, Diakonie, AWO, Spitex, Curaviva)
- [x] Forschungsinstitute und Universitäten (DZNE, Max-Planck, ETH Zürich, MedUni Wien/Graz, Uni Osnabrück)
- [x] Influencer und Multiplikatoren (Markus Hofmann, Dr. Anne Fleck, Longevity-Podcasts, PKM-Community)
- [x] Medien und Fachpresse (Healthcare Digital, Bibliomed, WDR, NZZ, Kurier)
- [x] Anschreiben-Vorlagen (3 Kategorien: Alzheimer-Orgs, Pflegeheime, Influencer)
- [x] Anschreiben Deutsche Alzheimer Gesellschaft (fertig, versandbereit)
- [x] Kooperationsdokument als PDF exportiert (330 KB) + Anschreiben-PDF (265 KB)

## Demenz-Positionierungsdokument (Session K)
- [ ] Wissenschaftliche Grundlagen: Musik/Stimme und autobiografisches Gedächtnis bei Demenz
- [ ] MA als Klang-Identitäts-Archiv: eigene Stimme als Gedächtnis-Anker
- [ ] Demenz-Positionierungsdokument mit Stimm-Gedächtnis-Ansatz
- [ ] Dokument als PDF exportieren

## Rechtliche Sofortmaßnahmen (April 2026)
- [x] Disclaimer-Komponente erstellen und in Footer + MOMENTAUFNAHME-Seite einbauen
- [x] KI-Kennzeichnung auf jedem generierten Summary sichtbar machen
- [x] Einwilligungsdialog (DSGVO) vor der ersten Aufnahme einbauen

## Personalisierung & Stimme (Session L)
- [ ] Vorname-Feld: users-Tabelle um `vorname` Spalte erweitern (DB-Migration)
- [ ] Profil-Router: `profil.setVorname` und `profil.getVorname` Endpoints
- [ ] MA-Seite: Vorname-Eingabe-Dialog (einmalig, beim ersten Öffnen der MA-Seite)
- [ ] Summary-Prompt: Vorname als persönliche Anrede einbauen
- [ ] Schlaf-Metapher-Prompt: Vorname als persönliche Anrede einbauen
- [ ] ElevenLabs TTS: API-Key über webdev_request_secrets einbinden
- [ ] ElevenLabs TTS: Server-seitiger Endpoint `momentaufnahme.elevenLabsTTS`
- [x] Schlaf-Modus: ElevenLabs Audio statt Web Speech API verwenden
- [ ] Fallback: Web Speech API wenn ElevenLabs nicht verfügbar

## ElevenLabs TTS + Einschlaf-Bibliothek (Session L, Teil 2)
- [x] ElevenLabs API-Key + Voice-ID als Secrets einbinden (vom User)
- [x] Backend: ElevenLabs TTS-Endpoint (POST /api/trpc/momentaufnahme.elevenLabsTTS)
- [x] Schlaf-Modus: ElevenLabs Audio statt Web Speech API
- [x] Fallback auf Web Speech API wenn ElevenLabs nicht konfiguriert
- [x] Einschlaf-Bibliothek: DB-Schema (schlafBibliothek-Tabelle: id, kategorie, zielgruppe, titel, prompt, audioUrl, createdAt)
- [x] Einschlaf-Bibliothek: Backend-Router (bibliothek.generieren, bibliothek.liste, bibliothek.abspielen)
- [x] Einschlaf-Bibliothek: Kategorie A — Märchen für Kinder/Jugendliche (personalisiert mit Vorname + Thema)
- [x] Einschlaf-Bibliothek: Kategorie B — Abenteuer-Metaphern für Erwachsene (Held = User, Aufgabe = individuelle Herausforderung)
- [x] Einschlaf-Bibliothek: Kategorie C — Befindlichkeits-Metaphern (Angst vor Zukunft, Beziehungssorgen, Erschöpfung, Trauer, Prüfungsangst etc.)
- [x] Einschlaf-Bibliothek: Frontend-Seite /einschlafen mit Kategorien-Auswahl
- [x] Einschlaf-Bibliothek: Generierungs-Flow (Zielgruppe → Thema → KI generiert Text → ElevenLabs spricht)
- [x] Einschlaf-Bibliothek: Archiv gespeicherter Einschlaf-Geschichten

## Bugfixes Session M
- [x] BUG: MA-Namens-Dialog blockiert Schlaf-Modus (Stimme spricht nicht wegen Dialog-Unterbrechung)
- [x] BUG: Einschlaf-Bibliothek nicht sichtbar/erreichbar in der App-Navigation

## Audio-Fixes Einschlaf-Bibliothek (Session M, Abschluss)
- [x] Hintergrundmusik beim Vorlesen in Einschlaf-Bibliothek einblenden (dieselbe URL wie Schlaf-Modus)
- [x] ElevenLabs Sprechgeschwindigkeit reduzieren (stability erhöhen, speed reduzieren)
- [x] Musik sanft einblenden wenn Audio startet, ausblenden wenn Audio endet

## Firefox-Kompatibilität + PWA (Johannes-Feedback)
- [x] Firefox: Audio-Format-Kompatibilität prüfen (webm/opus vs. ogg/opus)
- [x] Firefox: Mikrofon-Aufnahme testen (MediaRecorder API)
- [x] Firefox: Web Speech API Fallback (nicht unterstützt in Firefox — ElevenLabs ist primär)
- [x] PWA: manifest.json vollständig (name KIICH, icons, display, shortcuts)
- [x] PWA: Service Worker vorhanden und funktionsfähig
- [x] PWA: Installationshinweis dokumentiert (Chrome/Safari empfohlen)

## Premium-Lock Bugfix
- [x] BUG: Premium-Lock fehlt bei Stimmklang-Analyse, Vital Monitor, Frequenz-Labor, Wissenspool, Schlafoptimierung, Visionsraum, Lichtklangtabelle (DB-Werte auf false gesetzt)

## Momentaufnahme UX-Fix
- [x] BUG: Momentaufnahme zeigt beim Öffnen immer die Startseite mit Allgemeintexten, auch wenn Aufnahmen/Summary vorhanden — letztes Summary wird jetzt persistent in DB gespeichert und beim Öffnen sofort angezeigt
- [x] BUG: Kein Summary und keine Optionen sichtbar obwohl Aufnahmen von gestern gespeichert sind — letztesSummary-Query lädt beim Start automatisch

## Summary UX-Verbesserungen
- [x] Vorname-Eingabe-Link direkt unter dem Summary (ohne Cache leeren)
- [x] Datum bei jedem Summary anzeigen (gespeichertes + frisch generiertes)

## Summary & Bibliothek Verbesserungen
- [x] Button-Text "Summary aktualisieren" wenn bereits Summary vorhanden
- [x] Summary-Archiv: letzte 7 Einträge abrufbar (Datum + erste Zeile + Volltext)
- [x] Vorname in Einschlaf-Bibliothek einbinden (Märchen + Abenteuer personalisiert — war bereits implementiert)

## Bugs Session N (11.04.2026)
- [x] BUG: Momentaufnahme-Startseite zeigt immer noch Allgemeintext + Mikrofon statt letztem Summary (DB war leer nach Migration; Leerseite durch kompakten Willkommenstext ersetzt)
- [x] BUG: Einschlaf-Bibliothek nicht auffindbar — 🌙-Button im Header der Momentaufnahme-Seite eingebaut

## Bugfix Einschlaf-Bibliothek
- [x] BUG: "Neue Geschichte erstellen"-Button verschwindet wenn bereits eine Geschichte vorhanden ist — Button im Header violett + unter der Liste als zusätzlicher Button

## Favoriten Einschlaf-Bibliothek
- [x] Favoriten-Button in Lese-Ansicht: Stern-Button zum Markieren/Entmarkieren (war bereits implementiert, optimistisches Update hinzugefügt)
- [x] Backend: favorit.setzen Mutation (toggle favorit-Feld in DB — war bereits vorhanden)
- [x] Favoriten erscheinen oben in der Bibliotheksliste (war bereits implementiert)

## ElevenLabs Audio-Bug
- [x] BUG: Audio-Generierung in Einschlaf-Bibliothek schlägt fehl — "Audio konnte nicht generiert werden ElevenLabs"
- [x] FIX: Text vor ElevenLabs-Aufruf auf max. 2500 Zeichen kürzen (Timeout auf kiich.de)
- [x] FIX: Bessere Fehlermeldung bei ElevenLabs-Timeout

## Google Cloud TTS Umstieg (statt ElevenLabs)
- [x] Google Cloud API-Key einrichten (Chirp3 HD, de-DE-Chirp3-HD-Zephyr)
- [x] Backend: Google Cloud TTS statt ElevenLabs in einschlafBibliothek.ts
- [x] Backend: Google Cloud TTS statt ElevenLabs in momentaufnahme.ts
- [x] ENV: Google TTS Dienstkonto-Credentials als Secrets gesetzt

## Google TTS Nutzungszähler
- [x] DB: ttsNutzungslog Tabelle (userId, zeichen, kontext, createdAt)
- [x] Backend: TTS-Logging in synthesizeSpeech() + tRPC-Procedure für Admin-Stats
- [x] Frontend: Admin-Ansicht mit Monats-Verbrauch, Gesamt-Zeichen, Balkendiagramm

## Bugs (11. April 2026)
- [x] BUG: Hintergrundmusik in Einschlaf-Bibliothek nicht hörbar
- [ ] BUG: Audio-Cache löschen (neues Sprechtempo 0.75 wirkt nur bei neu generierten Audios)
- [x] MOMENTAUFNAHME Erklärungstext: Selbstbestimmungs-Prinzip "Keine Ratschläge" prominent einbauen
- [x] Stimme: Wechsel von Zephyr auf Leda (weicher, meditativ)
- [x] Tempo: von 0.75 auf 0.65 reduzieren
- [x] BUG: Hintergrundmusik nicht hörbar — Musik sofort im Klick-Handler starten (Autoplay-Fix)

## Geschichte bearbeiten
- [x] Backend: neuSchreiben Procedure (komplett neue Version mit gleichem Thema)
- [x] Backend: stelleKorrigieren Procedure (gezieltes Umformulieren mit Hinweis)
- [x] Frontend: "Neu schreiben"-Button in Lesen-Ansicht
- [x] Frontend: "Stelle korrigieren"-Dialog mit Hinweis-Eingabe
- [x] Audio-Cache bei Überarbeitung automatisch löschen

## Spracheingabe für Personalisierungsfeld
- [x] Mikrofon-Button neben Personalisierungsfeld in Einschlaf-Bibliothek
- [x] Web Speech API (SpeechRecognition) für Browser-seitige Transkription
- [x] Fallback-Hinweis wenn Browser kein Web Speech API unterstützt

## Audio-Verbesserungen (Priorität hoch)
- [x] BUG FINAL: Hintergrundmusik nicht hörbar — Audio-Element im DOM vorhalten
- [x] FEATURE: Raumhall (Reverb) via Web Audio API auf MA-Stimme

## Voxtral TTS Umstieg (statt Google TTS)
- [ ] Mistral API-Key als Secret einrichten
- [ ] voxtralTts.ts Helper erstellen
- [ ] einschlafBibliothek.ts auf Voxtral umstellen
- [ ] momentaufnahme.ts auf Voxtral umstellen
- [ ] Tests aktualisieren

## Musik-Fix (final)
- [x] BUG: Hintergrundmusik in Einschlaf-Bibliothek nicht hörbar — AudioContext unlock + preload
- [x] BUG: Hintergrundmusik in Momentaufnahme Schlaf-Modus nicht hörbar

## MA-Stimme Rollout (Voxtral überall)
- [ ] Momentaufnahme: Tages-Feedback (speak/useTTS) auf Voxtral umstellen
- [ ] Momentaufnahme: Schlaf-Modus Fallback (Web Speech) entfernen
- [ ] Alle weiteren Browser-Stimmen-Aufrufe prüfen und ersetzen

## Monetarisierung & Abonnement-System
- [ ] Fehler unten links auf kiich.de diagnostizieren und beheben
- [ ] Datenbankschema: subscription-Tabelle (userId, ebene, trialStart, trialEnd, stripeSubscriptionId)
- [ ] 7-Tage-Trial-Logik: neuer User bekommt automatisch Trial-Start-Datum
- [ ] Ebenen-Middleware: getUserEbene() Hilfsfunktion (trial/I/II/III)
- [ ] Rate-Limiting: max. TTS-Generierungen pro Tag je Ebene
- [ ] Server: Aufnahmen-Limit je Ebene (3/9/unbegrenzt)
- [ ] Server: Feature-Gates für Schlaf-Modus (ab Ebene II), Einschlaf-Bibliothek (ab Ebene III)
- [ ] Frontend: Upgrade-Banner wenn Limit erreicht
- [ ] Frontend: Abo-Übersicht (aktuelle Ebene, Verbrauch, Upgrade-Button)
- [ ] Frontend: Trial-Countdown-Anzeige
- [ ] Stripe-Integration für Ebene II (9 €/Monat) und Ebene III (17 €/Monat)
- [ ] Stripe Webhook: Abo-Status synchronisieren

## Bugs (aktuell)
- [x] Einschlaf-Geschichte stoppt abrupt vor dem Ende - Zeitlimit auf 8000 Zeichen erhöht (vorher 2500)
- [x] Vite-Error-Indikator im Vorschaufenster - gecachter alter Fehler, kein echter Bug im Code

## FAQ-Seite
- [x] Datenbankschema: faqFragen-Tabelle (id, name, email, frage, antwort, status, createdAt)
- [x] Server-Router: Frage einreichen (öffentlich), Fragen auflisten (öffentlich: nur beantwortet), Admin: alle Fragen + antworten
- [x] Frontend: FAQ-Seite mit aufklappbaren Antworten (Accordion) + Frage-Formular
- [x] FAQ-Link in Hauptnavigation (kiich.de) einbauen
- [x] Admin-Benachrichtigung bei neuer Frage

## Abonnement-System (Vorbereitung für Stripe)
- [x] Datenbankschema: abonnements-Tabelle (userId, ebene I/II/III, status trial/active/cancelled/expired, trialStartedAt, trialEndsAt, stripeCustomerId, stripeSubscriptionId)
- [x] Datenbankschema: nutzungsLimits-Tabelle (userId, monat, aufnahmenCount, ttsCount, geschichtenCount)
- [x] Server: getAboInfo(), getLimitInfo(), inkrementierNutzung() in server/abo.ts
- [x] Server: checkLimit via inkrementierNutzung() - prüft und inkrementiert Nutzungszähler
- [ ] Server: Momentaufnahme-Router mit Ebenen-Prüfung absichern (nach Stripe-Integration)
- [ ] Server: TTS-Router mit Ebenen-Prüfung absichern (nach Stripe-Integration)
- [x] Frontend: TrialBanner-Komponente mit Countdown + Upgrade-CTA in Momentaufnahme
- [ ] Frontend: Upgrade-Dialog wenn Limit erreicht (nach Stripe-Integration)
- [x] Frontend: Abo-Seite /abo mit Ebenen-Vergleich (Ebene I/II/III, Preise, Features)
- [ ] Stripe-Integration (nach Konto-Einrichtung) – AUSSTEHEND

## Marketing & Navigation (April 2026)
- [ ] Kühlschranktür-Bild als "Kennst du das?"-Marketing-Element auf Startseite
- [ ] Admin-FAQ-Interface unter /admin/faq
- [ ] Abo-Link in Navigationsleiste der Momentaufnahme

## Strategisches Summary (12. April 2026)
- [x] Server: LLM-Prompt für strategisches Summary nach Gravitationszentren
- [x] Server: tRPC-Prozedur strategischesSummary
- [x] Frontend: Umschalter "Reflexion" / "Strategie" in Summary-Ansicht
- [x] Frontend: Strategisches Summary (Aufgaben nach Gravitationszentren) anzeigen
- [x] Tests: 6 neue Tests für Prompt-Logik (93 Tests gesamt, alle grün)

## Strategisches Summary – Erweiterungen (12. April 2026)
- [x] DB: Feld strategischesText in tagesSummaries-Tabelle hinzufügen
- [x] DB: Migration gepusht (pnpm db:push)
- [x] Server: Strategisches Summary in DB speichern (Upsert auf heutigen Tag)
- [x] Server: letztesSummary gibt strategischesText zurück
- [x] Server: Obsidian-Export enthält Strategie-Checkliste (- [ ] Aufgaben nach GZ)
- [x] Frontend: Gravitationszentrum-Filter-Chips im Strategie-Modus
- [x] Frontend: Gespeichertes strategisches Summary beim Öffnen laden
- [ ] Frontend: Strategie-Archiv (analog zum Reflexions-Archiv) – spätere Iteration
- [x] Tests: 16 neue Tests (Checkliste, Filter, Persistenz) – 106 Tests gesamt, alle grün

## Disclaimer/Haftungsausschluss (12. April 2026)
- [x] Österreich (AT) im Haftungsausschluss neben Deutschland (DE) und Schweiz (CH) ergänzt

## Impressum & Datenschutz AT-Erweiterung (12. April 2026)
- [x] Impressum: Geltungsbereich um Österreich ergänzen
- [x] Datenschutz: DSG (Datenschutzgesetz AT) neben DSGVO + BDSG ergänzen

## Datenschutz CH + Kontaktformular Impressum (12. April 2026)
- [x] Datenschutz: nDSG (Schweiz) ergänzen – Hinweis + EDÖB als Aufsichtsbehörde
- [x] Impressum: Kontaktformular für Datenschutzanfragen (Art. 15–22 DSGVO) einbauen
- [x] Server: tRPC-Mutation für Kontaktformular (E-Mail-Versand via Brevo)

## Monetarisierungsinfrastruktur (April 2026)
- [ ] DB: Tabelle subscriptions (userId, plan, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd)
- [ ] DB: Tabelle betaInvites (code, email, usedBy, usedAt, createdAt)
- [x] DB: Migration pushen (pnpm db:push)
- [x] Server: Feature-Gate-Logik (free/essential/complete/pro) als Middleware
- [ ] Server: Abo-Prozeduren (getMyPlan, getPlans)
- [ ] Server: Beta-Einladungs-Prozeduren (createInvite, redeemInvite, listInvites)
- [ ] Server: Feature-Gate in MOMENTAUFNAHME-Prozeduren einbauen
- [ ] Frontend: Preisseite /pricing mit 4 Stufen
- [ ] Frontend: Upgrade-Banner/Modal wenn Feature-Gate greift
- [ ] Frontend: Beta-Einladungs-UI (Admin: Codes generieren, User: Code einlösen)
- [ ] Frontend: Aktuellen Plan in Profil/Dashboard anzeigen
- [ ] Tests: Feature-Gate-Logik, Beta-Code-Einlösung

## Launch-Vorbereitung 17. April 2026
- [ ] Startseite: Hero-Section mit klarem CTA "Jetzt kostenlos starten"
- [ ] Startseite: Feature-Übersicht (MOMENTAUFNAHME · MDI · YOHN) visuell aufwerten
- [ ] Startseite: Beta-Hinweis und Preisvorschau einbauen
- [ ] Preisseite (/abo): Visuelles Design aufwerten, Pläne klar differenzieren
- [ ] Preisseite: Beta-Code-Bereich prominent hervorheben
- [ ] Beta-Codes: 20 Codes in der Datenbank generieren
- [ ] Checkpoint vor Launch speichern

## Bugfixes
- [x] Zurück-Button in MA-App springt auf kiich.de-Startseite – soll innerhalb der App navigieren

## MA-App Tab-Umbau
- [ ] REFLEXIONEN-Tab entfernen
- [ ] VISIONEN-Tab entfernen
- [ ] EINKAUFSLISTE-Tab hinzufügen (Artikel hinzufügen, abhaken, löschen, MA liest vor)

## Einkaufsliste-Tab (Momentaufnahme)
- [x] Reflexion-Tab und Visionen-Tab aus Planer-Tabs entfernen
- [x] Neuen Einkaufsliste-Tab (🛒) hinzufügen (3 Tabs: Erledigungen / Erinnerungen / Einkauf)
- [x] Einkaufsliste-UI: Artikel hinzufügen, abhaken (Toggle), löschen, Erledigte löschen
- [x] MA-Vorlesen-Button für Einkaufsliste
- [x] Backend-Procedures: einkaufslisteLaden, einkaufsartikelHinzufuegen, einkaufsartikelToggle, einkaufsartikelLoeschen, einkaufslisteGekauftLoeschen (bereits vorhanden)
- [x] Datenbankschema: einkaufsliste-Tabelle bereits vorhanden, keine Migration nötig

## Einkaufsliste Teilen
- [x] Teilen-Button im Einkaufsliste-Tab (navigator.share mit Fallback auf Zwischenablage)

## Datenschutzerklärung
- [x] Mitbewerber-Datenschutzerklärungen recherchieren (Otter.ai, Notion AI, Reflect, Mem.ai, Superhuman)
- [x] Relevante Klauseln filtern und DSGVO-konforme Datenschutzerklärung für kiich.de verfassen
- [x] Datenschutzerklärung als eigene Seite in die App einbauen (/datenschutz)

## Datenschutz & Impressum – Optimierung (April 2026)
- [x] Mistral als Auftragsverarbeiter in Datenschutzerklärung eintragen
- [x] Impressum professionell optimieren (analog Mitbewerber-Recherche)

## Rechtsdokumente – Erweiterung (April 2026)
- [ ] Nutzungsbedingungen (AGB) als neue Seite /nutzungsbedingungen erstellen
- [ ] Cookie-Hinweis-Komponente vorbereiten (deaktiviert, aktivierbar wenn Analytics kommt)
- [ ] Versionshistorie in Datenschutzerklärung einbauen
- [ ] Footer-Links um Nutzungsbedingungen erweitern

## MA Rechts-Checkliste (monatlich wiederkehrend)
- [x] Datenbankschema: rechts_aufgaben + rechts_pruefprotokoll Tabellen
- [x] Backend: Procedures für Aufgaben laden, abhaken, MA-Analyse starten
- [x] Frontend: /rechts-checkliste Seite mit MA-Integration
- [x] Monatliche Push-Erinnerung einrichten (via Fälligkeitsdatum in DB)

## Rechts-Checkliste Erweiterungen
- [x] Footer-Link zur Rechts-Checkliste
- [x] Push-Erinnerung wenn Aufgabe fällig wird (via bestehende Push-Infrastruktur + Fälligkeitsdatum)
- [x] Prüfprotokoll-Ansicht pro Aufgabe

## RITUALE-Tab (Momentaufnahme)
- [x] Datenbankschema: rituale_einstellungen Tabelle
- [x] Backend: Procedures für Rituale (laden, speichern, Wecker, morgenTextGenerieren, musikHochladen)
- [x] Bewegungspausen-Timer (45min Arbeit / 5min Pause) mit Push-Notification
- [x] Morgenerwachen-Wecker: Uhrzeit einstellen, MA-Sprachbegrüßung, Hintergrundmusik
- [x] Morgentext-Editor: eigenen Text für MA-Begrüßung hinterlegen
- [x] Musik-Upload oder URL für Morgenritual-Hintergrundmusik
- [x] RITUALE als neuer Tab in Momentaufnahme einbinden (4 Tabs: Erledigungen / Erinnerungen / Einkauf / Rituale)

## Rituale-Erweiterungen (14. April 2026)
- [x] DB: ritual_logs Tabelle (userId, typ, datum, notiz, streak)
- [x] DB: dankbarkeit Tabelle (userId, datum, eintrag1, eintrag2, eintrag3, stimmung)
- [x] DB: Migration pushen
- [x] Backend: Dankbarkeits-Procedures (speichern, laden, Streak berechnen)
- [x] Backend: Abend-Ritual-Procedures (Atemübung starten, Tagesreflexion)
- [x] Backend: Streak-Statistik (Morgenritual, Pausen, Dankbarkeit)
- [x] Service-Worker: Wecker-Auslösung (Musik + MA-Morgentext zur eingestellten Uhrzeit)
- [x] RitualeTab: Abend-Ritual-Bereich (Dankbarkeit 3 Felder + Atemübung 4-7-8)
- [x] RitualeTab: Streak-Anzeige (Flammen-Symbol, Tages-Übersicht)

## Stabilitäts-Verbesserungen (14. April 2026)
- [x] PushJob: Retry-Mechanismus bei ECONNRESET (exponentielles Backoff, max. 3 Versuche)
- [x] PushJob: DB-Reconnect bei Verbindungsabbruch
- [x] Workbox-Offline-Service-Worker (Cache-First für Assets, Network-First für API, kein Auto-Reload)

## Testimonials
- [x] Barbara Mohr-Modes (USA/Deutschland) – Podcast-Feedback in "Stimmen aus dem Feld" eingefügt

## Bugfix: Spracheingabe Einkaufsliste
- [x] Spracheingabe im Einkaufsliste-Tab: dedizierter Mikrofon-Button + einkaufsartikelPerSprache-Procedure (LLM extrahiert Artikel + Mengen, mehrere Artikel gleichzeitig möglich)

## Build-Fix
- [x] Workbox maximumFileSizeToCacheInBytes erhöht (5 MiB), globPatterns auf Nicht-JS-Assets beschränkt
- [x] Spracheingabe Einkaufsliste Bug – LLM-Prompt korrigieren

## Executive Summary – Referenzen
- [x] Echobell-Website recherchieren
- [x] Referenzen-Abschnitt mit ALADIN, Echobell und AUMEGA-CD einbauen (Thomas Cavar, TCenergydesign)

## Namenskorrektur
- [x] "Thomas Cavar" → "Thomas Chochola" in Executive Summary (MD + PDF) korrigiert (Impressum war bereits korrekt)

## Startseite – Gründer & Partner-Download
- [x] Executive Summary als PDF-Download im Footer (Für Partner & Investoren)
- [x] "Über den Gründer"-Block auf Startseite (ALADIN, Echobell, AUMEGA)
- [x] Dieter Broers Testimonial-Platzhalter in "Stimmen aus dem Feld" (amber-Farbe, "Anfrage ausstehend"-Badge)

## Korrektur Stimmen aus dem Feld
- [x] Dieter Broers Platzhalter entfernt – Stimmen aus dem Feld ist für User-Testimonials reserviert

## Executive Summary PDF-Viewer
- [x] PDF direkt im Browser ansehbar machen (Modal mit eingebettetem PDF-Viewer + Download-Button)

- [x] ALADIN-Link (www.livingdesigns.de) im Gründer-Block ergänzt

## Taminos Korrekturen – Impressum & Datenschutz
### Impressum
- [x] Scroll-Richtung fix: Seite soll von oben nach unten scrollen (beginnt momentan von unten)
- [x] Nur deutsches Recht – Österreich und Schweiz-Hinweise entfernen
- [x] Abschnitt 9 Datenschutzanfragen: 30-Tage-Frist-Satz entfernen
### Datenschutz
- [x] Nur deutsches Recht – Österreich und Schweiz-Hinweise entfernen
- [x] Abschnitt 1 Verantwortlicher: Satz "Da der Verantwortliche..." komplett gestrichen
- [x] Abschnitt 12 Ihre Rechte: 30-Tage-Satz entfernt
- [x] Abschnitt 13: "nationalen" Datenschutz-Aufsichtsbehörde – AT/CH-Blöcke entfernt
- [x] Abschnitt 14 (Änderungen) komplett gestrichen

## Weitere Korrekturen (14. April 2026)
- [x] Datenschutz: Cookie-Abschnitt (Session-Cookies) ergänzt
- [x] Executive Summary aus Startseite entfernt

## KIICH-Statement Hero-Bereich
- [x] Bisherigen Subtitle-Satz unter Logo entfernen
- [x] Neues KIICH-Statement einbauen: erster Satz prominent (weiß, groß), Rest hinter "Mehr lesen →"-Button

## FAQ-Seite
- [x] FAQ-Seite /faq erstellen mit Abschnitten: Was ist KIICH?, Was ist eine PWA?, App installieren (iOS/Android), Datenschutz, Kontakt
- [x] "App installieren"-Button mit PWA beforeinstallprompt-Event
- [x] FAQ-Button auf Startseite einbauen (neben oder unter den Hero-Buttons)
- [x] Route /faq in App.tsx registrieren

## FAQ DSGVO-Konformität
- [x] Hinweistext angepasst: "Wichtige grundlegende Fragen werden hier veröffentlicht. Eine vollständige Anonymisierung vor Veröffentlichung wird durchgeführt."
- [x] Pflicht-Checkbox eingebaut: "Ich bin damit einverstanden, dass meine Frage anonymisiert und auf dieser Seite veröffentlicht werden kann."
- [x] Submit-Button deaktiviert solange Checkbox nicht angehakt

## Admin & Freischaltung
- [x] Admin-Bypass im Trainingscenter: Admin sieht nie Schlösser
- [x] Granulares Freischalt-System für einzelne Trainingskategorien (DB-gesteuert)
- [ ] Episode 03: Gewählte Umfeldaktivierungs-Einheit freischalten

## Admin & E-Mail Features
- [x] Admin-FAQ-Verwaltung Frontend (Fragen ansehen, beantworten, veröffentlichen)
- [x] Willkommens-E-Mail via Brevo nach Registrierung
- [x] Test-Mail an Thomas senden zur Textüberprüfung

## Episoden-Datenbank-Standardisierung
- [x] Episode 04 Audio-Problem dauerhaft lösen (Streaming-Proxy mit audio/mpeg)
- [x] Datenbankschema für Episoden anlegen (podcast_episodes Tabelle)
- [x] tRPC-Router für Episoden (CRUD, öffentlich lesbar, Admin-geschützt)
- [ ] Admin-UI zum Hinzufügen/Bearbeiten von Episoden (inkl. Audio-Upload)
- [x] Frontend auf DB-Daten umstellen (Episoden.tsx + Home.tsx)
- [x] Bestehende 4 Episoden in DB migrieren

## Einschlafbibliothek Qualitätssicherung (April 2026)
- [x] Bug-Fix: Satzzeichen-Bug in fuegeSprechpausenEin behoben
- [x] Bug-Fix: Text-Limit auf 12000 Zeichen erhöht
- [x] Bug-Fix: Gemini thinking budget_tokens auf 0 gesetzt
- [x] Längen-Constraint in alle 3 LLM-Prompts eingebaut (MÄRCHEN 450-550, ABENTEUER 550-650, BEFINDLICHKEIT 400-500 Wörter)
- [x] Wiederholungs-Check im Backend: automatischer zweiter LLM-Versuch bei erkannter Wiederholung
- [x] schlafMetapher-Prompt mit Wiederholungs-Verbot versehen
- [x] Unit-Tests für Wiederholungs-Check und Titel-Extraktion (10 Tests, alle grün)
- [ ] 12 Lichtklang-Archetyp-Geschichten erstellen und in App integrieren

## Vitalwerte & Coaching (2026-04-28)

- [x] DB-Schema: Tabelle `vitalEintraege` (Gesundheitsdaten DSGVO Art. 9)
- [x] DB-Schema: Tabelle `coachingEinwilligungen` (Opt-in mit IP-Logging)
- [x] DB-Migration: pnpm db:push durchgeführt
- [x] Server-Router `vital.ts`: saveEintrag, getMyEintraege, getEintragByDatum
- [x] Server-Router `vital.ts`: activateCoachingMode, revokeCoachingMode, getMyCoachingStatus
- [x] Server-Router `vital.ts`: getCoachingClients, getClientEintraege, getClientProfile (Admin)
- [x] resolveCoachId(-1) auf Owner-User via OWNER_OPEN_ID auflösen
- [x] VitalDashboard: DB-Speicherung statt localStorage
- [x] VitalDashboard: Opt-in Coaching-Modus mit DSGVO-Einwilligungs-Dialog
- [x] CoachingDashboard: Admin-Seite /admin/coaching fuer Thomas
- [x] CoachingDashboard: Client-Liste mit aktiven Einwilligungen
- [x] CoachingDashboard: Client-Detail mit Verlauf und Charts (Recharts)
- [x] AdminHub: Link zum Coaching Dashboard eingebunden
- [x] App.tsx: Route /admin/coaching registriert
- [x] Vitest: 7 Tests fuer vital Router (DSGVO-Text, Datum-Validierung)
