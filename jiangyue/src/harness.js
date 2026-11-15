/* harness.js — headless hooks used by tools/still.mjs and tools/render.mjs (not used by viewers). */
(function (G) {
  'use strict';
  var F = G.F, cv = null, ctx = null;
  G.HARNESS = {
    init: function (q) {
      cv = document.createElement('canvas'); cv.width = Math.round(1080 * q); cv.height = Math.round(1920 * q);
      ctx = cv.getContext('2d');
      return F.init(q);
    },
    /** contact sheet of frames at the given times */
    sheet: function (ts, cols, scale, crop) {
      var cw = crop ? crop[2] : 1080, ch = crop ? crop[3] : 1920, cx = crop ? crop[0] : 0, cy = crop ? crop[1] : 0, q = F.Q;
      var w = Math.round(cw * scale), h = Math.round(ch * scale), rows = Math.ceil(ts.length / cols), g = 6;
      var out = document.createElement('canvas'); out.width = cols * (w + g) + g; out.height = rows * (h + g + 18) + g;
      var o = out.getContext('2d'); o.fillStyle = '#222'; o.fillRect(0, 0, out.width, out.height); o.imageSmoothingQuality = 'high';
      var ms = [];
      for (var i = 0; i < ts.length; i++) {
        var t0 = performance.now(); F.render(ctx, ts[i]); ms.push(performance.now() - t0);
        var x = g + (i % cols) * (w + g), y = g + Math.floor(i / cols) * (h + g + 18);
        o.drawImage(cv, cx * q, cy * q, cw * q, ch * q, x, y, w, h);
        o.fillStyle = '#ddd'; o.font = '13px sans-serif'; o.fillText(ts[i].toFixed(2) + 's', x + 2, y + h + 14);
      }
      return { png: out.toDataURL('image/png'), ms: ms };
    },
    /** one frame as JPEG bytes (base64) for the encoder */
    frame: function (t, quality) { F.render(ctx, t); return cv.toDataURL('image/jpeg', quality || .96).split(',')[1]; }
  };
})(window);
