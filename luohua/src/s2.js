/* s2.js — 二「伞开」(bar 2: the umbrella unfolds a quarter on each beat) and 三「桥」(bar 3: a walker on the bridge in the petal rain). */
(function (G) {
  'use strict';
  var L = G.L, F = G.FILM, T = G.TIMING, P = L.P, E = L.E;
  var N = 28;   // umbrella panels

  /* ---- the umbrella (top view), shared with the quick cuts in bar 7 ---- */
  L.umbrella = function (R) {
    var ang = function (i) { return i / N * Math.PI * 2 - Math.PI / 2; };
    var canopy = new Path2D();
    for (var i = 0; i <= N; i++) {
      var a = ang(i), b = ang(i + .5);
      var x = Math.cos(a) * R, y = Math.sin(a) * R;
      if (i === 0) canopy.moveTo(x, y); else canopy.quadraticCurveTo(Math.cos(ang(i - .5)) * R * .955, Math.sin(ang(i - .5)) * R * .955, x, y);
    }
    canopy.closePath();
    var spr = L.sprite(R * 2.3, R * 2.3, function (g) {
      var gr = g.createRadialGradient(0, 0, R * .1, 0, 0, R); gr.addColorStop(0, P.white); gr.addColorStop(.7, '#f1e2cc'); gr.addColorStop(1, '#e8cdb6');
      L.paper(g, canopy, gr, { shadow: [10, 18, 30, .55], rim: 0, tex: .6 });
      g.save(); g.clip(canopy);
      // red rim band with a gold line
      var band = new Path2D(); band.arc(0, 0, R * 1.05, 0, 6.2832); band.moveTo(R * .86, 0); band.arc(0, 0, R * .86, 0, 6.2832);
      g.fillStyle = P.red; g.fill(band, 'evenodd');
      g.strokeStyle = P.gold; g.lineWidth = R * .012; g.beginPath(); g.arc(0, 0, R * .845, 0, 6.2832); g.stroke();
      g.strokeStyle = 'rgba(241,212,142,.7)'; g.lineWidth = R * .005; g.beginPath(); g.arc(0, 0, R * .825, 0, 6.2832); g.stroke();
      // painted plum bough across the canopy
      var br = L.branch(23, -R * .78, R * .45, -.5, R * 1.25, R * .07, 2, { rate: .5, bend: .006 });
      g.fillStyle = '#3a2f52'; g.fill(br.path);
      var sp = [L.blossom(R * .07, 'red', 3), L.blossom(R * .065, 'plum', 4), L.blossom(R * .06, 'peach', 5)], r = L.rng(4);
      br.spots.forEach(function (s, i) { if (Math.hypot(s.x, s.y) < R * .8) L.blit(g, sp[i % 3], s.x, s.y, r.range(.7, 1.1), r() * 6); });
      // a little blue cloud motif on the other side
      L.blit(g, L.cloud(R * .5, 12, { col: '#9fb3dc', line: '#5a76b5', shadow: false }), R * .12, -R * .52, 1);
      // fold shading: alternate panels
      for (i = 0; i < N; i++) {
        var a = ang(i), b = ang(i + 1);
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 1.1, a, b); g.closePath();
        var sg = g.createLinearGradient(Math.cos(a) * R, Math.sin(a) * R, Math.cos(b) * R, Math.sin(b) * R);
        sg.addColorStop(0, 'rgba(60,30,40,' + (i % 2 ? .1 : .02) + ')'); sg.addColorStop(1, 'rgba(255,255,255,' + (i % 2 ? .0 : .08) + ')');
        g.fillStyle = sg; g.fill();
      }
      // ribs
      g.strokeStyle = 'rgba(156,118,51,.55)'; g.lineWidth = R * .004;
      for (i = 0; i < N; i++) { var c = ang(i); g.beginPath(); g.moveTo(Math.cos(c) * R * .14, Math.sin(c) * R * .14); g.lineTo(Math.cos(c) * R, Math.sin(c) * R); g.stroke(); }
      g.restore();
      // hub
      var hub = new Path2D(); hub.arc(0, 0, R * .14, 0, 6.2832);
      L.paper(g, hub, '#2b4683', { shadow: [3, 6, 10, .5], rim: 2, tex: .5 });
      g.strokeStyle = P.gold; g.lineWidth = R * .01; g.beginPath(); g.arc(0, 0, R * .12, 0, 6.2832); g.stroke();
      var top = new Path2D(); top.arc(0, 0, R * .06, 0, 6.2832);
      L.paper(g, top, P.red, { shadow: [2, 4, 6, .5], rim: 1.5, tex: .4 });
    }, R * 1.15, R * 1.15);
    return { spr: spr, R: R, ang: ang };
  };
  /* draw umbrella opened to fraction `open` (fan sweep), rotated by rot */
  L.drawUmbrella = function (g, U, x, y, open, rot, sc) {
    var R = U.R, sweep = Math.PI * 2 * L.clamp(open, 0, 1);
    if (sweep <= 0.001) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
    if (open < .999) {
      // clip to the swept wedge (+ shadow pad)
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 1.3, -Math.PI / 2, -Math.PI / 2 + sweep); g.closePath(); g.save(); g.clip();
      L.blit(g, U.spr, 0, 0, 1);
      g.restore();
      // the leading panel, still folding: a darker wedge whose edge flutters
      var a = -Math.PI / 2 + sweep, w = .22;
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * .99, a - w, a); g.closePath();
      var sg = g.createLinearGradient(Math.cos(a - w) * R, Math.sin(a - w) * R, Math.cos(a) * R, Math.sin(a) * R);
      sg.addColorStop(0, 'rgba(40,20,40,0)'); sg.addColorStop(1, 'rgba(40,20,40,.35)'); g.fillStyle = sg; g.fill();
      g.strokeStyle = P.goldD; g.lineWidth = R * .008; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke();
      // the folded bundle that the fan comes out of
      g.save(); g.rotate(a); var fold = new Path2D(); fold.moveTo(0, -R * .02); fold.lineTo(R, -R * .035); fold.lineTo(R, R * .035); fold.lineTo(0, R * .02); fold.closePath();
      L.paper(g, fold, P.red, { shadow: [3, 6, 8, .5], rim: 1.5, tex: .4 }); g.restore();
    } else L.blit(g, U.spr, 0, 0, 1);
    g.restore();
  };

  var st = {};
  F.scene({
    id: 'umbrella', t0: T.BARS[1], flash: .5,
    build: function () {
      st.U = L.umbrella(390);
      st.bg = L.sprite(L.W, L.H, function (g) {
        var gr = g.createRadialGradient(820, 560, 50, 820, 560, 1100); gr.addColorStop(0, '#2b4686'); gr.addColorStop(1, '#0d1534');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        // concentric paper rings
        [[980, '#152452'], [840, '#1a2c60'], [700, '#20366f'], [565, '#284180']].forEach(function (c) {
          var p = new Path2D(); p.arc(820, 560, c[0], 0, 6.2832);
          var q = new Path2D(); q.arc(820, 560, c[0], 0, 6.2832); q.moveTo(820 + c[0] - 60, 560); q.arc(820, 560, c[0] - 60, 0, 6.2832);
          L.paper(g, p, c[1], { shadow: [6, 10, 28, .55], rim: 3, rimCol: L.light(c[1], .25), tex: .6 });
          g.strokeStyle = 'rgba(217,178,97,.35)'; g.lineWidth = 1.5; g.beginPath(); g.arc(820, 560, c[0] - 14, 0, 6.2832); g.stroke();
        });
        var r = L.rng(8); g.fillStyle = 'rgba(240,229,204,.5)';
        for (var i = 0; i < 60; i++) { g.beginPath(); g.arc(r() * L.W, r() * L.H, r() * 1.6 + .3, 0, 6.283); g.fill(); }
      });
      st.clouds = [L.cloud(330, 31), L.cloud(260, 32, { col: '#d4ddf0' }), L.cloud(220, 33)];
      st.petals = L.petalField(17, 80, { v: [80, 170], s: [.5, .95] });
      var r = L.rng(51); st.landed = [];
      for (var i = 0; i < 14; i++) { var a = r() * 6.28, d = r.range(.3, .85) * 390; st.landed.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, k: i % 6, rot: r() * 6.28, t: 6.0 + i * .045 + r() * .2 }); }
      st.glow = L.glow(520, '#8fa6dc', .1);
    },
    draw: function (g, t, lt) {
      g.drawImage(st.bg.c, 0, 0, L.W, L.H);
      var b = T.BEATS, open = 0;
      for (var i = 0; i < 4; i++) open += .25 * E.back(L.seg(t, b[4 + i], b[4 + i] + .42), 2.2);
      L.blit(g, st.glow, 820, 560, 1, 0, .25 + .2 * F.pulse(t, .3));
      var gust = F.gust(t, T.BEATS, 22, .5);
      L.drawPetals(g, st.petals, t, gust, 0, .45, .8);
      var rot = -.2 + lt * .16 + open * .35;
      L.drawUmbrella(g, st.U, 820, 560, open, rot, .9 + .1 * open);
      // petals settling on the open canopy
      if (open > .999) {
        g.save(); g.translate(820, 560); g.rotate(rot);
        st.landed.forEach(function (p) {
          var a = L.seg(t, p.t, p.t + .3); if (a <= 0) return;
          L.blit(g, L.petals[p.k], p.x, p.y - (1 - E.out3(a)) * 80, .7 * (1.3 - .3 * E.out3(a)), p.rot, Math.min(1, a * 2));
        });
        g.restore();
      }
      L.blit(g, st.clouds[0], 300, 930 + Math.sin(t) * 6, 1); L.blit(g, st.clouds[1], 1380, 170 + Math.sin(t * .8 + 1) * 6, 1);
      L.blit(g, st.clouds[2], 1470, 950, 1);
      L.drawPetals(g, st.petals, t, gust, .45, 1, 1);
    }
  });

  /* ---- 3 桥：a walker with a red umbrella crosses the stone bridge; the tree lets go on every beat ---- */
  L.walker = function (s) {   // side view, umbrella over shoulder, facing right. anchor = feet
    return L.sprite(260 * s, 340 * s, function (g) {
      g.scale(s, s);
      // robe
      var robe = new Path2D();
      robe.moveTo(-8, -150); robe.bezierCurveTo(-30, -110, -44, -40, -58, 0); robe.lineTo(46, 0); robe.bezierCurveTo(30, -50, 22, -110, 12, -150); robe.closePath();
      var gr = g.createLinearGradient(0, -150, 0, 0); gr.addColorStop(0, P.cream); gr.addColorStop(1, '#cfd8ee');
      L.paper(g, robe, gr, { shadow: [3, 5, 8, .45], rim: 1.6, tex: .5 });
      var over = new Path2D(); over.moveTo(-4, -146); over.bezierCurveTo(-22, -100, -30, -60, -40, -24); over.lineTo(4, -30); over.bezierCurveTo(8, -80, 10, -120, 10, -146); over.closePath();
      L.paper(g, over, P.mid, { shadow: [2, 3, 5, .35], rim: 1.4, tex: .5 });
      var sash = new Path2D(); sash.rect(-20, -112, 34, 9); sash.moveTo(-6, -104); sash.lineTo(-14, -60); sash.lineTo(-8, -60); sash.lineTo(0, -104);
      L.paper(g, sash, P.red, { shadow: [1, 2, 3, .3], rim: 1, tex: .3 });
      // sleeve + arm holding the shaft
      var sl = new Path2D(); sl.moveTo(6, -140); sl.quadraticCurveTo(34, -128, 40, -104); sl.quadraticCurveTo(30, -92, 14, -98); sl.closePath();
      L.paper(g, sl, P.cream, { shadow: [2, 3, 4, .35], rim: 1.2, tex: .4 });
      // head + hair bun
      var head = new Path2D(); head.ellipse(4, -164, 13, 15, .1, 0, 6.283);
      L.paper(g, head, '#f3e3cf', { shadow: [1, 2, 3, .3], rim: 1, tex: .2 });
      var hair = new Path2D(); hair.ellipse(-2, -170, 14, 13, .2, 0, 6.283); hair.ellipse(-12, -184, 9, 8, 0, 0, 6.283);
      L.paper(g, hair, '#14182e', { shadow: [1, 2, 3, .3], rim: 1, rimCol: '#3a4366', tex: .2 });
      g.fillStyle = P.gold; g.fillRect(-20, -190, 18, 2.5);
      // umbrella: shaft + domed canopy, tilted back
      g.save(); g.translate(30, -100); g.rotate(-.28);
      g.strokeStyle = '#6a4a2e'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -128); g.stroke();
      var c = new Path2D(); c.moveTo(-110, -96);
      for (var i = 0; i <= 8; i++) { var x = -110 + i * 27.5; c.quadraticCurveTo(x - 13.75, -88, x, -96); }
      c.bezierCurveTo(90, -130, 40, -160, 0, -162); c.bezierCurveTo(-40, -160, -90, -130, -110, -96); c.closePath();
      var ug = g.createLinearGradient(0, -162, 0, -90); ug.addColorStop(0, P.redL); ug.addColorStop(1, P.redD);
      L.paper(g, c, ug, { shadow: [4, 8, 12, .5], rim: 2, rimCol: '#f08a6a', tex: .5 });
      g.strokeStyle = 'rgba(241,212,142,.6)'; g.lineWidth = 1.4;
      for (i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(0, -162); g.quadraticCurveTo(i * 22, -140, i * 31, -94); g.stroke(); }
      g.fillStyle = P.gold; g.beginPath(); g.arc(0, -166, 5, 0, 6.283); g.fill();
      g.restore();
    }, 130 * s, 300 * s);
  };

  var sb = {};
  F.scene({
    id: 'bridge', t0: T.BARS[2],
    build: function () {
      sb.sky = L.sprite(L.W + 400, L.H, function (g) {
        var gr = g.createLinearGradient(0, 0, 0, 700);
        gr.addColorStop(0, '#111b40'); gr.addColorStop(.55, '#2d3f7a'); gr.addColorStop(.85, '#8a6f7d'); gr.addColorStop(1, '#d9a878');
        g.fillStyle = gr; g.fillRect(0, 0, L.W + 400, L.H);
        var r = L.rng(2); g.fillStyle = 'rgba(240,229,204,.6)';
        for (var i = 0; i < 80; i++) { g.beginPath(); g.arc(r() * (L.W + 400), r() * 380, r() * 1.5 + .3, 0, 6.283); g.fill(); }
        var ranges = [
          { y: 560, h: [130, 270], c: ['#5a6aa0', '#9a8090'], seed: 41, n: 8 },
          { y: 630, h: [80, 200], c: ['#34477f', '#5a5880'], seed: 42, n: 7 },
          { y: 705, h: [50, 140], c: ['#1f3166', '#27325e'], seed: 43, n: 6 }];
        ranges.forEach(function (R) {
          var rg = L.ridge(-40, L.W + 440, R.y, 1300, { seed: R.seed, n: R.n, h: R.h });
          var f = g.createLinearGradient(0, R.y - 260, 0, R.y + 120); f.addColorStop(0, R.c[0]); f.addColorStop(1, R.c[1]);
          L.paper(g, rg.path, f, { shadow: [4, -2, 18, .4], rim: 2.5, rimCol: 'rgba(240,200,170,.55)', tex: .5 });
          var mg = g.createLinearGradient(0, R.y - 20, 0, R.y + 60); mg.addColorStop(0, 'rgba(240,210,190,0)'); mg.addColorStop(.5, 'rgba(240,210,190,.2)'); mg.addColorStop(1, 'rgba(240,210,190,0)');
          g.fillStyle = mg; g.fillRect(0, R.y - 20, L.W + 400, 80);
        });
      });
      // river + bridge (with reflection)
      sb.river = L.sprite(L.W + 300, 400, function (g) {
        var gr = g.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#2b3f78'); gr.addColorStop(1, '#13204a');
        var p = new Path2D(); p.rect(0, 0, L.W + 300, 400);
        L.paper(g, p, gr, { shadow: [0, -6, 16, .4], rim: 0, tex: .5 });
        g.fillStyle = 'rgba(217,168,120,.35)';
        var r = L.rng(5);
        for (var i = 0; i < 40; i++) { var y = 10 + r() * 300, w = 30 + r() * 120; g.fillRect(r() * (L.W + 300), y, w * (1 - y / 400), 2.5); }
      }, 0, 0);
      var BR = 205, BX = 500, BY = 352, DK = -150;    // arch radius, centre, water line; deck control y
      sb.deck = function (u) { var x = L.lerp(60, 940, u), y = (1 - u) * (1 - u) * 316 + 2 * u * (1 - u) * DK + u * u * 316; return [x, y]; };
      sb.bridge = L.sprite(1000, 760, function (g) {
        var b = new Path2D();
        b.moveTo(30, BY); b.lineTo(40, 316); b.quadraticCurveTo(BX, DK - 30, 960, 316); b.lineTo(970, BY);
        b.lineTo(BX + BR, BY); b.arc(BX, BY, BR, 0, Math.PI, true); b.lineTo(30, BY); b.closePath();
        var gr = g.createLinearGradient(0, 40, 0, BY); gr.addColorStop(0, '#f3e9d3'); gr.addColorStop(1, '#c9bfb4');
        L.paper(g, b, gr, { shadow: [6, 12, 20, .55], rim: 2.4, tex: .7 });
        g.save(); g.clip(b);
        g.strokeStyle = 'rgba(80,70,90,.35)'; g.lineWidth = 2;
        for (var i = 0; i <= 16; i++) { var a = Math.PI + i / 16 * Math.PI;
          g.beginPath(); g.moveTo(BX + Math.cos(a) * BR, BY + Math.sin(a) * BR); g.lineTo(BX + Math.cos(a) * (BR + 34), BY + Math.sin(a) * (BR + 34)); g.stroke(); }
        g.beginPath(); g.arc(BX, BY, BR + 34, Math.PI, 0); g.stroke();
        g.restore();
        // railing: posts + rail following the deck
        g.strokeStyle = '#d9cdb5'; g.lineWidth = 4; g.beginPath();
        for (i = 0; i <= 40; i++) { var d = sb.deck(i / 40); i ? g.lineTo(d[0], d[1] - 30) : g.moveTo(d[0], d[1] - 30); }
        g.stroke();
        for (i = 1; i < 14; i++) { d = sb.deck(i / 14); g.fillStyle = '#e2d6be'; g.fillRect(d[0] - 3, d[1] - 34, 6, 32); }
        // reflection completes the moon-bridge circle
        g.save(); g.globalAlpha = .26; g.translate(0, BY * 2); g.scale(1, -1); g.fillStyle = '#d6cdbf'; g.fill(b); g.restore();
      }, 0, 0);
      sb.walker = L.walker(.8);
      // foreground tree (right) and bough (left)
      var tr = L.branch(77, 1990, 1130, -2.05, 760, 120, 2, { rate: .6, bend: -.006 });
      var tl = L.branch(78, -80, 40, .22, 620, 54, 2, { rate: .6, bend: .01 });
      sb.trees = L.sprite(L.W, L.H, function (g) {
        [tr, tl].forEach(function (b) {
          var gr = g.createLinearGradient(0, 0, L.W, L.H); gr.addColorStop(0, '#1c1730'); gr.addColorStop(1, '#2c2442');
          L.paper(g, b.path, gr, { shadow: [10, 16, 26, .65], rim: 2.8, rimCol: '#5c4f78', tex: .6 });
        });
      });
      var sp = [L.blossom(40, 'plum', 61), L.blossom(36, 'peach', 62), L.blossom(44, 'white', 63), L.blossom(38, 'plum', 64), L.blossom(34, 'red', 65)], r = L.rng(9);
      sb.flowers = tr.spots.concat(tl.spots).filter(function (s) { return s.x > -50 && s.x < L.W + 50 && s.y > -50 && s.y < L.H + 50; })
        .map(function (s, i) { return { x: s.x, y: s.y, sp: sp[i % 5], sc: r.range(.6, 1.1), rot: r() * 6.28 }; });
      sb.petalsB = L.petalField(23, 90, { v: [60, 120], s: [.3, .55], wind: 90 });
      sb.petalsF = L.petalField(24, 60, { v: [140, 240], s: [.8, 1.3], wind: 120 });
    },
    draw: function (g, t, lt) {
      var pan = lt * 34, gust = F.gust(t, T.BEATS, 40, .45);
      L.blit(g, sb.sky, -pan * .3, 0, 1);
      L.blit(g, sb.river, -pan * .5 - 100, 700, 1);
      g.save(); g.translate(-pan * .6, 0);
      L.blit(g, sb.bridge, 420, 350, 1);
      // the walker crosses the bridge, bobbing a little with each step (two steps per beat)
      var u = L.clamp(.14 + lt * .1, 0, 1), d = sb.deck(u), bob = Math.abs(Math.sin(t * Math.PI / .82)) * 3;
      L.blit(g, sb.walker, 420 + d[0], 350 + d[1] - 2 - bob, 1, (d[1] - sb.deck(u + .01)[1]) * -.01);
      g.restore();
      L.drawPetals(g, sb.petalsB, t, gust * .6, 0, 1, .9);
      // trees (foreground) with blossoms that tremble on the beat
      var sh = F.pulse(t, .25) * .012;
      g.save(); g.translate(-pan * 1.1, 0);
      L.blit(g, sb.trees, 0, 0, 1);
      sb.flowers.forEach(function (f, i) { L.blit(g, f.sp, f.x, f.y, f.sc * (1 + sh * 3), f.rot + Math.sin(t * 2 + i) * .05 + sh * (i % 2 ? 4 : -4)); });
      g.restore();
      L.drawPetals(g, sb.petalsF, t, gust, 0, 1, 1);
    }
  });
})(window);
