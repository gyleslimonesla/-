/* film.js — scene timeline, transitions, captions, section chips, light dust, finishing. */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, S = G.SCRIPT;
  var F = G.FILM = { scenes: {}, DUR: S.DUR };
  F.scene = function (o) { F.scenes[o.id] = o; };
  F.beat = function (t, dec) { var b = Math.floor(t / S.BEAT) * S.BEAT; return Math.exp(-(t - b) / (dec || .16)); };
  F.down = function (t, dec) { var b = Math.floor(t / S.BAR) * S.BAR; return Math.exp(-(t - b) / (dec || .25)); };
  F.since = function (t, list) { var b = -1e9; list.forEach(function (x) { if (x <= t) b = x; }); return t - b; };
  F.hit = function (t, list, dec) { var d = F.since(t, list); return d > 1e8 ? 0 : Math.exp(-d / (dec || .2)); };

  var ORDER = S.SCENES.map(function (s) { return s[0]; });
  function bounds(id) { for (var i = 0; i < S.SCENES.length; i++) if (S.SCENES[i][0] === id) return S.SCENES[i]; }

  F.init = function () {
    L.buildGrain();
    ORDER.forEach(function (id) { var s = F.scenes[id], b = bounds(id); s.t0 = b[1]; s.t1 = b[2]; if (s.build) s.build(); });
    var r = L.rng(3); F.dust = [];
    for (var i = 0; i < 70; i++) F.dust.push({ x: r() * L.W, y: r() * L.H, v: r.range(14, 50), s: r.range(4, 12), c: L.rain(r()), ph: r() * 6.28, f: r.range(.6, 2) });
  };

  function drawScene(g, s, t) {
    g.save();
    var ZO = s.zoomOut || 0;
    if (ZO && t > s.t1 - ZO) {   // dive into the exit focus
      var u = L.seg(t, s.t1 - ZO, s.t1), z = 1 + (s.zoomMax || 6) * E.in3(u), f = s.focus || [L.W / 2, L.H / 2];
      g.translate(f[0], f[1]); g.scale(z, z); g.translate(-f[0], -f[1]);
    }
    if (s.pal) L.bg(g, t, s.pal);
    s.draw(g, t, t - s.t0);
    g.restore();
  }

  var TR = .42;
  F.render = function (ctx, t) {
    var k = L.k; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    var idx = 0; for (var i = 0; i < ORDER.length; i++) if (t >= F.scenes[ORDER[i]].t0) idx = i;
    var s = F.scenes[ORDER[idx]], prev = idx > 0 ? F.scenes[ORDER[idx - 1]] : null, lt = t - s.t0;
    var kind = s.trIn || 'cut';
    if (prev && lt < TR && kind !== 'cut') {
      var u = lt / TR;
      if (kind === 'iris') {
        drawScene(ctx, prev, prev.t1 - 1e-4);
        var f = s.focusIn || [L.W / 2, L.H / 2], R = 2300 * E.in2(u) + 10;
        ctx.save(); ctx.beginPath(); ctx.arc(f[0], f[1], R, 0, Math.PI * 2); ctx.clip();
        var z = 1.35 - .35 * E.out3(u); ctx.translate(f[0], f[1]); ctx.scale(z, z); ctx.translate(-f[0], -f[1]);
        drawScene(ctx, s, t); ctx.restore();
        var ring = new Path2D(); ring.arc(f[0], f[1], R, 0, Math.PI * 2); L.neon(ctx, ring, L.rain(u * .8), 26 * (1 - u) + 4, 40);
      } else if (kind === 'swipe') {
        var e = E.io(u), dir = s.swipeDir || 1;
        ctx.save(); ctx.translate(-dir * L.W * e, 0); drawScene(ctx, prev, prev.t1 - 1e-4); ctx.restore();
        ctx.save(); ctx.translate(dir * L.W * (1 - e), 0); drawScene(ctx, s, t); ctx.restore();
        // speed streaks
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; var r = L.rng(Math.floor(t * 60));
        for (var q = 0; q < 14; q++) { ctx.fillStyle = L.rgba(L.rain(r()), .35 * Math.sin(Math.PI * u)); ctx.fillRect(0, r() * L.H, L.W, 3 + r() * 10); }
        ctx.restore();
      } else { // flash
        drawScene(ctx, s, t);
        ctx.fillStyle = 'rgba(255,248,239,' + (.85 * (1 - u)) + ')'; ctx.fillRect(0, 0, L.W, L.H);
      }
    } else drawScene(ctx, s, t);

    // shake on slams
    overlay(ctx, t);
    L.finish(ctx, t);
    var fade = Math.max(1 - L.seg(t, 0, .3), L.seg(t, S.DUR - .6, S.DUR - .05));
    if (fade > 0) { ctx.fillStyle = 'rgba(8,3,24,' + fade + ')'; ctx.fillRect(0, 0, L.W, L.H); }
  };

  function overlay(g, t) {
    // light dust (persistent through every cut)
    g.save(); g.globalCompositeOperation = 'lighter';
    F.dust.forEach(function (d, i) {
      var y = ((d.y - d.v * t) % (L.H + 100) + L.H + 100) % (L.H + 100) - 50, x = d.x + Math.sin(t * d.f * .5 + d.ph) * 30;
      var tw = .35 + .65 * Math.pow(.5 + .5 * Math.sin(t * d.f * 2 + d.ph), 3);
      L.dot(g, x, y, d.s * (1 + .6 * F.beat(t)), d.c, tw * .7);
    });
    g.restore();
    // section chip
    S.HEADERS.forEach(function (h) {
      var a = L.win(t, h[0] + .15, h[1] - .05, .45, .3); if (a <= 0) return;
      var x = 64 - (1 - E.out3(a)) * 420, y = 215;
      g.save(); g.globalAlpha = Math.min(1, a * 1.5);
      g.font = '900 40px ' + L.FONT.sans; var w = g.measureText(h[3]).width + 150;
      var pill = L.rrect(x, y - 38, w, 76, 38); L.sticker(g, pill, C.white, { lw: 5, sh: [5, 6], hi: false });
      var dot = L.circle(x + 38, y, 30); L.sticker(g, dot, C.magenta, { lw: 4, sh: false, hi: false });
      g.fillStyle = C.white; g.font = '900 30px ' + L.FONT.sans; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(h[2], x + 38, y + 1);
      g.fillStyle = C.ink; g.font = '900 40px ' + L.FONT.sans; g.textAlign = 'left'; g.fillText(h[3], x + 84, y + 2);
      g.restore();
    });
    // captions
    S.CAPS.forEach(function (c, ci) {
      var a = c[0], b = c[1]; if (t < a || t > b + .05) return;
      var style = c[3] || 'cap', out = L.seg(t, b - .2, b);
      if (style === 'big') {
        var u = L.seg(t, a, a + .32), z = 2.4 - 1.4 * E.out5(u), shake = (1 - u) * 14;
        g.save(); g.translate(L.W / 2 + Math.sin(t * 90) * shake, 520 + Math.cos(t * 77) * shake); g.rotate(-.05); g.scale(z, z); g.globalAlpha = (1 - out) * Math.min(1, u * 4);
        var bw = Math.min(980, 160 * Array.from(c[2]).length + 120);
        var plate = L.rrect(-bw / 2, -120, bw, 240, 40); L.sticker(g, plate, ci % 2 ? C.magenta : C.violet, { lw: 9, sh: [12, 14] });
        L.text(g, c[2], 0, c[4] ? -14 : 0, 150, { font: 'disp', weight: 400, fill: C.yellow, stroke: 12, shadow: [6, 8, C.ink], marker: false, maxW: bw - 80 });
        if (c[4]) L.text(g, c[4], 0, 82, 40, { weight: 900, fill: C.white, shadow: false, marker: false, track: .12 });
        g.restore();
        return;
      }
      var y = 1430 - E.out3(out) * 40, cols = [C.magenta, C.cyan, C.violet, C.orange];
      g.save(); g.globalAlpha = 1 - out;
      if (style === 'q') { var qb = L.rrect(90, y - 80, 900, 160, 50); L.sticker(g, qb, C.white, { lw: 7, sh: [8, 10] }); }
      L.text(g, c[2], L.W / 2, y, 68, {
        fill: style === 'q' ? C.ink : C.white, hl: C.ink, stroke: style === 'q' ? 0 : 12, shadow: style === 'q' ? false : [5, 7, cols[ci % 4]], maxW: 940,
        reveal: function (i) { return L.seg(t, a + i * .035, a + i * .035 + .22); }
      });
      g.restore();
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
