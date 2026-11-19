/* sc1.js — hook (0–10), title (10–15), 签筒 / superposition (15–35). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT;
  var SH = G.SHARED = G.SHARED || {};
  var CX = 540, CY = 860;

  /* ---------------- hook ---------------- */
  F.scene({
    id: 'hook', pal: { base: '#0b0522', blobs: [C.violet, C.blue, C.magenta, C.deep], grid: C.lilac },
    zoomOut: .55, zoomMax: 9, focus: [CX, CY],
    draw: function (g, t) {
      var b = F.beat(t), labels = [['上上签', C.red], ['中签', C.violet], ['下下签', C.ink]];
      // ripples from the dot
      for (var q = 0; q < 4; q++) {
        var ph = ((t * .55 + q / 4) % 1), R = 30 + ph * 520;
        var rp = L.circle(CX, CY, R); g.save(); g.globalAlpha = (1 - ph) * .7 * L.seg(t, .2, 1); L.neon(g, rp, q % 2 ? C.cyan : C.magenta, 5, 20); g.restore();
      }
      // three possible sticks, superposed (2.5–5 out, 5–6 back in)
      var fan = E.back(L.seg(t, 2.5, 3.1), 2) * (1 - E.in3(L.seg(t, 5.0, 5.6)));
      if (fan > 0) labels.forEach(function (lb, i) {
        var ang = (i - 1) * .55 * fan;
        for (var k = 2; k >= 0; k--) {   // ghost copies jitter = 'all at once'
          var j = k ? (L.noise(t * 7 + i * 5 + k * 11) * .09) : 0;
          g.save(); if (k) { g.globalCompositeOperation = 'lighter'; }
          P.stick(g, CX, CY + 40, 560 * fan, ang + j, lb[0], k ? (k === 1 ? C.cyan : C.magenta) : lb[1], { alpha: k ? .35 : 1, sh: k ? false : [6, 8], lw: k ? 0 : 5 });
          g.restore();
        }
      });
      // the eye opens around the dot
      var open = E.back(L.seg(t, 5.0, 5.7), 1.6);
      if (open > 0) {
        var pupil = 1 + .12 * b - .45 * E.out3(L.seg(t, 8.75, 9.2));
        P.eye(g, CX, CY, 1.05 + .03 * b, open, t, pupil);
      }
      // the dot itself
      var dr = 26 * (1 + .5 * b) * (1 - L.seg(t, 5.0, 5.4));
      if (dr > 1) { L.dot(g, CX, CY, dr * 6, C.cyan, .9); var dp = L.circle(CX, CY, dr); g.fillStyle = C.white; g.fill(dp); }
      // ? marks orbiting during the fan
      if (fan > .1) for (var m = 0; m < 6; m++) {
        var a = t * .8 + m * 1.047, rr = 430 + 30 * Math.sin(t * 2 + m);
        L.text(g, m % 2 ? '?' : '？', CX + Math.cos(a) * rr, CY - 120 + Math.sin(a) * rr * .55, 64, { font: 'fun', weight: 400, fill: L.RAINBOW[m], stroke: 8, shadow: false, marker: false, reveal: function () { return fan; } });
      }
    }
  });

  /* ---------------- title ---------------- */
  F.scene({
    id: 'title', trIn: 'iris', focusIn: [CX, 820],
    pal: { base: '#2a0a4a', blobs: [C.magenta, C.orange, C.violet, C.cyan], grid: C.pink },
    draw: function (g, t, lt) {
      // rotating rays
      g.save(); g.translate(CX, 820); g.rotate(lt * .25);
      for (var i = 0; i < 18; i++) {
        g.fillStyle = L.rgba(L.RAINBOW[i % 7], .22); g.beginPath(); g.moveTo(0, 0);
        g.arc(0, 0, 1600, i / 18 * Math.PI * 2, (i + .5) / 18 * Math.PI * 2); g.closePath(); g.fill();
      }
      g.restore();
      // concentric pulse rings on each beat
      var pb = (lt % S.BEAT) / S.BEAT, rg = L.circle(CX, 820, 200 + pb * 700); g.save(); g.globalAlpha = 1 - pb; L.neon(g, rg, C.yellow, 8, 30); g.restore();
      // the big stick behind the title
      var sa = E.back(L.seg(lt, .05, .5), 1.8);
      P.stick(g, 820, 1330, 980 * sa, -.42, '上上签', C.red, { w: 92 });
      var tj = E.back(L.seg(lt, .3, .8), 2);
      if (tj > 0) { g.save(); g.translate(250, 1180); g.scale(tj, tj); var ring = L.circle(0, 0, 118); L.sticker(g, ring, C.white, { lw: 8, sh: [8, 10] }); P.taiji(g, 0, 0, 110, lt * 2, C.ink, C.white); g.restore(); }
      // title, one character per beat
      var ttl = Array.from(S.TITLE);
      ttl.forEach(function (ch, i) {
        var a = L.seg(lt, i * S.BEAT * .5, i * S.BEAT * .5 + .28); if (a <= 0) return;
        var x = CX + (i - 2) * 186, y = 760 + Math.sin(lt * 3 + i) * 8, z = E.back(a, 3.2);
        g.save(); g.translate(x, y); g.rotate((i % 2 ? .06 : -.06) * (1 - a) + Math.sin(lt * 2 + i) * .03); g.scale(z, z);
        L.text(g, ch, 0, 0, 200, { font: 'disp', weight: 400, fill: i === 4 ? C.yellow : C.white, stroke: 16, shadow: [10, 12, L.RAINBOW[i]], marker: false });
        g.restore();
      });
      var sb = E.back(L.seg(lt, 2.2, 2.6), 2.4);
      if (sb > 0) {
        g.save(); g.translate(CX, 960); g.scale(sb, sb);
        var pl = L.rrect(-260, -50, 520, 100, 50); L.sticker(g, pl, C.cyan, { lw: 7, sh: [7, 9] });
        L.text(g, S.SUB, 0, 2, 54, { fill: C.ink, shadow: false, marker: false, track: .08 });
        g.restore();
      }
      for (var s = 0; s < 8; s++) {
        var sp = L.sparkle(120 + L.hash(s) * 840, 380 + L.hash(s + 9) * 1100, 26 + 14 * Math.sin(lt * 4 + s));
        g.save(); g.globalAlpha = .9 * L.seg(lt, .2 + s * .1, .5 + s * .1); L.sticker(g, sp, L.RAINBOW[s % 7], { lw: 4, sh: false, hi: false }); g.restore();
      }
    }
  });

  /* ---------------- 签筒 → probability bars ---------------- */
  var TX = 540, TY = 1170, LAB = ['上上签', '上签', '中签', '下签', '下下签'], PROB = [.12, .22, .32, .22, .12];
  var HEAD = [C.red, C.orange, C.yellow, C.cyan, C.violet];
  SH.bars = LAB.map(function (lb, i) { return { x: 540 + (i - 2) * 172, base: 1240, h: PROB[i] * 1500, w: 124, col: HEAD[i], label: lb, p: PROB[i] }; });
  SH.drawBars = function (g, t, k, o) {   // k: 0..1 how 'bar-like'; o:{glow, hl index, alpha}
    o = o || {};
    SH.bars.forEach(function (b, i) {
      var h = b.h * (o.hScale ? o.hScale(i) : 1), w = b.w, x = b.x - w / 2, y = b.base - h;
      var p = L.rrect(x, y, w, h, 22);
      g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha(i);
      if (o.hl === i) L.dot(g, b.x, y + h / 2, 300, b.col, .5 + .3 * F.beat(t));
      var gr = g.createLinearGradient(0, y, 0, b.base); gr.addColorStop(0, L.light(b.col, .35)); gr.addColorStop(1, b.col);
      L.sticker(g, p, gr, { lw: 7, sh: [8, 10] });
      // shimmering wave bands inside: still in superposition
      g.save(); g.clip(p); g.globalCompositeOperation = 'lighter';
      for (var q = 0; q < 3; q++) { var yy = y + ((t * 160 + q * h / 3 + i * 40) % (h + 40)) - 20; g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, yy, w, 14); }
      g.restore();
      L.text(g, Math.round(b.p * 100) + '%', b.x, y - 46, 44, { fill: C.white, stroke: 8, shadow: false, marker: false });
      L.text(g, b.label, b.x, b.base + 52, 36, { fill: C.white, stroke: 7, shadow: false, marker: false, maxW: 160 });
      g.restore();
    });
  };
  F.scene({
    id: 'tube', trIn: 'swipe',
    pal: { base: '#071a33', blobs: [C.jade, C.blue, C.mint, C.violet], grid: C.mint },
    build: function () { G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + LAB.join('') + '上中下签%铁口直断'; },
    draw: function (g, t, lt) {
      // shake on every beat until the sticks leave
      var shake = F.beat(t, .22) * (t < 25 ? 1 : 0), rot = Math.sin(t * 28) * .07 * shake;
      var fly = L.seg(t, 25.0, 26.6), tubeY = TY + E.in2(L.seg(t, 25.3, 26.2)) * 1300;
      g.save(); g.translate(TX, tubeY); g.rotate(rot); g.translate(-TX, -tubeY);
      P.tube.back(g, TX, tubeY, 1);
      g.restore();
      // sticks: inside the tube (ghosted superposition) → flying out to become bars
      SH.bars.forEach(function (b, i) {
        var u = E.io(L.seg(t, 25.0 + i * .12, 26.2 + i * .12));
        var sx = TX + (i - 2) * 38, sy = tubeY - 60, sl = 560 + (i % 2) * 40, sa = (i - 2) * .1 + rot;
        if (u <= 0) {
          for (var k = 2; k >= 0; k--) {
            var j = k ? L.noise(t * 6 + i * 3 + k * 17) * .1 : 0, dy = k ? L.noise(t * 5 + i + k * 9) * 40 : -F.beat(t, .2) * 30 * ((i % 2) * 2 - 1);
            g.save(); if (k) g.globalCompositeOperation = 'lighter';
            P.stick(g, sx, sy + dy, sl, sa + j, b.label, k ? (k === 1 ? C.cyan : C.magenta) : b.col, { alpha: k ? .3 : 1, lw: k ? 0 : 5, sh: k ? false : [6, 8] });
            g.restore();
          }
        } else if (u < 1) {
          // morph: stick (thin, angled, wood) → bar (wide, upright, colour)
          var x = L.lerp(sx, b.x, u), base = L.lerp(sy, b.base, u), len = L.lerp(sl, b.h, u), w = L.lerp(44, b.w, u), ang = L.lerp(sa, 0, u);
          var lift = Math.sin(Math.PI * u) * 260;
          g.save(); g.translate(x, base - lift); g.rotate(ang + Math.sin(Math.PI * u) * (i - 2) * .3);
          var p = L.rrect(-w / 2, -len, w, len, L.lerp(12, 22, u));
          L.sticker(g, p, L.mix(C.wood, b.col, u), { lw: 6, sh: [7, 9] });
          g.restore();
        }
      });
      if (fly > .99 || t > 26.8) SH.drawBars(g, t, 1, {
        hScale: function (i) { return E.back(L.seg(t, 26.2 + i * .12, 26.6 + i * .12), 1.5); },
        hl: t > 32.5 ? 2 : undefined
      });
      g.save(); g.translate(TX, tubeY); g.rotate(rot); g.translate(-TX, -tubeY);
      P.tube.front(g, TX, tubeY, 1, t);
      g.restore();
      // formula
      var fa = L.seg(t, 30.0, 30.4);
      if (fa > 0) {
        g.save(); g.globalAlpha = fa; g.translate(0, (1 - E.out3(fa)) * 40);
        var plate = L.rrect(60, 380, 960, 150, 36); L.sticker(g, plate, C.white, { lw: 7, sh: [8, 10] });
        var x = 92, y = 455;
        x += P.ket(g, x, y, 54, 'ψ', C.violet) + 14;
        g.font = '900 54px ' + L.FONT.sans; g.fillStyle = C.ink; g.textBaseline = 'middle'; g.fillText('=', x, y + 2); x += 50;
        [['a', '上上'], ['b', '上'], ['c', '中']].forEach(function (q, i) {
          var ap = L.seg(t, 30.2 + i * .2, 30.5 + i * .2); g.globalAlpha = fa * ap;
          g.fillStyle = [C.red, C.orange, C.magenta][i]; g.font = '900 50px ' + L.FONT.sans; g.fillText(q[0], x, y + 2); x += 32;
          x += P.ket(g, x, y, 46, q[1], C.ink) + 8;
          g.fillStyle = C.ink; g.fillText(i < 2 ? '+' : '+ …', x, y + 2); x += i < 2 ? 44 : 90;
        });
        g.restore();
      }
      var pa = L.seg(t, 32.5, 32.8);
      if (pa > 0) {
        g.save(); g.translate(540, 620); g.scale(E.back(pa, 2), E.back(pa, 2));
        var pl = L.rrect(-300, -60, 600, 120, 60); L.sticker(g, pl, C.yellow, { lw: 7, sh: [7, 9] });
        L.text(g, 'P(中签) = |c|² = 32%', 0, 2, 50, { fill: C.ink, shadow: false, marker: false });
        g.restore();
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
