/* Act IV — FABLE: that which is told (94–119 s). A relief becomes a page; the page stands up as a paper theatre. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var FOX = F.OPUS.FOX, CROW = { x: FOX.x + F.OPUS.CROW.dx, y: FOX.y + F.OPUS.CROW.dy }, TX = FOX.x + F.OPUS.TRUNK.dx;
  var Y0 = 560, LH = 900, ANCH = { x: 540, y: 1440 }; // layer sprites cover world y 560..1460
  var st = {};
  var SH = function (g, blur, dy, a) { g.shadowColor = 'rgba(58,48,28,' + (a || .3) + ')'; g.shadowBlur = blur * g.q; g.shadowOffsetY = dy * g.q; g.shadowOffsetX = 0; };

  function leafCluster(g, x, y, R, n, col, sz) {
    g.fillStyle = col;
    for (var i = 0; i < n; i++) {
      var a = R() * 6.28, d = R.range(0, sz * 1.5), lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .8, rot = R.range(-1.3, 1.3), L = sz * R.range(.8, 1.25);
      g.save(); g.translate(lx, ly); g.rotate(rot); g.beginPath(); g.moveTo(-L, 0); g.quadraticCurveTo(0, -L * .52, L, 0); g.quadraticCurveTo(0, L * .52, -L, 0); g.fill(); g.restore();
    }
  }
  function limb(g, R, x, y, ang, len, w, depth, col, leafCol, sz, tips) {
    var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, bend = R.range(-.18, .18);
    var mx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * len * bend, my = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * len * bend;
    var s = F.spline([[x, y], [mx, my], [x2, y2]], false, 6);
    g.fillStyle = col; F.ribbon(g, s, 0, 1, function (u) { return lerp(w, w * .62, u); });
    if (depth <= 0) { tips.push([x2, y2]); return; }
    var n = depth > 1 ? 2 : 3;
    for (var i = 0; i < n; i++) limb(g, R, x2, y2, ang + lerp(-.62, .62, n === 1 ? .5 : i / (n - 1)) + R.range(-.16, .16), len * R.range(.6, .74), w * .6, depth - 1, col, leafCol, sz, tips);
    if (depth <= 2) tips.push([mx, my]);
  }
  function tree(g, R, x, y, h, lean, col, leafCol, sz, depth) {
    var tips = [];
    SH(g, 12, 5, .26);
    limb(g, R, x, y, -Math.PI / 2 + lean, h * .44, h * .075, depth, col, leafCol, sz, tips);
    tips.forEach(function (t) { leafCluster(g, t[0], t[1], R, 9, leafCol, sz); });
    g.shadowColor = 'rgba(0,0,0,0)';
    // a second, lighter scattering gives the cut-paper canopy some sparkle
    tips.forEach(function (t, i) { if (i % 2) leafCluster(g, t[0] + 6, t[1] - 8, R, 3, F.mix(leafCol, '#F4EDDB', .22), sz * .8); });
    return tips;
  }

  function buildLayers() {
    // F1 — far hills, small trees, the crest
    st.L1 = F.sprite(W, LH, function (g) {
      var R = F.rng(101), i;
      SH(g, 10, 4, .18);
      var hill = F.spline([[90, 780], [220, 700], [380, 730], [540, 670], [700, 716], [860, 664], [990, 760]], false, 8), pts = F.pts(hill, 1);
      g.fillStyle = '#DAD9C6'; g.beginPath(); g.moveTo(90, 790); pts.forEach(function (q) { g.lineTo(q[0], q[1]); }); g.lineTo(990, 790); g.closePath(); g.fill();
      [[200, 706, 70], [300, 716, 54], [452, 700, 62], [640, 696, 76], [760, 692, 58], [900, 684, 66]].forEach(function (c) {
        g.fillStyle = '#C9CAB5'; g.fillRect(c[0] - 2, c[1] - c[2] * .5, 4, c[2] * .5 + 8);
        g.beginPath(); g.ellipse(c[0], c[1] - c[2] * .8, c[2] * .3, c[2] * .52, 0, 0, 6.3); g.fill();
      });
    });
    // F2 — two trees, mid distance
    st.L2 = F.sprite(W, LH, function (g) {
      var R = F.rng(103);
      SH(g, 12, 5, .22); g.fillStyle = '#B5B9A2';
      var gr = F.pts(F.spline([[70, 800], [200, 772], [400, 792], [640, 778], [860, 764], [1010, 796]], false, 8), 1);
      g.beginPath(); g.moveTo(70, 812); gr.forEach(function (q) { g.lineTo(q[0], q[1]); }); g.lineTo(1010, 812); g.closePath(); g.fill();
      tree(g, R, 846, 772, 560, .06, '#9FA48C', '#AEB39C', 17, 3);
      tree(g, R, 150, 780, 420, -.05, '#A6AB93', '#B7BBA5', 15, 3);
    });
    // F3 — the fable itself: mound, great tree, the bough for the crow
    st.L3 = F.sprite(W, LH, function (g) {
      var R = F.rng(105), by = FOX.y - Y0;
      SH(g, 14, 6, .3); g.fillStyle = '#8D917A';
      var gr = F.pts(F.spline([[110, 812], [200, 730], [290, by + 14], [420, 716], [560, 700], [640, by + 2], [740, 700], [860, 742], [970, 812]], false, 8), 1);
      g.beginPath(); g.moveTo(110, 826); gr.forEach(function (q) { g.lineTo(q[0], q[1]); }); g.lineTo(970, 826); g.closePath(); g.fill();
      var tips = tree(g, R, TX, by + 20, 580, -.02, '#6A7059', '#7A8068', 20, 3);
      // the crow's bough
      SH(g, 10, 5, .28); g.fillStyle = '#6A7059';
      var b = F.spline([[TX + 8, by - 262], [TX + 70, by - 278], [CROW.x - TX + TX, CROW.y - Y0 + 3], [CROW.x + 62, CROW.y - Y0 + 10]], false, 5);
      F.ribbon(g, b, 0, 1, function (u) { return lerp(13, 4, u); });
      leafCluster(g, CROW.x + 70, CROW.y - Y0 + 4, R, 5, '#7A8068', 15);
      g.shadowColor = 'rgba(0,0,0,0)';
      // tufts on the mound
      g.strokeStyle = '#7A7F68'; g.lineWidth = 2; g.lineCap = 'round';
      for (var i = 0; i < 26; i++) { var x = R.range(150, 930), y = 800 - Math.abs(R.gauss()) * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + R.range(-4, 4), y - 10, x + R.range(-9, 9), y - R.range(12, 22)); g.stroke(); }
    });
    // F4 — near grasses and ferns at the wings
    st.L4 = F.sprite(W, LH, function (g) {
      var R = F.rng(107);
      SH(g, 14, 6, .32);
      [[150, 1], [250, 1], [84, 1], [330, .7], [930, 1], [830, 1], [996, 1], [750, .7]].forEach(function (c) {
        for (var i = 0; i < 9; i++) {
          var a = -Math.PI / 2 + R.range(-.85, .85), L = R.range(80, 170) * c[1];
          var s = F.spline([[c[0], 840], [c[0] + Math.cos(a) * L * .5, 840 + Math.sin(a) * L * .55], [c[0] + Math.cos(a + (a > -Math.PI / 2 ? .4 : -.4)) * L, 840 + Math.sin(a) * L * .9]], false, 5);
          g.fillStyle = i % 3 ? '#565D49' : '#6A705A'; F.ribbon(g, s, 0, 1, function (u) { return 9 * (1 - u * u) + .5; });
        }
      });
      g.fillStyle = '#565D49'; g.fillRect(40, 836, 1000, 30);
    });
    // crest: shield, sprays, ribbon
    st.crest = F.sprite(260, 200, function (g) {
      SH(g, 10, 4, .26);
      g.fillStyle = '#EFE5CC'; g.beginPath(); g.moveTo(20, 150); g.quadraticCurveTo(70, 132, 130, 150); g.quadraticCurveTo(190, 168, 240, 150); g.lineTo(232, 176); g.quadraticCurveTo(190, 190, 130, 174); g.quadraticCurveTo(70, 158, 28, 176); g.closePath(); g.fill();
      g.fillStyle = C.rose; g.beginPath(); g.moveTo(84, 22); g.lineTo(176, 22); g.lineTo(176, 84); g.quadraticCurveTo(176, 124, 130, 146); g.quadraticCurveTo(84, 124, 84, 84); g.closePath(); g.fill();
      g.shadowColor = 'rgba(0,0,0,0)';
      g.strokeStyle = '#E9D7AA'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(92, 30); g.lineTo(168, 30); g.lineTo(168, 84); g.quadraticCurveTo(168, 118, 130, 137); g.quadraticCurveTo(92, 118, 92, 84); g.closePath(); g.stroke();
      // emblem: a quill
      g.fillStyle = '#F4EAD2'; g.save(); g.translate(130, 84); g.rotate(.5);
      g.beginPath(); g.moveTo(0, 40); g.quadraticCurveTo(-18, 0, -4, -42); g.quadraticCurveTo(16, -4, 3, 40); g.closePath(); g.fill();
      g.strokeStyle = C.roseD; g.lineWidth = 1.4; g.beginPath(); g.moveTo(1, 48); g.lineTo(-2, -34); g.stroke(); g.restore();
      // sprays
      [-1, 1].forEach(function (s) {
        g.fillStyle = '#8D917A';
        for (var i = 0; i < 6; i++) { var a = lerp(.5, -1.0, i / 5), r = 70; g.save(); g.translate(130 + s * (58 + Math.cos(a) * 12 + i * 2), 118 - i * 17); g.rotate(s * (.9 - i * .12)); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 12, -9, s * 26, 0); g.quadraticCurveTo(s * 12, 9, 0, 0); g.fill(); g.restore(); }
      });
    });
    // little bird
    st.bird = F.path('M0,0 C-10,-12 -26,-14 -40,-6 C-28,-8 -16,-4 -8,6 C-18,6 -26,10 -32,16 C-20,14 -8,14 0,8 C10,14 22,16 34,14 C26,8 18,4 8,4 C16,-6 28,-12 42,-12 C26,-18 10,-12 0,0 Z', 3);
    // the book
    st.book = F.sprite(1000, 220, function (g) { // world x = 40.., y = 1290..
      var cx = 500, i, R = F.rng(109);
      SH(g, 18, 9, .36);
      g.fillStyle = '#5E6550'; g.beginPath(); g.moveTo(cx - 398, 24); g.lineTo(cx + 398, 24); g.lineTo(cx + 468, 172); g.lineTo(cx - 468, 172); g.closePath(); g.fill();
      g.shadowColor = 'rgba(0,0,0,0)';
      // page blocks
      for (i = 3; i >= 0; i--) {
        g.fillStyle = i ? '#E5DCC2' : '#F6EFDC'; g.strokeStyle = 'rgba(120,104,70,.35)'; g.lineWidth = 1;
        [-1, 1].forEach(function (s) {
          g.beginPath(); g.moveTo(cx, 34 + i * 2); g.quadraticCurveTo(cx + s * 180, 20 + i * 2, cx + s * (386 + i * 2), 30 + i * 2);
          g.lineTo(cx + s * (452 + i * 3), 156 + i * 4); g.quadraticCurveTo(cx + s * 200, 140 + i * 4, cx, 160 + i * 4); g.closePath(); g.fill(); g.stroke();
        });
      }
      // gutter shadow
      var gg = g.createLinearGradient(cx - 70, 0, cx + 70, 0); gg.addColorStop(0, 'rgba(90,76,48,0)'); gg.addColorStop(.5, 'rgba(90,76,48,.34)'); gg.addColorStop(1, 'rgba(90,76,48,0)');
      g.fillStyle = gg; g.fillRect(cx - 70, 26, 140, 140);
      // lines of text
      g.strokeStyle = 'rgba(70,62,44,.3)'; g.lineWidth = 1.3;
      [-1, 1].forEach(function (s) {
        for (i = 0; i < 8; i++) { var y = 52 + i * 12.5, k = i / 8; g.beginPath(); g.moveTo(cx + s * 50, y); g.lineTo(cx + s * (lerp(350, 398, k) - (i % 3 === 2 ? 70 : 0)), y - 5 + k * 3); g.stroke(); }
      });
      g.fillStyle = C.rose; g.fillRect(cx - 392 + 46, 44, 26, 26); // illuminated initial
      g.fillStyle = '#C9A964'; g.fillRect(cx - 2, 150, 4, 60); // ribbon marker
    });
    // F5 — foreground foliage at the wings (dark, close to the lens)
    var dk = [F.art.leafSprite('laurel', ['#6A705A', '#565D49', '#3F4536'], 331), F.art.leafSprite('laurel', ['#565D49', '#454B3B', '#33382C'], 332)];
    st.dkLeaves = dk;
    st.wings = [
      F.art.branch({ pts: [[-30, 1120], [40, 1010], [110, 930], [200, 880]], n: 8, len: [120, 170], spread: .7, tones: 2, seed: 111, w0: 8, w1: 2, stemCol: '#3F4536' }),
      F.art.branch({ pts: [[W + 30, 1060], [W - 50, 960], [W - 120, 890], [W - 190, 850]], n: 8, len: [120, 170], spread: .7, tones: 2, seed: 113, w0: 8, w1: 2, stemCol: '#3F4536' }),
      F.art.branch({ pts: [[-30, 760], [30, 700], [90, 668], [150, 656]], n: 6, len: [90, 130], spread: .7, tones: 2, seed: 115, w0: 6, w1: 2, stemCol: '#3F4536' }),
      F.art.branch({ pts: [[W + 30, 700], [W - 40, 650], [W - 100, 626], [W - 150, 618]], n: 6, len: [90, 130], spread: .7, tones: 2, seed: 117, w0: 6, w1: 2, stemCol: '#3F4536' })
    ];
    st.sun = F.sprite(700, 700, function (g) {
      var R = F.rng(119);
      F.wash(g, F.blob(350, 350, 300, 300, R, 24, .06), '#EBD9B4', { R: R, layers: 16, alpha: .03, mag: .08 });
      F.wash(g, F.blob(350, 350, 190, 190, R, 22, .05), C.roseL, { R: R, layers: 14, alpha: .03, mag: .06 });
      F.wash(g, F.blob(350, 350, 120, 120, R, 20, .04), '#F3E3BB', { R: R, layers: 14, alpha: .06, mag: .05, edge: .2 });
      F.granulate(g, 700, 700, R, 3000, .12);
    }, Math.min(F.Q, .75));
  }

  F.acts.fable = {
    build: function () { buildLayers(); },
    /** the stage: every paper layer, with parallax push-in; returns nothing, draws into ctx */
    stage: function (ctx, t) {
      var push = p(t, 99.5, 113.5, E.inOutS), i;
      function layer(spr, zoom, t0, hinge, a) {
        var r = E.outBack(seg(t, t0, t0 + 1.9)), al = clamp(seg(t, t0, t0 + .5)) * (a === undefined ? 1 : a); if (r <= 0 || al <= 0) return;
        var z = 1 + push * zoom;
        ctx.save(); ctx.translate(ANCH.x, ANCH.y); ctx.scale(z, z); ctx.translate(-ANCH.x, -ANCH.y);
        ctx.translate(0, hinge); ctx.scale(1, r); ctx.translate(0, -hinge);
        ctx.globalAlpha = al; ctx.drawImage(spr.c, 0, Y0, W, LH); ctx.restore(); ctx.globalAlpha = 1;
      }
      // F0 — watercolour sun
      F.blit(ctx, st.sun, 560, 930, { a: p(t, 94, 99, E.inOutS) * .95, sc: 1 + push * .03 });
      // the book opens: each page unfolds from the gutter
      var bq = p(t, 93.6, 96.8, E.out);
      if (bq > 0) {
        var bz = 1 + push * .16, q = F.Q;
        ctx.save(); ctx.translate(ANCH.x, ANCH.y); ctx.scale(bz, bz); ctx.translate(-ANCH.x, -ANCH.y); ctx.globalAlpha = clamp(bq * 2.5);
        ctx.drawImage(st.book.c, (500 - 500 * bq) * q, 0, 1000 * bq * q, 220 * q, 540 - 500 * bq, 1290, 1000 * bq, 220);
        ctx.restore(); ctx.globalAlpha = 1;
      }
      layer(st.L1, .05, 95.3, 1350);
      // crest stands at the back of the stage
      var cq = E.outBack(seg(t, 96.6, 98.4));
      if (cq > 0) F.blit(ctx, st.crest, 540, 1440 - (1440 - 838) * (1 + push * .05), { ax: .5, ay: 1, sy: cq, sx: lerp(.8, 1, cq), a: clamp(cq * 3) });
      layer(st.L2, .09, 95.9, 1362);
      // birds cross the sky
      for (i = 0; i < 3; i++) {
        var bt = seg(t, 98 + i * 2.2, 118 + i * 2.2); if (bt <= 0 || bt >= 1) continue;
        var bx = lerp(-60, W + 60, bt), by = 700 + i * 46 + Math.sin(bt * 9 + i) * 26 - bt * 90, flap = Math.sin(t * 7 + i * 2);
        ctx.save(); ctx.translate(bx, by); ctx.scale(.62 - i * .08, (.62 - i * .08) * (.55 + .45 * flap)); ctx.fillStyle = F.rgba('#565D49', .85); F.fillPath(ctx, st.bird); ctx.restore();
      }
      // F3 — canopy and mound grow up around the printed figures
      var g3 = p(t, 94.4, 97.4, E.inOutS), z3 = 1 + push * .1;
      ctx.save(); ctx.translate(ANCH.x, ANCH.y); ctx.scale(z3, z3); ctx.translate(-ANCH.x, -ANCH.y);
      if (g3 > 0) {
        var rise = Y0 + LH - (LH + 40) * g3;
        ctx.save(); ctx.beginPath(); ctx.rect(0, rise, W, H); ctx.clip(); ctx.globalAlpha = clamp(g3 * 2);
        ctx.drawImage(st.L3.c, 0, Y0, W, LH); ctx.restore(); ctx.globalAlpha = 1;
      }
      // fox and crow (registered with the pediment relief they came from)
      var fa = p(t, 91.4, 94.0, E.inOutS);
      if (fa > 0) {
        ctx.globalAlpha = fa;
        var look = .2 + p(t, 113.2, 116.4, E.inOut) * .5 + Math.sin(t * .9) * .012, hop = Math.sin(t * 1.7) * .02;
        ctx.save(); ctx.translate(CROW.x, CROW.y); ctx.rotate(hop); F.FIG.crow(ctx, 'paper'); ctx.restore();
        ctx.save(); ctx.translate(FOX.x, FOX.y); F.FIG.fox(ctx, 'paper', look); ctx.restore();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      layer(st.L4, .36, 96.7, 1400);
      // F5 — wings of dark foliage, strongest parallax
      var wq = p(t, 97.2, 101.5, E.inOutS);
      if (wq > 0) st.wings.forEach(function (b, k) {
        ctx.save(); ctx.translate((k % 2 ? 1 : -1) * push * 150, push * (k < 2 ? 40 : -10));
        F.art.drawBranch(ctx, b, st.dkLeaves, E.inOutS(seg(wq, (k > 1 ? .3 : 0), (k > 1 ? 1 : .7))), t + k, 1, .04); ctx.restore();
      });
    },

    draw: function (ctx, t) {
      var d = F.dark(t), sink = p(t, 114.2, 119.6, E.inOut);
      if (sink >= 1) return;
      var dy = sink * 760, sc = F.scratch(), g = sc.g;
      g.save(); g.translate(0, dy); this.stage(g, t); g.restore();
      g.setTransform(F.Q, 0, 0, F.Q, 0, 0); g.globalAlpha = 1;
      // the theatre melts into the page under the captions, and never climbs into the title
      var vg = g.createLinearGradient(0, 1446, 0, 1500); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = vg; g.fillRect(0, 1446, W, H - 1446);
      var keep = 1 - sink;
      if (keep > 0) { var tg = g.createLinearGradient(0, 552, 0, 640); tg.addColorStop(0, 'rgba(0,0,0,' + keep + ')'); tg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg; g.fillRect(0, 0, W, 640); }
      if (d > 0.001) { // dusk: the theatre darkens to a silhouette and sinks as we look up
        g.globalCompositeOperation = 'source-atop'; g.globalAlpha = Math.min(.88, d * 1.6); g.fillStyle = '#23271D'; g.fillRect(0, 0, W, H);
      }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      ctx.drawImage(sc.c, 0, 0, W, H);
      F.titleBlock(ctx, S.ACTS[4], t, { x: 540, y: 352, t0: 95.2, out0: 111.8, out1: 113.6, size: 150 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
