# MDI App Improvements & Fixes

- [ ] **Fix Recording Bug**: Ensure microphone stops correctly after each step and restarts cleanly for the next question.
- [ ] **Implement Tone Aggregation**: Create logic to combine frequency distributions from all 3 recordings (Present, Past, Future) instead of overwriting results.
- [ ] **Stabilize Fundamental Tone Detection**: Use a weighted average or "most frequent across all sessions" approach to reduce variance (E, G, F, Dis issue).
- [ ] **UI Feedback**: Add clear visual indicators when recording starts/stops to prevent user confusion.
- [ ] **Reset State**: Ensure all internal states (analyzer, buffers) are fully reset between wizard steps.
