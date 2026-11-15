/* 序 · 展卷（0–13 s）：纸、一滴墨、一道水线、题名。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var HZ = 1040, DX = 560, st = {};

  F.acts.xu = {
    build: function () {
      // 墨晕
      st.bloom = F.sprite(520, 520, function (g) {
        var R = F.rng(5), i;
        function disc(x, y, r, a) { var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, F.rgba(C.ink, a)); gr.addColorStop(.5, F.rgba(C.ink, a * .72)); gr.addColorStop(.8, F.rgba(C.ink, a * .34)); gr.addColorStop(1, F.rgba(C.ink, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); }
        for (i = 0; i < 46; i++) { var an = R() * 6.28, d = Math.sqrt(R()) * 120; disc(260 + Math.cos(an) * d, 260 + Math.sin(an) * d, R.range(50, 120), R.range(.03, .07)); }
        disc(260, 260, 150, .3); disc(256, 262, 80, .42); disc(262, 258, 38, .5);
        g.strokeStyle = F.rgba(C.ink, .05); g.lineWidth = 3; for (i = 0; i < 5; i++) { g.beginPath(); g.arc(260 + R.range(-8, 8), 260 + R.range(-8, 8), 150 + i * 12, 0, 6.3); g.stroke(); }
        F.granulate(g, 520, 520, R, 2600, .12);
      });
      // 一笔水线：湿处浓，尽处飞白
      st.line = F.sprite(W, 90, function (g) {
        var R = F.rng(7), i;
        for (i = 0; i < 70; i++) {
          var y = 45 + R.gauss() * 7, half = R.range(260, 560) * (1 - Math.abs(R.gauss()) * .25), a = R.range(.05, .2);
          var gr = g.createLinearGradient(DX - half, 0, DX + half, 0); gr.addColorStop(0, F.rgba(C.ink, 0)); gr.addColorStop(.2, F.rgba(C.ink, a)); gr.addColorStop(.5, F.rgba(C.ink, a * 1.7)); gr.addColorStop(.8, F.rgba(C.ink, a)); gr.addColorStop(1, F.rgba(C.ink, 0));
          g.strokeStyle = gr; g.lineWidth = R.range(.7, 2.6); g.beginPath(); g.moveTo(DX - half, y + R.range(-2, 2)); g.quadraticCurveTo(DX, y + R.range(-3, 3), DX + half, y + R.range(-2, 2)); g.stroke();
        }
        F.granulate(g, W, 90, R, 1600, .2);
      });
      st.shade = F.glowSprite(700, '#1A1710', .9, 1.3);
    },
    paint: function (ctx, t) {
      ctx.drawImage(F.assets.paper.c, 0, 0, W, H);
      // 灯下的纸：四周暗，慢慢亮起
      var dim = 1 - p(t, 0, 3.4, E.inOutS);
      if (dim > 0) { ctx.fillStyle = 'rgba(22,19,14,' + (.9 * dim) + ')'; ctx.fillRect(0, 0, W, H); }
      var vg = ctx.createRadialGradient(540, 900, 300, 540, 900, 1250); vg.addColorStop(0, 'rgba(60,48,26,0)'); vg.addColorStop(1, 'rgba(60,48,26,' + (.2 + .05 * Math.sin(t * .7)) + ')');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      // 墨滴
      var fall = seg(t, 1.5, 2.1);
      if (fall > 0 && fall < 1) { var y = lerp(380, HZ, fall * fall); ctx.fillStyle = C.ink; ctx.globalAlpha = clamp(fall * 5); ctx.beginPath(); ctx.moveTo(DX, y - 26); ctx.bezierCurveTo(DX + 5, y - 10, DX + 8, y - 4, DX + 8, y + 1); ctx.arc(DX, y + 1, 8, 0, Math.PI); ctx.bezierCurveTo(DX - 8, y - 4, DX - 5, y - 10, DX, y - 26); ctx.fill(); ctx.globalAlpha = 1; }
      var bq = p(t, 2.1, 6.5, E.out);
      if (bq > 0) {
        // 墨先晕开，再向两侧走成一道水线——日后的海平面
        F.blit(ctx, st.bloom, DX, HZ, { sc: lerp(.1, .62, bq), sy: lerp(1, .5, p(t, 3, 8, E.inOutS)), a: lerp(1, .55, p(t, 5, 10, E.inOutS)) });
        var lq = p(t, 3.2, 9.4, E.inOutS), half = 600 * lq;
        if (lq > 0) { ctx.save(); ctx.beginPath(); ctx.rect(DX - half, HZ - 60, half * 2, 120); ctx.clip(); ctx.drawImage(st.line.c, 0, HZ - 45, W, 90); ctx.restore(); }
      }
    },
    words: function (ctx, t) {
      if (t > 15) return;
      var out = 1 - p(t, 11.4, 13.4, E.inOutS);
      ctx.globalAlpha = out;
      F.say(ctx, t, 'g0', 340, 470, { color: C.inkL });
      // 题名
      var rv = seg(t, 7.3, 10.6);
      F.vtext(ctx, [S.TITLE], 640, 280, { font: 'xing', size: 196, pitch: 182, color: C.ink, reveal: rv });
      var sq = E.outBack(seg(t, 10.3, 11.1));
      if (sq > 0) F.blit(ctx, F.assets.seals['一昼夜'], 520, 890, { sc: .8 * (.9 + .1 * sq), a: clamp(sq * 2) });
      F.vtext(ctx, ['六首诗'], 520, 620, { font: 'sc', weight: 300, size: 31, pitch: 52, color: C.inkL, alpha: p(t, 10.0, 11.2, E.inOutS) });
      ctx.globalAlpha = 1;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
