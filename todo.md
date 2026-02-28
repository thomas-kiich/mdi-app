# MDI App Improvements & Fixes

- [x] **Fix Recording Bug**: Ensure microphone stops correctly after each step and restarts cleanly for the next question.
- [x] **Implement Tone Aggregation**: Create logic to combine frequency distributions from all 3 recordings.
- [ ] **Fix Playback Bug**: Ensure the "Play Tone" button plays the *exact* frequency (Hz) detected, not a default note or wrong octave.
- [ ] **Tune Algorithm (Fundamental vs. Overtone)**: Adjust detection to prioritize the lowest strong frequency (fundamental) to avoid jumping to the major third (e.g., detecting A instead of F).
- [ ] **Harmonic Filtering**: Implement a check that if a strong tone (e.g., A) is detected, check if a lower harmonically related tone (e.g., F) is present, even if quieter.
- [ ] **Visual Feedback**: Show the detected Hz value during playback to confirm match.
