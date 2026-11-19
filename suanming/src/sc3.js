/* sc3.js — decoherence (80–107.5) and dice (107.5–122.5). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT;
  var OX = 540, OY = 860, dz = {};

  function neq(g, x, y, s, slash) {   // the ≠ handed over from the double slit
    g.save(); g.translate(x, y); g.scale(s, s);
    [-1, 1].forEach(function (k) { var r = L.rrect(-210, k * 70 - 28, 420, 56, 28); L.sticker(g, r, C.orange, { lw: 7, sh: [8, 10] }); });
    if (slash > 0) { g.save(); g.rotate(-.5); var r2 = L.rrect(-28, -230 * slash, 56, 460 * slash, 28); L.sticker(g, r2, C.magenta, { lw: 7, sh: [8, 10] }); g.restore(); }
    g.restore();
  }
  // molecules arriving at the object: one per beat at first, then a storm
  function molecules(t) {
    var out = [], r = L.rng(9), i, b;
    for (i = 0; i < 10; i++) { b = 85.0 + i * S.BEAT; out.push({ t: b, a: r() * 6.283, c: L.rain(r()), kind: i % 3 === 2 ? 'photon' : 'mol' }); }
    for (i = 0; i < 260; i++) out.push({ t: 92.5 + i * .019, a: r() * 6.283, c: L.rain(r()), kind: r() < .4 ? 'photon' : 'mol' });
    return out;
  }
  F.scene({
    id: 'decoh', trIn: 'flash', zoomOut: .5, zoomMax: 7,
    pal: { base: '#1d0a2c', blobs: [C.orange, C.magenta, C.violet, C.blue], grid: C.pink },
    build: function () { dz.mol = molecules(); this.focus = [540, 640]; G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '测量有人在看相互作用撞击次活死思想实验1935'; },
    draw: function (g, t, lt) {
      // ---- 80–85: ≠
      var nA = 1 - E.in3(L.seg(t, 84.6, 85.2));
      if (nA > 0) {
        neq(g, OX, OY, nA, 1);
        var la = E.back(L.seg(t, 80.3, 80.7), 2) * nA, ra = E.back(L.seg(t, 80.5, 80.9), 2) * nA;
        [[180, '测量', C.cyan, la], [900, '有人在看', C.yellow, ra]].forEach(function (q) {
          if (q[3] <= 0) return; g.save(); g.translate(q[0], OY); g.scale(q[3], q[3]);
          var w = q[1].length * 62 + 60, pl = L.rrect(-w / 2, -50, w, 100, 30); L.sticker(g, pl, q[2], { lw: 6, sh: [6, 8] });
          L.text(g, q[1], 0, 2, 56, { fill: C.ink, shadow: false, marker: false, maxW: w - 30 }); g.restore();
        });
        var xa = E.back(L.seg(t, 82.5, 82.8), 3) * nA;
        if (xa > 0) { g.save(); g.translate(900, OY); g.scale(xa, xa); var xp = new Path2D(); xp.moveTo(-120, -70); xp.lineTo(120, 70); xp.moveTo(120, -70); xp.lineTo(-120, 70); g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = C.ink; g.stroke(xp); g.lineWidth = 16; g.strokeStyle = C.red; g.stroke(xp); g.restore(); }
        var ca = E.back(L.seg(t, 82.7, 83.1), 2) * nA;
        if (ca > 0) {   // two little balls bumping under 测量
          var bx = Math.sin(t * 9) * 26;
          L.sticker(g, L.circle(140 - Math.abs(bx), OY + 160, 30 * ca), C.cyan, { lw: 5, sh: [4, 5] });
          L.sticker(g, L.circle(220 + Math.abs(bx), OY + 160, 30 * ca), C.pink, { lw: 5, sh: [4, 5] });
          L.text(g, '相互作用', 180, OY + 240, 40 * ca, { fill: C.cyan, stroke: 8, shadow: false, marker: false });
        }
      }
      // ---- 85–97.5: the quantum object, hit by the environment
      var oa = E.back(L.seg(t, 85.0, 85.5), 1.6) * (1 - E.in3(L.seg(t, 97.2, 97.6)));
      if (oa > 0) {
        var hits = 0; dz.mol.forEach(function (m) { if (m.t + .35 <= t) hits++; });
        var coh = Math.exp(-hits * .22), grow = 1 + 1.6 * E.io(L.seg(t, 92.5, 94.5)), R = 90 * grow * oa;
        // incoming molecules / photons
        g.save(); g.globalCompositeOperation = 'lighter';
        dz.mol.forEach(function (m) {
          var a = t - m.t; if (a < 0 || a > .7) return;
          var u = a / .35, d = u < 1 ? L.lerp(900, R + 10, E.in2(u)) : R + 10 + (u - 1) * 600, ang = m.a + (u > 1 ? Math.PI * .7 : 0);
          var x = OX + Math.cos(ang) * d, y = OY + Math.sin(ang) * d;
          if (m.kind === 'photon') { g.strokeStyle = L.rgba(C.yellow, .9 * (1 - Math.max(0, u - 1))); g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * 60, y + Math.sin(ang) * 60); g.stroke(); }
          else L.dot(g, x, y, 34, m.c, 1 - Math.max(0, u - 1));
          if (Math.abs(u - 1) < .25) L.dot(g, OX + Math.cos(m.a) * R, OY + Math.sin(m.a) * R, 110, C.white, .9 * (1 - Math.abs(u - 1) * 4));
        });
        g.restore();
        // halo of coherence
        var halo = new Path2D(); for (var i = 0; i <= 80; i++) { var a = i / 80 * Math.PI * 2, rr = R * 1.8 + Math.sin(a * 6 + t * 5) * 14 * coh; i ? halo.lineTo(OX + Math.cos(a) * rr, OY + Math.sin(a) * rr) : halo.moveTo(OX + Math.cos(a) * rr, OY + Math.sin(a) * rr); }
        halo.closePath(); g.save(); g.globalAlpha = coh; L.neon(g, halo, C.mint, 8, 30); g.restore();
        // the two superposed copies merge into one
        var sep = 130 * coh * grow;
        if (coh > .03) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55 * coh; L.sticker(g, L.circle(OX - sep, OY, R), C.cyan, { lw: 0, sh: false, hi: false }); L.sticker(g, L.circle(OX + sep, OY, R), C.magenta, { lw: 0, sh: false, hi: false }); g.restore(); }
        var solid = L.circle(OX, OY, R); g.save(); g.globalAlpha = 1 - coh * .7;
        var gr = g.createRadialGradient(OX - R * .3, OY - R * .3, R * .1, OX, OY, R); gr.addColorStop(0, C.white); gr.addColorStop(1, C.violet);
        L.sticker(g, solid, gr, { lw: 7, sh: [8, 10] }); g.restore();
        // the hit counter
        var cA = L.seg(t, 85.2, 85.6);
        if (cA > 0) {
          var n = t < 92.5 ? hits : Math.floor(Math.pow(10, 2 + 16 * E.in2(L.seg(t, 92.5, 96.8))));
          var label = t < 96.8 ? '撞击 ' + n.toLocaleString('en-US') + ' 次' : '撞击 ∞ 次';
          g.save(); g.globalAlpha = cA; var cp = L.rrect(260, 1150, 560, 96, 48); L.sticker(g, cp, C.ink, { lw: 6, sh: [6, 8], hi: false }); L.text(g, label, 540, 1199, 46, { fill: C.yellow, shadow: false, marker: false, maxW: 520 }); g.restore();
        }
      }
      // ---- 97.5–102.5: Schrödinger's cat
      var ka = L.win(t, 97.5, 102.6, .4, .3);
      if (ka > 0) {
        g.save(); g.translate(OX, 1000); g.scale(E.back(Math.min(1, ka * 1.4), 1.6), E.back(Math.min(1, ka * 1.4), 1.6));
        var box = new Path2D(); box.moveTo(-300, -90); box.lineTo(300, -90); box.lineTo(270, 180); box.lineTo(-270, 180); box.closePath();
        var fl = (t * 1.6) % 2 < 1;
        P.cat(g, -60, -150, .95, false, t); P.cat(g, 80 + Math.sin(t * 6) * 8, -140, .95, true, t);
        L.sticker(g, box, C.wood, { lw: 8, sh: [10, 12] });
        var lid = new Path2D(); lid.moveTo(-320, -120); lid.lineTo(320, -120); lid.lineTo(300, -86); lid.lineTo(-300, -86); lid.closePath();
        g.save(); g.translate(-300, -100); g.rotate(-1.05); g.translate(300, 100); L.sticker(g, lid, C.woodD, { lw: 7, sh: [6, 8] }); g.restore();
        L.text(g, fl ? '活' : '死', -160, 60, 120, { font: 'disp', weight: 400, fill: fl ? C.lime : C.pink, stroke: 12, shadow: [6, 8, C.ink], marker: false });
        L.text(g, '+', 0, 60, 100, { fill: C.white, stroke: 10, shadow: false, marker: false });
        L.text(g, fl ? '死' : '活', 160, 60, 120, { font: 'disp', weight: 400, fill: fl ? C.pink : C.lime, stroke: 12, shadow: [6, 8, C.ink], marker: false });
        var tag = L.rrect(-200, 210, 400, 76, 38); L.sticker(g, tag, C.yellow, { lw: 6, sh: [6, 8] });
        L.text(g, '思想实验 · 1935', 0, 249, 40, { fill: C.ink, shadow: false, marker: false });
        g.restore();
      }
      // ---- 102.5–107.5: the teller under bombardment; the glasses fall
      var ta = E.back(L.seg(t, 102.5, 103.0), 1.4);
      if (ta > 0) {
        var r = L.rng(Math.floor(t * 20));
        g.save(); g.globalCompositeOperation = 'lighter';
        for (var q = 0; q < 46; q++) { var ang = r() * 6.283, d = 200 + ((t * 900 + q * 61) % 700); L.dot(g, 540 + Math.cos(ang) * d, 700 + Math.sin(ang) * d, 24, L.rain(r()), .8); }
        g.restore();
        var fall = E.in2(L.seg(t, 105.0, 105.7));
        P.teller(g, 540, 1160 + (1 - ta) * 600, 1.3, { t: t, banner: .2, glasses: 1 - fall, mouth: fall > .5 ? 1 : .2, sweat: t > 104 });
      }
    }
  });

  /* ---------------- dice ---------------- */
  F.scene({
    id: 'dice', trIn: 'iris', focusIn: [540, 800], zoomOut: .5, zoomMax: 8,
    pal: { base: '#1c0d34', blobs: [C.yellow, C.lime, C.magenta, C.orange], grid: C.yellow },
    build: function () { this.focus = [790, 860]; G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '经典物理量子力学现在未来实验'; },
    draw: function (g, t, lt) {
      var bi = Math.floor(t / S.BEAT), ph = (t % S.BEAT) / S.BEAT, r = L.rng(bi + 3);
      var faces = [1 + Math.floor(r() * 6), 1 + Math.floor(r() * 6), 1 + Math.floor(r() * 6)];
      // phase A (107.5–112.5): one big die bouncing on the beat
      var split = E.io(L.seg(t, 112.4, 113.2)), frozen = t >= 117.5 && t < 120;
      var big = 1 - split * .55, dx = L.lerp(540, 790, split), dy = L.lerp(820, 860, split);
      var hop = frozen ? 0 : Math.abs(Math.sin(Math.PI * ph)) * 120 * (1 - split * .5);
      var rot = frozen ? .1 : (bi % 2 ? 1 : -1) * (.3 * (1 - ph)) + Math.sin(t) * .1;
      if (t >= 120) { hop *= 1.6; }
      // left: clockwork (classical determinism)
      if (split > 0) {
        g.save(); g.globalAlpha = split; var gx = L.lerp(-200, 270, E.out3(split));
        [[gx, 760, 110, 12, 1, C.cyan], [gx + 150, 900, 80, 9, -1.33, C.lime], [gx - 40, 990, 64, 8, 1.66, C.yellow]].forEach(function (q) {
          g.save(); g.translate(q[0], q[1]); g.rotate(t * .8 * q[4]); L.sticker(g, P.gear(q[2], q[3]), q[5], { lw: 6, sh: [6, 8], rule: 'evenodd' }); g.restore();
        });
        var lp = L.rrect(gx - 150, 520, 300, 84, 42); L.sticker(g, lp, C.white, { lw: 6, sh: [6, 8] }); L.text(g, '经典物理', gx, 563, 46, { fill: C.ink, shadow: false, marker: false });
        L.text(g, '现在 → 未来', gx, 1150, 44, { fill: C.white, stroke: 8, shadow: false, marker: false });
        g.restore();
      }
      // the die (and later its swarm)
      P.die(g, dx, dy - hop, 1.5 * big, rot, faces);
      if (split > 0) {
        var ra = L.seg(t, 115, 115.5);
        for (var i = 0; i < 4 * ra; i++) {
          var rr = L.rng(bi * 7 + i), ox = [-150, 150, -110, 140][i], oy = [-260, -220, 230, 250][i];
          P.die(g, dx + ox, dy + oy - Math.abs(Math.sin(Math.PI * ((t + i * .2) % S.BEAT) / S.BEAT)) * 50, .55, rr() * 3, [1 + Math.floor(rr() * 6), 1 + Math.floor(rr() * 6), 1 + Math.floor(rr() * 6)]);
        }
        var lp2 = L.rrect(dx - 150, 520, 300, 84, 42); g.save(); g.globalAlpha = L.seg(t, 114.9, 115.3); L.sticker(g, lp2, C.yellow, { lw: 6, sh: [6, 8] }); L.text(g, '量子力学', dx, 563, 46, { fill: C.ink, shadow: false, marker: false }); g.restore();
      }
      // 117.5–120: "God does not play dice" — a stop ring clamps the die; 120: it breaks free
      var sa = L.win(t, 117.5, 120.1, .25, .12);
      if (sa > 0) {
        var ring = new Path2D(); ring.arc(dx, dy, 240, 0, Math.PI * 2); ring.moveTo(dx - 170, dy - 170); ring.lineTo(dx + 170, dy + 170);
        g.save(); g.globalAlpha = sa; g.lineWidth = 40; g.strokeStyle = C.ink; g.stroke(ring); g.lineWidth = 26; g.strokeStyle = C.red; g.stroke(ring); g.restore();
      }
      if (t >= 120) {
        var u = t - 120;
        for (var k = 0; k < 10; k++) { var a = k * .628 + .3, d = u * 900, rr2 = L.rng(k + 50); if (d > 1400) continue; g.save(); g.globalAlpha = Math.max(0, 1 - u * .7); P.die(g, dx + Math.cos(a) * d, dy + Math.sin(a) * d + u * u * 300, .4, u * 6 + k, [1 + k % 6, 1 + (k + 2) % 6, 1 + (k + 4) % 6]); g.restore(); }
        [0, 1, 2].forEach(function (j) {
          var z = E.back(L.seg(t, 120.3 + j * .3, 120.6 + j * .3), 3); if (z <= 0) return;
          g.save(); g.translate(250 + j * 290, 1170); g.scale(z, z);
          var cb = L.rrect(-110, -50, 220, 100, 30); L.sticker(g, cb, C.lime, { lw: 6, sh: [6, 8] });
          L.text(g, '实验 ✓', 0, 3, 44, { fill: C.ink, shadow: false, marker: false }); g.restore();
        });
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
