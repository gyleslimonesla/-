/* timing.js — every cut and pulse in the film comes from these numbers, measured from the song (librosa beat/onset tracking). */
(function (G) {
  var T = G.TIMING = {};
  T.DUR = 25.36;
  // beat track, ~73 BPM (one beat ≈ 0.82 s); bars of four
  T.BEATS = [0.07, 1.0, 1.83, 2.62, 3.34, 4.3, 5.13, 5.92, 6.73, 7.55, 8.38, 9.2, 10.03, 10.82, 11.68, 12.47, 13.31, 14.12,
    14.93, 15.74, 16.58, 17.44, 18.25, 19.09, 19.92, 20.71, 21.52, 22.36, 23.13, 23.87, 24.61];
  T.BARS = [0.07, 3.34, 6.73, 10.03, 13.31, 16.58, 19.92, 23.13];
  // strongest percussive accents (onset strength peaks)
  T.HITS = [0.46, 3.02, 5.11, 5.80, 12.47, 12.91, 14.93, 15.72, 17.44, 19.09, 22.34, 23.10, 24.85];
  /* lyrics: [start, end, text, accent-char indices]. Characters are revealed evenly across [start,end].
     Left empty on purpose — the words were not transcribed (see README). Fill in and re-render. */
  T.LYRICS = [];
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
