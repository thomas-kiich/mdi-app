# MDI App Improvements & Fixes

- [x] **Fix Recording Bug**: Ensure microphone stops correctly after each step and restarts cleanly for the next question.
- [x] **Implement Tone Aggregation**: Create logic to combine frequency distributions from all 3 recordings.
- [x] **Refine Tone Detection**: Prioritize fundamental frequency over overtones (fix A vs F issue).
- [x] **Implement Frequency Chart**: Add a visual chart in the result view showing the distribution of all detected tones across the 3 steps.
- [x] **Improve Playback Quality**: Change oscillator type (e.g., triangle/sawtooth) or add harmonics to make the played tone sound more natural and match the user's perception better.
- [x] **Show Exact Hz**: Display the exact Hz value being played to the user for verification.
- [x] **Add Octave Toggle**: Allow user to shift playback up/down an octave to find the perceptual match.
- [ ] **Add Expert Mode**: 
    - [ ] Pure Sine Wave Toggle (for tuner calibration)
    - [ ] Manual Frequency Slider (fine-tune +/- 50 cents)
    - [ ] 432 Hz / 440 Hz Global Switch
- [ ] **Draft KIICH Philosophy**: Write the missing chapter based on the "Machine vs. Human" rhythm concept.
