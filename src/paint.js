/* paint.js — materials: paper, watercolour, gold, ink, light. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp;

  /* ---------- paper ---------- */
  F.makePaper = function (o) {
    return F.sprite(W, H, function (g) {
      var R = F.rng(o.seed || 7), i, x, y, r, gr;
      g.fillStyle = o.base; g.fillRect(0, 0, W, H);
      // slow tonal mottling (aged, uneven sizing)
      for (i = 0; i < (o.mottN || 60); i++) {
        x = R() * W; y = R() * H; r = R.range(140, 520);
        gr = g.createRadialGradient(x, y, 0, x, y, r);
        var col = o.mott[i % o.mott.length], a = R.range(.02, .07) * (o.mottA || 1);
        gr.addColorStop(0, F.rgba(col, a)); gr.addColorStop(1, F.rgba(col, 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      // fibres
      g.lineCap = 'round';
      for (i = 0; i < (o.fibN || 2400); i++) {
        x = R() * W; y = R() * H; var L = R.range(o.fibL ? o.fibL[0] : 14, o.fibL ? o.fibL[1] : 70), a0 = R() * Math.PI * 2, bend = R.range(-.5, .5);
        g.beginPath(); g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(a0 + bend) * L * .5, y + Math.sin(a0 + bend) * L * .5, x + Math.cos(a0) * L, y + Math.sin(a0) * L);
        var light = R() < (o.fibLight === undefined ? .55 : o.fibLight);
        g.strokeStyle = light ? F.rgba(o.fib[0], R.range(.10, .34)) : F.rgba(o.fib[1], R.range(.04, .13));
        g.lineWidth = R.range(.5, 1.5); g.stroke();
      }
      // edge toning
      if (o.edge) {
        var e = o.edgeW || 200, ec = o.edge, ea = o.edgeA || .16;
        [[0, 0, e, 0], [W, 0, W - e, 0], [0, 0, 0, e], [0, H, 0, H - e]].forEach(function (q) {
          gr = g.createLinearGradient(q[0], q[1], q[2], q[3]); gr.addColorStop(0, F.rgba(ec, ea)); gr.addColorStop(1, F.rgba(ec, 0));
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
        });
      }
      // grain (in device pixels)
      var cw = g.canvas.width, ch = g.canvas.height, id = g.getImageData(0, 0, cw, ch), d = id.data, amp = o.grain === undefined ? 9 : o.grain, s = 1234567 + (o.seed || 0);
      for (i = 0; i < d.length; i += 4) {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        var n = (((s >>> 0) % 1000) / 1000 - .5) * amp;
        d[i] += n; d[i + 1] += n; d[i + 2] += n * .9;
      }
      g.putImageData(id, 0, 0);
    });
  };

  /* ---------- watercolour ---------- */
  function deform(pts, iters, mag, R) {
    var p = pts;
    for (var k = 0; k < iters; k++) {
      var q = [], n = p.length;
      for (var i = 0; i < n; i++) {
        var a = p[i], b = p[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        var gm = R.gauss() * mag * L, ang = R() * 6.2832;
        q.push(a, [(a[0] + b[0]) / 2 + Math.cos(ang) * gm, (a[1] + b[1]) / 2 + Math.sin(ang) * gm]);
      }
      p = q;
    }
    return p;
  }
  function fillPts(g, p) { g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); g.fill(); }
  F.fillPts = fillPts;
  /** layered translucent wash of a polygon. o:{R, layers, alpha, mag, edge} */
  F.wash = function (g, pts, color, o) {
    o = o || {}; var R = o.R || F.rng(o.seed || 3), layers = o.layers || 16, alpha = o.alpha || .06, mag = o.mag === undefined ? .16 : o.mag;
    var base = deform(pts, 1, mag, R), ga = g.globalAlpha;
    g.fillStyle = color;
    for (var l = 0; l < layers; l++) { g.globalAlpha = ga * alpha; fillPts(g, deform(base, 2, mag, R)); }
    if (o.edge) { // pigment pooling at the rim
      g.globalAlpha = ga * o.edge; g.strokeStyle = color; g.lineWidth = o.edgeW || 1.4; g.lineJoin = 'round';
      var p = deform(base, 2, mag * .5, R); g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); g.stroke();
    }
    g.globalAlpha = ga;
  };
  /** paper tooth showing through pigment */
  F.granulate = function (g, w, h, R, n, a) {
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (var i = 0; i < n; i++) { g.globalAlpha = R.range(.03, a || .14); var r = R.range(.5, 1.8); g.beginPath(); g.arc(R() * w, R() * h, r, 0, 6.3); g.fill(); }
    g.restore();
  };
  /** soft irregular blob polygon */
  F.blob = function (cx, cy, rx, ry, R, n, jit) {
    var p = []; n = n || 14; jit = jit === undefined ? .18 : jit;
    for (var i = 0; i < n; i++) { var a = i / n * 6.2832, k = 1 + R.range(-jit, jit); p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return p;
  };

  /* ---------- gold ---------- */
  /** metallic gradient across the frame; dark=true for use on parchment, false on night ground */
  F.gold = function (ctx, onLight, t) {
    var sh = ((t || 0) * .035) % 1, g = ctx.createLinearGradient(-300 + sh * 300, 0, 1080 + sh * 300, 1920);
    var s = onLight ? ['#8C7443', '#B79B63', '#C9AF7C', '#9A8150', '#BFA36C', '#86703F', '#B2965F'] : ['#B79B63', '#E6D3A6', '#F3E6C4', '#C9AF7C', '#EBDDB6', '#A98E5C', '#DCC79A'];
    for (var i = 0; i < s.length; i++) g.addColorStop(i / (s.length - 1), s[i]);
    return g;
  };
  /** radial glow sprite */
  F.glowSprite = function (r, col, a0, pow) {
    return F.sprite(r * 2, r * 2, function (g) {
      var gr = g.createRadialGradient(r, r, 0, r, r, r), n = 10;
      for (var i = 0; i <= n; i++) { var u = i / n; gr.addColorStop(u, F.rgba(col, a0 * Math.pow(1 - u, pow || 2))); }
      g.fillStyle = gr; g.fillRect(0, 0, 2 * r, 2 * r);
    }, Math.min(1, F.Q));
  };

  /** ornamental rule: hairlines growing from a central lozenge */
  F.rule = function (ctx, x, y, w, pr, color, lw) {
    if (pr <= 0) return;
    var h = w / 2 * pr, ga = ctx.globalAlpha;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 1.4;
    ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x - 14 - h, y); ctx.moveTo(x + 14, y); ctx.lineTo(x + 14 + h, y); ctx.stroke();
    ctx.globalAlpha = ga * clamp(pr * 3);
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = ga;
  };

  /* ---------- shared scratch canvas for masked reveals ---------- */
  var scratch = null;
  F.scratch = function () {
    if (!scratch || scratch.q !== F.Q) { scratch = F.sprite(W, H); scratch.q = F.Q; }
    var g = scratch.g; g.setTransform(F.Q, 0, 0, F.Q, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, H); return scratch;
  };
  /** soft-edged disc used as an ink-spread / light mask */
  F.softDisc = function (g, x, y, r, soft, col) {
    var gr = g.createRadialGradient(x, y, Math.max(0, r * (1 - soft)), x, y, Math.max(1, r));
    gr.addColorStop(0, F.rgba(col || '#000000', 1)); gr.addColorStop(1, F.rgba(col || '#000000', 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, Math.max(1, r), 0, 6.2832); g.fill();
  };
})(typeof window !== 'undefined' ? window : globalThis);
