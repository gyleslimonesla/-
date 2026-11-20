/* props.js — 罗盘, 铜钱, 卦, 浑天仪(布洛赫球), 天眼, 齿轮, all as gilt engraving. */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, P = G.PROPS = {};
  var TAU = Math.PI * 2;

  /** hexagram: bits[0] = bottom line; 1 = yang (solid), 0 = yin (broken). centred at x,y */
  P.hex = function (g, x, y, w, h, bits, o) {
    o = o || {}; var n = bits.length, lh = h / (n * 1.7 - .7), gap = lh * .7, col = o.col || L.GOLD;
    g.save(); g.translate(x, y); if (o.a !== undefined) g.globalAlpha *= o.a;
    if (o.glow) { g.shadowColor = o.glowCol || 'rgba(255,196,110,.6)'; g.shadowBlur = o.glow * L.k; }
    g.fillStyle = col;
    for (var i = 0; i < n; i++) {
      var yy = h / 2 - lh - i * (lh + gap), show = o.reveal === undefined ? 1 : L.clamp(o.reveal * n - i, 0, 1);
      if (show <= 0) continue;
      var ww = w * E.out3(show);
      if (bits[i]) g.fillRect(-ww / 2, yy, ww, lh);
      else { var half = ww * .42; g.fillRect(-ww / 2, yy, half, lh); g.fillRect(ww / 2 - half, yy, half, lh); }
    }
    g.restore();
  };
  P.bits = function (n) { var b = []; for (var i = 0; i < 6; i++) b.push((n >> i) & 1); return b; };   // Fu Xi order: bit 0 = bottom line

  /* ---------------- 罗盘 luopan ---------------- */
  var TRI = [[1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1], [1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]]; // 乾兑离震巽坎艮坤 (bottom→top)
  var MOUNT = Array.from('子癸丑艮寅甲卯乙辰巽巳丙午丁未坤申庚酉辛戌乾亥壬');
  P.buildLuopan = function () {
    function ring(R, fn) { return L.sprite(R * 2 + 40, R * 2 + 40, fn, R + 20, R + 20); }
    var gold = function (g, R) { return L.goldGrad(g, -R, -R, R, R); };
    P.lp = {
      plate: ring(470, function (g) {
        var sq = new Path2D(); sq.rect(-455, -455, 910, 910); g.strokeStyle = 'rgba(217,176,106,.35)'; g.lineWidth = 3; g.stroke(sq);
        sq = new Path2D(); sq.rect(-440, -440, 880, 880); g.lineWidth = 1; g.stroke(sq);
        g.strokeStyle = 'rgba(217,176,106,.25)'; g.beginPath(); g.moveTo(-455, 0); g.lineTo(455, 0); g.moveTo(0, -455); g.lineTo(0, 455); g.stroke();
        var disc = L.circle(0, 0, 400); var dg = g.createRadialGradient(0, 0, 60, 0, 0, 400); dg.addColorStop(0, '#2b2618'); dg.addColorStop(1, '#12100c'); g.fillStyle = dg; g.fill(disc);
      }),
      tick: ring(400, function (g) {
        g.strokeStyle = gold(g, 400);
        for (var i = 0; i < 360; i++) { var a = i / 360 * TAU, r0 = i % 10 ? 380 : 366, r1 = 396; g.lineWidth = i % 10 ? 1.4 : 2.6; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke(); }
        g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 398, 0, TAU); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 362, 0, TAU); g.stroke();
      }),
      hex64: ring(360, function (g) {
        g.strokeStyle = gold(g, 360); g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 300, 0, TAU); g.stroke();
        for (var i = 0; i < 64; i++) {
          var a = i / 64 * TAU - Math.PI / 2; g.save(); g.translate(Math.cos(a) * 330, Math.sin(a) * 330); g.rotate(a + Math.PI / 2);
          P.hex(g, 0, 0, 22, 44, P.bits(i), { col: gold(g, 30) }); g.restore();
          g.save(); g.rotate(a + Math.PI / 64); g.beginPath(); g.moveTo(300, 0); g.lineTo(360, 0); g.strokeStyle = 'rgba(217,176,106,.35)'; g.lineWidth = 1; g.stroke(); g.restore();
        }
      }),
      mount: ring(300, function (g) {
        g.strokeStyle = gold(g, 300); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 228, 0, TAU); g.stroke();
        g.font = '700 34px ' + L.FONT.serif; g.textAlign = 'center'; g.textBaseline = 'middle';
        MOUNT.forEach(function (ch, i) {
          var a = i / 24 * TAU - Math.PI / 2; g.save(); g.translate(Math.cos(a) * 264, Math.sin(a) * 264); g.rotate(a + Math.PI / 2);
          g.fillStyle = '子午卯酉'.indexOf(ch) >= 0 ? C.cinL : '#e7c27a'; g.fillText(ch, 0, 0); g.restore();
          g.save(); g.rotate(a + Math.PI / 24); g.beginPath(); g.moveTo(228, 0); g.lineTo(298, 0); g.strokeStyle = 'rgba(217,176,106,.4)'; g.lineWidth = 1; g.stroke(); g.restore();
        });
      }),
      tri: ring(228, function (g) {
        g.strokeStyle = gold(g, 228); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 130, 0, TAU); g.stroke();
        var names = Array.from('乾兑离震巽坎艮坤');
        TRI.forEach(function (b, i) {
          var a = i / 8 * TAU - Math.PI / 2; g.save(); g.translate(Math.cos(a) * 178, Math.sin(a) * 178); g.rotate(a + Math.PI / 2);
          P.hex(g, 0, -6, 58, 46, b, { col: gold(g, 40) });
          g.font = '500 20px ' + L.FONT.serif; g.fillStyle = 'rgba(239,230,210,.7)'; g.textAlign = 'center'; g.fillText(names[i], 0, 38); g.restore();
        });
      }),
      core: ring(130, function (g) {
        var d = L.circle(0, 0, 112); var dg = g.createRadialGradient(-20, -20, 10, 0, 0, 112); dg.addColorStop(0, '#3a3220'); dg.addColorStop(1, '#16130c'); g.fillStyle = dg; g.fill(d);
        g.strokeStyle = L.goldGrad(g, -112, -112, 112, 112); g.lineWidth = 4; g.stroke(d);
        g.strokeStyle = 'rgba(196,61,44,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-112, 0); g.lineTo(112, 0); g.moveTo(0, -112); g.lineTo(0, 112); g.stroke();
      })
    };
  };
  /** draw the luopan. rot: base rotation; spin: how lively the rings turn */
  P.luopan = function (g, x, y, s, t, o) {
    o = o || {}; var lp = P.lp, a = o.a === undefined ? 1 : o.a, sp = o.spin === undefined ? 1 : o.spin, rv = o.reveal === undefined ? 1 : o.reveal;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
    L.blit(g, lp.plate, 0, 0, 1, 0, rv);
    [[lp.tick, .02, .2], [lp.hex64, -.05, .35], [lp.mount, .07, .5], [lp.tri, -.11, .65], [lp.core, 0, .8]].forEach(function (q, i) {
      var show = L.clamp((rv - q[2] * .6) * 2.5, 0, 1); if (show <= 0) return;
      L.blit(g, q[0], 0, 0, .9 + .1 * E.out3(show), t * q[1] * sp + (o.kick || 0) * (i % 2 ? -1 : 1), show);
    });
    // needle (south end cinnabar)
    var na = (o.needle !== undefined ? o.needle : Math.sin(t * .9) * .25 + Math.sin(t * 2.3) * .06);
    g.save(); g.rotate(na); g.globalAlpha *= L.clamp((rv - .7) * 3, 0, 1);
    var nd = new Path2D(); nd.moveTo(0, -100); nd.lineTo(9, 0); nd.lineTo(0, 100); nd.lineTo(-9, 0); nd.closePath();
    g.save(); g.clip(nd); g.fillStyle = '#e8c27a'; g.fillRect(-12, -100, 24, 100); g.fillStyle = C.cinnabar; g.fillRect(-12, 0, 24, 100); g.restore();
    L.gline(g, nd, 1.5, { glow: 8, col: '#fff0c6' });
    g.fillStyle = '#fff0c6'; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill();
    g.restore();
    g.restore();
  };

  /* ---------------- 开元通宝 ---------------- */
  P.buildCoin = function () {
    var R = 130;
    function face(front) {
      return L.sprite(R * 2 + 20, R * 2 + 20, function (g) {
        var outer = L.circle(0, 0, R), hole = new Path2D(); hole.rect(-R * .27, -R * .27, R * .54, R * .54);
        var body = new Path2D(); body.addPath(outer); body.addPath(hole);
        var gr = g.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, '#b98a45'); gr.addColorStop(.35, '#f2d28e'); gr.addColorStop(.55, '#c8974e'); gr.addColorStop(1, '#6e4f22');
        g.fillStyle = gr; g.fill(body, 'evenodd');
        // patina field
        var field = L.circle(0, 0, R * .84); var fg = g.createRadialGradient(-R * .3, -R * .3, 10, 0, 0, R * .9); fg.addColorStop(0, 'rgba(120,85,35,.15)'); fg.addColorStop(1, 'rgba(60,40,15,.45)');
        g.save(); g.clip(body, 'evenodd'); g.fillStyle = fg; g.fill(field); g.restore();
        g.strokeStyle = '#5a3f18'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * .84, 0, TAU); g.stroke();
        g.strokeStyle = '#fff0c6'; g.lineWidth = 1.5; g.beginPath(); g.arc(-1, -1, R * .86, Math.PI * .9, Math.PI * 1.7); g.stroke();
        g.strokeStyle = '#5a3f18'; g.lineWidth = 3; g.strokeRect(-R * .3, -R * .3, R * .6, R * .6);
        if (front) {
          g.font = '700 ' + (R * .42) + 'px ' + L.FONT.serif; g.textAlign = 'center'; g.textBaseline = 'middle';
          [['开', 0, -R * .57], ['元', 0, R * .57], ['通', R * .57, 0], ['宝', -R * .57, 0]].forEach(function (q) {
            g.fillStyle = '#4a3212'; g.fillText(q[0], q[1] + 2, q[2] + 2); g.fillStyle = '#f6dc9c'; g.fillText(q[0], q[1], q[2]);
          });
        } else {
          g.strokeStyle = '#f6dc9c'; g.lineWidth = 6; g.beginPath(); g.arc(0, -R * .2, R * .5, Math.PI * 1.25, Math.PI * 1.75); g.stroke();   // 月纹
        }
        g.strokeStyle = 'rgba(40,25,8,.7)'; g.lineWidth = 2.5; g.stroke(outer);
      }, R + 10, R + 10);
    }
    P.coinF = face(true); P.coinB = face(false); P.coinR = R;
  };
  /** a coin seen at flip angle f (0 = face up toward viewer), spin = in-plane rotation, scale s */
  P.coin = function (g, x, y, s, f, spin, o) {
    o = o || {}; var c = Math.cos(f), sideUp = c >= 0, R = P.coinR * s, th = 12 * s;
    g.save(); g.translate(x, y); g.rotate(spin || 0); if (o.a !== undefined) g.globalAlpha *= o.a;
    // edge (thickness)
    var sy = Math.max(.04, Math.abs(c));
    g.save(); g.scale(1, sy); g.fillStyle = '#5c4119'; g.beginPath(); g.ellipse(0, th / sy * Math.sign(Math.sin(f) || 1) * .5, R, R, 0, 0, TAU); g.fill(); g.restore();
    g.save(); g.scale(1, sy); L.blit(g, sideUp ? P.coinF : P.coinB, 0, 0, s, 0, 1); g.restore();
    if (o.glint) L.dot(g, -R * .3, -R * .3 * sy, 90 * s, '#fff2cc', o.glint);
    g.restore();
  };

  /* ---------------- 浑天仪 / Bloch sphere ---------------- */
  function proj(v, ry, tilt) {
    var x = v[0] * Math.cos(ry) + v[2] * Math.sin(ry), z = -v[0] * Math.sin(ry) + v[2] * Math.cos(ry), y = v[1];
    var y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    return [x, -y2, z2];
  }
  function ring3(g, cx, cy, R, fn, ry, tilt, w, col, a, glow) {
    var front = new Path2D(), back = new Path2D(), pf = null, pb = null;
    for (var i = 0; i <= 120; i++) {
      var v = fn(i / 120 * TAU), p = proj(v, ry, tilt), X = cx + p[0] * R, Y = cy + p[1] * R;
      if (p[2] >= 0) { if (pf) front.lineTo(X, Y); else front.moveTo(X, Y); pf = 1; pb = null; } else { if (pb) back.lineTo(X, Y); else back.moveTo(X, Y); pb = 1; pf = null; }
    }
    L.gline(g, back, w * .7, { col: col, a: a * .3, glow: 0 });
    L.gline(g, front, w, { col: col, a: a, glow: glow === undefined ? 10 : glow });
  }
  /** st: {th, ph, len} state (θ from 阳 pole), o:{a, ry, tilt, label} */
  P.armillary = function (g, cx, cy, R, t, st, o) {
    o = o || {}; var a = o.a === undefined ? 1 : o.a, ry = o.ry === undefined ? t * .35 : o.ry, tilt = o.tilt === undefined ? .32 : o.tilt;
    var gold = L.goldGrad(g, cx - R, cy - R, cx + R, cy + R);
    g.save();
    // base
    var base = new Path2D(); base.moveTo(cx - R * .55, cy + R * 1.55); base.quadraticCurveTo(cx - R * .1, cy + R * 1.35, cx, cy + R * 1.1); base.quadraticCurveTo(cx + R * .1, cy + R * 1.35, cx + R * .55, cy + R * 1.55);
    base.moveTo(cx - R * .7, cy + R * 1.58); base.lineTo(cx + R * .7, cy + R * 1.58);
    L.gline(g, base, 4, { col: gold, a: a * .9 });
    // outer fixed meridian ring (thick, with ticks)
    var mer = L.circle(cx, cy, R * 1.12); L.gline(g, mer, 7, { col: gold, a: a, glow: 14 });
    g.save(); g.globalAlpha *= a * .7; g.strokeStyle = gold; g.lineWidth = 1.5;
    for (var i = 0; i < 72; i++) { var an = i / 72 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(an) * R * 1.12, cy + Math.sin(an) * R * 1.12); g.lineTo(cx + Math.cos(an) * R * (i % 6 ? 1.17 : 1.21), cy + Math.sin(an) * R * (i % 6 ? 1.17 : 1.21)); g.stroke(); }
    g.restore();
    // sphere silhouette
    g.save(); g.globalAlpha *= a; var sg = g.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R); sg.addColorStop(0, 'rgba(154,216,212,.16)'); sg.addColorStop(1, 'rgba(154,216,212,.02)'); g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill(); g.restore();
    L.gline(g, L.circle(cx, cy, R), 1.5, { col: 'rgba(154,216,212,.5)', a: a, glow: 0 });
    // rotating rings: equator, two meridians, tropics
    ring3(g, cx, cy, R, function (u) { return [Math.cos(u), 0, Math.sin(u)]; }, ry, tilt, 4, gold, a);
    ring3(g, cx, cy, R, function (u) { return [Math.cos(u), Math.sin(u), 0]; }, ry, tilt, 3, gold, a);
    ring3(g, cx, cy, R, function (u) { return [0, Math.sin(u), Math.cos(u)]; }, ry, tilt, 3, gold, a);
    [.5, -.5].forEach(function (yy) { var rr = Math.sqrt(1 - yy * yy); ring3(g, cx, cy, R, function (u) { return [Math.cos(u) * rr, yy, Math.sin(u) * rr]; }, ry, tilt, 1.5, gold, a * .6, 0); });
    // polar axis
    var pN = proj([0, 1.3, 0], ry, tilt), pS = proj([0, -1.3, 0], ry, tilt);
    var ax = new Path2D(); ax.moveTo(cx + pN[0] * R, cy + pN[1] * R); ax.lineTo(cx + pS[0] * R, cy + pS[1] * R); L.gline(g, ax, 2, { col: gold, a: a * .8, glow: 0 });
    // pole labels
    if (o.label !== false) {
      var n = proj([0, 1.42, 0], ry, tilt), s = proj([0, -1.42, 0], ry, tilt);
      g.save(); g.globalAlpha *= a;
      L.text(g, '阳 |1⟩', cx + n[0] * R, cy + n[1] * R - 10, 40, { weight: 700, fill: 'gold' });
      L.text(g, '阴 |0⟩', cx + s[0] * R, cy + s[1] * R + 14, 40, { weight: 700, fill: 'gold' });
      g.restore();
    }
    // the state arrow
    if (st) {
      var len = st.len === undefined ? 1 : st.len, v = [Math.sin(st.th) * Math.cos(st.ph) * len, Math.cos(st.th) * len, Math.sin(st.th) * Math.sin(st.ph) * len], p = proj(v, ry, tilt);
      var tx = cx + p[0] * R, ty = cy + p[1] * R, ar = new Path2D(); ar.moveTo(cx, cy); ar.lineTo(tx, ty);
      L.gline(g, ar, 6, { col: C.q, a: a, glow: 18, glowCol: 'rgba(154,216,212,.9)' });
      L.dot(g, tx, ty, 70, C.q, a); L.dot(g, cx, cy, 30, C.q, a * .7);
      g.save(); g.globalAlpha *= a; g.fillStyle = '#e9fffd'; g.beginPath(); g.arc(tx, ty, 10, 0, TAU); g.fill(); g.restore();
    }
    g.restore();
  };

  /* ---------------- 天眼 ---------------- */
  P.eye = function (g, x, y, s, open, t, o) {
    o = o || {}; g.save(); g.translate(x, y); g.scale(s, s); if (o.a !== undefined) g.globalAlpha *= o.a;
    var W = 380, h = 200 * open, gold = L.goldGrad(g, -W, -h, W, h);
    var lid = new Path2D(); lid.moveTo(-W, 0); lid.quadraticCurveTo(0, -h * 1.6, W, 0); lid.quadraticCurveTo(0, h * 1.6, -W, 0); lid.closePath();
    g.save(); g.clip(lid);
    g.fillStyle = 'rgba(10,12,20,.85)'; g.fillRect(-W, -300, W * 2, 600);
    var ir = 160; g.strokeStyle = gold; g.lineWidth = 1.4;
    for (var i = 0; i < 72; i++) { var a = i / 72 * TAU + t * .05; g.beginPath(); g.moveTo(Math.cos(a) * 70, Math.sin(a) * 70); g.lineTo(Math.cos(a) * ir, Math.sin(a) * ir); g.stroke(); }
    L.gline(g, L.circle(0, 0, ir), 5, { col: gold, glow: 14 });
    // taiji pupil, line art + fill
    g.save(); g.rotate(t * .8); var R = 64 * (o.pupil || 1);
    g.fillStyle = '#f2dfae'; g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); g.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); g.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2); g.closePath(); g.fill();
    g.fillStyle = '#0b0c12'; g.beginPath(); g.arc(0, -R / 2, R * .14, 0, TAU); g.fill(); g.fillStyle = '#f2dfae'; g.beginPath(); g.arc(0, R / 2, R * .14, 0, TAU); g.fill();
    L.gline(g, L.circle(0, 0, R), 3, { col: gold, glow: 10 });
    g.restore();
    g.restore();
    L.gline(g, lid, 5, { col: gold, glow: 20 });
    var lid2 = new Path2D(); lid2.moveTo(-W * .92, -10); lid2.quadraticCurveTo(0, -h * 1.85, W * .92, -10); L.gline(g, lid2, 2, { col: gold, a: .6 });
    g.restore();
  };

  P.gear = function (r, teeth) {
    var p = new Path2D(), n = teeth || 12;
    for (var i = 0; i < n * 2; i++) { var a0 = i / (n * 2) * TAU, a1 = (i + 1) / (n * 2) * TAU, R = i % 2 ? r * .84 : r; if (!i) p.moveTo(Math.cos(a0) * R, Math.sin(a0) * R); p.lineTo(Math.cos(a0 + .03) * R, Math.sin(a0 + .03) * R); p.lineTo(Math.cos(a1 - .03) * R, Math.sin(a1 - .03) * R); }
    p.closePath(); p.moveTo(r * .55, 0); p.arc(0, 0, r * .55, 0, TAU); p.moveTo(r * .16, 0); p.arc(0, 0, r * .16, 0, TAU);
    for (i = 0; i < 6; i++) { var a = i / 6 * TAU; p.moveTo(Math.cos(a) * r * .16, Math.sin(a) * r * .16); p.lineTo(Math.cos(a) * r * .55, Math.sin(a) * r * .55); }
    return p;
  };
  P.build = function () { P.buildLuopan(); P.buildCoin(); };
})(typeof window !== 'undefined' ? window : globalThis);
