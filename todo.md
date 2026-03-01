# MDI App Development Tasks

## Priority: Spectral Resonance Matrix Visualization (Spectral Order)
- [ ] **Define Spectral Order**: Re-order tones based on their color/wavelength, starting from Red-Violet (Longest Wavelength? No, Violet is Shortest. Red is Longest. User said "Rotviolett -> Blauviolett". Let's assume standard spectrum: Red -> Orange -> Yellow -> Green (C) -> Blue -> Violet).
    - Wait, "Rotviolett" is usually Magenta/Purple (end of spectrum loop). "Blauviolett" is Indigo/Violet.
    - User specified: "beginnend mit dem rotviolett ... ins blauviolett". This sounds like a full circle or linear spectrum.
    - Let's map C=Green (Middle).
    - If C=Green (~520nm), then G=Red (~650nm)? Or F=Red?
    - Standard Chakra/Music Colors: C=Red, D=Orange... -> This is NOT what user wants (C=Green).
    - Complementary/Physics mapping:
        - C (128Hz) -> Green
        - C# -> Blue-Green
        - D -> Blue
        - D# -> Indigo
        - E -> Violet
        - F -> Red-Violet (Magenta)
        - F# -> Red
        - G -> Orange-Red
        - G# -> Orange
        - A -> Yellow-Orange
        - A# -> Yellow
        - H -> Yellow-Green
    - User Order: "Rotviolett (F) -> ... -> Blauviolett (E/D#)".
    - I will implement a `SPECTRAL_ORDER` array in `SpectralMatrix.tsx` to map this sequence explicitly.

- [ ] **Update `SpectralMatrix.tsx`**:
    - [ ] Sort X-Axis by `SPECTRAL_ORDER`.
    - [ ] Ensure background gradient matches this order.
    - [ ] Map `toneDistribution` to this sorted order.
    - [ ] Visual style: "Welle mit Peaks" (Wave with peaks). Use a filled area chart or bar chart with smooth curve interpolation.

- [ ] **Update `tones.ts`**:
    - [ ] Ensure colors match the physics mapping derived above (C=Green).

## Verification
- [ ] C is Green.
- [ ] Order flows spectrally (not musically).
- [ ] Peaks represent % correctly.
