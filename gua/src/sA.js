/* sA.js — 引 (0–12.5), 八字 (12.5–30), 起卦 (30–45). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT;
  var SH = G.SHARED = G.SHARED || {};
  var TAU = Math.PI * 2;

  /* ---------- shared helpers ---------- */
  // coin flight: thrown at t0, rises, hangs (slow motion between sA and sB), lands at tl showing `up` (true = 字面)
  SH.coinState = function (t, t0, tl, x, yLow, yTop, yLand, up, spinRate, slow) {
    var f, y;
    if (t < t0) return { x: x, y: yLow, f: up ? 0 : Math.PI, a: 0 };
    var w = spinRate || 16;
    var fAt = function (tt) { if (!slow || tt < slow[0]) return (tt - t0) * w; var b = (slow[0] - t0) * w; if (tt < slow[1]) return b + (tt - slow[0]) * w * .14; return b + (slow[1] - slow[0]) * w * .14 + (tt - slow[1]) * w; };
    if (t < tl) {
      f = fAt(t);
      var up1 = E.out3(L.seg(t, t0, t0 + 1.1));
      y = L.lerp(yLow, yTop, up1) + Math.sin(t * 2) * 8;
      var fall = L.seg(t, tl - .35, tl); y = L.lerp(y, yLand, E.in2(fall));
    } else {
      var fl = fAt(tl), tgt = Math.ceil(fl / TAU) * TAU + (up ? 0 : Math.PI); if (tgt - fl < Math.PI * .5) tgt += TAU;
      var u = L.seg(t, tl, tl + .35); f = L.lerp(fl, tgt, E.out3(u));
      y = yLand - Math.abs(Math.sin(u * Math.PI * 2)) * 30 * (1 - u);
    }
    return { x: x, y: y, f: f, a: 1 };
  };
  SH.PILLARS = [['年柱', '甲', '辰', C.wood, C.earth, '木', '土'], ['月柱', '丙', '寅', C.fire, C.wood, '火', '木'], ['日柱', '戊', '午', C.earth, C.fire, '土', '火'], ['时柱', '庚', '申', C.metal, C.metal, '金', '金']];
  SH.grid64 = function (g, cx, cy, cell, t, o) {   // 8×8 in Fu Xi binary order; o:{a, reveal(t), bright(i)->0..1, binary}
    o = o || {};
    for (var i = 0; i < 64; i++) {
      var r = Math.floor(i / 8), c = i % 8, x = cx + (c - 3.5) * cell, y = cy + (r - 3.5) * cell * 1.05;
      var show = o.reveal ? o.reveal(i) : 1; if (show <= 0) continue;
      var b = o.bright ? o.bright(i) : 1, a = (o.a === undefined ? 1 : o.a) * show;
      if (b > .6) L.dot(g, x, y, cell * .9, '#ffd796', (b - .6) * a);
      P.hex(g, x, y - (o.binary ? cell * .1 : 0), cell * .56, cell * .62, P.bits(i), { col: b > .5 ? L.GOLD : L.mix('#4a3f2a', '#e2bd74', b * 1.6), a: a * (.35 + .65 * b), reveal: show < 1 ? show : undefined });
      if (o.binary) { var s = ''; for (var k = 5; k >= 0; k--) s += (i >> k) & 1; g.save(); g.globalAlpha *= a * o.binary; g.font = '500 ' + (cell * .17) + 'px ' + L.FONT.serif; g.fillStyle = C.q; g.textAlign = 'center'; g.fillText(s, x, y + cell * .42); g.restore(); }
    }
  };

  /* ---------------- 引 ---------------- */
  var CY = 880, COINS = [[300, true], [540, false], [780, true]];
  F.scene({
    id: 'yin', push: .05,
    
    draw: function (g, t, lt) {
      var titleA = L.seg(t, 9.9, 10.6);
      P.luopan(g, 540, CY, 1.0, t, { reveal: E.out3(L.seg(t, .2, 2.4)), a: 1 - titleA * .7, kick: E.out3(L.seg(t, 7.5, 8.3)) * .6 });
      // three coins
      COINS.forEach(function (c, i) {
        var t0 = S.HITS.coin[i], tl = S.HITS.land[i];
        var st = SH.coinState(t, t0, tl, c[0], 1350, 560 + (i === 1 ? -60 : 0), CY, c[1], 15 + i * 2, [5.0, 7.4]);
        if (t < t0) return;
        var slow = t > 5 && t < 7.5;
        if (!slow && t < tl) for (var k = 3; k >= 1; k--) { var gs = SH.coinState(t - k * .02, t0, tl, c[0], 1350, 560 + (i === 1 ? -60 : 0), CY, c[1], 15 + i * 2, [5.0, 7.4]); P.coin(g, gs.x, gs.y, .78, gs.f, i * .4, { a: .18 }); }
        P.coin(g, st.x, st.y, .78, st.f, i * .4 + (t - t0) * .3, { a: 1 - titleA * .8, glint: slow ? .35 + .3 * Math.sin(t * 3 + i) : 0 });
        if (t >= tl && t < tl + .6) { var u = (t - tl) / .6; L.dot(g, c[0], CY, 260 * (1 - u) + 40, '#ffe2a6', 1 - u); L.gline(g, L.circle(c[0], CY, 40 + u * 220), 3, { a: 1 - u, col: '#ffe2a6' }); }
      });
      if (t > 5 && t < 7.5) {   // slow-motion: a ring of time
        var sa = L.win(t, 5, 7.5, .3, .3); L.gline(g, L.circle(540, 560, 330), 1.5, { a: sa * .6, dash: [6, 14] });
        L.text(g, '正？  反？', 540, 380, 64, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return sa; } });
      }
      // title
      if (titleA > 0) {
        L.dot(g, 540, 820, 600, '#ffcf88', .25 * titleA);
        L.text(g, S.TITLE, 540, 800, 190, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 10 + i * .16, 10.5 + i * .16); } });
        var la = L.seg(t, 11.0, 11.6);
        var ln = new Path2D(); ln.moveTo(540 - 330 * la, 990); ln.lineTo(540 + 330 * la, 990); L.gline(g, ln, 2, { a: la });
        L.text(g, S.SUB, 540, 1050, 46, { weight: 700, fill: C.ivory, track: .2, reveal: function (i) { return L.seg(t, 11.1 + i * .03, 11.5 + i * .03); } });
        F.seal(g, '问卦', 900, 680, 92, E.back(L.seg(t, 11.6, 11.9), 2));
      }
    }
  });

  /* ---------------- 八字 ---------------- */
  function pillar(g, x, y, s, p, t, a0, glow) {
    var W = 190, H = 540, ap = L.seg(t, a0, a0 + .6);
    if (ap <= 0) return;
    g.save(); g.translate(x, y); g.scale(s, s);
    var fr = L.rrect(-W / 2, -H / 2, W, H, 16);
    g.save(); g.globalAlpha *= ap; g.fillStyle = 'rgba(12,14,22,.78)'; g.fill(fr); g.restore();
    L.gline(g, fr, 3, { reveal: ap, len: 1500, glow: 12 });
    var inner = L.rrect(-W / 2 + 10, -H / 2 + 10, W - 20, H - 20, 10); L.gline(g, inner, 1, { a: ap * .5, glow: 0 });
    var ca = L.seg(t, a0 + .3, a0 + .8);
    g.save(); g.globalAlpha *= ca;
    L.text(g, p[0], 0, -H / 2 + 46, 34, { weight: 700, fill: C.ivory, track: .2 });
    var dv = new Path2D(); dv.moveTo(-W / 2 + 26, -H / 2 + 80); dv.lineTo(W / 2 - 26, -H / 2 + 80); L.gline(g, dv, 1.5, { glow: 0, a: .6 });
    [[p[1], p[3], p[5], -60], [p[2], p[4], p[6], 140]].forEach(function (q, j) {
      var gl = glow ? glow(j) : 0;
      if (gl > 0) L.dot(g, 0, q[3], 170, q[1], gl * .6);
      L.text(g, q[0], 0, q[3], 118, { weight: 900, fill: q[1], glow: 1 });
      var tag = L.circle(54, q[3] + 62, 20); g.fillStyle = L.rgba(q[1], .2); g.fill(tag); L.gline(g, tag, 1.5, { col: q[1], glow: 0 });
      L.text(g, q[2], 54, q[3] + 63, 24, { weight: 700, fill: q[1], shadow: false, glow: 0 });
    });
    g.restore(); g.restore();
  }
  var WX = [['木', C.wood], ['火', C.fire], ['土', C.earth], ['金', C.metal], ['水', C.water]];
  function wuxing(g, cx, cy, R, t, a) {
    if (a <= 0) return;
    var pts = WX.map(function (w, i) { var an = -Math.PI / 2 + i * TAU / 5; return [cx + Math.cos(an) * R, cy + Math.sin(an) * R]; });
    // 生: around the circle
    for (var i = 0; i < 5; i++) {
      var a0 = -Math.PI / 2 + i * TAU / 5 + .26, a1 = -Math.PI / 2 + (i + 1) * TAU / 5 - .26, p = new Path2D();
      p.arc(cx, cy, R, a0, L.lerp(a0, a1, L.seg(a, i * .1, i * .1 + .5)));
      L.gline(g, p, 3, { col: WX[i][1], a: a, glow: 10, glowCol: WX[i][1] });
      var ae = a1, hx = cx + Math.cos(ae) * R, hy = cy + Math.sin(ae) * R, d = ae + Math.PI / 2;
      if (a > .6) { var ah = new Path2D(); ah.moveTo(hx + Math.cos(d - 2.6) * 18, hy + Math.sin(d - 2.6) * 18); ah.lineTo(hx, hy); ah.lineTo(hx + Math.cos(d + 2.6) * 18, hy + Math.sin(d + 2.6) * 18); L.gline(g, ah, 3, { col: WX[i][1], a: a, glow: 0 }); }
    }
    // 克: the star inside
    var star = new Path2D(); for (i = 0; i <= 5; i++) { var q = pts[(i * 2) % 5]; i ? star.lineTo(q[0], q[1]) : star.moveTo(q[0], q[1]); }
    L.gline(g, star, 1.5, { a: a * .5, reveal: L.seg(a, .4, 1), len: 1400, dash: undefined, glow: 0 });
    pts.forEach(function (q, i) {
      var z = E.back(L.seg(a, i * .1, i * .1 + .4), 2); if (z <= 0) return;
      L.dot(g, q[0], q[1], 110, WX[i][1], .55 * z);
      var c = L.circle(q[0], q[1], 52 * z); g.fillStyle = 'rgba(10,12,20,.85)'; g.fill(c); L.gline(g, c, 3, { col: WX[i][1], glow: 14, glowCol: WX[i][1] });
      L.text(g, WX[i][0], q[0], q[1] + 2, 52 * z, { weight: 900, fill: WX[i][1], shadow: false });
    });
    g.save(); g.globalAlpha *= a; L.text(g, '生', cx + R * 1.18, cy - R * .62, 30, { weight: 700, fill: C.ivory }); L.text(g, '克', cx, cy + 6, 30, { weight: 700, fill: C.ivory }); g.restore();
  }
  F.scene({
    id: 'bazi', tint: '#1b1c30', push: .03,
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .16, spin: .5 });
      var lift = E.io(L.seg(t, 19.8, 20.8)), sc = L.lerp(1, .72, lift), py = L.lerp(840, 610, lift);
      var gears = L.seg(t, 24.8, 25.6);
      if (gears > 0) {
        [[300, 1180, 150, 16, 1], [520, 1300, 100, 11, -1.45], [720, 1190, 130, 14, 1.15], [870, 1330, 80, 9, -1.8]].forEach(function (q) {
          g.save(); g.translate(q[0], q[1]); g.rotate(t * .6 * q[4]); L.gline(g, P.gear(q[2], q[3]), 3, { a: gears, glow: 12 }); g.restore();
        });
        L.text(g, '决定论', 540, 1060, 54, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 25.2 + i * .1, 25.6 + i * .1); } });
      }
      SH.PILLARS.forEach(function (p, i) {
        var x = 540 + (i - 1.5) * 228 * sc;
        pillar(g, x, py, sc, p, t, 12.7 + i * .35, function (j) {   // 17.5–20: count the eight characters on the beat
          var k = i * 2 + j, tk = 17.6 + k * .28; return t >= tk && t < 20 ? Math.exp(-(t - tk) / .5) + .25 : 0;
        });
      });
      // 年 月 日 时 tags
      var ta = L.win(t, 15.0, 17.5, .3, .3);
      if (ta > 0) ['年', '月', '日', '时'].forEach(function (ch, i) { var x = 540 + (i - 1.5) * 228; L.text(g, ch, x, 520, 56, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return L.seg(t, 15.0 + i * .15, 15.4 + i * .15) * ta; } }); });
      wuxing(g, 540, 1130, 220, t, L.seg(t, 20.1, 21.6) * (1 - L.seg(t, 24.6, 25.2)));
      // 22.5–25: the eight characters written into a fate scroll
      var sa = L.win(t, 22.5, 25.2, .5, .4);
      if (sa > 0) {
        var sx = 540, sy = 1130, sh = 520 * E.out3(sa);
        var sp = L.rrect(sx - 70, sy - sh / 2, 140, sh, 8); g.save(); g.globalAlpha *= sa; g.fillStyle = '#e9dcbe'; g.fill(sp); g.restore();
        L.gline(g, sp, 2, { a: sa, glow: 8 });
        L.text(g, '甲辰丙寅戊午庚申', sx, sy - 230, 50, { font: 'brush', weight: 400, fill: '#2a2014', shadow: false, glow: 0, vertical: true, lead: 1.15, reveal: function (i) { return L.seg(t, 22.8 + i * .12, 23.1 + i * .12) * sa; } });
        F.seal(g, '命定', sx + 110, sy + 210, 70, E.back(L.seg(t, 23.9, 24.2), 2) * sa);
      }
    }
  });

  /* ---------------- 起卦 ---------------- */
  var TAI = [1, 1, 1, 0, 0, 0];   // 地天泰 (bottom→top)
  F.scene({
    id: 'qigua', tint: '#18202f', push: .03,
    draw: function (g, t, lt) {
      P.luopan(g, 540, 860, 1.7, t, { a: .14, spin: .5 });
      var gridA = L.seg(t, 39.9, 40.6), eg = E.io(gridA), hexX = L.lerp(540, 932, eg), hexY = L.lerp(980, 488, eg), hexS = gridA >= 1 ? 0 : L.lerp(1, .14, eg);
      // the three coins: one throw per line
      var throwA = L.win(t, 30.2, 37.6, .4, .4);
      if (throwA > 0) {
        S.HITS.throw.forEach(function () { });
        var ti = -1; S.HITS.throw.forEach(function (x, i) { if (t >= x) ti = i; });
        [380, 540, 700].forEach(function (x, j) {
          var tt = ti >= 0 ? t - S.HITS.throw[ti] : 0, hop = ti >= 0 && ti < 6 && tt < .42 ? Math.sin(Math.PI * tt / .42) * 180 : 0;
          var res = ti >= 0 ? ((TAI[ti] + j) % 3 === 0) : true;   // a plausible spread of faces
          var f = ti >= 0 && tt < .42 ? tt * 30 : (res ? 0 : Math.PI);
          P.coin(g, x, 470 - hop, .58, f, j * .5, { a: throwA });
        });
      }
      // the hexagram growing from the bottom
      var slots = 6;
      if (hexS > 0) {
        g.save(); g.translate(hexX, hexY); g.scale(hexS, hexS);
        for (var i = 0; i < slots; i++) {
          var y = 230 - i * 92, show = t >= S.HITS.throw[i] + .2 ? E.out3(L.seg(t, S.HITS.throw[i] + .2, S.HITS.throw[i] + .5)) : 0;
          var slot = L.rrect(-230, y - 26, 460, 52, 6); L.gline(g, slot, 1, { a: .35, glow: 0, dash: [8, 10] });
          if (show > 0) {
            var hl = t > 35 && t < 37.5 ? .5 + .5 * Math.sin(t * 6 + i) : 0;
            if (hl > 0) L.dot(g, 0, y, 260, '#ffd796', hl * .3);
            P.hex(g, 0, y, 460 * show, 52, [TAI[i]], { glow: 14 });
            L.text(g, ['初', '二', '三', '四', '五', '上'][i] + (TAI[i] ? '九' : '六'), -330, y, 34, { weight: 700, fill: C.ivory, reveal: function () { return show; } });
          }
        }
        var nm = L.seg(t, 37.6, 38.2);
        if (nm > 0) { L.text(g, '泰', 330, -40, 150, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return nm; } }); L.text(g, '地天泰', 330, 70, 36, { weight: 700, fill: C.ivory, track: .2, reveal: function () { return nm; } }); }
        g.restore();
      }
      // 35–37.5: the yin/yang key
      var ka = L.win(t, 35, 37.6, .3, .3);
      if (ka > 0) {
        P.hex(g, 300, 1330, 200, 40, [1], { a: ka, glow: 10 }); L.text(g, '阳', 300, 1390, 44, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return ka; } });
        P.hex(g, 780, 1330, 200, 40, [0], { a: ka, glow: 10 }); L.text(g, '阴', 780, 1390, 44, { font: 'brush', weight: 400, fill: 'gold', reveal: function () { return ka; } });
      }
      // 40–45: sixty-four
      if (gridA > 0) {
        var bin = L.seg(t, 42.5, 43.3);
        SH.grid64(g, 540, 900, 112, t, { reveal: function (i) { return L.seg(t, 40 + (i % 8 + Math.floor(i / 8)) * .06, 40.4 + (i % 8 + Math.floor(i / 8)) * .06); }, binary: bin, bright: function (i) { return i === 7 ? 1 : .55 + .1 * Math.sin(t * 2 + i); } });
        L.text(g, '2⁶ = 64', 540, 400, 96, { weight: 900, fill: 'gold', reveal: function (i) { return L.seg(t, 40.4 + i * .06, 40.8 + i * .06) * (1 - L.seg(t, 42.3, 42.6)); } });
        if (bin > 0) { L.text(g, 'Leibniz · 1703', 540, 400, 64, { font: 'brush', weight: 400, fill: 'gold', reveal: function (i) { return L.seg(t, 42.6 + i * .04, 43 + i * .04); } }); L.text(g, '阳 = 1   阴 = 0', 540, 1400 - 40, 40, { weight: 700, fill: C.q, reveal: function () { return bin; } }); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
