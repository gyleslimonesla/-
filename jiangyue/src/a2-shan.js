/* 二 · 人定 · 王维《山居秋暝》（39–62 s）：空山新雨后。竹青、松烟、浅墨、秋月白。立轴水墨。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, INK = '#23261F', GREEN = '#48634F';
  F.MOON = { x: 610, y: 505 };
  var STREAM = [[430, 1040], [500, 1120], [452, 1218], [540, 1322], [612, 1430], [548, 1548], [600, 1664], [570, 1790]];

  function bambooSprite(seed, tone) {
    return F.sprite(420, 900, function (g) {
      var R = F.rng(seed), i, k;
      for (i = 0; i < 6; i++) {
        var bx = 40 + i * 58 + R.range(-14, 14), top = R.range(40, 260), lean = R.range(-.06, .1), wdt = R.range(5, 9);
        var sp = F.spline([[bx, 900], [bx + lean * 300, 600], [bx + lean * 620, 300], [bx + lean * 880 + R.range(-10, 20), top]], false, 8);
        g.fillStyle = F.rgba(GREEN, tone * R.range(.6, .9)); F.ribbon(g, sp, 0, 1, function (u) { return lerp(wdt, wdt * .4, u); });
        g.strokeStyle = F.rgba(C.paper, .55); g.lineWidth = 2; for (k = 1; k < 8; k++) { var q = F.at(sp, k / 8 + R.range(-.02, .02)); g.beginPath(); g.moveTo(q.x - wdt, q.y); g.lineTo(q.x + wdt, q.y); g.stroke(); }
        for (k = 0; k < 7; k++) { // 叶：个字、介字
          var q2 = F.at(sp, R.range(.42, 1)), side = R() < .5 ? -1 : 1, cx = q2.x + side * R.range(14, 70), cy = q2.y + R.range(-10, 24), n = 3 + (R() * 3 | 0);
          g.strokeStyle = F.rgba(GREEN, tone * .7); g.lineWidth = 1.2; g.beginPath(); g.moveTo(q2.x, q2.y); g.lineTo(cx, cy); g.stroke();
          for (var j = 0; j < n; j++) {
            var a = Math.PI / 2 + side * .25 + (j - (n - 1) / 2) * .46 + R.range(-.1, .1), L = R.range(46, 84), wd = R.range(5, 8.5);
            g.save(); g.translate(cx, cy); g.rotate(a - Math.PI / 2); g.fillStyle = F.rgba(j % 2 ? GREEN : '#33483A', tone * R.range(.55, .95));
            g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(wd, L * .2, wd, L * .5, 0, L); g.bezierCurveTo(-wd, L * .5, -wd, L * .2, 0, 0); g.fill(); g.restore();
          }
        }
      }
    });
  }

  F.acts.shan = {
    pre: 2.6, post: 2.0,
    build: function () {
      var M = F.MOON;
      // 烘云托月：四周淡染，月是留出来的纸
      st.sky = F.sprite(W, H, function (g) {
        var R = F.rng(201);
        K.vgrad(g, 0, 0, W, 1250, [[0, 'rgba(92,110,124,.62)'], [.45, 'rgba(120,136,144,.38)'], [1, 'rgba(150,160,160,0)']]);
        for (var i = 0; i < 22; i++) F.wash(g, F.blob(R() * W, R() * 800, R.range(180, 420), R.range(50, 130), R, 12, .3), i % 2 ? '#5E7282' : '#F4EFE2', { R: R, layers: 5, alpha: .014, mag: .3 });
        g.globalCompositeOperation = 'destination-out';
        var gr = g.createRadialGradient(M.x, M.y, 100, M.x, M.y, 330); gr.addColorStop(0, 'rgba(0,0,0,.66)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 1000);
        g.fillStyle = '#000'; g.beginPath(); g.arc(M.x, M.y, 118, 0, 6.3); g.fill();
        g.globalCompositeOperation = 'source-over';
        g.strokeStyle = 'rgba(90,108,122,.3)'; g.lineWidth = 1.2; g.beginPath(); g.arc(M.x, M.y, 118, 0, 6.3); g.stroke();
      }, Math.min(F.Q, .75));
      st.moonLight = F.glowSprite(118, '#FFFDF4', .75, .35);
      st.mist = K.mistSprite(2160, 260, 203, '#F5F0E3', 1.25);
      // 远山
      st.far = F.sprite(W, 980, function (g) {
        var R = F.rng(205);
        K.inkMount(g, K.ridge({ x0: -20, x1: 1100, base: 760, amp: 120, seed: 21, peaks: [[905, 420, 150], [700, 180, 110]] }), 880, INK, .17, .45, R, .2);
        K.inkMount(g, K.ridge({ x0: -20, x1: 1100, base: 820, amp: 110, seed: 22, peaks: [[388, 650, 172], [180, 260, 130], [590, 220, 90]] }), 980, INK, .26, .42, R, .35);
        F.granulate(g, W, 980, R, 5000, .12);
      });
      // 中景山梁与小松
      st.mid = F.sprite(W, 700, function (g) {
        var R = F.rng(207), pts = K.ridge({ x0: -20, x1: 1100, base: 420, amp: 90, seed: 24, peaks: [[1040, 240, 260], [60, 60, 150]] });
        K.inkMount(g, pts, 700, INK, .42, .5, R, .5);
        for (var i = 0; i < 6; i++) { var q = pts[24 + i * 24 + (R() * 12 | 0)]; if (q) K.pine(g, q[0], q[1] + 8, R.range(70, 150), R, INK, { branches: 5, alpha: .55, lean: R.range(-.18, .18) }); }
        F.granulate(g, W, 700, R, 4000, .13);
      });
      // 近处山石、双松、泉
      st.near = F.sprite(W, 1060, function (g) { // world y = 940 + local
        var R = F.rng(209), i, oy = 940;
        // 山石：右高左低，夹出一道泉
        K.inkMount(g, K.ridge({ x0: 470, x1: 1500, base: 1060, amp: 70, seed: 31, taper: 330, peaks: [[1010, 760, 250], [760, 390, 150]] }), 1060, INK, .8, .92, R, .7);
        K.inkMount(g, K.ridge({ x0: -420, x1: 560, base: 1060, amp: 60, seed: 33, taper: 300, peaks: [[40, 560, 250], [300, 300, 130]] }), 1060, INK, .62, .9, R, .6);
        // 泉身：留白
        var sp = F.spline(STREAM.map(function (q) { return [q[0], q[1] - oy]; }), false, 6), sw = function (u) { return lerp(14, 96, Math.pow(u, 1.4)); };
        g.fillStyle = F.rgba('#F4EFE2', .97); F.ribbon(g, sp, 0, 1, sw);
        g.fillStyle = F.rgba('#D5DEDA', .55); F.ribbon(g, sp, 0, 1, function (u) { return sw(u) * .45; });
        // 石：夹泉而立
        [[.1, -1, 52], [.2, 1, 40], [.36, -1, 70], [.5, 1, 84], [.66, -1, 62], [.8, 1, 92], [.93, -1, 78]].forEach(function (r) { var q = F.at(sp, r[0]), w = sw(r[0]) / 2 + r[2] * .6; K.rock(g, q.x + r[1] * w, q.y + 8, r[2], r[2] * .6, R, INK, 1.05); });
        st.sp = F.spline(STREAM, false, 6);
        // 下方潭水淡染
        K.vgrad(g, 0, 760, W, 300, [[0, 'rgba(150,172,170,0)'], [.4, 'rgba(150,172,170,.28)'], [1, 'rgba(120,146,150,.42)']]);
        // 双松
        K.pine(g, 1010, 1300 - oy, 430, R, INK, { lean: .1, branches: 6, alpha: .7 });
        K.pine(g, 900, 1330 - oy, 870, R, INK, { lean: -.2, branches: 10 });
        F.granulate(g, W, 1060, R, 6000, .1);
      });
      st.bamboo = [bambooSprite(211, .95), bambooSprite(213, .6)];
      // 莲叶
      st.lotus = F.sprite(200, 90, function (g) {
        var R = F.rng(215), pts = F.blob(100, 45, 88, 30, R, 16, .1);
        F.wash(g, pts, '#6E957F', { R: R, layers: 12, alpha: .1, mag: .05, edge: .4 }); F.wash(g, pts, '#3F6654', { R: R, layers: 8, alpha: .05, mag: .08 });
        g.strokeStyle = 'rgba(40,70,58,.4)'; g.lineWidth = 1; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.28; g.beginPath(); g.moveTo(100, 45); g.lineTo(100 + Math.cos(a) * 80, 45 + Math.sin(a) * 27); g.stroke(); }
      });
      st.boat = F.sprite(300, 200, function (g) { g.translate(150, 150); K.raft(g, 250, '#2A2D27'); });
      st.women = F.sprite(120, 90, function (g) { g.translate(34, 80); K.figure(g, 62, { col: '#A77F7C' }); g.fillStyle = '#6C6A5C'; g.fillRect(14, -30, 14, 10); g.translate(50, 2); K.figure(g, 58, { col: '#7C8B86' }); });
    },

    paint: function (ctx, t) {
      var M = F.MOON, cam = p(t, 39, 63, E.inOutS), dy = lerp(70, 0, cam), i;
      ctx.drawImage(F.assets.paper.c, 0, 0, W, H);
      ctx.save(); ctx.translate(0, dy * .3);
      ctx.drawImage(st.sky.c, 0, 0, W, H);
      F.blit(ctx, st.moonLight, M.x, M.y, { a: .55 + .05 * Math.sin(t * .8) });
      ctx.restore();
      var T0 = 39, u = F.since('shan', t);
      K.inkReveal(ctx, st.far, 0, 250 + dy * .5, W, 980, [[388, 720, T0 + 2.0, 3.6, 900], [905, 900, T0 + 2.8, 3.2, 700]], t, { col: INK });
      K.mist(ctx, st.mist, 880 + dy * .6, t, 9, .95, 200);
      K.inkReveal(ctx, st.mid, 0, 760 + dy * .8, W, 700, [[760, 1130, T0 + 3.0, 3.2, 900]], t, { col: INK });
      K.mist(ctx, st.mist, 1090 + dy * .9, t, -13, .8, 1200);
      ctx.save(); ctx.translate(0, dy);
      K.inkReveal(ctx, st.near, 0, 940, W, 1060, [[940, 1360, T0 + 3.6, 3.6, 1000], [150, 1560, T0 + 4.2, 3.2, 800]], t, { col: INK });
      var flow = p(u, 4.6, 8, E.inOutS);
      // 清泉石上流
      ctx.lineCap = 'round';
      for (i = 0; i < 64; i++) {
        var f = (i / 64 + t * (.085 + .03 * K.hash(i))) % 1; if (f > flow) continue; var q = F.at(st.sp, f), wd = lerp(14, 96, Math.pow(f, 1.4)) * .36, off = (K.hash(i * 3.7) - .5) * 2 * wd;
        var nx = -Math.sin(q.a), ny = Math.cos(q.a), L = lerp(10, 30, f) * (.6 + K.hash(i * 1.9));
        ctx.strokeStyle = i % 3 ? 'rgba(255,255,255,' + (.75 * Math.sin(Math.PI * f)) + ')' : 'rgba(110,128,130,' + (.4 * Math.sin(Math.PI * f)) + ')'; ctx.lineWidth = 1.2 + f * 1.6;
        ctx.beginPath(); ctx.moveTo(q.x + nx * off, q.y + ny * off); ctx.lineTo(q.x + nx * off + Math.cos(q.a) * L, q.y + ny * off + Math.sin(q.a) * L); ctx.stroke();
      }
      // 潭中涟漪
      K.ripples(ctx, t, { n: 46, x0: 120, x1: 1060, y0: 1740, y1: 1960, col: '#5F7A7C', seed: 5, len: 30, alpha: .32, lw: 1.3, pow: 1 });
      // 莲动下渔舟
      var bq = p(t, 51, 63, E.out), bx = lerp(1260, 846, bq);
      F.blit(ctx, st.boat, bx, 1836 + Math.sin(t * 1.2) * 2, { ax: .5, ay: 150 / 200 });
      [[700, 1800, .9], [820, 1850, 1.15], [930, 1794, 1], [1010, 1868, 1.2], [620, 1876, .8], [900, 1900, 1.05]].forEach(function (l, k) {
        var push = Math.exp(-Math.pow((l[0] - bx + 60) / 150, 2)) * bq * (1 - seg(t, 62, 64));
        var lq = E.outBack(seg(u, 5 + k * .35, 6.4 + k * .35)); if (lq <= 0) return;
        F.blit(ctx, st.lotus, l[0] - push * 26, l[1] + Math.sin(t * 1.4 + k * 1.7) * (2 + push * 5), { sc: l[2] * lq, rot: Math.sin(t * 1.1 + k) * (.03 + push * .12) });
      });
      // 竹喧归浣女
      var wq = p(t, 44, 60, E.lin), wa = F.io(t, 44, 46.5, 57, 60);
      F.blit(ctx, st.women, lerp(440, 250, wq), 1700 + Math.sin(t * 5) * 1.4, { ax: .5, ay: 1, a: wa * .9 });
      var wind = .5 + .5 * Math.sin(t * .42);
      F.blit(ctx, st.bamboo[1], 20, 1960, { ax: .2, ay: 1, rot: -.03 + Math.sin(t * .9 + 1) * .014 * (1 + wind), sx: 1.0, sy: E.out(seg(u, 4.4, 7.4)) });
      ctx.restore();
      ctx.save(); ctx.translate(0, dy * 1.35);
      F.blit(ctx, st.bamboo[0], -110, 2010, { ax: .1, ay: 1, rot: .02 + Math.sin(t * .8) * .018 * (1 + wind), sx: 1.05, sy: 1.05 * E.out(seg(u, 5, 8)) });
      K.mist(ctx, st.mist, 1420, t, 17, .5, 700);
      ctx.restore();
      F.curtain(ctx, 'shan', t);
    },
    mask: function (g, q) { // 江上的雾升起来，雾散处已是空山
      var yb = lerp(H + 600, -600, E.inOutS(q)), gr = g.createLinearGradient(0, yb - 560, 0, yb + 560);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    },
    veil: function (ctx, q, t) {
      var yb = lerp(H + 600, -600, E.inOutS(q)), a = Math.sin(Math.PI * q);
      K.mist(ctx, st.mist, yb - 330, t, 30, a, 0); K.mist(ctx, st.mist, yb - 160, t, -22, a * .9, 500); K.mist(ctx, st.mist, yb - 40, t, 16, a * .7, 1100);
    },
    words: function (ctx, t) {
      var HALO = 'rgba(244,239,226,.9)';
      F.say(ctx, t, 's0', 250, 250, { color: C.inkL, halo: HALO, weight: 400 });
      F.say(ctx, t, 's1', 262, 230, { color: C.ink, halo: HALO, size: 96 });
      F.say(ctx, t, 's2', 262, 230, { color: C.ink, halo: HALO, size: 96 });
      F.sign(ctx, t, 'shan', 62, 250, { color: C.ink, halo: HALO, delay: 6.4, early: 2.2, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
