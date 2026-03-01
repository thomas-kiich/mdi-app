# MDI App Debugging Tasks

## Priority: Fix Aggregation & Correction Logic
- [ ] **Analyze `Home.tsx`**: Check how `results.q1`, `results.q2`, `results.q3` are stored. Are they overwritten by the final result calculation?
- [ ] **Debug `calculateFinalResult`**: Ensure it doesn't modify the individual step results.
- [ ] **Inspect `useAudioAnalyzer.ts`**: Verify if the `result` state is being updated with corrected values that persist across steps.
- [ ] **Disable Aggressive Correction**: Ensure that if a frequency clearly falls into a specific band (e.g., 103.75 Hz -> G#), it is NOT forced to another tone (e.g., F) just because F was dominant in another step.
- [ ] **Verify Detail Table**: The table must show the exact tone corresponding to the frequency measured in that specific step.

## Verification
- [ ] Input 103.75 Hz -> Output G# (not F +246 cents).
- [ ] Input 93.63 Hz -> Output F# (or F depending on exact boundary).
- [ ] Input 113.19 Hz -> Output A (not F# +313 cents).
