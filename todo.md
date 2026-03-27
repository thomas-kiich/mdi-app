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
