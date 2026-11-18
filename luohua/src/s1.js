/* s1.js — 一「月窗」opening (bar 1) and 八「落」finale (bar 8): the same moon window and plum bough. */
(function (G) {
  'use strict';
  var L = G.L, F = G.FILM, T = G.TIMING, P = L.P, E = L.E;

  /* tapered bough with twigs → one Path2D + flower spots */
  L.branch = function (seed, x, y, ang, len, wid, depth, o) {
    var r = L.rng(seed), segs = [], spots = []; o = o || {};
    function grow(x, y, a, l, w, d, order) {
      var pts = [[x, y]], n = 9, cx = x, cy = y, ca = a;
      for (var i = 1; i <= n; i++) { ca += r.range(-.2, .2) + (o.bend || 0); cx += Math.cos(ca) * l / n; cy += Math.sin(ca) * l / n; pts.push([cx, cy]); }
      segs.push({ pts: pts, w0: w, w1: Math.max(1.6, w * .3) });
      for (i = 3; i <= n; i++) if (r() < (o.rate || .5)) spots.push({ x: pts[i][0] + r.range(-w, w) * 1.2, y: pts[i][1] + r.range(-w, w) * 1.2, u: order + i / n, d: d });
      spots.push({ x: cx, y: cy, u: order + 1, d: d, tip: 1 });
      if (d > 0) {
        var kids = d > 1 ? 3 : 2;
        for (var q = 0; q < kids; q++) {
          var j = 2 + Math.floor(r() * (n - 3)), b = Math.atan2(pts[j][1] - pts[j - 1][1], pts[j][0] - pts[j - 1][0]);
          grow(pts[j][0], pts[j][1], b + (q % 2 ? 1 : -1) * r.range(.35, .85), l * r.range(.38, .58), w * (.3 + (1 - j / n) * .45), d - 1, order + j / n);
        }
      }
    }
    grow(x, y, ang, len, wid, depth, 0);
    var p = new Path2D();
    segs.forEach(function (s) {
      var n = s.pts.length, left = [], right = [];
      for (var i = 0; i < n; i++) {
        var a = s.pts[Math.max(0, i - 1)], b = s.pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
        var w = L.lerp(s.w0, s.w1, Math.pow(i / (n - 1), .8)) / 2 * (1 + .12 * Math.sin(i * 2.1 + seed));
        left.push([s.pts[i][0] - dy / m * w, s.pts[i][1] + dx / m * w]); right.unshift([s.pts[i][0] + dy / m * w, s.pts[i][1] - dx / m * w]);
      }
      L.curve(p, left.concat(right), true, false, .7);
      p.moveTo(s.pts[0][0] + s.w0 / 2, s.pts[0][1]); p.arc(s.pts[0][0], s.pts[0][1], s.w0 / 2, 0, 6.283);
    });
    return { path: p, spots: spots, segs: segs };
  };

  var WX = 800, WY = 540, WR = 410;   // the moon window
  var st = {};

  function buildWindow() {
    // inside: sky + moon + three ranges of hills + mist + water
    st.inside = L.sprite(L.W + 200, L.H + 120, function (g) {
      var gr = g.createLinearGradient(0, 0, 0, L.H);
      gr.addColorStop(0, '#22356e'); gr.addColorStop(.55, '#3f5c9c'); gr.addColorStop(1, '#2a417c');
      g.fillStyle = gr; g.fillRect(-100, -60, L.W + 200, L.H + 120);
      // stars
      var r = L.rng(5); g.fillStyle = 'rgba(240,229,204,.7)';
      for (var i = 0; i < 90; i++) { g.beginPath(); g.arc(r() * L.W, r() * 560, r() * 1.6 + .3, 0, 6.283); g.fill(); }
      var MX = WX + 150, MY = WY - 150;
      L.blit(g, L.glow(330, '#dfe6f7', .25), MX, MY, 1, 0, .55);
      var moon = new Path2D(); moon.arc(MX, MY, 150, 0, 6.283);
      var mg = g.createRadialGradient(MX - 40, MY - 50, 10, MX, MY, 150); mg.addColorStop(0, P.white); mg.addColorStop(1, '#e7dcc2');
      L.paper(g, moon, mg, { shadow: [0, 0, 30, .0], rim: 0, tex: .6 });
      g.save(); g.clip(moon);
      [[MX - 50, MY + 20, 46, .07], [MX + 55, MY - 45, 30, .06], [MX + 20, MY + 80, 24, .06], [MX - 70, MY - 70, 18, .05]].forEach(function (c) {
        var cg = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], c[2]); cg.addColorStop(0, 'rgba(150,130,95,' + c[3] + ')'); cg.addColorStop(1, 'rgba(150,130,95,0)');
        g.fillStyle = cg; g.fillRect(c[0] - c[2], c[1] - c[2], c[2] * 2, c[2] * 2);
      });
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(MX, MY, 146, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
      g.restore();
      // cloud wisp across moon
      L.blit(g, L.cloud(260, 9, { col: '#d9e1f2', shadow: [3, 5, 10, .3] }), MX - 250, MY + 60, 1);
      var ranges = [
        { y: 600, h: [110, 230], col: '#8199cf', seed: 3, n: 7, mist: .34 },
        { y: 690, h: [70, 180], col: '#5b78bb', seed: 8, n: 6, mist: .28 },
        { y: 780, h: [50, 140], col: '#3a5699', seed: 13, n: 5, mist: .2 },
        { y: 860, h: [30, 90], col: '#243d7a', seed: 19, n: 4, mist: .14 }];
      ranges.forEach(function (R, i) {
        var rg = L.ridge(260, 1360, R.y, 1200, { seed: R.seed, n: R.n, h: R.h });
        var fill = g.createLinearGradient(0, R.y - 230, 0, R.y + 100); fill.addColorStop(0, L.light(R.col, .1)); fill.addColorStop(1, L.dark(R.col, .22));
        L.paper(g, rg.path, fill, { shadow: [4, -3, 18, .4], rim: 2.6, rimCol: L.light(R.col, .45), tex: .5 });
        var mgr = g.createLinearGradient(0, R.y - 40, 0, R.y + 70); mgr.addColorStop(0, 'rgba(225,232,246,0)'); mgr.addColorStop(.55, 'rgba(225,232,246,' + R.mist + ')'); mgr.addColorStop(1, 'rgba(225,232,246,0)');
        g.fillStyle = mgr; g.fillRect(200, R.y - 40, 1300, 110);
        if (i === 1) {   // a small pagoda on the second range
          g.save(); g.translate(560, 640); var pc = '#2a427f';
          for (var q = 0; q < 4; q++) {
            var yy = -q * 22, ww = 30 - q * 5;
            var roof = new Path2D(); roof.moveTo(-ww - 8, yy - 4); roof.quadraticCurveTo(0, yy - 10, ww + 8, yy - 4); roof.lineTo(ww - 2, yy - 13); roof.lineTo(-ww + 2, yy - 13); roof.closePath();
            roof.rect(-ww * .55, yy - 22, ww * 1.1, 10);
            L.paper(g, roof, pc, { shadow: [2, 3, 4, .4], rim: 1.2, rimCol: '#6884c4', tex: 0 });
          }
          g.fillStyle = pc; g.fillRect(-1.5, -112, 3, 26); g.restore();
        }
      });
      // water
      g.save(); g.beginPath(); g.rect(-100, 860, L.W + 200, 400); g.clip();
      L.seigaiha(g, 250, 840, 1150, 300, 38, ['#1f3471', '#2f4b8f', '#e9e0c8', '#2b4687', '#3e5ea2'], { persp: .5 });
      var wg = g.createLinearGradient(0, 860, 0, 1000); wg.addColorStop(0, 'rgba(34,53,110,.75)'); wg.addColorStop(1, 'rgba(34,53,110,0)');
      g.fillStyle = wg; g.fillRect(0, 860, L.W, 140);
      g.restore();
      // moon road on the water
      g.fillStyle = 'rgba(251,246,234,.5)';
      for (i = 0; i < 9; i++) { var yy = 880 + i * 18, ww = 90 - i * 6 + (i % 2) * 20; g.fillRect(WX + 150 - ww / 2, yy, ww, 3); }
    }, 100, 60);

    // the panel with the round opening (casts a shadow into the window)
    st.panel = L.sprite(L.W + 240, L.H + 200, function (g) {
      var p = new Path2D(); p.rect(-120, -100, L.W + 240, L.H + 200); p.moveTo(WX + WR, WY); p.arc(WX, WY, WR, 0, 6.283);
      var gr = g.createRadialGradient(WX, WY, WR, WX, WY, 1500); gr.addColorStop(0, '#22346a'); gr.addColorStop(1, '#0f1838');
      L.paper(g, p, gr, { shadow: [10, 16, 38, .75], rim: 0, tex: .7, rule: 'evenodd' });
      // raised rings
      [[WR + 92, WR + 8, '#1a2a5a']].forEach(function (c) {
        var q = new Path2D(); q.arc(WX, WY, c[0], 0, 6.283); q.moveTo(WX + c[1], WY); q.arc(WX, WY, c[1], 0, 6.283);
        L.paper(g, q, c[2], { shadow: [6, 10, 22, .6], rim: 3, rimCol: '#3b5596', tex: .6, rule: 'evenodd' });
      });
      g.strokeStyle = P.gold; g.lineWidth = 5; g.beginPath(); g.arc(WX, WY, WR + 10, 0, 6.283); g.stroke();
      g.strokeStyle = P.goldD; g.lineWidth = 2; g.beginPath(); g.arc(WX, WY, WR + 70, 0, 6.283); g.stroke();
      g.strokeStyle = 'rgba(241,212,142,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(WX, WY, WR + 80, 0, 6.283); g.stroke();
      // fret (回纹) corners
      function fret(x, y, s, dir) {
        g.save(); g.translate(x, y); g.scale(dir, 1);
        var q = new Path2D(), u = s / 7;
        [[0, 0, 7, 1], [6, 0, 1, 7], [0, 6, 7, 1], [0, 2, 1, 5], [2, 2, 3, 1], [4, 2, 1, 3], [2, 4, 3, 1]].forEach(function (b) { q.rect(b[0] * u, b[1] * u, b[2] * u, b[3] * u); });
        L.paper(g, q, '#2c4583', { shadow: [3, 5, 8, .5], rim: 1.6, rimCol: '#5d7cc0', tex: .5 });
        g.restore();
      }
      for (var i = 0; i < 4; i++) { fret(-20 + i * 130, 30, 120, 1); fret(30, 160 + i * 130, 120, 1); }
      for (i = 0; i < 3; i++) { fret(L.W - 140 - i * 130 + 120, L.H - 150, 120, -1); }
    }, 120, 100);

    var cl = [L.cloud(360, 21), L.cloud(300, 4), L.cloud(250, 17, { col: '#dfe5f2' })];
    st.clouds = [[cl[0], WX - 560, WY + 300, 1], [cl[1], WX + 330, WY + 330, 1], [cl[2], WX + 220, WY - 470, .9]];

    // the bough
    var br = L.branch(7, -60, 70, .36, 940, 64, 2, { rate: .55, bend: .004 });
    st.bough = L.sprite(L.W, L.H, function (g) {
      var gr = g.createLinearGradient(0, 0, 900, 400); gr.addColorStop(0, '#271f3c'); gr.addColorStop(1, '#3d3258');
      L.paper(g, br.path, gr, { shadow: [8, 14, 22, .6], rim: 2.6, rimCol: '#6a5a86', tex: .6 });
    });
    var r = L.rng(31), kinds = ['plum', 'plum', 'peach', 'white', 'plum', 'red'];
    st.sprites = [];
    for (var i = 0; i < 6; i++) st.sprites.push(L.blossom(34 + i % 3 * 6, kinds[i], 40 + i));
    st.bud = L.bud(12); st.budR = L.bud(12, 'red');
    st.flowers = br.spots.filter(function (s) { return s.x > -30 && s.x < 1500 && s.y > -20 && s.y < 900; }).map(function (s, i) {
      return { x: s.x, y: s.y, sp: st.sprites[i % 6], sc: r.range(.55, 1.05) * (s.tip ? .9 : 1), rot: r() * 6.28, u: s.u, bud: r() < .22 };
    });
    // order by distance along the bough → bloom wave following the beat
    st.flowers.sort(function (a, b) { return a.u - b.u; });
    var nb = 4; st.flowers.forEach(function (f, i) { f.beat = Math.min(nb - 1, Math.floor(i / st.flowers.length * nb)); f.jit = r() * .16; });
    st.petals = L.petalField(91, 70, { v: [70, 140], s: [.45, .85] });
  }

  function drawWindow(g, t, lt, o) {
    var push = o.push, dx = o.dx || 0;
    g.save();
    g.translate(L.W / 2, L.H / 2); g.scale(push, push); g.translate(-L.W / 2, -L.H / 2);
    L.blit(g, st.inside, -dx * .5, 0, 1);
    // petals inside the window (far)
    g.save(); g.beginPath(); g.arc(WX, WY, WR, 0, 6.283); g.clip();
    L.drawPetals(g, st.petals, t, o.gust * .5, 0, .35, .7);
    g.restore();
    L.blit(g, st.panel, -dx * .15, 0, 1);
    st.clouds.forEach(function (c, i) { L.blit(g, c[0], c[1] - dx * .2 + Math.sin(t * .4 + i) * 8, c[2], c[3]); });
    g.restore();
  }
  function drawBough(g, t, bloom, sway, fall) {
    g.save();
    g.translate(-60, 70); g.rotate(sway); g.translate(60, -70);
    L.blit(g, st.bough, 0, 0, 1);
    st.flowers.forEach(function (f, i) {
      var b = bloom(f), dropped = fall ? fall(f, i) : 0;
      if (dropped >= 1) return;
      if (b <= 0) { L.blit(g, f.bud ? st.budR : st.bud, f.x, f.y, f.sc * .9, f.rot); return; }
      var s = f.sc * E.back(L.clamp(b, 0, 1), 2.6), rot = f.rot - .7 * (1 - E.out3(L.clamp(b, 0, 1)));
      L.blit(g, f.sp, f.x + dropped * 30, f.y + dropped * dropped * 300, s * (1 - dropped * .3), rot + dropped * 3, 1 - dropped);
    });
    g.restore();
  }

  // ---- 1 月窗：opening, blossoms open on the four beats of bar 1 ----
  F.scene({
    id: 'window', t0: 0, flash: 0, punch: 0,
    build: buildWindow,
    draw: function (g, t, lt) {
      var gust = F.gust(t, T.BEATS, 26, .5);
      drawWindow(g, t, lt, { push: 1.12 - .07 * E.out3(L.seg(t, 0, 3.4)), dx: t * 10, gust: gust });
      var beats = T.BEATS.slice(0, 4);
      drawBough(g, t, function (f) { return (t - beats[f.beat] - f.jit) / .38; }, Math.sin(t * 1.1) * .008 + F.pulse(t, .3) * .006);
      L.drawPetals(g, st.petals, t, gust, .35, 1, L.seg(t, .3, 1.5));
      // title: one character per beat, seal on the fourth
      var b = T.BEATS;
      F.vtext(g, '落花雨', 1640, 250, 150, function (i) { return L.seg(t, b[i + 1] - .1, b[i + 1] + .35); }, { lead: 1.2 });
      F.seal(g, '花雨', 1530, 760, 74, L.seg(t, b[3] + .2, b[3] + .5));
    }
  });

  // ---- 8 落：finale — the bough lets its blossoms go, beat by beat; the moon stays ----
  F.scene({
    id: 'finale', t0: T.BARS[7], flash: .35,
    draw: function (g, t, lt) {
      var gust = F.gust(t, T.BEATS, 30, .6);
      drawWindow(g, t, lt, { push: 1.0 + .05 * E.sine(L.seg(lt, 0, 2.3)), dx: 30 + lt * 8, gust: gust });
      var n = st.flowers.length, beats = [T.BARS[7], 23.87, 24.61];
      drawBough(g, t, function () { return 1; }, Math.sin(t * 1.1) * .008 + F.pulse(t, .3) * .008, function (f, i) {
        var k = i % 3, start = beats[k] + (i / n) * .5;
        return L.clamp((t - start) / 1.6, 0, 1);
      });
      L.drawPetals(g, st.petals, t, gust, .35, 1, 1);
      F.vtext(g, '落花雨', 1640, 250, 150, function () { return 1; }, { lead: 1.2, alpha: 1 - L.seg(t, 24.7, 25.2) });
      F.seal(g, '花雨', 1530, 760, 74, 1 - L.seg(t, 24.7, 25.2));
    }
  });
})(window);
