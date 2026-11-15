/* 跋 · 收卷（165–180 s）：一昼夜看完，原是一卷。月亮还是那一个。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, M = { x: 540, y: 500, r: 150 }, SH = 520, PITCH = 520, FEATH = 90, HALO = 'rgba(244,239,226,.9)';
  // 每一章取一帧，裁出地平线上下的一带
  var CUT = [['jiang', 30, 400], ['shan', 56, 400], ['feng', 72.5, 650], ['baidi', 99.5, 560], ['xihu', 115.5, 560], ['xia', 134.2, 500], ['yuan', 149.6, 610]];

  F.acts.ba = {
    pre: 2.6, post: 1.8,
    build: function () {
      var n = CUT.length, total = (n - 1) * PITCH + PITCH + FEATH, q = F.Q, sq = Math.min(q, .75);
      var buf = F.assets.buf, seg1 = F.sprite(PITCH + FEATH, SH, null, sq), srcH = (PITCH + FEATH) / W * H;
      st.total = total;
      st.strip = F.sprite(total, SH, function (g) {
        g.fillStyle = C.paper; g.fillRect(0, 0, total, SH);
        for (var i = 0; i < n; i++) {
          var c = CUT[i], bg = buf.g;
          bg.setTransform(q, 0, 0, q, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over'; bg.clearRect(0, 0, W, H);
          F.acts[c[0]].paint(bg, c[1]);
          bg.setTransform(q, 0, 0, q, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over';
          var sg = seg1.g, w1 = PITCH + FEATH, sh = SH / w1 * W; // source band height that maps to SH
          sg.setTransform(sq, 0, 0, sq, 0, 0); sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, w1, SH);
          sg.drawImage(buf.c, 0, c[2] * q, W * q, sh * q, 0, 0, w1, SH);
          sg.globalCompositeOperation = 'destination-in';
          var gr = sg.createLinearGradient(0, 0, w1, 0); gr.addColorStop(0, i ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)'); gr.addColorStop(FEATH / w1, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); sg.fillStyle = gr; sg.fillRect(0, 0, w1, SH);
          g.drawImage(seg1.c, i * PITCH, 0, w1, SH);
        }
      }, sq);
      // 留白之月
      st.sky = F.sprite(W, 1100, function (g) {
        var R = F.rng(801);
        K.vgrad(g, 0, 0, W, 1100, [[0, 'rgba(96,112,126,.5)'], [.5, 'rgba(126,140,148,.3)'], [1, 'rgba(150,160,160,0)']]);
        for (var i = 0; i < 18; i++) F.wash(g, F.blob(R() * W, R() * 760, R.range(180, 420), R.range(50, 130), R, 12, .3), i % 2 ? '#5E7282' : '#F4EFE2', { R: R, layers: 5, alpha: .014, mag: .3 });
        g.globalCompositeOperation = 'destination-out';
        var gr = g.createRadialGradient(M.x, M.y, M.r * .8, M.x, M.y, M.r * 2.7); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 1100);
        g.fillStyle = '#000'; g.beginPath(); g.arc(M.x, M.y, M.r, 0, 6.3); g.fill();
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(90,108,122,.3)'; g.lineWidth = 1.2; g.beginPath(); g.arc(M.x, M.y, M.r, 0, 6.3); g.stroke();
      }, Math.min(F.Q, .75));
      st.glow = F.glowSprite(M.r, '#FFFDF4', .7, .35);
      st.ymoon = K.moonSprite(92, '#F8EDCB', '#C9B47E', 41);
    },
    paint: function (ctx, t) {
      ctx.drawImage(F.assets.paper.c, 0, 0, W, H);
      ctx.drawImage(st.sky.c, 0, 0, W, 1100);
      F.blit(ctx, st.glow, M.x, M.y, { a: .6 + .05 * Math.sin(t * .8) });
      // 元夕的月，走到纸的正中，成为留白
      var mq = p(t, 162.4, 167.6, E.inOutS), Y = F.YMOON;
      if (mq < 1) F.blit(ctx, st.ymoon, lerp(Y.x + 190, M.x, mq), lerp(Y.y - 20, M.y, mq), { sc: lerp(1, M.r / 92, mq), a: 1 - p(t, 165.4, 167.8, E.inOutS) });
      // 长卷：先横向看过一遍，再退远，见其全
      var pan = p(t, 165.2, 173.6, E.inOutS), zo = p(t, 173.2, 177.2, E.inOutS), a = p(t, 164.6, 166.6, E.inOutS);
      var s = lerp(1, 960 / st.total, zo), cy = lerp(1190, 1230, zo), x0 = lerp(lerp(80, W - st.total - 80, pan), (W - st.total * s) / 2, zo), h = SH * s, y0 = cy - h / 2, w = st.total * s;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(70,56,30,.2)'; ctx.fillRect(x0 - 6 * s, y0 + 10 * s + 6, w + 12 * s, h + 20 * s);
      ctx.fillStyle = '#DDD2B8'; ctx.fillRect(x0 - 26 * s, y0 - 30 * s, w + 52 * s, h + 60 * s); // 绫边
      ctx.strokeStyle = 'rgba(150,130,90,.5)'; ctx.lineWidth = 1; ctx.strokeRect(x0 - 26 * s, y0 - 30 * s, w + 52 * s, h + 60 * s);
      ctx.drawImage(st.strip.c, x0, y0, w, h);
      ctx.strokeStyle = 'rgba(60,50,30,.5)'; ctx.strokeRect(x0, y0, w, h);
      // 轴头
      if (zo > 0) { ctx.globalAlpha = a * zo; ctx.fillStyle = '#4A3B2A'; [x0 - 30 * s - 5, x0 + w + 30 * s - 5].forEach(function (rx) { ctx.fillRect(rx, y0 - 30 * s - 14, 10, h + 60 * s + 28); }); }
      ctx.globalAlpha = 1;
    },
    words: function (ctx, t) {
      if (t < 165) return;
      F.say(ctx, t, 'e0', 930, 250, { color: C.inkL, halo: HALO, weight: 400, size: 40 });
      F.say(ctx, t, 'e1', 900, 230, { color: C.ink, halo: HALO, size: 92, dur: 3.4, out: .01 });
      F.say(ctx, t, 'e2', 196, 300, { color: C.ink, halo: HALO, weight: 300, size: 58, pitch: 84, dur: 2.2, out: .01 });
      var sq = E.outBack(seg(t, 176.6, 177.4)); if (sq > 0) F.blit(ctx, F.assets.seals['一昼夜'], 196, 742, { sc: .82 * (.9 + .1 * sq), a: clamp(sq * 2) });
      var ca = p(t, 176.4, 178.2, E.inOutS);
      F.htext(ctx, S.TITLE, 540, 1520, { size: 66, font: 'xing', color: C.ink, alpha: ca });
      F.htext(ctx, S.COLOPHON[0], 540, 1574, { size: 26, weight: 300, color: C.inkL, alpha: ca });
      F.htext(ctx, S.COLOPHON[1], 540, 1790, { size: 22, weight: 300, color: C.inkLL, alpha: ca });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
