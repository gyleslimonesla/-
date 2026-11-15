/* 一 · 黄昏 · 张若虚《春江花月夜》（13–39 s）：海上明月共潮生。银蓝、月白、浅青、淡墨。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var HZ = 1040, MX = 610, T0 = 13, st = {};
  var TXT = '#F2EFE4', HALO = 'rgba(18,28,42,.6)';
  var BR = { x: -30, y: 94, w: 612, h: 571 }; // 近枝在画面上的位置
  var TREES = [[70, 150, 1], [190, 136, 1.15], [300, 138, .95], [420, 150, 1.1], [540, 168, .9], [130, 250, .8], [1010, 362, 1.2], [880, 356, 1], [760, 370, 1.1], [640, 396, .9], [960, 500, .85], [120, 556, 1.3], [300, 560, 1.1]];

  function moonY(t) { return lerp(HZ + 30, 520, p(t, 14.2, 28, E.out)) - 50 * p(t, 27, 41, E.inOutS); }

  F.acts.jiang = {
    pre: 2.4, post: 1.6,
    build: function () {
      st.bg = F.sprite(W, H, function (g) {
        var R = F.rng(101), hz = HZ / H;
        K.vgrad(g, 0, 0, W, H, [[0, '#1E2B40'], [.22, '#31455C'], [hz - .12, '#6F8797'], [hz - .012, '#B7C7CB'], [hz, '#C9D6D6'], [hz + .004, '#A3B8BF'], [hz + .14, '#6A8394'], [.82, '#3C5266'], [1, '#27384C']]);
        for (var i = 0; i < 26; i++) F.wash(g, F.blob(R() * W, R() * HZ * .8, R.range(160, 420), R.range(40, 120), R, 12, .3), i % 2 ? '#8FA6B4' : '#162236', { R: R, layers: 5, alpha: .012, mag: .3 });
      }, Math.min(F.Q, .5));
      st.moon = K.moonSprite(128, '#F6F3E8', '#B9C6CC', 21);
      st.halo = F.glowSprite(520, '#DDE8EA', .5, 2.3); st.halo2 = F.glowSprite(230, '#F3F4EC', .55, 1.8);
      st.mist = K.mistSprite(2160, 220, 23, '#DCE6E8', 1);
      st.far = F.sprite(W, 220, function (g) {
        var R = F.rng(103);
        K.inkMount(g, K.ridge({ x0: -10, x1: 430, base: 196, amp: 80, seed: 3, peaks: [[130, 60, 110]] }), 200, '#1A2738', .62, .8, R);
        K.inkMount(g, K.ridge({ x0: 720, x1: 1090, base: 198, amp: 64, seed: 9, peaks: [[960, 74, 120]] }), 200, '#1A2738', .55, .8, R);
        K.inkMount(g, K.ridge({ x0: 300, x1: 900, base: 200, amp: 22, seed: 14 }), 200, '#22324A', .3, .9, R);
      });
      // 芳甸与花林：月照花林皆似霰
      st.land = F.sprite(W, 640, function (g) {
        var R = F.rng(105), k;
        var A = [[-30, 150], [150, 126], [360, 132], [540, 158], [668, 190], [560, 222], [360, 236], [150, 262], [-30, 290]];
        var B = [[1110, 372], [920, 346], [720, 362], [570, 400], [478, 438], [600, 470], [820, 486], [1110, 512]];
        var Cc = [[-30, 560], [200, 540], [420, 566], [560, 610], [460, 660], [-30, 660]];
        [A, B, Cc].forEach(function (poly) {
          var sp = F.pts(F.spline(poly, true, 12), 1);
          F.wash(g, sp, '#111C2B', { R: R, layers: 14, alpha: .09, mag: .05, edge: .3 });
          F.wash(g, sp.map(function (q) { return [q[0], q[1] + 10]; }), '#0C1420', { R: R, layers: 8, alpha: .06, mag: .06 });
        });
        TREES.forEach(function (q) {
          var x = q[0], y = q[1], s = q[2];
          g.strokeStyle = 'rgba(8,14,22,.85)'; g.lineWidth = 2.6 * s; g.lineCap = 'round';
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + R.range(-8, 8) * s, y - 40 * s, x + R.range(-12, 12) * s, y - 74 * s); g.stroke();
          var cx = x, cy = y - 86 * s, gr = g.createRadialGradient(cx, cy, 2, cx, cy, 82 * s);
          gr.addColorStop(0, 'rgba(240,238,236,.2)'); gr.addColorStop(1, 'rgba(240,238,236,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 82 * s, 0, 6.3); g.fill();
          for (k = 0; k < 80; k++) {
            var a = R() * 6.28, d = Math.sqrt(R()), px = cx + Math.cos(a) * d * 62 * s, py = cy + Math.sin(a) * d * 40 * s;
            g.fillStyle = k % 5 === 0 ? 'rgba(232,206,212,' + R.range(.5, .9) + ')' : 'rgba(250,248,244,' + R.range(.3, .8) + ')';
            g.beginPath(); g.arc(px, py, R.range(1.1, 3.2) * s, 0, 6.3); g.fill();
          }
        });
      });
      st.twinkle = F.glowSprite(9, '#FFFFFF', 1, 1.4);
      // 近枝：先是墨枝，再一朵一朵开
      var R = F.rng(107), limbs = [
        [[-10, 60], [120, 96], [260, 170], [380, 262], [470, 380]], [[150, 108], [230, 96], [330, 104], [420, 86]],
        [[262, 172], [300, 250], [318, 340], [300, 430]], [[384, 266], [440, 268], [510, 290], [560, 340]], [[60, 80], [90, 150], [100, 230]]];
      st.limbS = limbs.map(function (pts) { return F.spline(pts, false, 6); });
      st.branch = F.sprite(600, 560, function (g) { st.limbS.forEach(function (s, i) { g.fillStyle = 'rgba(12,16,22,.94)'; F.ribbon(g, s, 0, 1, function (u) { return lerp(i ? 8 : 15, 1.6, u); }); }); });
      st.petals = [K.petal('round', '#FBF8F4', '#F1DADB', '#D9A5AE', 111), K.petal('round', '#FAF3F0', '#EBC9CE', '#CF939E', 113)];
      st.flowers = []; st.buds = [];
      st.limbS.forEach(function (s, i) {
        var n = i ? 6 : 9, k;
        for (k = 0; k < n; k++) { var q = F.at(s, lerp(.22, 1, (k + R()) / n)), x = q.x + R.range(-16, 16), y = q.y + R.range(-16, 16); st.flowers.push({ x: x, y: y, s: R.range(.8, 1.22), rot: R() * 6.28, d: Math.hypot(x, y - 60), v: k % 2 }); }
        for (k = 0; k < 4; k++) { var q2 = F.at(s, R.range(.3, 1)); st.buds.push([q2.x + R.range(-12, 12), q2.y + R.range(-12, 12), R() * 3, Math.hypot(q2.x, q2.y - 60)]); }
      });
      st.petal = K.petalSprite('#F6ECEA', '#E6BFC5');
      st.boat = F.sprite(280, 160, function (g) { g.translate(140, 120); K.skiff(g, 210, '#0E1722'); });
    },

    paint: function (ctx, t) {
      var i, cam = p(t, 27, 39, E.inOutS), up = cam * 70, my = moonY(t), u = F.since('jiang', t);
      ctx.drawImage(st.bg.c, 0, 0, W, H);
      ctx.save(); ctx.translate(0, up * .5);
      // 月与光
      ctx.save(); ctx.beginPath(); ctx.rect(0, -200, W, HZ + 200); ctx.clip();
      var ma = p(t, 14, 17, E.inOutS);
      F.blit(ctx, st.halo, MX, my, { a: ma * (.8 + .06 * Math.sin(t * .6)), sc: 1.15 });
      F.blit(ctx, st.halo2, MX, my, { a: ma * .9 });
      F.blit(ctx, st.moon, MX, my, { a: ma });
      ctx.restore();
      ctx.drawImage(st.far.c, 0, HZ - 198, W, 220);
      K.mist(ctx, st.mist, HZ - 150, t, 7, .5, 300);
      // 潮：一线一线推来
      ctx.lineCap = 'round';
      for (i = 0; i < 24; i++) {
        var uu = ((i + t * .15) % 24) / 24, y = HZ + 8 + Math.pow(uu, 1.7) * 400, a = Math.sin(Math.PI * uu) * .42;
        ctx.strokeStyle = 'rgba(224,234,236,' + a + ')'; ctx.lineWidth = .8 + uu * 2; ctx.beginPath();
        var amp = 2 + uu * 6, wl = 150 + i * 13 % 160, ph = i * 2.1 + t * .35;
        for (var x = -20; x <= W + 20; x += 40) ctx[x < 0 ? 'moveTo' : 'lineTo'](x, y + Math.sin(x / wl * 6.28 + ph) * amp + Math.sin(x / 61 + i) * amp * .3);
        ctx.stroke();
      }
      var rise = seg(my, HZ + 30, HZ - 200);
      K.ripples(ctx, t, { n: 190, y0: HZ + 6, y1: HZ + 560, focus: [MX, 105], col: '#FBFAF2', seed: 3, len: 34, pow: 1.5, alpha: 1 * rise, lw: 2.2, near: false });
      K.ripples(ctx, t, { n: 60, x0: 0, x1: W, y0: HZ + 20, y1: 1900, col: '#C7D5DA', seed: 9, len: 26, pow: 1.3, alpha: .28, lw: 1.3 });
      ctx.restore();

      // 芳甸：两点墨落入水中，晕成洲渚
      ctx.save(); ctx.translate(0, up * 1.1);
      var bx = lerp(430, 640, seg(t, 13, 40)), by = 1352 + Math.sin(t * 1.1) * 2, ba = p(u, 2.4, 5, E.inOutS);
      ctx.globalAlpha = .28 * ba; ctx.save(); ctx.translate(bx, by + 2); ctx.scale(1, -.7); ctx.drawImage(st.boat.c, -140, -120, 280, 160); ctx.restore(); ctx.globalAlpha = 1;
      F.blit(ctx, st.boat, bx, by, { ax: .5, ay: 120 / 160, rot: Math.sin(t * .9) * .012, a: ba });
      K.inkReveal(ctx, st.land, 0, 1330, W, 640, [[300, 1520, T0 + 2.7, 3.4, 760], [820, 1740, T0 + 3.5, 3.4, 760], [220, 1900, T0 + 4.2, 3, 600]], t, { col: '#0C1420' });
      // 月照花林皆似霰：林间的碎光
      var tw = p(u, 4, 8, E.inOutS);
      if (tw > 0) { ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < 78; i++) { var tr = TREES[i % TREES.length], fl = Math.max(0, Math.sin(t * (1.6 + K.hash(i) * 2.4) + i * 2.7)); if (fl < .5) continue; F.blit(ctx, st.twinkle, tr[0] + (K.hash(i * 3.3) - .5) * 110 * tr[2], 1330 + tr[1] - 86 * tr[2] + (K.hash(i * 5.1) - .5) * 70 * tr[2], { sc: .6 + K.hash(i * 7) * 1.1, a: (fl - .5) * 2 * tw }); } ctx.globalCompositeOperation = 'source-over'; }
      K.mist(ctx, st.mist, 1500, t, -11, .34, 900);
      K.mist(ctx, st.mist, 1730, t, 14, .3, 100);
      ctx.restore();
      // 近枝：点墨成枝，花次第开
      var sway = (Math.sin(t * .5) * .012 + Math.sin(t * 1.3) * .004) * p(u, 6, 9, E.inOutS);
      if (u < 6) K.inkReveal(ctx, st.branch, BR.x, BR.y, BR.w, BR.h, [[BR.x + 10, BR.y + 70, T0 + 2.4, 3.4, 760]], t, { soft: .3 });
      ctx.save(); ctx.translate(-cam * 40 + BR.x, up * 1.8 + BR.y + 57); ctx.rotate(sway); ctx.scale(1.02, 1.02); ctx.translate(0, -57);
      if (u >= 6) ctx.drawImage(st.branch.c, 0, 0, 600, 560);
      for (i = 0; i < st.buds.length; i++) { var b = st.buds[i], bq = E.outBack(seg(u, 2.0 + b[3] / 260, 2.6 + b[3] / 260)); if (bq > 0) { ctx.fillStyle = F.rgba(C.rouge, .8); ctx.beginPath(); ctx.ellipse(b[0], b[1], 4 * bq, 5.5 * bq, b[2], 0, 6.3); ctx.fill(); } }
      for (i = 0; i < st.flowers.length; i++) { var f = st.flowers[i], t1 = 2.6 + f.d / 150; K.bloom5(ctx, st.petals[f.v], f.x, f.y, f.s, f.rot + Math.sin(t * .8 + i) * .04, seg(u, t1, t1 + 2.6), t); }
      ctx.restore();
      K.fall(ctx, st.petal, t, { n: 16, seed: 4, life: 12, x0: -80, x1: 620, y0: 200, y1: 1750, dx: 420, sway: 46, sc: 1.05, alpha: .9 * p(u, 5, 9) });
      F.curtain(ctx, 'jiang', t);
    },
    mask: function (g, q) { // 夜色自上而下晕开
      var yb = lerp(-520, H + 520, E.inOutS(q)), gr = g.createLinearGradient(0, yb - 500, 0, yb + 500);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'j0', 250, 1110, { color: TXT, halo: HALO, weight: 400 });
      F.say(ctx, t, 'j1', 956, 230, { color: TXT, halo: HALO });
      F.say(ctx, t, 'j2', 956, 230, { color: TXT, halo: HALO });
      F.say(ctx, t, 'j3', 250, 1110, { color: TXT, halo: HALO, weight: 400 });
      F.sign(ctx, t, 'jiang', 962, 900, { color: TXT, halo: HALO, early: 2.2, weight: 400, delay: 7 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
