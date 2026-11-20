/* sB.js — 叠加 (45–65), 坍塌 (65–85), 测量 (85–107.5). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT, SH = G.SHARED;
  var TAU = Math.PI * 2, PI = Math.PI;
  var PI_INDEX = 56;   // 天地否: bottom three yin, top three yang

  /* gold double slit with dots accumulating */
  var DS = (function () {
    var r = L.rng(17), hits = [];
    for (var i = 0; i < 900; i++) {
      var x; for (var k = 0; k < 200; k++) { x = r.range(-380, 380); var env = Math.exp(-x * x / (2 * 190 * 190)), c = Math.cos(PI * x / 72); if (r() < env * c * c) break; }
      hits.push({ x: x, y: r.range(-60, 60), t: 57.6 + Math.pow(i / 900, .55) * 4.6 });
    }
    return hits;
  })();
  function doubleSlit(g, cx, cy, t, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha *= a;
    var scr = L.rrect(cx - 420, cy - 300, 840, 150, 10); g.fillStyle = 'rgba(8,10,16,.85)'; g.fill(scr); L.gline(g, scr, 2, { glow: 8 });
    var bar = new Path2D(); bar.moveTo(cx - 420, cy + 120); bar.lineTo(cx - 70, cy + 120); bar.moveTo(cx - 30, cy + 120); bar.lineTo(cx + 30, cy + 120); bar.moveTo(cx + 70, cy + 120); bar.lineTo(cx + 420, cy + 120);
    L.gline(g, bar, 8, { glow: 12 });
    g.save(); g.beginPath(); g.rect(cx - 420, cy - 150, 840, 262); g.clip(); g.globalCompositeOperation = 'lighter';
    [-50, 50].forEach(function (sx, j) { for (var q = 0; q < 7; q++) { var ph = (t * .8 + q / 7) % 1, R = ph * 380; g.strokeStyle = L.rgba(j ? '#ffd796' : '#9ad8d4', .5 * (1 - ph)); g.lineWidth = 3; g.beginPath(); g.arc(cx + sx, cy + 112, R, PI, 0); g.stroke(); } });
    g.restore();
    var src = L.circle(cx, cy + 300, 26); L.gline(g, src, 3, {}); L.dot(g, cx, cy + 300, 80, '#9ad8d4', .6 + .3 * F.beat(t));
    g.save(); g.beginPath(); g.rect(cx - 414, cy - 294, 828, 138); g.clip();
    DS.forEach(function (h) { if (h.t > t) return; var age = t - h.t; g.fillStyle = age < .2 ? '#fff6dc' : '#e2bd74'; g.fillRect(cx + h.x - 2.5, cy - 225 + h.y - 2.5, 5, 5); });
    g.restore();
    L.text(g, '双缝', cx - 360, cy + 160, 32, { weight: 700, fill: C.ivory }); L.text(g, '屏', cx + 390, cy - 330, 32, { weight: 700, fill: C.ivory });
    g.restore();
  }

  /* ---------------- 叠加 ---------------- */
  F.scene({
    id: 'super', tint: '#13222c', push: .03,
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .1, spin: .4 });
      // the armillary: big, then up and smaller when the 64 appear, then aside for the coin comparison
      var up = E.io(L.seg(t, 49.8, 50.6)), side = E.io(L.seg(t, 52.4, 53.2)), away = E.io(L.seg(t, 57.2, 57.9));
      var ax = L.lerp(540, 760, side), ay = L.lerp(L.lerp(800, 470, up), 900, side) - away * 300, aR = L.lerp(L.lerp(260, 165, up), 190, side) * (1 - away * .4);
      var th = L.lerp(0, PI / 2, E.io(L.seg(t, 47.5, 48.6)));
      var appear = E.out3(L.seg(t, 45.0, 46.0));
      P.armillary(g, ax, ay, aR * (.85 + .15 * appear), t, { th: th, ph: t * 1.6 }, { a: appear * (1 - away), label: true });
      if (th > .2 && side < .5 && up < .5) L.text(g, '|ψ⟩ = α|阴⟩ + β|阳⟩', 540, 1365, 54, { weight: 700, fill: C.q, reveal: function (i) { return L.seg(t, 48.4 + i * .04, 48.8 + i * .04) * (1 - up); } });
      // 64 hexagrams all at once
      var ga = L.win(t, 50.0, 52.6, .5, .4);
      if (ga > 0) SH.grid64(g, 540, 1120, 86, t, { a: ga, bright: function (i) { return .45 + .4 * Math.pow(.5 + .5 * Math.sin(t * 3 + i * .7), 2); } });
      // the coin (classical) vs the qubit (quantum)
      var ca = L.win(t, 52.6, 57.6, .5, .5);
      if (ca > 0) {
        var reveal = L.seg(t, 55.0, 55.6);
        P.coin(g, 320, 900, .9, t * 9 * (1 - reveal) + reveal * 0, 0, { a: ca * (1 - reveal * .3) });
        if (reveal > 0) { L.dot(g, 320, 900, 200, '#ffd796', reveal * .6); L.text(g, '早已是“正”', 320, 1080, 44, { weight: 900, fill: 'gold', reveal: function () { return reveal * ca; } }); }
        L.text(g, '经典 · 不知道', 320, 560, 40, { weight: 700, fill: C.ivory, reveal: function () { return ca; } });
        L.text(g, '量子 · 叠加', 760, 560, 40, { weight: 700, fill: C.q, reveal: function () { return ca; } });
        var vs = new Path2D(); vs.moveTo(540, 700); vs.lineTo(540, 1120); L.gline(g, vs, 1.5, { a: ca * .5, dash: [6, 10], glow: 0 });
      }
      doubleSlit(g, 540, 930, t, L.win(t, 57.5, 65.1, .5, .3));
      var ia = L.win(t, 60.0, 65.1, .4, .3);
      if (ia > 0) { var cp = new Path2D(); for (var x = -414; x <= 414; x += 4) { var I = Math.exp(-x * x / (2 * 190 * 190)) * Math.pow(Math.cos(PI * x / 72), 2), y = 930 - 162 - I * 120; x === -414 ? cp.moveTo(540 + x, y) : cp.lineTo(540 + x, y); } L.gline(g, cp, 3, { col: C.q, a: ia, glowCol: 'rgba(154,216,212,.8)' }); }
    }
  });

  /* ---------------- 坍塌 ---------------- */
  F.scene({
    id: 'collapse', tint: '#221a24', push: .03,
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .1, spin: .4 });
      var c0 = S.HITS.collapse[0], c1 = S.HITS.collapse[1];
      // armillary: spinning superposition, snaps to a pole at 65.0
      var snap = E.out5(L.seg(t, c0, c0 + .25)), shrink = E.io(L.seg(t, 67.2, 68.0));
      var aA = 1 - L.seg(t, 69.6, 70.2);
      if (aA > 0) P.armillary(g, 540, L.lerp(800, 470, shrink), L.lerp(300, 170, shrink), t, { th: L.lerp(PI / 2, PI, snap), ph: t < c0 ? t * 1.6 : c0 * 1.6 }, { a: aA * Math.min(1, lt * 3 + .5) });
      if (t >= c0 && t < c0 + 1) { var u = t - c0; L.dot(g, 540, 800, 700 * (1 - u), '#fff2cc', 1 - u); [0, .1, .2].forEach(function (d) { var v = u - d; if (v > 0) L.gline(g, L.circle(540, 800, 60 + v * 900), 4, { a: Math.max(0, 1 - v * 1.4), col: '#ffe2a6' }); }); }
      // the sixty-four collapse into one: 否
      var gA = L.seg(t, 67.4, 67.9), kill = E.in2(L.seg(t, c1, c1 + .5)), pull = E.io(L.seg(t, 68.2, 69.4));
      if (gA > 0 && pull < 1) SH.grid64(g, 540, 1060, 92, t, { a: gA, bright: function (i) { return i === PI_INDEX ? 1 : (.5 + .3 * Math.sin(t * 3 + i)) * (1 - kill); } });
      if (t >= c1) { var u2 = t - c1; if (u2 < .8) L.dot(g, 540 + (PI_INDEX % 8 - 3.5) * 92, 1060 + (Math.floor(PI_INDEX / 8) - 3.5) * 96.6, 400 * (1 - u2), '#fff2cc', 1 - u2); }
      // the chosen hexagram moves to centre stage
      if (pull > 0) {
        var x0 = 540 + (PI_INDEX % 8 - 3.5) * 92, y0 = 1060 + (Math.floor(PI_INDEX / 8) - 3.5) * 96.6;
        var hx = L.lerp(x0, 540, pull), hy = L.lerp(y0, 1020, pull), hs = L.lerp(.11, 1, pull);
        var crack = L.seg(t, 75.0, 75.6);
        g.save(); g.translate(hx, hy); g.scale(hs, hs);
        L.dot(g, 0, 0, 420, '#c43d2c', .25 * pull + .2 * F.hit(t, [72.5], .5));
        P.hex(g, 0, 0, 470, 430, P.bits(PI_INDEX), { glow: 18 });
        if (crack > 0) { var cr = new Path2D(); cr.moveTo(-40, -230); cr.lineTo(10, -120); cr.lineTo(-30, -20); cr.lineTo(30, 80); cr.lineTo(-10, 230); L.gline(g, cr, 4, { col: C.cinL, reveal: crack, len: 600, glowCol: 'rgba(226,96,74,.9)' }); }
        g.restore();
        var nm = L.seg(t, 69.6, 70.2);
        if (nm > 0) { L.text(g, '否', 860, 1020, 150, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return nm; } }); L.text(g, '天地否', 860, 1120, 36, { weight: 700, fill: C.ivory, track: .2, reveal: function () { return nm; } }); }
      }
      // the diviner's eye
      var ea = L.win(t, 70.0, 82.6, .6, .8) * (1 - L.win(t, 72.2, 75.2, .2, .3)), open = E.out3(L.seg(t, 70.2, 71.0)) * (1 - E.in2(L.seg(t, 80.3, 81.4)));
      if (ea > 0) P.eye(g, 540, 560, .85, Math.max(.02, open), t, { a: ea, pupil: 1 - .3 * F.hit(t, [72.5], .6) });
    }
  });

  /* ---------------- 测量 ---------------- */
  var MOL = (function () { var r = L.rng(4), m = []; for (var i = 0; i < 12; i++) m.push({ t: 87.5 + i * S.BEAT * .5, a: r() * TAU }); for (i = 0; i < 160; i++) m.push({ t: 92.5 + i * .03, a: r() * TAU }); return m; })();
  F.scene({
    id: 'measure', tint: '#121c2e', push: .03,
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .1, spin: .4 });
      var hits = 0; MOL.forEach(function (m) { if (m.t + .3 <= t) hits++; });
      var coh = Math.exp(-hits * .12), R = 250, cx = 540, cy = 860;
      var aA = 1 - L.seg(t, 92.0, 92.6);
      if (aA > 0) {
        P.armillary(g, cx, cy, R, t, { th: PI / 2, ph: t * 1.6, len: coh }, { a: aA * Math.min(1, lt * 2 + .3), label: true });
        // molecules flying in
        g.save(); g.globalCompositeOperation = 'lighter';
        MOL.forEach(function (m) {
          var a = t - m.t; if (a < 0 || a > .55) return; var u = a / .3, d = u < 1 ? L.lerp(800, R, E.in2(u)) : R + (u - 1) * 500, an = m.a + (u > 1 ? 1.2 : 0);
          L.dot(g, cx + Math.cos(an) * d, cy + Math.sin(an) * d, 34, '#e8c27c', 1 - Math.max(0, u - 1) * 1.5);
          if (Math.abs(u - 1) < .25) L.dot(g, cx + Math.cos(m.a) * R, cy + Math.sin(m.a) * R, 120, '#fff2cc', 1 - Math.abs(u - 1) * 4);
        });
        g.restore();
        // the eye, crossed out: no one needs to look
        var xa = L.win(t, 85.2, 90, .4, .4);
        if (xa > 0) { P.eye(g, 870, 520, .32, .9, t, { a: xa }); var xx = new Path2D(); xx.moveTo(760, 440); xx.lineTo(980, 600); xx.moveTo(980, 440); xx.lineTo(760, 600); L.gline(g, xx, 7, { col: C.cinL, a: xa, reveal: L.seg(t, 85.5, 86.0), len: 600, glowCol: 'rgba(226,96,74,.9)' }); }
        var vl = L.seg(t, 88, 88.4) * aA; if (vl > 0) L.text(g, '相干性 ' + Math.round(coh * 100) + '%', cx, cy + R * 1.85, 44, { weight: 700, fill: C.q, reveal: function () { return vl; } });
      }
      // 92.5–97.5: bigger things are hit more often
      var ba = L.win(t, 92.4, 97.6, .4, .4);
      if (ba > 0) [['原子', 24, 210], ['铜钱', 70, 470], ['人', 150, 800]].forEach(function (q, j) {
        var y = 900, r = L.rng(Math.floor(t * 24) + j * 99), n = [3, 26, 90][j];
        g.save(); g.globalAlpha *= ba; L.gline(g, L.circle(q[2], y, q[1]), 3, { glow: 10 });
        g.globalCompositeOperation = 'lighter'; for (var k = 0; k < n; k++) { var an = r() * TAU, d = q[1] + 10 + r() * 50; L.dot(g, q[2] + Math.cos(an) * d, y + Math.sin(an) * d, 12, '#e8c27c', .9); }
        g.restore(); L.text(g, q[0], q[2], y + 230, 44, { weight: 700, fill: C.ivory, reveal: function () { return ba; } });
      });
      // 97.5–105: a person, measured countless times
      var pa = L.win(t, 97.6, 107.5, .5, .3);
      if (pa > 0) {
        var fig = new Path2D(); fig.arc(540, 700, 70, 0, TAU); fig.moveTo(430, 1080); fig.bezierCurveTo(430, 860, 470, 800, 540, 800); fig.bezierCurveTo(610, 800, 650, 860, 650, 1080);
        L.gline(g, fig, 4, { a: pa, reveal: L.seg(t, 97.6, 98.6), len: 1400 });
        var r2 = L.rng(Math.floor(t * 30)); g.save(); g.globalCompositeOperation = 'lighter';
        for (var k = 0; k < 70 * pa; k++) { var an2 = r2() * TAU, d2 = 260 + r2() * 300; L.dot(g, 540 + Math.cos(an2) * d2, 880 + Math.sin(an2) * d2 * 1.2, 14, '#e8c27c', .7 * pa); }
        g.restore();
        var ex = Math.floor(3 + 27 * E.in2(L.seg(t, 99.8, 102.3))), sup = String(ex).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; }).join('');
        var lab = t < 102.3 ? '被测量 10' + sup + ' 次' : '被测量 无数次';
        L.text(g, lab, 540, 1240, 48, { weight: 900, fill: 'gold', reveal: function () { return L.seg(t, 99.8, 100.2) * pa; } });
        var ey = L.win(t, 102.6, 107.4, .4, .5);
        if (ey > 0) { P.eye(g, 540, 470, .3, .9 * (1 - L.seg(t, 104.4, 105.2)) + .02, t, { a: ey }); L.text(g, '一眼？', 540, 360, 44, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return ey; } }); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
