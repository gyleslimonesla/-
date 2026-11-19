/* sc4.js — what fortune-telling really collapses (122.5–140) and the ending (140–150). */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, F = G.FILM, P = G.PROPS, S = G.SCRIPT;
  var PX = 540, PY = 1190;
  function person(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.scale(s, s);
    var body = new Path2D(); body.moveTo(-70, 60); body.bezierCurveTo(-70, -30, -40, -60, 0, -60); body.bezierCurveTo(40, -60, 70, -30, 70, 60); body.closePath();
    L.sticker(g, body, col || C.cyan, { lw: 6, sh: [6, 8] });
    L.sticker(g, L.circle(0, -105, 44), '#ffd9b0', { lw: 6, sh: [6, 8] });
    g.fillStyle = C.ink; g.beginPath(); g.arc(-14, -108, 5, 0, 6.3); g.arc(14, -108, 5, 0, 6.3); g.fill();
    g.restore();
  }
  // possible futures: branching rainbow paths up from the person
  var BR = (function () {
    var r = L.rng(12), out = [];
    for (var i = 0; i < 9; i++) {
      var ang = -Math.PI / 2 + (i - 4) * .26, pts = [[PX, PY - 140]], x = PX, y = PY - 140, a = ang;
      for (var j = 0; j < 7; j++) { a += r.range(-.25, .25); x += Math.cos(a) * 90; y += Math.sin(a) * 90; pts.push([x, y]); }
      out.push({ pts: pts, c: L.rain(i / 9) });
    }
    return out;
  })();
  function drawBranches(g, t, grow, keep, fade) {
    BR.forEach(function (b, i) {
      var a = i === keep ? 1 : 1 - fade; if (a <= 0) return;
      var n = Math.max(2, Math.ceil(b.pts.length * grow)), p = new Path2D(); L.curve(p, b.pts.slice(0, n), false, .8);
      g.save(); g.globalAlpha = a; L.neon(g, p, i === keep && fade > 0 ? C.yellow : b.c, i === keep && fade > 0 ? 12 : 7, 22); g.restore();
      if (grow >= 1) L.dot(g, b.pts[b.pts.length - 1][0], b.pts[b.pts.length - 1][1], 40 + 10 * F.beat(t), b.c, a * .9);
    });
  }

  F.scene({
    id: 'mind', trIn: 'iris', focusIn: [790, 860],
    pal: { base: '#0d1030', blobs: [C.cyan, C.pink, C.violet, C.mint], grid: C.sky },
    build: function () { G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '八字星座塔罗你外表随和内心有自己的坚持你有很多未发挥的潜力你有时外向有时内向准相信退缩不顺更信今年不顺应验'; },
    draw: function (g, t, lt) {
      // 122.5–127.5: futures, then a slip lands and one path is chosen
      var A = 1 - E.in3(L.seg(t, 127.2, 127.7));
      if (A > 0) {
        g.save(); g.globalAlpha = A;
        drawBranches(g, t, E.out3(L.seg(t, 122.7, 123.8)), 6, E.io(L.seg(t, 125.2, 126.2)));
        var sl = E.out3(L.seg(t, 124.6, 125.2));
        if (sl > 0) { var sy = L.lerp(300, PY - 230, sl); g.save(); g.translate(PX + 60, sy); g.rotate(.3 - sl * .25); var slip = L.rrect(-60, -130, 120, 260, 14); L.sticker(g, slip, C.white, { lw: 6, sh: [6, 8] }); g.strokeStyle = C.red; g.lineWidth = 5; g.strokeRect(-44, -114, 88, 228); g.font = '900 44px ' + L.FONT.sans; g.fillStyle = C.red; g.textAlign = 'center'; g.textBaseline = 'middle'; Array.from('今年不顺').forEach(function (ch, i) { g.fillText(ch, 0, -78 + i * 52); }); g.restore(); }
        person(g, PX, PY, 1.3, C.cyan);
        g.restore();
      }
      // 127.5–132.5: Barnum — three cards, then "准!" stamps on the beats
      var B = L.win(t, 127.5, 132.7, .2, .3);
      if (B > 0) {
        var cards = [['八字', ['你外表随和', '内心有自己的坚持'], C.magenta], ['星座', ['你有很多', '未发挥的潜力'], C.violet], ['塔罗', ['你有时外向', '有时内向'], C.blue]];
        cards.forEach(function (c, i) {
          var z = E.back(L.seg(t, 127.6 + i * .5, 128.0 + i * .5), 1.8); if (z <= 0) return;
          var x = 540 + (i - 1) * 300, y = 860 + Math.abs(i - 1) * 40, rot = (i - 1) * .16;
          g.save(); g.globalAlpha = B; P.card(g, x, y, 330, 460, rot, c[2], c[0], c[1], { s: z }); g.restore();
          var st = E.back(L.seg(t, S.HITS.stamp[i], S.HITS.stamp[i] + .22), 3);
          if (st > 0) {
            g.save(); g.globalAlpha = B; g.translate(x + 40, y + 120); g.rotate(-.3); g.scale(2.2 - 1.2 * st, 2.2 - 1.2 * st);
            g.lineWidth = 10; g.strokeStyle = C.red; g.beginPath(); g.arc(0, 0, 78, 0, 6.3); g.stroke();
            L.text(g, '准！', 4, 4, 70, { font: 'disp', weight: 400, fill: C.red, shadow: false, marker: false }); g.restore();
          }
        });
      }
      // 132.5–140: the self-fulfilling loop
      var D = E.back(L.seg(t, 132.6, 133.2), 1.4);
      if (D > 0) {
        var cx = 540, cy = 860, R = 300 * D;
        var ring = L.circle(cx, cy, R); L.neon(g, ring, C.mint, 10, 30);
        var ph = ((t - 132.5) / S.BAR) % 1;
        for (var k = 0; k < 4; k++) { var aa = -Math.PI / 2 + k * Math.PI / 2 + .45; var ah = new Path2D(); ah.moveTo(cx + Math.cos(aa - .12) * (R - 26), cy + Math.sin(aa - .12) * (R - 26)); ah.lineTo(cx + Math.cos(aa) * R, cy + Math.sin(aa) * R); ah.lineTo(cx + Math.cos(aa - .12) * (R + 26), cy + Math.sin(aa - .12) * (R + 26)); g.lineWidth = 10; g.lineJoin = 'round'; g.strokeStyle = C.mint; g.stroke(ah); }
        var da = -Math.PI / 2 + ph * Math.PI * 2; L.dot(g, cx + Math.cos(da) * R, cy + Math.sin(da) * R, 70, C.yellow, 1);
        [['相信', C.yellow], ['退缩', C.pink], ['不顺', C.orange], ['更信', C.cyan]].forEach(function (q, k) {
          var a = -Math.PI / 2 + k * Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, near = Math.max(0, Math.cos(da - a)), z = D * (1 + .2 * Math.pow(near, 8));
          g.save(); g.translate(x, y); g.scale(z, z); var pl = L.rrect(-95, -48, 190, 96, 48); L.sticker(g, pl, q[1], { lw: 6, sh: [6, 8] }); L.text(g, q[0], 0, 3, 50, { fill: C.ink, shadow: false, marker: false }); g.restore();
        });
        var ya = E.back(L.seg(t, 137.5, 137.8), 3);
        if (ya > 0) { g.save(); g.translate(cx, cy); g.rotate(-.2); g.scale(2.2 - 1.2 * ya, 2.2 - 1.2 * ya); g.lineWidth = 12; g.strokeStyle = C.red; g.beginPath(); g.arc(0, 0, 120, 0, 6.3); g.stroke(); L.text(g, '应验', 0, 6, 92, { font: 'disp', weight: 400, fill: C.red, shadow: false, marker: false }); g.restore(); }
        else { g.save(); g.translate(cx, cy); var slip2 = L.rrect(-50, -110, 100, 220, 12); L.sticker(g, slip2, C.white, { lw: 5, sh: [5, 7] }); g.font = '900 36px ' + L.FONT.sans; g.fillStyle = C.red; g.textAlign = 'center'; g.textBaseline = 'middle'; Array.from('今年不顺').forEach(function (ch, i) { g.fillText(ch, 0, -66 + i * 44); }); g.restore(); }
      }
    }
  });

  /* ---------------- ending ---------------- */
  var COL = S.HITS.collapse[1];
  F.scene({
    id: 'outro', trIn: 'iris', focusIn: [540, 860],
    pal: { base: '#140a33', blobs: [C.magenta, C.cyan, C.yellow, C.violet], grid: C.lilac },
    build: function () {
      var r = L.rng(77); this.pts = [];
      for (var i = 0; i < 160; i++) this.pts.push({ a: r() * 6.283, r: r.range(80, 420), w: r.range(.4, 1.4) * (r() < .5 ? -1 : 1), c: L.rain(r()), s: r.range(14, 40), tx: r.range(-90, 90), ty: r.range(-90, 90) });
      G.EXTRA_TEXT = (G.EXTRA_TEXT || '') + '你上上签自己抽';
    },
    draw: function (g, t, lt) {
      var cx = 540, cy = 780, col = E.in3(L.seg(t, COL - .5, COL)), post = t >= COL;
      // futures again, faint, from the person
      g.save(); g.globalAlpha = .6 * (1 - L.seg(t, 145, 146)); drawBranches(g, t, E.out3(L.seg(t, 140.2, 141.4)), -1, 0); g.restore();
      // the cloud of possibilities → the word 你
      if (!post || t < COL + .4) {
        g.save(); g.globalCompositeOperation = 'lighter'; var fa = post ? 1 - L.seg(t, COL, COL + .4) : 1;
        this.pts.forEach(function (p) {
          var a = p.a + p.w * t, r = p.r * (1 - col), x = cx + Math.cos(a) * r * 1.1 + p.tx * col * .4, y = cy + Math.sin(a) * r * .8 + p.ty * col * .4;
          L.dot(g, x, y, p.s * (1 + .4 * F.beat(t)), p.c, .8 * fa);
        });
        g.restore();
      }
      if (post) {
        var u = t - COL;
        for (var q = 0; q < 3; q++) { var a = u - q * .12; if (a < 0) continue; g.save(); g.globalAlpha = Math.max(0, 1 - a * 1.2); L.neon(g, L.circle(cx, cy, 40 + a * 1100), L.RAINBOW[q * 2 + 1], 12, 34); g.restore(); }
        var z = E.back(L.seg(t, COL, COL + .35), 2.4);
        g.save(); g.translate(cx, cy); g.scale(z, z);
        var gr = g.createLinearGradient(-200, -200, 200, 200); L.RAINBOW.forEach(function (c, i) { gr.addColorStop(i / 6, c); });
        L.text(g, '你', 0, 0, 400, { font: 'sans', weight: 900, fill: gr, stroke: 22, shadow: [14, 18, C.ink], marker: false, pop: false });
        g.restore();
        // the end card: 上上签 · 自己抽
        var e = E.back(L.seg(t, 147.5, 148.0), 1.6);
        if (e > 0) {
          P.stick(g, 870, 1290, 640 * e, .28, '上上签', C.red, { w: 82 });
          g.save(); g.translate(540, 1160); g.scale(e, e); var pl = L.rrect(-250, -56, 500, 112, 56); L.sticker(g, pl, C.yellow, { lw: 7, sh: [8, 10] });
          L.text(g, '上上签 · 自己抽', 0, 3, 58, { fill: C.ink, shadow: false, marker: false }); g.restore();
          L.text(g, S.TITLE, 540, 420, 64, { font: 'disp', weight: 400, fill: C.white, stroke: 10, shadow: [5, 6, C.magenta], marker: false, reveal: function (i) { return L.seg(t, 148 + i * .08, 148.3 + i * .08); } });
        }
      }
      var pa = 1 - L.seg(t, 145.7, 146.2); if (pa > 0) { g.save(); g.globalAlpha = pa; person(g, PX, PY + 40, 1.1, C.cyan); g.restore(); }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
