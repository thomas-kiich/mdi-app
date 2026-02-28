# MDI App Improvements & Fixes

- [x] **Fix Recording Bug**: Ensure microphone stops correctly after each step and restarts cleanly for the next question.
- [x] **Implement Tone Aggregation**: Create logic to combine frequency distributions from all 3 recordings.
- [x] **Refine Tone Detection**: Prioritize fundamental frequency over overtones (fix A vs F issue).
- [x] **Implement Frequency Chart**: Add a visual chart in the result view showing the distribution of all detected tones across the 3 steps.
- [x] **Improve Playback Quality**: Change oscillator type (e.g., triangle/sawtooth) or add harmonics to make the played tone sound more natural and match the user's perception better.
- [x] **Show Exact Hz**: Display the exact Hz value being played to the user for verification.
- [x] **Add Octave Toggle**: Allow user to shift playback up/down an octave to find the perceptual match.
- [x] **Add Expert Mode**: 
    - [x] Pure Sine Wave Toggle (for tuner calibration)
    - [x] Manual Frequency Slider (fine-tune +/- 50 cents)
    - [x] 432 Hz / 440 Hz Global Switch
- [x] **Fix Tone Mapping Logic**: Correct the `getToneFromFrequency` function to handle all octaves correctly.
- [x] **Implement Custom Frequency Bands**: Use user's CSV data for tone definitions.
- [ ] **Fix Octave Normalization**: 
    - [ ] **CRITICAL**: Ensure frequencies below the custom range (e.g., 77Hz) are correctly doubled until they fit into the table (103-212Hz).
    - [ ] Verify that 77.10Hz maps to D (154.2Hz) and not A.
- [ ] **Verify Chart Data**: Check `FrequencyChart.tsx` to confirm exactly what the three bars represent (Likely dominant tone of Q1, Q2, Q3).
- [ ] **Integrate User's Philosophy**: Add the "KIICH Philosophy" chapter using the user's provided material (on hold).
