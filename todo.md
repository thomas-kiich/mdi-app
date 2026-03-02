# MDI App Development Tasks

## Phase 12: Implement Sound Body Visualization & Finalize Frequency Display

- [ ] **Frequency Display Logic Fix (Home.tsx):**
    - Ensure the displayed frequency (`fundamentalFreq`) corresponds to the *measured* frequency of the dominant tone if available.
    - If the dominant tone was not the fundamental in any session (but won by accumulation), fallback to `ToneFreq * 2^(cents/1200)` using the *weighted average cents* deviation of that tone across sessions (if available) OR just use the ideal tone frequency.
    - *Crucial:* Do NOT show the frequency of the last session's fundamental (e.g. G#) if the result is F#. This is the main bug to fix.
    - Implementation detail: Calculate weighted average cents for the dominant tone from the `stepDistributions` if possible, or simpler: just use the ideal frequency of the dominant tone if no direct measurement exists. The user prefers "stimmig" (consistent) data over "raw but contradictory" data.

- [ ] **Sound Body Visualization (SoundBody.tsx):**
    - Create a new component `SoundBody` that takes `toneDistribution` and `dominantTone` as props.
    - **Visual Metaphor:** A human silhouette (standing, arms by side).
    - **Mapping:**
        - **Center (Navel):** The location of the Dominant Tone (Fundamental).
        - **Upward (Navel to Head):** The frequency spectrum mapped vertically.
        - **Downward (Navel to Feet):** The mirrored spectrum.
    - **Implementation:**
        - Use an SVG for the silhouette.
        - Overlay a vertical gradient or "aura" visualization inside/around the silhouette.
        - The "Wave" from `SpectralMatrix` should be rotated 90 degrees and applied along the vertical axis of the body.
        - Colors should match the user's specific palette (E-BlueViolet to F-Magenta).
    - **Placement:** Add this component below the `SpectralMatrix` in `Home.tsx`.

- [ ] **Inverse Matrix (Optional/Next Step):**
    - The user mentioned an "Inverse" view. We can incorporate this into the Sound Body or keep it as a separate view later. For now, focus on the "Sound Body" as the primary new visualization.
    - *Note:* The user said "wir füllen einfach den fehlbereich des therethischen diagrammrechtecks mit der zugehörigen farbwelle auf... im nächsten veranschaulichungsschritt drehen wir diese darstellung um 90 Grad...". So the Sound Body *is* the next step of the "Inverse/Filled" idea.

- [ ] **Cleanup:**
    - Move technical details (Hz, Cents) to a "Details" toggle to declutter the main view as requested ("maximale anschaulichkeit").
