/* sC.js — 天命？ (107.5–135) and 结语 (135–150). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT, SH = G.SHARED;
  var TAU = Math.PI * 2, PI = Math.PI;

  // a random stream of measured lines (fixed seed: it is 'random', but the film must render the same every time)
  var RND = (function () { var r = L.rng(2026), a = []; for (var i = 0; i < 64; i++) a.push(r() < .5 ? 1 : 0); return a; })();
  function strip(g, x, y, text, a, rot) {
    if (a <= 0) return;
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha *= Math.min(1, a * 1.5);
    var h = 120 + Array.from(text).length * 78, p = L.rrect(-62, -h / 2, 124, h * E.out3(a), 6);
    g.fillStyle = '#e9dcbe'; g.fill(p); g.strokeStyle = C.cinnabar; g.lineWidth = 3; g.strokeRect(-50, -h / 2 + 12, 100, h * E.out3(a) - 24);
    L.text(g, text, 0, -h / 2 + 40, 62, { font: 'brush', weight: 400, fill: '#2a1d10', shadow: false, glow: 0, vertical: true, lead: 1.22, reveal: function (i) { return L.seg(a, .3 + i * .08, .5 + i * .08); } });
    g.restore();
  }
  function stamp(g, x, y, ch, a) {
    if (a <= 0) return;
    g.save(); g.translate(x, y); g.rotate(-.25); var z = 2 - E.out3(a); g.scale(z, z); g.globalAlpha *= Math.min(1, a * 2);
    g.strokeStyle = C.cinnabar; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.stroke();
    L.text(g, ch, 0, 4, 66, { font: 'brush', weight: 400, fill: C.cinnabar, shadow: false, glow: 0 }); g.restore();
  }

  F.scene({
    id: 'fate', tint: '#1d1a2c', push: .03,
    build: function () { G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '拉普拉斯妖1814量子随机数心软易吃亏命中带财却难聚今年需防小人准相信设防关系变僵更信应验你的选择？'; },
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .08, spin: .3 });
      // 107.5–112.5: the fate scroll and the clockwork universe
      var ga = L.win(t, 107.5, 112.9, .5, .4);
      if (ga > 0) {
        var spinA = t * .5;
        [[620, 860, 210, 22, 1], [870, 1080, 130, 14, -1.62], [380, 1130, 120, 13, -1.75], [860, 640, 110, 12, -1.9], [420, 640, 90, 10, 2.3]].forEach(function (q, i) {
          var z = E.out3(L.seg(t, 107.6 + i * .12, 108.2 + i * .12));
          g.save(); g.translate(q[0], q[1]); g.rotate(spinA * q[4]); g.scale(z, z); L.gline(g, P.gear(q[2], q[3]), 3, { a: ga, glow: 12 }); g.restore();
        });
        var pend = new Path2D(), pa = Math.sin(t * PI / S.BEAT) * .35; pend.moveTo(620, 860); pend.lineTo(620 + Math.sin(pa) * 300, 860 + Math.cos(pa) * 300);
        L.gline(g, pend, 4, { a: ga }); L.dot(g, 620 + Math.sin(pa) * 300, 860 + Math.cos(pa) * 300, 60, '#ffd796', ga);
        var la = L.seg(t, 110, 110.5) * ga;
        if (la > 0) L.text(g, '拉普拉斯妖 · 1814', 540, 420, 52, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 110 + i * .05, 110.4 + i * .05) * ga; } });
      }
      // 112.5–117.5: the quantum coin — one measurement per beat, six make a hexagram
      var qa = L.win(t, 112.5, 117.9, .4, .4);
      if (qa > 0) {
        var bi = Math.floor((t - 112.5) / (S.BEAT / 2)), ph = ((t - 112.5) % (S.BEAT / 2)) / (S.BEAT / 2), res = RND[Math.max(0, bi) % 64];
        P.armillary(g, 540, 600, 160, t, { th: ph < .35 ? PI / 2 : (res ? 0 : PI), ph: t * 3 }, { a: qa, label: true });
        if (ph >= .35 && ph < .6) L.dot(g, 540, res ? 440 : 760, 160, '#fff2cc', qa * (1 - (ph - .35) * 4));
        // finished hexagrams scroll in a row; the current one builds bottom-up
        for (var h = 0; h <= Math.floor(Math.max(0, bi) / 6); h++) {
          var bits = [], done = Math.min(6, Math.max(0, bi + 1 - h * 6)); for (var k = 0; k < 6; k++) bits.push(RND[(h * 6 + k) % 64]);
          var cur = Math.floor(Math.max(0, bi) / 6), x = 540 + (h - cur) * 230;
          if (x < -120) continue;
          g.save(); g.globalAlpha *= qa; P.hex(g, x, 1060, 160, 200, bits, { glow: h === cur ? 14 : 4, a: h === cur ? 1 : .55, reveal: done / 6 }); g.restore();
        }
        var cA = L.seg(t, 115, 115.5) * qa;
        if (cA > 0) {
          var chip = L.rrect(380, 1230, 320, 120, 14); g.save(); g.globalAlpha *= cA; g.fillStyle = 'rgba(10,14,20,.9)'; g.fill(chip); g.restore();
          L.gline(g, chip, 3, { a: cA, col: C.q, glowCol: 'rgba(154,216,212,.8)' });
          for (var pn = 0; pn < 8; pn++) { var pin = new Path2D(); pin.moveTo(400 + pn * 40, 1230); pin.lineTo(400 + pn * 40, 1210); pin.moveTo(400 + pn * 40, 1350); pin.lineTo(400 + pn * 40, 1370); L.gline(g, pin, 3, { a: cA, col: C.q, glow: 0 }); }
          L.text(g, '量子随机数', 540, 1292, 46, { weight: 900, fill: C.q, reveal: function () { return cA; } });
        }
      }
      // 117.5–120: why so accurate?
      var wa = L.win(t, 117.6, 120.1, .3, .25);
      if (wa > 0) L.text(g, '？', 540, 860, 360, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return wa; } });
      // 120–125: Barnum strips, stamped on the beat
      var ba = L.win(t, 120.4, 125.1, .3, .3);
      if (ba > 0) {
        ['心软易吃亏', '命中带财却难聚', '今年需防小人'].forEach(function (s2, i) {
          var a = L.seg(t, 120.6 + i * .3, 121.4 + i * .3) * ba, x = 540 + (i - 1) * 250, y = 1000 + (i === 1 ? -20 : 30);
          strip(g, x, y, s2, a, (i - 1) * .06);
          stamp(g, x + 40, y + 200, '准', L.seg(t, S.HITS.stamp[i], S.HITS.stamp[i] + .25) * ba);
        });
      }
      // 125–135: the self-fulfilling loop
      var la2 = L.seg(t, 125.6, 126.4) * (1 - L.seg(t, 134.6, 135));
      if (la2 > 0) {
        var cx = 540, cy = 1030, R = 270 * E.out3(la2);
        L.gline(g, L.circle(cx, cy, R), 3, { a: la2, reveal: la2, len: 2000 });
        var ph2 = ((t - 125.6) / (S.BAR)) % 1, da = -PI / 2 + ph2 * TAU;
        L.dot(g, cx + Math.cos(da) * R, cy + Math.sin(da) * R, 70, '#ffd796', la2);
        [['相信', 0], ['设防', 1], ['关系变僵', 2], ['更信', 3]].forEach(function (q) {
          var a = -PI / 2 + q[1] * PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, near = Math.pow(Math.max(0, Math.cos(da - a)), 8);
          var w = q[0].length * 52 + 50, pl = L.rrect(x - w / 2, y - 40, w, 80, 40);
          g.save(); g.globalAlpha *= la2; g.fillStyle = 'rgba(10,12,20,.92)'; g.fill(pl); g.restore();
          L.gline(g, pl, 2 + near * 3, { a: la2, glow: 8 + near * 20 });
          L.text(g, q[0], x, y + 2, 44, { weight: 700, fill: near > .5 ? 'gold' : C.ivory, reveal: function () { return la2; } });
          var ah = new Path2D(), a2 = a + PI / 4, hx = cx + Math.cos(a2) * R, hy = cy + Math.sin(a2) * R, d = a2 + PI / 2;
          ah.moveTo(hx + Math.cos(d - 2.5) * 22, hy + Math.sin(d - 2.5) * 22); ah.lineTo(hx, hy); ah.lineTo(hx + Math.cos(d + 2.5) * 22, hy + Math.sin(d + 2.5) * 22); L.gline(g, ah, 3, { a: la2, glow: 0 });
        });
        var ya = L.seg(t, 130.2, 130.5);
        if (t < 132.4) stamp(g, cx, cy, '应验', ya * la2);
        var ca = L.seg(t, 132.5, 133.1) * la2;
        if (ca > 0) { L.dot(g, cx, cy, 260, '#ffd796', ca * .5); L.text(g, '你的选择', cx, cy, 72, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 132.5 + i * .1, 132.9 + i * .1) * la2; } }); }
      }
    }
  });

  /* ---------------- 结语 ---------------- */
  var STARS = (function () { var r = L.rng(64), a = []; for (var i = 0; i < 36; i++) a.push({ x: r.range(110, 970), y: r.range(380, 1360), n: Math.floor(r() * 64), s: r.range(.5, 1), ph: r() * 6.28 }); return a; })();
  F.scene({
    id: 'end', tint: '#221d1a', push: .02,
    build: function () { G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '天行健君子以自强不息周易乾象传'; },
    draw: function (g, t, lt) {
      var lpA = 1 - L.seg(t, 139.4, 140.4);
      P.luopan(g, 540, 860, L.lerp(1.0, 1.7, L.seg(t, 139, 141)), t, { a: L.lerp(1, .12, 1 - lpA), spin: 1.2 });
      if (lpA > 0) [[400, true], [540, false], [680, true]].forEach(function (c, i) { P.coin(g, c[0], 860, .55, c[1] ? 0 : PI, i * .4, { a: lpA }); });
      // futures: hexagrams floating like stars, then all converging into 乾
      var fa = L.seg(t, 139.8, 140.8), conv = E.io(L.seg(t, 142.6, 144.2));
      if (fa > 0 && conv < 1) STARS.forEach(function (st, i) {
        var tw = .45 + .55 * Math.pow(.5 + .5 * Math.sin(t * 2 + st.ph), 2), x = L.lerp(st.x, 540, conv), y = L.lerp(st.y, 820, conv);
        P.hex(g, x, y, 70 * st.s * (1 - conv * .5), 80 * st.s * (1 - conv * .5), P.bits(st.n), { a: fa * tw * (1 - conv), glow: 8 });
      });
      var qa = L.seg(t, 143.9, 144.6);
      if (qa > 0) {
        var hx = L.lerp(540, 330, E.io(L.seg(t, 145.2, 146.2)));
        L.dot(g, hx, 820, 520, '#ffd796', .35 * qa + .4 * F.hit(t, [144.2], .4));
        P.hex(g, hx, 820, 380 * E.out3(qa), 520, [1, 1, 1, 1, 1, 1], { glow: 22 });
        var na = L.seg(t, 145.4, 146);
        if (na > 0) L.text(g, '乾', hx, 1180, 120, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return na; } });
        // the Image (象传) of 乾, in two columns
        var cols = ['天行健', '君子以自强不息'];
        cols.forEach(function (c, j) {
          L.text(g, c, 800 - j * 130, 470, 104, { font: 'brush', weight: 400, fill: j ? C.ivory : 'gold', vertical: true, lead: 1.08, reveal: function (i) { return L.seg(t, 145.8 + j * .6 + i * .14, 146.2 + j * .6 + i * .14); } });
        });
        L.text(g, '——《周易 · 乾 · 象传》', 690, 1330, 32, { weight: 500, fill: C.ivory, reveal: function () { return L.seg(t, 147.6, 148.2); } });
        F.seal(g, '薛定谔的卦'.length === 5 ? '问卦' : '问卦', 900, 1300, 86, E.back(L.seg(t, 148.0, 148.3), 2));
        L.text(g, S.TITLE, 540, 1480, 64, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 148.2 + i * .08, 148.6 + i * .08); } });
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
