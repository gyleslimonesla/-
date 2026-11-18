/* harness.js — headless hooks for tools/shot.mjs */
(function (G) {
  'use strict';
  var F = G.F, cv, ctx;
  G.HARNESS = {
    init: function (q) {
      F.Q = q; cv = document.createElement('canvas'); cv.width = Math.round(F.W * q); cv.height = Math.round(F.H * q); ctx = cv.getContext('2d');
      return F.loadFonts().catch(function () { }).then(function () { var t0 = performance.now(); for (var k in F.plates) if (F.plates[k].build) { var a = performance.now(); F.plates[k].build(); console.log('build', k, Math.round(performance.now() - a)); } if (F.buildCommon) F.buildCommon(); return performance.now() - t0; });
    },
    sheet: function (items, cols, scale) {
      var q = F.Q, w = Math.round(F.W * scale), h = Math.round(F.H * scale), rows = Math.ceil(items.length / cols), g = 6;
      var out = document.createElement('canvas'); out.width = cols * (w + g) + g; out.height = rows * (h + g) + g; var o = out.getContext('2d'); o.fillStyle = '#222'; o.fillRect(0, 0, out.width, out.height); o.imageSmoothingQuality = 'high';
      items.forEach(function (it, i) {
        ctx.setTransform(q, 0, 0, q, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, F.W, F.H);
        F.plates[it.p].draw(ctx, it.t || 0, it.s || {}, { x: it.px || 0, y: it.py || 0 });
        if (F.finish) F.finish(ctx);
        o.drawImage(cv, g + (i % cols) * (w + g), g + Math.floor(i / cols) * (h + g), w, h);
      });
      return out.toDataURL('image/png');
    }
  };
})(window);
