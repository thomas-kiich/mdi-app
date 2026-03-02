# MDI App Development Tasks

## Phase 9: Implement Rainbow Gradient (E-Violet to F-Red)
- [ ] Update `tones.ts` to implement the natural rainbow gradient (Descending Chromatic Scale E -> F):
    - E = Violet (Start / Shortest Wavelength)
    - Dis = Indigo
    - D = Blue
    - Cis = Blue-Green (Turquoise)
    - C = Green (Center)
    - H = Yellow-Green
    - Ais = Yellow
    - A = Yellow-Orange
    - Gis = Orange
    - G = Red-Orange
    - Fis = Red
    - F = Deep Red (End / Longest Wavelength)
- [ ] Update `SpectralMatrix.tsx` to sort the X-axis explicitly in this order: [E, Dis, D, Cis, C, H, Ais, A, Gis, G, Fis, F].
- [ ] Ensure the background gradient visualizes this full spectrum smoothly.
- [ ] Verify that C is exactly Green.
