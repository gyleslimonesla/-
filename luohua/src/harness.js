/* harness.js — headless hooks for stills and frame export. */
(function (G) {
  var L = G.L, F = G.FILM, cv, ctx;
  G.HARNESS = {
    init: async function (q) {
      L.k = q || 1; cv = document.getElementById('cv'); cv.width = Math.round(L.W * L.k); cv.height = Math.round(L.H * L.k); ctx = cv.getContext('2d');
      await Promise.all(['700', '900'].map(function (w) { return document.fonts.load(w + ' 60px "Noto Serif SC"', '落花雨' + (G.TIMING.LYRICS.map(function (c) { return c[2]; }).join(''))); }));
      F.init(); return true;
    },
    sheet: function (ts, cols, scale, crop) {
      var w = cv.width * scale, h = cv.height * scale, rows = Math.ceil(ts.length / cols);
      var sh = document.createElement('canvas'); sh.width = cols * w; sh.height = rows * h; var g = sh.getContext('2d'), ms = [];
      ts.forEach(function (t, i) {
        var a = performance.now(); F.render(ctx, t); ms.push(performance.now() - a);
        g.drawImage(cv, (i % cols) * w, Math.floor(i / cols) * h, w, h);
        g.fillStyle = '#ff0'; g.font = '14px sans-serif'; g.fillText(t.toFixed(2), (i % cols) * w + 4, Math.floor(i / cols) * h + 16);
      });
      return { png: sh.toDataURL('image/png'), ms: ms };
    },
    frame: function (t, q) { F.render(ctx, t); return cv.toDataURL('image/jpeg', q || .95).split(',')[1]; }
  };
})(window);
