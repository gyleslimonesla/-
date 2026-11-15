/* 四 · 日出 · 李白《早发白帝城》（86–108 s）：轻舟已过万重山。金光、朝霞红、江水青、青绿山。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, WL = 1310, HALO = 'rgba(246,236,214,.92)';
  var PAL = { top: '#2C5A82', mid: '#4C8C7A', foot: '#C79C62', shade: '#17324A', light: '#F2E3B4', gold: '#D8B25C' };
  var PALN = { top: '#1F4A66', mid: '#3A7566', foot: '#9C7A4C', shade: '#0F2536', light: '#E6D39A', gold: '#C9A450' };

  /** how far the boat has travelled (px of the nearest layer) */
  function travel(t) { var u = seg(t, 85, 111); return 5200 * (u * u * (3 - 2 * u)); }
  function strip(ctx, spr, x, y, period) { x = ((x % period) + period) % period - period; for (; x < W; x += period) if (x + spr.w > 0) ctx.drawImage(spr.c, x, y, spr.w, spr.h); }

  F.acts.baidi = {
    pre: 2.2, post: 2.4,
    build: function () {
      st.bg = F.sprite(W, H, function (g) {
        var R = F.rng(401);
        K.vgrad(g, 0, 0, W, H, [[0, '#E7C9A4'], [.16, '#EDB596'], [.3, '#F2CFA6'], [.5, '#F7E7C8'], [.68, '#F6ECD6'], [1, '#EFE6D0']]);
        for (var i = 0; i < 20; i++) F.wash(g, F.blob(R() * W, R() * 700, R.range(160, 400), R.range(30, 90), R, 12, .3), i % 2 ? '#E29A7E' : '#FFF4D8', { R: R, layers: 5, alpha: .02, mag: .3 });
      }, Math.min(F.Q, .5));
      st.sun = F.sprite(220, 220, function (g) { var gr = g.createRadialGradient(110, 110, 10, 110, 110, 104); gr.addColorStop(0, '#FFF8E0'); gr.addColorStop(.7, '#FCE6AC'); gr.addColorStop(1, '#F1C97A'); g.fillStyle = gr; g.beginPath(); g.arc(110, 110, 100, 0, 6.3); g.fill(); });
      st.sunGlow = F.glowSprite(620, '#FFE9B0', .75, 1.8);
      st.cloud = [K.cloudSprite(620, 220, 411, '#FFF6E2', '#E7A088', 'rgba(201,160,78,.75)'), K.cloudSprite(480, 170, 413, '#FFF1DA', '#DE8E7C', 'rgba(201,160,78,.7)'), K.cloudSprite(760, 240, 415, '#FFFAEC', '#EDB9A0', 'rgba(201,160,78,.6)')];
      st.mist = K.mistSprite(2160, 240, 417, '#FBF4E2', 1.3);
      // 远峰（淡）
      st.far = F.sprite(2000, 900, function (g) {
        var R = F.rng(421);
        K.inkMount(g, K.ridge({ x0: 0, x1: 2000, base: 900, amp: 160, seed: 51, sharp: 1.6, taper: 260, peaks: [[330, 560, 150], [760, 420, 170], [1240, 600, 180], [1640, 380, 150]] }), 900, '#5F87A0', .5, .55, R, .3);
        // 白帝城：在最高的一座峰上
        var cx = 330, cy = 250; g.fillStyle = '#B8503A'; g.fillRect(cx - 56, cy + 34, 112, 30); g.fillStyle = '#8E3A2A'; g.fillRect(cx - 12, cy + 44, 24, 20);
        K.roof(g, cx, cy + 12, 150, 26, '#34506A', { curl: 12, line: 'rgba(216,178,92,.9)' }); g.fillStyle = '#C25B40'; g.fillRect(cx - 34, cy - 12, 68, 26);
        K.roof(g, cx, cy - 34, 104, 24, '#34506A', { curl: 11, line: 'rgba(216,178,92,.9)' });
        g.fillStyle = '#B8503A'; g.fillRect(cx - 130, cy + 50, 74, 14); g.fillRect(cx + 56, cy + 50, 84, 14);
      });
      // 中景：青绿群峰两组
      function range(seed, peaks) {
        return F.sprite(1700, 860, function (g) {
          var R = F.rng(seed);
          K.greenMount(g, K.ridge({ x0: 0, x1: 1700, base: 860, amp: 120, seed: seed, sharp: 1.8, taper: 240, f: [.004, .013, .04], peaks: peaks.map(function (q) { return [q[0] + 60, q[1] * .7, q[2] * 1.3]; }) }), 860, { top: '#5D8CA8', mid: '#7FB09C', foot: '#D9BC8A', shade: '#3B6680', light: '#F6EBC8', gold: null }, R, { moss: .1 });
          K.greenMount(g, K.ridge({ x0: 0, x1: 1700, base: 860, amp: 110, seed: seed + 1, sharp: 2.2, taper: 220, f: [.0045, .015, .05], peaks: peaks }), 860, PAL, R);
          // 山脚：林与石
          g.fillStyle = 'rgba(23,50,74,.6)'; for (var i = 0; i < 120; i++) { var x = R.range(200, 1500), y = 860 - R.range(8, 90); g.beginPath(); g.ellipse(x, y, R.range(5, 12), R.range(3, 7), 0, 0, 6.3); g.fill(); }
          F.granulate(g, 1700, 860, R, 7000, .1);
        });
      }
      st.mid = [range(431, [[330, 520, 120], [640, 690, 135], [930, 430, 110], [1230, 600, 140]]), range(441, [[300, 640, 140], [600, 400, 100], [900, 720, 150], [1260, 480, 120]])];
      // 近岸：深色岩与松
      st.near = F.sprite(1900, 520, function (g) {
        var R = F.rng(451), pts = K.ridge({ x0: 0, x1: 1900, base: 520, amp: 110, seed: 61, sharp: 1.3, taper: 200, f: [.005, .016, .05], peaks: [[400, 250, 180], [1000, 180, 150], [1500, 300, 190]] });
        K.greenMount(g, pts, 520, PALN, R, { footA: 1, goldA: .6 });
        [[330, .9], [470, .7], [960, .8], [1440, 1], [1580, .75]].forEach(function (q) { var i = Math.round(q[0] / 6), pt = pts[i]; if (pt) K.pine(g, pt[0], pt[1] + 10, 210 * q[1], R, '#0E2230', { lean: R.range(-.25, .25), branches: 6 }); });
      });
      // 轻舟
      st.boat = F.sprite(380, 360, function (g) {
        g.translate(170, 300);
        K.sailboat(g, 270, { col: '#33281E' });
        g.save(); g.translate(-112, -30); K.figure(g, 58, { col: '#33281E', hat: true }); g.strokeStyle = '#33281E'; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -40); g.lineTo(-40, 44); g.stroke(); g.restore(); // 舟子把舵
        g.save(); g.translate(112, -22); K.figure(g, 76, { col: '#F6F1E4' }); g.strokeStyle = 'rgba(40,36,30,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-11, 0); g.quadraticCurveTo(-11, -34, -5, -62); g.moveTo(13, 0); g.quadraticCurveTo(14, -30, 5, -62); g.stroke();
        g.fillStyle = '#2A2620'; g.beginPath(); g.arc(0, -70, 5, Math.PI, 0); g.fill(); g.restore(); // 诗人：白衣立于船头
      });
    },

    paint: function (ctx, t) {
      var X = travel(t), i, speed = (travel(t + .1) - travel(t - .1)) / .2, sq = clamp(speed / 300);
      ctx.drawImage(st.bg.c, 0, 0, W, H);
      // 日出
      var sy = lerp(900, 770, p(t, 84, 100, E.out)), sx = 700;
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.sunGlow, sx, sy, { a: .7 + .05 * Math.sin(t) }); ctx.globalCompositeOperation = 'source-over';
      F.blit(ctx, st.sun, sx, sy, { sc: .9 });
      // 彩云（最远，慢）
      F.blit(ctx, st.cloud[2], 760 - X * .035, 330, { a: .9 }); F.blit(ctx, st.cloud[1], 250 - X * .05, 250, { a: .85 }); F.blit(ctx, st.cloud[0], 1250 - X * .06, 520, { a: .9 });
      // 远峰与白帝城
      strip(ctx, st.far, 60 - X * .13, 440, 2300);
      F.blit(ctx, st.cloud[0], 250 - X * .16, 900, { a: .95, sc: 1.05 }); F.blit(ctx, st.cloud[1], 1500 - X * .16, 900, { a: .9 });
      K.mist(ctx, st.mist, 1010, t, 40 + speed * .1, .75, X * .16);
      // 万重山：两组青绿峰交替而过
      strip(ctx, st.mid[0], 220 - X * .46, WL - 846, 3700); strip(ctx, st.mid[1], 2070 - X * .46, WL - 846, 3700);
      K.mist(ctx, st.mist, WL - 150, t, 60 + speed * .3, .9, X * .5 + 800);
      // 江
      K.vgrad(ctx, 0, WL, W, H - WL, [[0, '#A9CFC6'], [.25, '#6FA9A6'], [.7, '#3F7F86'], [1, '#2C6470']]);
      ctx.lineCap = 'round';
      for (i = 0; i < 70; i++) { // 水势：越快越长
        var d = K.hash(i * 2.3), y = WL + 14 + Math.pow(d, 1.3) * 330, L = (30 + 190 * sq) * (.4 + d) * (.5 + K.hash(i * 5.1));
        var x = W + 300 - (((K.hash(i * 7.7) * 1700 + X * (1.2 + d * 1.4)) % 1700) + 1700) % 1700;
        ctx.strokeStyle = 'rgba(245,252,248,' + (.18 + .5 * sq) * (.4 + .6 * K.hash(i * 3.3)) + ')'; ctx.lineWidth = 1 + d * 2.2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L * .5, y - 2 - d * 3, x + L, y); ctx.stroke();
      }
      // 舟
      var bx = 470 + 40 * Math.sin(t * .3), by = 1452 + Math.sin(t * 2.1) * 3;
      ctx.strokeStyle = 'rgba(250,255,252,.8)'; ctx.lineWidth = 2;
      for (i = 0; i < 7; i++) { var wl = (60 + i * 46) * (.4 + sq), wy = by + 6 + i * 5; ctx.globalAlpha = (.75 - i * .09) * (.3 + sq); ctx.beginPath(); ctx.moveTo(bx - 120, wy); ctx.quadraticCurveTo(bx - 120 - wl * .5, wy + 3 + i * 2, bx - 120 - wl, wy + Math.sin(t * 3 + i) * 3); ctx.stroke(); }
      ctx.globalAlpha = 1;
      F.blit(ctx, st.boat, bx, by, { ax: 170 / 380, ay: 300 / 360, rot: -.02 - sq * .025 + Math.sin(t * 1.7) * .012 });
      // 衣带当风
      ctx.strokeStyle = 'rgba(246,241,228,.95)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      for (i = 0; i < 2; i++) { var fx = bx + 110, fy = by - 66 - i * 14, L2 = (38 + i * 16) * (.5 + sq * .8); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.bezierCurveTo(fx - L2 * .4, fy - 6 + Math.sin(t * 6 + i) * 5, fx - L2 * .7, fy + 4 + Math.sin(t * 6 + i + 1) * 7, fx - L2, fy - 2 + Math.sin(t * 6 + i + 2) * 9); ctx.stroke(); }
      // 近岸（最快）
      strip(ctx, st.near, 900 - X * 1.0, 1500, 2500);
      K.mist(ctx, st.mist, 1760, t, 120 + speed * .6, .55, X * 1.3);
      F.curtain(ctx, 'baidi', t);
    },
    mask: function (g, q) { // 第三声钟的回响，就是天光
      var B = F.BELL, r = 60 + 2300 * E.inOut(q), gr = g.createRadialGradient(B.x - 60, B.y - 60, Math.max(0, r - 520), B.x - 60, B.y - 60, r);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'b0', 262, 230, { color: C.inkL, halo: HALO, weight: 400 });
      F.say(ctx, t, 'b1', 962, 230, { color: C.ink, halo: HALO });
      F.say(ctx, t, 'b2', 962, 230, { color: C.ink, halo: HALO });
      F.sign(ctx, t, 'baidi', 78, 240, { color: C.ink, halo: HALO, delay: 5.8, early: 2.6, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
