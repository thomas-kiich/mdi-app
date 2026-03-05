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
- [ ] **Snapshot Export**:
  - [ ] Add a "Camera" button to the UI.
  - [ ] Implement canvas-to-blob conversion and download as PNG.
  - [ ] Ensure the filename includes a timestamp (e.g., `MDI-Spektrum-2026-03-04.png`).
- [ ] **Interactive Frequency Analysis**:
  - [ ] Add click handler to the canvas.
  - [ ] On click, find the nearest frequency bin and display its Hz value and musical note (e.g., "440Hz - A4").
  - [ ] Show a tooltip or overlay with this information.
- [ ] **3D Tunnel Mode**:
  - [ ] Create a new visualization mode toggle (2D / 3D).
  - [ ] Implement a perspective projection where new frequency lines appear at the center/far distance and move towards the viewer (or vice versa).
  - [ ] Use the same color/frequency logic but map Y-axis to radial distance or tunnel walls.

- [ ] **Harmonic Resonance Audio Synthesis**:
  - [ ] Implement a Web Audio API synthesizer function.
  - [ ] Create a "Warm Drone" sound using multiple oscillators (Fundamental + Octave + Fifth).
  - [ ] Apply a Low-Pass Filter to soften the sound.
  - [ ] Implement an Envelope (ADSR) with slow Attack (2s) and long Release (8s) for a total of ~12s.
  - [ ] Add a "Play Tone" button to the interactive tooltip in the Spectral Scanner.

- [ ] **Fix Tone-Color Mapping and Navigation**:
  - [ ] Verify `tones.ts` against user requirements (E=Blauviolett, C=Grün, etc.).
  - [ ] Ensure `SpectralScanner.tsx` uses the correct color from `tones.ts`.
  - [ ] Add a "Zur Animation" (To Animation) button in `SpectralScanner.tsx` that navigates to `/animation`.

- [ ] **Method 36 Training Module**:
  - [ ] Create `Method36Trainer.tsx` component.
  - [ ] Implement 36 BPM timer logic (1 beat = 1.666s).
  - [ ] Create visual circle animation (Grow 1 beat, Hold 1 beat, Shrink 3 beats, Hold 1 beat).
  - [ ] Implement audio synthesis for the specific fundamental tone during the "Shrink" phase (3 beats).
  - [ ] Add a subtle "heartbeat" sound on every beat.
  - [ ] Integrate "Start Training" button in `SpectralScanner.tsx` that passes the detected frequency to the trainer.

- [ ] **Link Analysis Result to Live Scanner**:
  - [ ] Locate the Analysis Result component/page.
  - [ ] Add a "Weiter zum Live-Scanner & Training" button.
  - [ ] Ensure the button opens the `SpectralScanner` component.

- [ ] **Fix Audio Context and Scanner Visualization Errors**:
  - [ ] Debug and fix AudioContext initialization issues (3 red errors).
  - [ ] Hard-code black background and colored lines for scanner visualization to prevent inversion.
  - [ ] Ensure "Method 36" button visibility even on minor errors.
  - [ ] Verify `SpectralScanner.tsx` logic for error handling and cleanup.

- [ ] **Refine Method 36 Trainer**:
  - [ ] Extend tone duration to full 3 beats (approx. 5 seconds) in `Method36Trainer.tsx`.
  - [ ] Update text from "TÖNEN" to "MANTRA YOHN TÖNEN".
  - [ ] Verify and fix pitch calculation/display logic in `SpectralScanner.tsx` to ensure correct note names.

- [ ] **Refine Method 36 Trainer (A=432Hz)**:
  - [ ] Recalculate all frequencies in `tones.ts` based on A4 = 432 Hz.
  - [ ] Update `getToneFromFrequency` logic to use 432 Hz reference.
  - [ ] Ensure displayed note names match the new frequency map.

- [ ] **Fix Data Transfer from Analysis to Trainer**:
  - [ ] Update `Home.tsx` to pass the analyzed frequency to `SpectralScanner`.
  - [ ] Modify `SpectralScanner.tsx` to accept an `initialFrequency` or `forcedFrequency` prop.
  - [ ] Ensure `Method36Trainer` uses this forced frequency if available, instead of live detection.
- [ ] **Fix Frequency Deviation Logic in Analysis**: Ensure the calculated frequency matches the identified tone (e.g., F) and that deviation (cents) is capped or corrected so it doesn't shift the tone to another note (like A).
- [ ] **Refine Method 36 Trainer (Sync, Duration, Gong)**:
  - [ ] **Progress Ring**: Ensure the ring starts at 12 o'clock and completes a full circle in exactly 10 seconds (6 beats) without jumping.
  - [ ] **Tone Duration**: Extend the mantra tone to last the full 3 beats (approx. 5 seconds) with a smooth release.
  - [ ] **Gong Signals**: Replace heartbeat with a synthetic gong sound to mark the "Inhale" and "Hold" phase transitions.
