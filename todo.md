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
- [ ] **Implement Vertical Aura Contour (Navel-Anchored)**
    - [ ] **Navel Anchor:** The Fundamental Tone (Peak) is ALWAYS at the Navel (y=0 relative).
    - [ ] **Vertical Mapping:** Map the 12 tones from Navel upwards to Head and downwards to Feet.
    - [ ] **Width = Intensity:** The width of the aura at any vertical point corresponds to the % intensity of that tone.
    - [ ] **Symmetry:** Mirror left/right and up/down (Navel -> Head / Navel -> Feet).
- [ ] **Expert Mode Toggle:**
    - [ ] Hide Hz/Cent/Details by default.
    - [ ] Add a "Gear" icon button to toggle visibility.

## Logic & Analysis
- [x] Fix quint correction logic
- [x] Fix aggregation logic
- [x] Fix frequency display (dominant tone logic)
- [x] Refine Frequency Logic: Calculate true average of measured frequencies for the dominant tone
- [ ] Debug: Why F# displays 183.58Hz (F) and 0 cent? Ensure precise calculation.

## General
- [x] Fix audio playback
- [x] Verify color mappings
- [ ] Final user verification
