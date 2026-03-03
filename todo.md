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

## Logic & Analysis
- [x] Fix quint correction logic
- [x] Fix aggregation logic
- [x] Fix frequency display (dominant tone logic)
- [x] Refine Frequency Logic: Calculate true average of measured frequencies for the dominant tone
- [ ] Debug: Why F# displays 183.58Hz (F) and 0 cent? Ensure precise calculation.

## Interactive Story (Connection Principle) - NEW
- [ ] Implement `ConnectionStory.tsx` with the new "Pointillism" narrative:
  - [ ] **Scene 1: The Source (White Noise)**: Create a canvas/SVG with thousands of white dots on a black background, representing the "Seinsfeld" (field of being) where all possibilities exist.
  - [ ] **Scene 2: The Formation**: Animate the white dots converging in the center to form a rounded rectangular shape (representing the human configuration).
  - [ ] **Scene 3: The Split (Polarity)**: 
    - [ ] Create a vertical wave split in the middle of the rectangle.
    - [ ] Animate the left half drifting to top-left and turning **Blue** (representing one pole).
    - [ ] Animate the right half drifting to bottom-right and turning **Red** (representing the other pole).
  - [ ] **Scene 4: The Longing (Connection)**: Render vibrating wave lines connecting the two separated halves, symbolizing the physical/emotional connection and longing.
  - [ ] **Scene 5: The Union (Fusion)**: Animate the two halves being drawn back together to the center, merging into a single shape that glows **Magenta** (the synthesis of Red and Blue).
  - [ ] **Interaction**: Ensure the animation is smooth, aesthetically pleasing (minimalist/pointillist style), and can be replayed or closed via the "Das Prinzip entdecken" button.
- [ ] Update `Home.tsx` to ensure the "Das Prinzip entdecken" button triggers this new `ConnectionStory` component correctly.
- [ ] (Optional) Add a subtle sound effect or voice-over placeholder if requested later (currently just visual).

## General
- [x] Fix audio playback
- [x] Verify color mappings
- [ ] Final user verification
