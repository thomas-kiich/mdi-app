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
- [x] Implement 7-day longitudinal study logic
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
- [ ] **Finalize**:
  - [ ] **Revert Red Alert**: Set background back to Deep Black (#000000).
  - [ ] **Remove Test Label**: Clean up UI.

## General
- [x] Fix audio playback
- [x] Verify color mappings
- [ ] Final user verification
