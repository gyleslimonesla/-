/* common.js — page furniture shared by all acts: frame, border ornament, title block, captions, subtitles. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var A = F.art = {}, acts = F.acts = {};

  /* ---------- how dark is the ground? (0 parchment … 1 night) ---------- */
  F.dark = function (t) { return Math.min(p(t, 113.5, 119.5, E.inOutS), 1 - p(t, 138.6, 142.2, E.inOutS)); };
  F.inkOn = function (t) { return F.mix(C.ink, '#F3EAD3', F.dark(t)); };
  F.goldOn = function (t) { return F.mix(C.goldDD, '#E2CFA2', F.dark(t)); };

  /* ---------- the Art Nouveau border (line state: prologue; bloomed state: coda) ---------- */
  function spiral(pts, cx, cy, r0, r1, a0, a1, n) { for (var i = 1; i <= n; i++) { var u = i / n, r = lerp(r0, r1, Math.pow(u, .8)), a = lerp(a0, a1, u); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }
  A.buildBorder = function () {
    var B = { stems: [], leaves: [], buds: [] };
    var m = 44, r = 34, k = r * .5523;
    // frame with concave corners, drawn as two halves that start at bottom-centre and meet at top-centre
    function half(mx) {
      var X = function (x) { return mx ? W - x : x; };
      return 'M' + X(540) + ',' + (H - m) + ' L' + X(W - m - r) + ',' + (H - m) +
        ' C' + X(W - m - r) + ',' + (H - m - k) + ' ' + X(W - m - k) + ',' + (H - m - r) + ' ' + X(W - m) + ',' + (H - m - r) +
        ' L' + X(W - m) + ',' + (m + r) +
        ' C' + X(W - m - k) + ',' + (m + r) + ' ' + X(W - m - r) + ',' + (m + k) + ' ' + X(W - m - r) + ',' + m +
        ' L' + X(540) + ',' + m;
    }
    B.frame = [F.path(half(false), 6)[0], F.path(half(true), 6)[0]];
    var m2 = 58;
    B.inner = F.path('M' + m2 + ',' + (m + r + 18) + ' V' + (H - m - r - 18) + ' M' + (W - m2) + ',' + (m + r + 18) + ' V' + (H - m - r - 18) +
      ' M' + (m + r + 18) + ',' + m2 + ' H' + (W - m - r - 18) + ' M' + (m + r + 18) + ',' + (H - m2) + ' H' + (W - m - r - 18), 20);

    function quadrant(mx, my, climbTop, t0) {
      var T = function (q) { return [mx ? W - q[0] : q[0], my ? H - q[1] : q[1]]; };
      var pts = [[540, 1812], [612, 1800], [700, 1815], [800, 1800], [898, 1813], [960, 1797], [995, 1756], [1001, 1690]];
      var y = 1690, kk = 0; while (y - 100 > climbTop + 20) { y -= 100; pts.push([kk % 2 ? 1002 : 988, y]); kk++; }
      pts.push([1000, climbTop + 4]);
      spiral(pts, 950, climbTop, 50, 9, 0, -Math.PI * 2 * 1.35, 22);
      var stem = F.spline(pts.map(T), false, 5);
      var si = B.stems.length; B.stems.push({ s: stem, w0: 4.6, w1: 1.3, t0: t0, t1: t0 + .78 });
      var endp = F.at(stem, 1); B.buds.push({ x: endp.x, y: endp.y, t: t0 + .78, big: true, q: (mx ? 1 : 0) + (my ? 2 : 0) });
      // tendril along the bottom
      var tp = [[784, 1803], [806, 1784], [816, 1756]]; spiral(tp, 850, 1752, 34, 6, Math.PI, Math.PI + Math.PI * 2 * 1.3, 16);
      var ten = F.spline(tp.map(T), false, 4);
      B.stems.push({ s: ten, w0: 2.8, w1: 1, t0: t0 + .26, t1: t0 + .52 });
      var e2 = F.at(ten, 1); B.buds.push({ x: e2.x, y: e2.y, t: t0 + .52, q: (mx ? 1 : 0) + (my ? 2 : 0) });
      // tendril on the side
      var sy0 = 1560, tq = [[997, sy0], [976, sy0 - 26], [948, sy0 - 34]]; spiral(tq, 944, sy0 - 4, 30, 6, -Math.PI / 2, -Math.PI / 2 - Math.PI * 2 * 1.25, 14);
      if (climbTop < sy0 - 150) {
        var ten2 = F.spline(tq.map(T), false, 4);
        B.stems.push({ s: ten2, w0: 2.6, w1: 1, t0: t0 + .45, t1: t0 + .68 });
        var e3 = F.at(ten2, 1); B.buds.push({ x: e3.x, y: e3.y, t: t0 + .68, q: (mx ? 1 : 0) + (my ? 2 : 0) });
      }
      // leaves
      var fr = [.07, .135, .2, .27, .36, .44, .52, .6, .68, .76], flip = (mx ? -1 : 1) * (my ? -1 : 1);
      for (var i = 0; i < fr.length; i++) {
        if (fr[i] > .8) continue;
        var q = F.at(stem, fr[i]), side = (i % 2 ? 1 : -1) * flip;
        B.leaves.push({ x: q.x, y: q.y, a: q.a + side * (.72 + (i % 3) * .1), L: 40 + ((i * 37) % 22), st: si, f: fr[i], side: side, q: (mx ? 1 : 0) + (my ? 2 : 0) });
      }
    }
    quadrant(false, false, 1290, 0); quadrant(true, false, 1290, 0);
    quadrant(false, true, 1500, .12); quadrant(true, true, 1500, .12);
    B.leaf = F.path('M0,0 C.28,-.36 .72,-.3 1,0 C.72,.26 .28,.3 0,0 Z M0,0 C.3,-.05 .6,-.05 .86,0', .04);
    return B;
  };
  /** draw the border in its gold-line state. prog 0..1 grows it. */
  A.drawBorder = function (ctx, B, prog, t, onLight, alpha, ornament) {
    if (prog <= 0 || alpha <= 0) return;
    var ga = ctx.globalAlpha; ctx.globalAlpha = ga * alpha;
    var gold = F.gold(ctx, onLight, t);
    ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 2; F.draw(ctx, B.frame, E.inOut(seg(prog, 0, .8)));
    ctx.lineWidth = .9; ctx.globalAlpha = ga * alpha * seg(prog, .6, .95) * .8; F.draw(ctx, B.inner, 1);
    var oa = ornament === undefined ? 1 : ornament;
    if (oa > 0) {
      ctx.globalAlpha = ga * alpha * oa;
      var i, fs = [];
      for (i = 0; i < B.stems.length; i++) {
        var s = B.stems[i], f = E.inOutS(seg(prog, s.t0, s.t1)); fs.push(f);
        if (f > 0) F.ribbon(ctx, s.s, 0, f, (function (s) { return function (u) { return lerp(s.w0, s.w1, u); }; })(s));
      }
      ctx.lineWidth = 1.2;
      for (i = 0; i < B.leaves.length; i++) {
        var l = B.leaves[i], g = E.outBack(seg(fs[l.st], l.f + .01, l.f + .09)); if (g <= 0) continue;
        var sway = Math.sin(t * .9 + i * 1.7) * .035;
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.a + sway); ctx.scale(l.L * g, l.L * g * .9);
        ctx.lineWidth = 1.5 / (l.L * g || 1); F.draw(ctx, B.leaf, 1); ctx.restore();
      }
      for (i = 0; i < B.buds.length; i++) {
        var b = B.buds[i], q = E.outBack(seg(prog, b.t, b.t + .06)); if (q <= 0) continue;
        ctx.beginPath(); ctx.arc(b.x, b.y, (b.big ? 5.5 : 3.6) * q, 0, 6.3); ctx.fill();
      }
      // centre lozenges top & bottom
      var cq = E.out(seg(prog, 0, .12));
      [[540, 1812], [540, 108]].forEach(function (c, j) {
        var q2 = j ? E.out(seg(prog, .12, .24)) : cq; if (q2 <= 0) return;
        ctx.beginPath(); ctx.moveTo(c[0], c[1] - 10 * q2); ctx.lineTo(c[0] + 7 * q2, c[1]); ctx.lineTo(c[0], c[1] + 10 * q2); ctx.lineTo(c[0] - 7 * q2, c[1]); ctx.closePath(); ctx.fill();
      });
    }
    ctx.globalAlpha = ga;
  };

  /* ---------- chapter title block (L5) ---------- */
  /** o:{x, y (baseline of the name), align, t0, out0, out1, size, ink, gold} */
  F.titleBlock = function (ctx, act, t, o) {
    var u = t - o.t0, out = 1 - p(t, o.out0, o.out1, E.inOutS); if (u < 0 || out <= 0) return;
    var x = o.x, y = o.y, al = o.align || 'c', ink = o.ink || F.inkOn(t), gold = o.gold || F.goldOn(t), size = o.size || 164;
    var ga = ctx.globalAlpha; ctx.globalAlpha = ga * out;
    // numeral
    var qn = p(u, 0, 1.2, E.out);
    F.text(ctx, act.num, x, y - size * .66 - 44, { font: 'cg', size: 30, weight: 500, track: .3, align: al, color: gold, alpha: qn });
    // name
    var wName = F.text(ctx, act.en, x, y, { font: 'cg', size: size, weight: 300, track: .1, align: al, color: ink, reveal: seg(u, .2, 2.0) });
    // rule
    var rx = al === 'c' ? x : al === 'l' ? x + 130 : x - 130;
    F.rule(ctx, rx, y + 46, 190, p(u, 1.2, 2.4, E.inOut), gold, 1.3);
    // chinese
    F.text(ctx, act.zh, x + (al === 'l' ? 2 : 0), y + 118, { font: 'sc', size: 50, weight: 600, track: .42, align: al, color: ink, reveal: seg(u, 1.5, 2.9), rise: 10 });
    // tagline
    F.text(ctx, act.tag, x + (al === 'l' ? 3 : 0), y + 180, { font: 'cg', size: 28, weight: 500, track: .34, align: al, color: gold, reveal: seg(u, 2.3, 3.9), rise: 6 });
    ctx.globalAlpha = ga;
    return wName;
  };

  /* ---------- running head + folio (chapters only) ---------- */
  F.chrome = function (ctx, t) {
    var a = Math.min(p(t, 13.8, 16, E.inOutS), 1 - p(t, 139.5, 142, E.inOutS)); if (a <= 0) return;
    var act = null, idx = 0;
    for (var i = 1; i <= 5; i++) if (t >= S.ACTS[i].t0 - .01) { act = S.ACTS[i]; idx = i; }
    if (!act) return;
    var gold = F.goldOn(t), ga = ctx.globalAlpha;
    // cross-fade the chapter mark around act boundaries
    var la = Math.min(seg(t, act.t0 + .6, act.t0 + 2.2), 1 - seg(t, act.t1 - 1.4, act.t1 - .2));
    if (idx === 5) la = seg(t, act.t0 + .6, act.t0 + 2.2);
    ctx.globalAlpha = ga * a;
    F.text(ctx, 'FROM HAIKU TO MYTHOS', 98, 120, { font: 'cg', size: 21, weight: 600, track: .3, align: 'l', color: gold, alpha: .9 });
    F.text(ctx, act.num + '  ·  ' + act.en, W - 98, 120, { font: 'cg', size: 21, weight: 600, track: .3, align: 'r', color: gold, alpha: .9 * la });
    // folio: five lozenges
    var y = 1830; ctx.fillStyle = gold; ctx.strokeStyle = gold; ctx.lineWidth = 1.2;
    for (i = 1; i <= 5; i++) {
      var x = 540 + (i - 3) * 38, on = i === idx ? la : (i < idx ? .0 : 0), r = 6;
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
      ctx.globalAlpha = ga * a * .8; ctx.stroke();
      if (on > 0) { ctx.globalAlpha = ga * a * on; ctx.fill(); }
    }
    ctx.globalAlpha = ga;
  };

  /* ---------- captions: etymology / product fact ---------- */
  F.captions = function (ctx, t) {
    for (var i = 0; i < S.CAPTIONS.length; i++) {
      var c = S.CAPTIONS[i]; if (t < c[0] - .1 || t > c[1] + .1) continue;
      var a = F.io(t, c[0], c[0] + .9, c[1] - .7, c[1]); a = E.inOutS(a); if (a <= 0) continue;
      var lab = S.LABELS[c[2]], gold = F.goldOn(t), ink = F.inkOn(t), lines = c[3].split('\n');
      var y0 = lines.length > 1 ? 1500 : 1510, rise = (1 - E.out(seg(t, c[0], c[0] + 1.1))) * 10;
      var ga = ctx.globalAlpha; ctx.globalAlpha = ga * a;
      // label with flanking hairlines
      var lw = F.text(ctx, lab[0] + '  ' + lab[1], 540, y0 + rise, { font: 'sc', size: 21, wsc: 600, weight: 600, track: .3, ltrack: .26, latin: 1.0, align: 'c', color: gold });
      ctx.strokeStyle = gold; ctx.lineWidth = 1; ctx.globalAlpha = ga * a * .7;
      var g2 = 26, ll = 54 * E.out(seg(t, c[0] + .2, c[0] + 1.4));
      ctx.beginPath(); ctx.moveTo(540 - lw / 2 - g2, y0 - 7 + rise); ctx.lineTo(540 - lw / 2 - g2 - ll, y0 - 7 + rise); ctx.moveTo(540 + lw / 2 + g2, y0 - 7 + rise); ctx.lineTo(540 + lw / 2 + g2 + ll, y0 - 7 + rise); ctx.stroke();
      ctx.globalAlpha = ga * a;
      for (var j = 0; j < lines.length; j++)
        F.text(ctx, lines[j], 540, y0 + 52 + j * 48 + rise, { font: 'sc', size: 32, weight: 500, wsc: 400, track: .06, latin: 1.2, align: 'c', color: ink });
      ctx.globalAlpha = ga;
    }
  };

  /* ---------- subtitles (narration) ---------- */
  F.subtitles = function (ctx, t) {
    for (var i = 0; i < S.NARRATION.length - 1; i++) { // the last cue is set as the coda's centrepiece
      var c = S.NARRATION[i]; if (t < c[0] - .3 || t > c[1] + .5) continue;
      var a = E.inOutS(F.io(t, c[0] - .25, c[0] + .35, c[1], c[1] + .45)); if (a <= 0) continue;
      var lines = c[2].split('\n'), ink = F.inkOn(t), y0 = lines.length > 1 ? 1656 : 1686;
      for (var j = 0; j < lines.length; j++)
        F.text(ctx, lines[j], 540, y0 + j * 60, { font: 'sc', size: 40, weight: 500, wsc: 400, track: .1, latin: 1.2, align: 'c', color: ink, alpha: a });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
