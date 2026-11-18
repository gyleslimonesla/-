/* s3.js — 四「落水」(bar 4: a petal lands on each beat; two koi circle) and 五「风起」(bar 5: petals whirl in the moon gate and burst on the big accent). */
(function (G) {
  'use strict';
  var L = G.L, F = G.FILM, T = G.TIMING, P = L.P, E = L.E;

  /* ---- koi, top view, drawn live along a circular swim path ---- */
  var PROF = [.62, .9, 1, .98, .9, .78, .62, .46, .32, .2, .13];
  function prof(s) { var x = s * (PROF.length - 1), i = Math.floor(x), f = x - i; return L.lerp(PROF[i], PROF[Math.min(PROF.length - 1, i + 1)], f); }
  L.koi = function (g, o, t) {
    // o: {cx, cy, R, th0, w (rad/s), len, wid, col, spot, spots[], dir}
    var th = o.th0 + o.w * t, n = 16, pts = [], sgn = o.w > 0 ? 1 : -1;
    for (var i = 0; i <= n; i++) {
      var s = i / n, a = th - sgn * s * o.len / o.R, wave = Math.sin(t * 6.5 - s * 4.2) * s * s * o.wid * .55;
      var r = o.R + wave;
      pts.push([o.cx + Math.cos(a) * r, o.cy + Math.sin(a) * r]);
    }
    var left = [], right = [];
    for (i = 0; i <= n; i++) {
      var A = pts[Math.max(0, i - 1)], B = pts[Math.min(n, i + 1)], dx = B[0] - A[0], dy = B[1] - A[1], m = Math.hypot(dx, dy) || 1, w = prof(i / n) * o.wid / 2;
      left.push([pts[i][0] - dy / m * w, pts[i][1] + dx / m * w]); right.unshift([pts[i][0] + dy / m * w, pts[i][1] - dx / m * w]);
    }
    var hd = pts[0], hd2 = pts[1], ha = Math.atan2(hd[1] - hd2[1], hd[0] - hd2[0]);
    var body = new Path2D(); L.curve(body, left.concat(right), true, false, .8);
    body.moveTo(hd[0] + Math.cos(ha) * o.wid * .2, hd[1]); body.ellipse(hd[0] + Math.cos(ha) * o.wid * .12, hd[1] + Math.sin(ha) * o.wid * .12, o.wid * .34, o.wid * .3, ha, 0, 6.283);
    // fins
    var tl = pts[n], tl2 = pts[n - 2], ta = Math.atan2(tl[1] - tl2[1], tl[0] - tl2[0]), flap = Math.sin(t * 6.5 - 4.2) * .5;
    var fin = new Path2D();
    [-1, 1].forEach(function (sd) {
      var a = ta + sd * (.5 + flap * sd * .4), L1 = o.wid * 1.25;
      fin.moveTo(tl[0], tl[1]);
      fin.quadraticCurveTo(tl[0] + Math.cos(ta + sd * .2) * L1 * .7, tl[1] + Math.sin(ta + sd * .2) * L1 * .7, tl[0] + Math.cos(a) * L1, tl[1] + Math.sin(a) * L1);
      fin.quadraticCurveTo(tl[0] + Math.cos(ta) * L1 * .55, tl[1] + Math.sin(ta) * L1 * .55, tl[0], tl[1]);
    });
    [[3, 1.1], [8, .7]].forEach(function (q) {
      var p = pts[q[0]], p2 = pts[q[0] + 1], a0 = Math.atan2(p[1] - p2[1], p[0] - p2[0]);
      [-1, 1].forEach(function (sd) {
        var a = a0 + Math.PI + sd * (1.0 + Math.sin(t * 5 + sd) * .2), l = o.wid * .7 * q[1];
        var bx = p[0] + Math.cos(a0 + sd * 1.57) * o.wid * .4, by = p[1] + Math.sin(a0 + sd * 1.57) * o.wid * .4;
        fin.moveTo(bx, by); fin.quadraticCurveTo(bx + Math.cos(a - sd * .5) * l, by + Math.sin(a - sd * .5) * l, bx + Math.cos(a) * l, by + Math.sin(a) * l);
        fin.quadraticCurveTo(bx + Math.cos(a + sd * .3) * l * .4, by + Math.sin(a + sd * .3) * l * .4, bx, by);
      });
    });
    L.paper(g, fin, L.rgba(o.fin || '#f3e6d6', .82), { shadow: [6, 12, 14, .35], rim: 0, tex: .3 });
    L.paper(g, body, o.col, { shadow: [8, 16, 18, .5], rim: 2, rimCol: 'rgba(255,255,255,.6)', tex: .5 });
    g.save(); g.clip(body);
    g.fillStyle = o.spot;
    (o.spots || []).forEach(function (sp) {
      var p = pts[Math.round(sp[0] * n)], q = pts[Math.min(n, Math.round(sp[0] * n) + 1)], a = Math.atan2(p[1] - q[1], p[0] - q[0]);
      g.beginPath(); g.ellipse(p[0] + Math.cos(a + 1.57) * sp[1] * o.wid, p[1] + Math.sin(a + 1.57) * sp[1] * o.wid, o.wid * sp[2] * 1.4, o.wid * sp[2], a, 0, 6.283); g.fill();
    });
    // dorsal line
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); pts.slice(2, 13).forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke();
    g.restore();
    // eyes
    g.fillStyle = '#141826';
    [-1, 1].forEach(function (sd) { g.beginPath(); g.arc(hd[0] + Math.cos(ha) * o.wid * .22 + Math.cos(ha + sd * 1.57) * o.wid * .22, hd[1] + Math.sin(ha) * o.wid * .22 + Math.sin(ha + sd * 1.57) * o.wid * .22, o.wid * .045, 0, 6.283); g.fill(); });
  };

  var CX = 860, CY = 540, sp = {};
  F.scene({
    id: 'pond', t0: T.BARS[3],
    build: function () {
      sp.bg = L.sprite(L.W, L.H, function (g) {
        g.fillStyle = '#0f1a40'; g.fillRect(0, 0, L.W, L.H);
        var rings = [1150, 1000, 860, 730, 610, 500, 400, 310, 230];
        rings.forEach(function (R, i) {
          var p = new Path2D(); p.arc(CX, CY, R, 0, 6.2832);
          var c = L.mix('#14214b', '#4a69aa', i / (rings.length - 1));
          L.paper(g, p, c, { shadow: [5, 9, 22, .5], rim: 2.4, rimCol: L.light(c, .22), tex: .55 });
        });
        var r = L.rng(4); g.fillStyle = 'rgba(240,229,204,.35)';
        for (var i = 0; i < 50; i++) { g.beginPath(); g.arc(r() * L.W, r() * L.H, r() * 1.4 + .3, 0, 6.283); g.fill(); }
      });
      // lily pads
      function pad(R, seed, flower) {
        return L.sprite(R * 2.6, R * 2.6, function (g) {
          var r = L.rng(seed), a0 = r() * 6.28, p = new Path2D();
          p.moveTo(0, 0); p.arc(0, 0, R, a0 + .22, a0 + 6.283 - .22); p.closePath();
          var gr = g.createRadialGradient(-R * .3, -R * .3, 0, 0, 0, R); gr.addColorStop(0, '#5f8fa6'); gr.addColorStop(1, '#2d5574');
          L.paper(g, p, gr, { shadow: [5, 9, 12, .5], rim: 2, rimCol: '#8fb6c6', tex: .5 });
          g.strokeStyle = 'rgba(200,225,230,.25)'; g.lineWidth = 1.5;
          for (var i = 0; i < 9; i++) { var a = a0 + .5 + i * .66; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * .9, Math.sin(a) * R * .9); g.stroke(); }
          if (flower) L.blit(g, L.blossom(R * .38, flower, seed), R * .35, -R * .1, 1);
        }, R * 1.3, R * 1.3);
      }
      sp.pads = [[pad(110, 1, 'white'), 330, 820], [pad(80, 2), 470, 940], [pad(95, 3, 'plum'), 1380, 240], [pad(70, 4), 1530, 360], [pad(60, 5), 230, 180], [pad(120, 6, 'red'), 1500, 900]];
      var r = L.rng(71);
      // a petal drops on each beat of the bar, plus the two accents
      var drops = [10.03, 10.82, 11.68, 12.47, 12.91];
      sp.drops = drops.map(function (tb, i) {
        var a = r() * 6.28, d = r.range(120, 420);
        return { t: tb, x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d * .9, k: i % 6, rot: r() * 6.28, big: i >= 3 };
      });
      sp.koi = [
        { cx: CX, cy: CY, R: 230, th0: 0, w: .55, len: 300, wid: 74, col: '#f6efe2', spot: '#d2412c', spots: [[.15, .1, .45], [.4, -.15, .5], [.62, .12, .35]], fin: '#f6efe2' },
        { cx: CX, cy: CY, R: 230, th0: Math.PI, w: .55, len: 280, wid: 70, col: '#e9a94e', spot: '#f6efe2', spots: [[.2, -.1, .35], [.5, .1, .4]], fin: '#f1c477' }];
      sp.petals = L.petalField(37, 40, { v: [50, 100], s: [.5, .8], wind: 20 });
    },
    draw: function (g, t, lt) {
      var z = 1 + lt * .012;
      g.save(); g.translate(CX, CY); g.scale(z, z); g.translate(-CX, -CY);
      g.drawImage(sp.bg.c, 0, 0, L.W, L.H);
      g.restore();
      // ripples from each landed petal
      sp.drops.forEach(function (d) {
        var age = t - d.t - .32; if (age < 0) return;
        for (var q = 0; q < 3; q++) {
          var a = age - q * .22; if (a < 0) continue;
          var R = 20 + a * (d.big ? 260 : 180), al = Math.max(0, 1 - a / 2.2) * (d.big ? .8 : .6);
          g.strokeStyle = 'rgba(232,238,250,' + al + ')'; g.lineWidth = 3.2 - q * .6;
          g.beginPath(); g.ellipse(d.x, d.y, R, R * .92, 0, 0, 6.283); g.stroke();
          g.strokeStyle = 'rgba(8,14,40,' + al * .5 + ')'; g.lineWidth = 2;
          g.beginPath(); g.ellipse(d.x + 2, d.y + 4, R, R * .92, 0, 0, 6.283); g.stroke();
        }
      });
      L.koi(g, sp.koi[0], t - 10); L.koi(g, sp.koi[1], t - 10);
      sp.pads.forEach(function (p, i) { L.blit(g, p[0], p[1] + Math.sin(t * .7 + i) * 4, p[2] + Math.cos(t * .6 + i) * 4, 1, Math.sin(t * .3 + i) * .05); });
      // the petals: falling (seen from above: large and blurred-in, shrinking to the water), then floating
      sp.drops.forEach(function (d) {
        var f = L.seg(t, d.t - .5, d.t + .32); if (t < d.t - .5) return;
        var land = f >= 1, s = land ? .95 : L.lerp(3.2, .95, E.in2(f)), drift = land ? (t - d.t - .32) * 10 : 0;
        if (!land) { g.fillStyle = 'rgba(5,10,30,' + .25 * f + ')'; g.beginPath(); g.ellipse(d.x + 10, d.y + 14, 22 * f, 14 * f, 0, 0, 6.283); g.fill(); }
        L.blit(g, L.petals[d.k], d.x + drift, d.y + drift * .4 - (1 - f) * 40, s * (d.big ? 1.3 : 1), d.rot + (land ? (t - d.t) * .2 : f * 2), Math.min(1, f * 3));
      });
      L.drawPetals(g, sp.petals, t, F.gust(t, T.BEATS, 10, .5), 0, 1, .7);
    }
  });

  /* ---- 5 风起: moon gate, the petals spiral in, then burst on the accent at 15.72 s ---- */
  var GX = 820, GY = 600, GR = 330, BURST = 15.72, sv = {};
  F.scene({
    id: 'gate', t0: T.BARS[4],
    build: function () {
      sv.garden = L.sprite(L.W, L.H, function (g) {
        var gr = g.createLinearGradient(0, GY - GR, 0, GY + GR); gr.addColorStop(0, '#1a2a5e'); gr.addColorStop(1, '#3c5a9c');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        L.blit(g, L.glow(260, '#e6ecfa', .2), GX + 120, GY - 170, 1, 0, .6);
        var m = new Path2D(); m.arc(GX + 120, GY - 170, 90, 0, 6.283);
        L.paper(g, m, P.white, { shadow: false, rim: 0, tex: .5 });
        [[620, 140, '#4d6aaa', 51], [690, 100, '#33508f', 52], [770, 70, '#223a76', 53]].forEach(function (R) {
          var rg = L.ridge(GX - GR - 60, GX + GR + 60, R[0], 1200, { seed: R[3], n: 4, h: [R[1] * .5, R[1]] });
          L.paper(g, rg.path, R[2], { shadow: [3, -2, 14, .4], rim: 2.2, rimCol: L.light(R[2], .35), tex: .5 });
        });
        // a willow-ish silhouette and a far pavilion roof
        var b = L.branch(5, GX + 260, GY + 340, -1.75, 420, 40, 2, { rate: .6, bend: -.004 });
        g.fillStyle = '#16244f'; g.fill(b.path);
        var sp2 = L.blossom(20, 'plum', 9), r = L.rng(3);
        b.spots.forEach(function (s) { L.blit(g, sp2, s.x, s.y, r.range(.6, 1.1), r() * 6, .8); });
      });
      sv.wall = L.sprite(L.W + 200, L.H + 200, function (g) {
        var p = new Path2D(); p.rect(-100, 150, L.W + 200, L.H + 100); p.moveTo(GX + GR, GY); p.arc(GX, GY, GR, 0, 6.283);
        var gr = g.createLinearGradient(0, 150, 0, L.H); gr.addColorStop(0, '#5f6ea2'); gr.addColorStop(1, '#323f6e');
        L.paper(g, p, gr, { shadow: [12, 18, 40, .7], rim: 0, tex: .7, rule: 'evenodd' });
        // gate trim
        var q = new Path2D(); q.arc(GX, GY, GR + 34, 0, 6.283); q.moveTo(GX + GR, GY); q.arc(GX, GY, GR, 0, 6.283);
        L.paper(g, q, '#34447a', { shadow: [4, 8, 14, .5], rim: 2, rimCol: '#7d8fc4', tex: .6, rule: 'evenodd' });
        g.strokeStyle = P.gold; g.lineWidth = 3; g.beginPath(); g.arc(GX, GY, GR + 20, 0, 6.283); g.stroke();
        // tiled coping along the top
        var roof = new Path2D(); roof.moveTo(-100, 175); roof.lineTo(L.W + 100, 175); roof.lineTo(L.W + 100, 120); roof.lineTo(-100, 120); roof.closePath();
        L.paper(g, roof, '#1d2850', { shadow: [4, 10, 16, .6], rim: 2, rimCol: '#4a5a8c', tex: .5 });
        g.fillStyle = '#2b3866';
        for (var x = -100; x < L.W + 100; x += 34) { g.beginPath(); g.arc(x, 176, 15, 0, Math.PI); g.fill(); }
        var ridge = new Path2D(); ridge.rect(-100, 104, L.W + 200, 20);
        L.paper(g, ridge, '#151d3e', { shadow: [3, 6, 8, .5], rim: 1.5, rimCol: '#3d4a7a', tex: .4 });
        // stone ground strip
        var gd = new Path2D(); gd.rect(-100, 960, L.W + 200, 220);
        L.paper(g, gd, '#2c3866', { shadow: [0, -4, 14, .4], rim: 2, rimCol: '#55639a', tex: .7 });
      }, 100, 100);
      // lantern
      sv.lantern = L.sprite(180, 360, function (g) {
        g.strokeStyle = '#2a2a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 30); g.stroke();
        var cap = new Path2D(); cap.roundRect(-34, 26, 68, 16, 4); cap.roundRect(-34, 180, 68, 16, 4);
        var body = new Path2D(); body.ellipse(0, 112, 66, 82, 0, 0, 6.283);
        var gr = g.createRadialGradient(-10, 100, 10, 0, 112, 80); gr.addColorStop(0, '#f2864f'); gr.addColorStop(1, '#a52c22');
        L.paper(g, body, gr, { shadow: [5, 10, 14, .55], rim: 2, rimCol: '#f6a070', tex: .5 });
        g.save(); g.clip(body); g.strokeStyle = 'rgba(120,30,20,.45)'; g.lineWidth = 2;
        for (var i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(0, 112, Math.abs(i) * 20 + 2, 82, 0, 0, 6.283); g.stroke(); }
        g.restore();
        L.paper(g, cap, P.gold, { shadow: [2, 4, 5, .5], rim: 1.5, tex: .3 });
        g.fillStyle = P.red; for (i = -2; i <= 2; i++) g.fillRect(i * 8 - 1.5, 196, 3, 50 - Math.abs(i) * 4);
        g.font = '900 54px "Noto Serif SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(250,220,150,.9)'; g.fillText('花', 0, 114);
      }, 90, 60);
      sv.lglow = L.glow(260, '#f7a258', .15);
      var r = L.rng(81); sv.vortex = [];
      for (var i = 0; i < 220; i++) sv.vortex.push({ r: r.range(40, 520), a: r() * 6.28, w: r.range(.7, 1.4), k: Math.floor(r() * 6), s: r.range(.5, 1.15), out: r.range(500, 1500), spin: r.range(-6, 6), fl: r.range(2, 6), z: r() });
      sv.petals = L.petalField(55, 50, { v: [60, 140], s: [.5, .9], wind: 50 });
    },
    draw: function (g, t, lt) {
      var pre = L.seg(t, T.BARS[4], BURST), after = Math.max(0, t - BURST);
      // a kick of the camera on the burst
      var kick = after > 0 ? 1 + .06 * Math.exp(-after / .25) : 1;
      g.save(); g.translate(GX, GY); g.scale(kick, kick); g.translate(-GX, -GY);
      g.drawImage(sv.garden.c, 0, 0, L.W, L.H);
      L.blit(g, sv.wall, 0, 0, 1);
      // lantern swings on the beats
      var sw = Math.sin(t * 2.3) * .05 + F.pulse(t, .4) * .1 * Math.sin(t * 9);
      L.blit(g, sv.lglow, 300, 420, 1 + .25 * F.pulse(t, .3), 0, .55 + .35 * F.pulse(t, .3) + (after > 0 ? .5 * Math.exp(-after / .5) : 0));
      L.blit(g, sv.lantern, 300, 240, 1, sw);
      L.blit(g, sv.lglow, 1560, 420, .8 + .2 * F.pulse(t, .3), 0, .45 + .3 * F.pulse(t, .3));
      L.blit(g, sv.lantern, 1560, 240, .85, -sw * .8);
      // the whirl
      var spinUp = 1 + 3.2 * E.in2(pre);
      sv.vortex.forEach(function (p, i) {
        var a, r, alpha = 1;
        if (after <= 0) {
          var appear = L.seg(t, T.BARS[4] + p.z * 1.2, T.BARS[4] + p.z * 1.2 + .5); if (appear <= 0) return; alpha = appear;
          r = p.r * (1 - .55 * E.in2(pre)) + 30; a = p.a + p.w * (t - T.BARS[4]) * spinUp * (1 + 200 / (r + 60));
        } else {
          var r0 = p.r * .45 + 30, a0 = p.a + p.w * (BURST - T.BARS[4]) * 4.2 * (1 + 200 / (r0 + 60));
          r = r0 + p.out * (1 - Math.exp(-after / .45)); a = a0 + p.w * .8 * (1 - Math.exp(-after / .4));
        }
        var x = GX + Math.cos(a) * r, y = GY + Math.sin(a) * r * .82 + (after > 0 ? after * after * 90 : 0);
        L.blit(g, L.petals[p.k], x, y, p.s * (after > 0 ? 1 + after * .3 : 1), a + t * p.spin, alpha, Math.cos(t * p.fl + i));
      });
      if (after > 0) {   // shock ring
        var R = 60 + after * 1700, al = Math.max(0, .7 - after * 1.1);
        g.strokeStyle = 'rgba(250,240,220,' + al + ')'; g.lineWidth = 10 * (1 - after); g.beginPath(); g.ellipse(GX, GY, R, R * .82, 0, 0, 6.283); g.stroke();
      }
      g.restore();
      L.drawPetals(g, sv.petals, t, F.gust(t, T.BEATS, 30, .5), 0, 1, L.seg(t, BURST, BURST + .3));
    },
    overlay: function (g, t) {
      var a = t >= BURST ? .55 * Math.exp(-(t - BURST) / .12) : 0;
      if (a > .01) { g.fillStyle = 'rgba(255,246,228,' + a + ')'; g.fillRect(0, 0, L.W, L.H); }
    }
  });
})(window);
