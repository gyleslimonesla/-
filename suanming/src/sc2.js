/* sc2.js — collapse (35–52.5) and the double slit (52.5–80). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT, SH = G.SHARED;
  var TEAL = { base: '#071a33', blobs: [C.jade, C.blue, C.mint, C.violet], grid: C.mint };

  /* ---------------- wave packet → 铁口直断 → collapse ---------------- */
  var XC = SH.bars[4].x, COL = 40.6;   // where it collapses (下下签 — of course), and when
  function envelope(x, sig, mu) { var d = (x - mu) / sig; return Math.exp(-d * d / 2); }
  F.scene({
    id: 'collapse', pal: TEAL, zoomOut: .5, zoomMax: 10,
    build: function () { this.focus = [XC, 650]; },
    draw: function (g, t, lt) {
      var morph = E.io(L.seg(t, 35.0, 36.4)), rise = E.io(L.seg(t, 36.0, 37.4));
      var base = L.lerp(1240, 1000, rise);
      // bars dissolve into the wave
      if (morph < 1) SH.drawBars(g, t, 1, { alpha: function () { return 1 - morph; }, hScale: function () { return 1 - morph * .3; } });
      // collapse progress
      var c = E.in3(L.seg(t, COL - .25, COL)), post = t >= COL;
      var sig = post ? 14 : L.lerp(250, 14, c), mu = post ? XC : L.lerp(540, XC, c), amp = 470 * (post ? 1 : L.lerp(1, 1.25, c));
      if (morph > 0) {
        var x0 = 40, x1 = 1040, N = 220, top = [], line = [];
        for (var i = 0; i <= N; i++) {
          var x = L.lerp(x0, x1, i / N), e = envelope(x, sig, mu), k = .045, w = Math.cos(k * (x - mu) - t * 7);
          var dens = e * e * amp * morph, re = e * w * amp * .55 * morph;
          top.push([x, base - dens]); line.push([x, base - amp * .5 * morph - re * (post ? 0 : 1)]);
        }
        // probability cloud
        var cloud = new Path2D(); cloud.moveTo(x0, base); top.forEach(function (p) { cloud.lineTo(p[0], p[1]); }); cloud.lineTo(x1, base); cloud.closePath();
        var gr = g.createLinearGradient(x0, 0, x1, 0); L.RAINBOW.forEach(function (cc, j) { gr.addColorStop(j / 6, L.rgba(cc, .75)); });
        g.save(); g.globalAlpha = .9; g.fillStyle = gr; g.fill(cloud); g.restore();
        L.neon(g, cloud, C.white, 4, 20);
        if (!post || t < COL + .3) { var wl = new Path2D(); line.forEach(function (p, j) { j ? wl.lineTo(p[0], p[1]) : wl.moveTo(p[0], p[1]); }); g.save(); g.globalAlpha = post ? 1 - L.seg(t, COL, COL + .3) : 1; L.neon(g, wl, C.yellow, 6, 24); g.restore(); }
        // axis
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, base); g.lineTo(1020, base); g.stroke();
        L.text(g, 'ψ', 120, base - 520 * morph + 40, 110, { font: 'sans', fill: C.yellow, stroke: 10, shadow: [5, 7, C.magenta], marker: false });
      }
      // collapse flash + rings
      if (post) {
        var u = t - COL;
        for (var q = 0; q < 3; q++) { var a = u - q * .1; if (a < 0) continue; var R = 30 + a * 900; g.save(); g.globalAlpha = Math.max(0, 1 - a * 1.6); L.neon(g, L.circle(XC, base - amp * .5, R), L.RAINBOW[q * 2], 10, 30); g.restore(); }
        L.dot(g, XC, base - 240, 360 * Math.exp(-u / .5) + 120 + 260 * E.in2(L.seg(t, 50.5, 52.5)), C.white, .8);
        // the result: one stick rises out of the spike, and sinks back before we dive in
        var st = E.back(L.seg(t, 42.6, 43.2), 1.6) * (1 - E.in3(L.seg(t, 49.6, 50.3)));
        if (st > 0) P.stick(g, XC, base + 10, 560 * st, -.12, '下下签', C.ink, { w: 70 });
      }
      // footnote: collapse is one interpretation's language
      var fn = L.win(t, 42.6, 49.9, .4, .3);
      if (fn > 0) { g.save(); g.globalAlpha = fn * .85; L.text(g, '* 这是哥本哈根诠释的说法；多世界诠释里没有“坍塌”', 540, 1535, 30, { weight: 500, fill: C.white, shadow: false, marker: false }); g.restore(); }
      // the fortune teller
      var tin = E.out3(L.seg(t, 37.5, 38.3)) * (1 - E.in3(L.seg(t, 50.0, 50.8))), tx = L.lerp(-320, 250, tin);
      if (tin > 0) {
        var slam = t < 40 ? E.in3(L.seg(t, 39.4, 40.0)) * .6 : 1, recoil = t >= 40 ? Math.exp(-(t - 40) / .12) * Math.sin((t - 40) * 60) * .08 : 0;
        P.teller(g, tx, 1290, .92, { t: t, banner: slam + recoil, mouth: t > 47.4 && t < 50 ? .8 : (t > 40 && t < 40.6 ? 1 : 0), sweat: t > 47.5 });
      }
      // ?? burst
      var qa = L.seg(t, 47.5, 47.9);
      if (qa > 0 && t < 50.2) [[700, 640, 160], [860, 520, 120], [930, 760, 90]].forEach(function (q, i) {
        var z = E.back(L.seg(t, 47.5 + i * .12, 47.9 + i * .12), 3);
        L.text(g, '？', q[0] + Math.sin(t * 5 + i) * 10, q[1], q[2] * z, { font: 'fun', weight: 400, fill: [C.yellow, C.pink, C.cyan][i], stroke: 12, shadow: [6, 8, C.ink], marker: false });
      });
    }
  });

  /* ---------------- double slit ---------------- */
  var SCR = { x0: 100, x1: 980, y0: 330, y1: 650 }, BY = 960, SL = [440, 640], GY = 1260;
  var sd = {};
  function sample(r, mode) {   // x on the screen
    for (var tries = 0; tries < 200; tries++) {
      var u = r(), x = L.lerp(SCR.x0 + 20, SCR.x1 - 20, u), d = x - 540, I;
      if (mode === 0) { var env = Math.exp(-d * d / (2 * 230 * 230)), fr = Math.cos(Math.PI * d / 86); I = env * fr * fr; }
      else { var a = x - 330, b = x - 750; I = Math.exp(-a * a / (2 * 62 * 62)) + Math.exp(-b * b / (2 * 62 * 62)); }
      if (r() < I) return x;
    }
    return 540;
  }
  function schedule(t0, t1, n, slow) {   // emission times: a slow start, then a flood
    var ts = []; for (var i = 0; i < n; i++) { var u = i / n; ts.push(t0 + (t1 - t0) * (slow ? Math.pow(u, .35) : u)); } return ts;
  }
  F.scene({
    id: 'slit', trIn: 'iris', focusIn: [540, BY],
    pal: { base: '#0b0b30', blobs: [C.blue, C.violet, C.cyan, C.magenta], grid: C.sky },
    build: function () {
      var r = L.rng(42);
      sd.A = schedule(52.8, 62.3, 1500, true).map(function (tt) { return { t: tt, x: sample(r, 0), y: L.lerp(SCR.y0 + 18, SCR.y1 - 18, r()), c: L.rain(r() * .3 + .45) }; });
      sd.B = schedule(65.2, 69.6, 1500, false).map(function (tt) { return { t: tt, x: sample(r, 1), y: L.lerp(SCR.y0 + 18, SCR.y1 - 18, r()), c: L.rain(r() * .2 + .02) }; });
      sd.gun = L.sprite(260, 240, function (g) {
        var b = L.rrect(-90, -60, 180, 160, 30); L.sticker(g, b, C.violet, { lw: 7, sh: [8, 10] });
        var n = L.rrect(-34, -120, 68, 80, 14); L.sticker(g, n, C.lilac, { lw: 7, sh: [6, 8] });
        g.fillStyle = C.yellow; g.font = '900 40px ' + L.FONT.sans; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('e⁻', 0, 22);
      }, 130, 140);
    },
    draw: function (g, t, lt) {
      var det = t >= 62.5 && t < 70, cmp = L.seg(t, 70, 70.6), endM = L.seg(t, 77.5, 79.2);
      var hide = E.io(cmp);
      g.save(); g.globalAlpha = 1 - hide;
      // screen
      var sp = L.rrect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, SCR.y1 - SCR.y0, 24); L.sticker(g, sp, '#160f3c', { lw: 7, sh: [8, 10], hi: false });
      L.text(g, '屏幕', SCR.x1 - 70, SCR.y1 + 40, 34, { fill: C.lilac, shadow: false, marker: false });
      // barrier with two slits
      var bar = new Path2D(); bar.rect(60, BY - 22, SL[0] - 18 - 60, 44); bar.rect(SL[0] + 18, BY - 22, SL[1] - SL[0] - 36, 44); bar.rect(SL[1] + 18, BY - 22, 1020 - SL[1] - 18, 44);
      L.sticker(g, bar, C.lilac, { lw: 6, sh: [6, 8] });
      L.text(g, '双缝', 120, BY + 64, 34, { fill: C.lilac, shadow: false, marker: false });
      L.blit(g, sd.gun, 540, GY, 1);
      // waves beyond the slits (no detector: interfering circles; detector: two straight beams)
      g.save(); g.beginPath(); g.rect(0, SCR.y1 + 10, L.W, BY - SCR.y1 - 30); g.clip(); g.globalCompositeOperation = 'lighter';
      if (!det && t < 70) SL.forEach(function (sx, si) { for (var q = 0; q < 7; q++) { var ph = ((t * .9 + q / 7) % 1), R = ph * 420; g.strokeStyle = L.rgba(si ? C.magenta : C.cyan, .55 * (1 - ph)); g.lineWidth = 6; g.beginPath(); g.arc(sx, BY - 20, R, Math.PI, 0); g.stroke(); } });
      if (det) SL.forEach(function (sx, si) { var gr = g.createLinearGradient(0, BY, 0, SCR.y1); gr.addColorStop(0, L.rgba(C.orange, .6)); gr.addColorStop(1, L.rgba(C.orange, .05)); g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 14, BY - 20); g.lineTo(sx + 14, BY - 20); g.lineTo(sx + (si ? 110 : -110) + 60, SCR.y1); g.lineTo(sx + (si ? 110 : -110) - 60, SCR.y1); g.closePath(); g.fill(); });
      g.restore();
      // electrons in flight (gun → slits)
      var list = t < 64 ? sd.A : sd.B;
      g.save(); g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < list.length; i++) {
        var e = list[i], a = t - e.t + .5; if (a < 0 || a > .5) continue;
        var u = a / .5, x = L.lerp(540, e.x < 540 ? SL[0] : SL[1], u), y = L.lerp(GY - 110, BY, u);
        L.dot(g, x, y, 34, C.cyan, .9);
        if (i % 40 && list === sd.B) continue;
      }
      g.restore();
      // hits on the screen
      var clearA = t >= 64.4 ? 1 - L.seg(t, 64.4, 65) : 1;
      g.save(); g.beginPath(); g.rect(SCR.x0 + 6, SCR.y0 + 6, SCR.x1 - SCR.x0 - 12, SCR.y1 - SCR.y0 - 12); g.clip();
      drawHits(g, t, sd.A, clearA, 0, 0, 1);
      if (t >= 65) drawHits(g, t, sd.B, 1, 0, 0, 1);
      // intensity curve over the fringes
      var ca = L.win(t, 58.2, 64.4, .5, .4);
      if (ca > 0) { var cp = new Path2D(); for (var x = SCR.x0; x <= SCR.x1; x += 4) { var d = x - 540, I = Math.exp(-d * d / (2 * 230 * 230)) * Math.pow(Math.cos(Math.PI * d / 86), 2); var y = SCR.y1 - 20 - I * 260; x === SCR.x0 ? cp.moveTo(x, y) : cp.lineTo(x, y); } g.globalAlpha = ca; L.neon(g, cp, C.yellow, 5, 18); }
      g.restore();
      // the detector: a pair of sunglasses staring at the slits
      var da = E.back(L.seg(t, 62.6, 63.2), 1.8) * (1 - L.seg(t, 69.6, 70));
      if (da > 0) {
        var gx = L.lerp(1200, 760, da), gy = BY + 150;
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = L.rgba(C.orange, .22 + .15 * F.beat(t));
        g.beginPath(); g.moveTo(gx - 40, gy - 10); g.lineTo(SL[0] - 10, BY + 24); g.lineTo(SL[1] + 10, BY + 24); g.closePath(); g.fill(); g.restore();
        P.glasses(g, gx, gy, 1.1, -.08, (t * .7) % 1);
        L.text(g, '探测器', gx + 40, gy + 110, 42, { fill: C.orange, stroke: 8, shadow: false, marker: false });
      }
      g.restore();
      // comparison panels
      if (cmp > 0 && endM < 1) {
        var pa = E.back(cmp, 1.6);
        [[0, '不看', sd.A, C.cyan, 300], [1, '看', sd.B, C.orange, 780]].forEach(function (q) {
          var cx = q[4], cy = 760, w = 420, h = 520;
          g.save(); g.translate(cx, cy); g.scale(pa, pa); g.translate(-cx, -cy);
          var keep = q[0] === 1 ? 1 : 1 - endM;
          g.globalAlpha = keep;
          var pp = L.rrect(cx - w / 2, cy - h / 2, w, h, 30); L.sticker(g, pp, '#160f3c', { lw: 7, sh: [9, 11], hi: false });
          g.save(); g.clip(pp);
          // map the screen hits into the panel (stretched vertically)
          q[2].forEach(function (e, i) { if (i % 2) return; var x = cx - w / 2 + (e.x - SCR.x0) / (SCR.x1 - SCR.x0) * w, y = cy - h / 2 + (e.y - SCR.y0) / (SCR.y1 - SCR.y0) * h; g.fillStyle = e.c; g.fillRect(x - 3, y - 3, 6, 6); });
          g.restore();
          var tag = L.rrect(cx - 90, cy + h / 2 - 36, 180, 72, 36); L.sticker(g, tag, q[3], { lw: 6, sh: [5, 7] });
          L.text(g, q[1], cx, cy + h / 2 + 2, 46, { fill: C.ink, shadow: false, marker: false });
          g.restore();
        });
      }
      // the two bands turn into ≠
      if (endM > 0) {
        var m = E.io(endM), cx = L.lerp(780, 540, m), cy = L.lerp(760, 860, m), rot = m * Math.PI / 2;
        var len = L.lerp(520, 420, m), wd = L.lerp(60, 56, m), gap = L.lerp(84, 70, m) * L.lerp(2.5, 1, m);
        g.save(); g.translate(cx, cy); g.rotate(rot);
        [-1, 1].forEach(function (s) { var r = L.rrect(s * gap - wd / 2, -len / 2, wd, len, wd / 2); L.sticker(g, r, C.orange, { lw: 7, sh: [8, 10] }); });
        g.restore();
        var sl = L.seg(t, 78.9, 79.5);
        if (sl > 0) { g.save(); g.translate(540, 860); g.rotate(-.5); var r2 = L.rrect(-28, -230 * E.out3(sl), 56, 460 * E.out3(sl), 28); L.sticker(g, r2, C.magenta, { lw: 7, sh: [8, 10] }); g.restore(); }
      }
      // the fortune teller peeks in
      var tp = L.win(t, 72.4, 77.8, .5, .4);
      if (tp > 0) P.teller(g, L.lerp(1300, 820, E.out3(tp)), 1330, .8, { t: t, look: -1, mouth: t > 75 ? .5 : 0, sweat: t > 75 });
    }
  });
  function drawHits(g, t, list, alpha, dx, dy, s) {
    g.save(); g.globalAlpha *= alpha;
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (e.t > t) break;
      var age = t - e.t, flash = Math.exp(-age / .15);
      g.fillStyle = e.c; g.fillRect(e.x - 3.5, e.y - 3.5, 7, 7);
      if (flash > .05) L.dot(g, e.x, e.y, 26, C.white, flash);
    }
    g.restore();
  }
})(typeof window !== 'undefined' ? window : globalThis);
