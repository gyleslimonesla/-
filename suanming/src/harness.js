/* harness.js — headless hooks: init(q), sheet(ts, cols, scale), frame(t). */
(function (G) {
  var L = G.L, F = G.FILM, S = G.SCRIPT, cv, ctx;
  G.HARNESS = {
    init: async function (q) {
      L.k = q || 1; cv = document.getElementById('cv'); cv.width = Math.round(L.W * L.k); cv.height = Math.round(L.H * L.k); ctx = cv.getContext('2d');
      var txt = S.TITLE + S.SUB + S.CAPS.map(function (c) { return c[2] + (c[4] || ''); }).join('') + S.HEADERS.map(function (h) { return h[2] + h[3]; }).join('') + (G.EXTRA_TEXT || '') + '这是哥本哈根诠释的说法；多世界诠释里没有“坍塌”*' + '0123456789%=+…|ψ⟩²×?？！';
      await Promise.all(['900 60px "Noto Sans SC"', '500 60px "Noto Sans SC"', '400 60px "ZCOOL QingKe HuangYou"', '400 60px "ZCOOL KuaiLe"'].map(function (f) { return document.fonts.load(f, txt); }));
      F.init(); return true;
    },
    sheet: function (ts, cols, scale) {
      var w = cv.width * scale, h = cv.height * scale, rows = Math.ceil(ts.length / cols);
      var sh = document.createElement('canvas'); sh.width = cols * w; sh.height = rows * h; var g = sh.getContext('2d'), ms = [];
      ts.forEach(function (t, i) {
        var a = performance.now(); F.render(ctx, t); ms.push(performance.now() - a);
        g.drawImage(cv, (i % cols) * w, Math.floor(i / cols) * h, w, h);
        g.fillStyle = '#ff0'; g.font = '16px sans-serif'; g.fillText(t.toFixed(2), (i % cols) * w + 4, Math.floor(i / cols) * h + 18);
      });
      return { png: sh.toDataURL('image/png'), ms: ms };
    },
    frame: function (t, q) { F.render(ctx, t); return cv.toDataURL('image/jpeg', q || .93).split(',')[1]; }
  };
})(window);
