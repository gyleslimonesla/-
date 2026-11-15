/* 落霞 · 日入 · 王勃《滕王阁序》（131–139 s）：秋水共长天一色。朱砂、赭、金、石青——壁画般的平涂。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, HZ = 1010, TXT = '#FBF2DE', HALO = 'rgba(70,40,34,.6)';
  F.SUNSET = { x: 540, y: HZ };

  function band(w, h, seed, cols) { // 一带霞：水色晕开的长云，顶上一线金
    return F.sprite(w, h, function (g) {
      var R = F.rng(seed), i;
      cols.forEach(function (col, k) {
        var y = h * (.34 + .16 * k), x0 = w * R.range(.04, .2), x1 = w * R.range(.78, .96), th = h * R.range(.1, .17), top = [], bot = [], n = 12;
        for (i = 0; i <= n; i++) { var u = i / n, x = lerp(x0, x1, u), e = Math.pow(Math.sin(Math.PI * u), .7), wob = F.noise(u * 5, seed + k) * h * .05; top.push([x, y - th * e * .55 + wob]); bot.unshift([x, y + th * e * .45 + wob]); }
        var pts = top.concat(bot);
        F.wash(g, pts, col, { R: R, layers: 14, alpha: .075, mag: .05 });
        F.wash(g, pts.map(function (q) { return [q[0], y + (q[1] - y) * .5]; }), col, { R: R, layers: 8, alpha: .06, mag: .06 });
        if (k === 0) { g.strokeStyle = 'rgba(240,210,140,.55)'; g.lineWidth = 1.3; g.beginPath(); for (i = 2; i <= n - 2; i++) g[i === 2 ? 'moveTo' : 'lineTo'](top[i][0], top[i][1] - 2); g.stroke(); }
      });
      F.granulate(g, w, h, R, w * h / 300, .14);
    });
  }

  F.acts.xia = {
    pre: 2.4, post: 1.4,
    build: function () {
      var hz = HZ / H;
      st.bg = F.sprite(W, H, function (g) {
        var R = F.rng(601);
        K.vgrad(g, 0, 0, W, H, [[0, '#56687C'], [.17, '#8E7A80'], [.32, '#C98466'], [.44, '#E3A868'], [hz, '#F2D08C'], [hz + .001, '#EDBE7C'], [hz + .14, '#D29468'], [hz + .3, '#9E7870'], [1, '#5E6478']]);
        for (var i = 0; i < 18; i++) F.wash(g, F.blob(R() * W, R() * H, R.range(180, 420), R.range(30, 80), R, 12, .3), i % 2 ? '#B8402E' : '#F6DFA8', { R: R, layers: 5, alpha: .014, mag: .3 });
      }, Math.min(F.Q, .5));
      st.sun = F.sprite(240, 240, function (g) { var gr = g.createRadialGradient(120, 120, 10, 120, 120, 112); gr.addColorStop(0, '#F9B46A'); gr.addColorStop(.6, '#EE7A48'); gr.addColorStop(1, '#D9502F'); g.fillStyle = gr; g.beginPath(); g.arc(120, 120, 108, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(240,206,130,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(120, 120, 107, 0, 6.3); g.stroke(); });
      st.glow = F.glowSprite(560, '#F6B46A', .6, 1.9);
      st.bands = [band(980, 220, 611, ['#B5503A', '#D99A58']), band(760, 180, 613, ['#9E4E5A', '#C4683F']), band(1080, 240, 615, ['#C4683F', '#E3B066', '#A8566A']), band(680, 160, 617, ['#8A4E58', '#B9703F']), band(880, 190, 619, ['#DDA458', '#B5503A'])];
      // 远岸一线与高阁
      st.shore = F.sprite(W, 240, function (g) {
        var R = F.rng(621), pts = K.ridge({ x0: -20, x1: 1100, base: 222, amp: 26, seed: 81, f: [.008, .03, .1] });
        K.tracePts(g, pts, 240); g.fillStyle = '#5A3A3C'; g.fill();
        var cx = 850, y = 206; g.fillStyle = '#4A2E32'; g.fillRect(cx - 62, y - 26, 124, 30);
        [[150, 30, 0], [116, 27, 52], [84, 24, 100]].forEach(function (r) { K.roof(g, cx, y - 54 - r[2], r[0], r[1], '#4A2E32', { curl: 13, line: 'rgba(240,200,120,.75)' }); g.fillStyle = '#4A2E32'; g.fillRect(cx - r[0] * .3, y - 26 - r[2], r[0] * .6, 26); });
      });
    },
    paint: function (ctx, t) {
      var i, sink = p(t, 129, 140, E.inOutS), sy = lerp(880, HZ + 26, sink), one = p(t, 135.6, 139.6, E.inOutS);
      ctx.drawImage(st.bg.c, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HZ); ctx.clip();
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.glow, 540, sy, { a: .8 }); ctx.globalCompositeOperation = 'source-over';
      F.blit(ctx, st.sun, 540, sy, {});
      ctx.restore();
      // 霞
      [[0, 300, 470, 14], [1, 760, 610, -10], [2, 420, 730, 9], [3, 900, 860, -7], [4, 160, 900, 6]].forEach(function (b) { F.blit(ctx, st.bands[b[0]], b[1] + (t - 135) * b[3], b[2], { a: .95 }); });
      ctx.drawImage(st.shore.c, 0, HZ - 222, W, 240);
      // 秋水：把天再画一遍
      ctx.save(); ctx.beginPath(); ctx.rect(0, HZ, W, H - HZ); ctx.clip();
      ctx.globalAlpha = .42; ctx.save(); ctx.translate(0, 2 * HZ); ctx.scale(1, -1);
      [[0, 300, 470, 14], [1, 760, 610, -10], [2, 420, 730, 9], [3, 900, 860, -7], [4, 160, 900, 6]].forEach(function (b) { F.blit(ctx, st.bands[b[0]], b[1] + (t - 135) * b[3], b[2], { a: .8 }); });
      F.blit(ctx, st.sun, 540, sy, {}); ctx.restore(); ctx.globalAlpha = 1;
      K.ripples(ctx, t, { n: 150, y0: HZ + 8, y1: 1900, focus: [540, 150], col: '#FBD48C', seed: 9, len: 40, alpha: .9, lw: 2.2, pow: 1.4 });
      K.ripples(ctx, t, { n: 80, x0: 0, x1: W, y0: HZ + 10, y1: 1900, col: '#7A4A4A', seed: 19, len: 40, alpha: .28, lw: 1.4, pow: 1.2 });
      ctx.restore();
      // 孤鹜
      var bq = seg(t, 130.6, 139.4); if (bq > 0 && bq < 1) { var bx = lerp(-120, 1220, bq), by = 860 - bq * 240 + Math.sin(bq * 7) * 12; K.bird(ctx, bx, by, 2.5, t * 5.2, '#2E2226', -.12); ctx.globalAlpha = .25; K.bird(ctx, bx, 2 * HZ - by, 2.5, t * 5.2, '#2E2226', .12); ctx.globalAlpha = 1; }
      // 共长天一色：水线化去
      if (one > 0) { K.vgrad(ctx, 0, HZ - 360, W, 720, [[0, 'rgba(206,140,104,0)'], [.5, 'rgba(206,140,104,' + (.92 * one) + ')'], [1, 'rgba(206,140,104,0)']]); F.blit(ctx, st.sun, 540, sy, { a: one * (1 - seg(t, 138.4, 139.8)), sc: lerp(1, .5, one) }); }
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'l1', 962, 230, { color: TXT, halo: HALO });
      F.sign(ctx, t, 'xia', 78, 240, { color: TXT, halo: HALO, delay: 1.6, early: 1.2, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
