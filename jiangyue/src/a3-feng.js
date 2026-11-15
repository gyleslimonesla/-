/* 三 · 夜半 · 张继《枫桥夜泊》（62–86 s）：夜半钟声到客船。深蓝、冷灰、枫红、渔火橙。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, HZ = 1092, NIGHT = '#0A0F19', TXT = '#ECE9DE', HALO = 'rgba(5,9,16,.75)';
  var BELL = { x: 806, y: 990, at: [77.6, 80.2, 82.8] };
  F.BELL = BELL;

function mleaf(g) { for (var k = -2; k <= 2; k++) { var a = -Math.PI / 2 + k * .66, L = 12 * (1 - Math.abs(k) * .15), w = 2.9; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - .22) * L * .55, Math.sin(a - .22) * L * .55); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + .22) * L * .55, Math.sin(a + .22) * L * .55); g.closePath(); g.fill(); } g.fillRect(-.6, 0, 1.2, 6); }
  F.acts.feng = {
    pre: 2.4, post: 2.2,
    build: function () {
      st.bg = F.sprite(W, H, function (g) {
        var R = F.rng(301), hz = HZ / H;
        K.vgrad(g, 0, 0, W, H, [[0, '#0A111E'], [.28, '#132036'], [hz - .09, '#22334C'], [hz - .005, '#3D4E62'], [hz, '#2C3D52'], [hz + .16, '#17263A'], [1, '#0A111C']]);
        var gr = g.createRadialGradient(210, HZ - 30, 20, 210, HZ - 30, 520); gr.addColorStop(0, 'rgba(190,176,140,.34)'); gr.addColorStop(1, 'rgba(190,176,140,0)'); g.fillStyle = gr; g.fillRect(0, 300, W, 1100);
        for (var i = 0; i < 22; i++) F.wash(g, F.blob(R() * W, R() * HZ, R.range(180, 420), R.range(40, 110), R, 12, .3), i % 2 ? '#3A4C66' : '#050A12', { R: R, layers: 5, alpha: .014, mag: .3 });
      }, Math.min(F.Q, .5));
      st.moon = K.moonSprite(112, '#EADFC2', '#9C9070', 31);
      st.halo = F.glowSprite(380, '#D8CBA4', .4, 2.2);
      st.mist = K.mistSprite(2160, 200, 303, '#7F93A8', .9);
      // 对岸：林、寒山寺
      st.far = F.sprite(W, 300, function (g) {
        var R = F.rng(305), pts = K.ridge({ x0: -20, x1: 1100, base: 262, amp: 58, seed: 41, f: [.006, .024, .09], peaks: [[820, 30, 170]] });
        K.tracePts(g, pts, 300); g.fillStyle = '#0C1522'; g.fill();
        K.pagoda(g, 806, 236, 7, 78, 214, '#0C1522', { light: 'rgba(240,170,90,.85)', line: 'rgba(120,140,165,.5)' });
        K.roof(g, 700, 196, 150, 34, '#0C1522', { curl: 12, line: 'rgba(120,140,165,.45)' }); g.fillStyle = '#0C1522'; g.fillRect(644, 228, 112, 40);
        K.roof(g, 912, 208, 120, 28, '#0C1522', { curl: 10, line: 'rgba(120,140,165,.45)' }); g.fillRect(866, 234, 92, 34);
        g.fillStyle = 'rgba(240,170,90,.8)'; g.fillRect(676, 240, 9, 12); g.fillRect(716, 240, 9, 12); g.fillRect(900, 244, 8, 10);
      });
      // 枫桥
      st.bridge = F.sprite(720, 260, function (g) { // world x = 60+, y = 1060+
        K.bridge(g, 30, 690, 96, 46, 132, '#243347', { waterY: 196, line: 'rgba(150,170,195,.5)' });
        var gr = g.createLinearGradient(0, 40, 0, 200); gr.addColorStop(0, 'rgba(120,140,170,.16)'); gr.addColorStop(1, 'rgba(120,140,170,0)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.fillRect(0, 0, 720, 260);
      });
      // 岸
      st.bank = F.sprite(W, 900, function (g) { // world y = 1020+
        var R = F.rng(307);
        var L = F.pts(F.spline([[-40, 150], [90, 142], [160, 176], [192, 262], [172, 430], [150, 620], [118, 900], [-40, 900]], true, 12), 1);
        var Rr = F.pts(F.spline([[1120, 124], [900, 130], [772, 152], [728, 204], [762, 304], [852, 436], [932, 606], [992, 784], [1040, 900], [1120, 900]], true, 12), 1);
        [L, Rr].forEach(function (poly) { F.wash(g, poly, '#070C14', { R: R, layers: 14, alpha: .14, mag: .04, edge: .3 }); F.fillPts(g, poly.map(function (q) { return q; })); });
        g.fillStyle = '#070C14'; F.fillPts(g, L); F.fillPts(g, Rr);
        // 芦
        g.strokeStyle = 'rgba(120,140,160,.35)'; g.lineWidth = 1.4; g.lineCap = 'round';
        for (var i = 0; i < 46; i++) { var x = i < 20 ? R.range(180, 330) : R.range(760, 930), y = i < 20 ? R.range(640, 880) : R.range(480, 800); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + R.range(-10, 14), y - 50, x + R.range(-30, 40), y - R.range(70, 130)); g.stroke(); }
      });
      // 江枫
      st.leaf = F.sprite(28, 28, function (g) { g.translate(14, 15); g.fillStyle = '#B5492F'; mleaf(g); });
      st.maple = F.sprite(700, 980, function (g) { // world x = -60+, y = 700+
        var R = F.rng(309), tips = [], cols = ['#8E3526', '#A7442D', '#6E261E', '#B9552F', '#7C2D22'];
        function limb(pts, w0) { var s = F.spline(pts, false, 6); g.fillStyle = '#05080E'; F.ribbon(g, s, 0, 1, function (u) { return lerp(w0, 1.5, u); }); for (var k = 0; k < 5; k++) { var q = F.at(s, lerp(.45, 1, k / 4)); tips.push([q.x, q.y]); } return s; }
        limb([[150, 980], [170, 760], [230, 560], [330, 400], [440, 300]], 46);
        limb([[205, 640], [300, 610], [420, 560], [560, 500], [660, 470]], 18);
        limb([[250, 520], [220, 400], [150, 300], [60, 240]], 16);
        limb([[330, 400], [330, 300], [380, 190], [470, 110]], 13);
        limb([[420, 560], [500, 640], [600, 660]], 9); limb([[170, 760], [80, 700], [10, 600]], 12);
        tips.forEach(function (tp) {
          for (var k = 0; k < 58; k++) {
            var a = R() * 6.28, d = Math.sqrt(R()) * 78, x = tp[0] + Math.cos(a) * d, y = tp[1] + Math.sin(a) * d * .7, sc = R.range(.6, 1.5);
            g.save(); g.translate(x, y); g.rotate(R() * 6.28); g.scale(sc, sc); g.globalAlpha = R.range(.55, 1); g.fillStyle = cols[(R() * cols.length) | 0];
            mleaf(g); g.restore();
          }
        });
      });
      // 客船
      st.boat = F.sprite(560, 240, function (g) {
        g.translate(280, 176);
        K.boat(g, 470, { col: '#070B12', lamp: null });
        // 篷：编席纹
        g.strokeStyle = 'rgba(90,110,135,.4)'; g.lineWidth = 1; for (var i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(i * 14, -6); g.quadraticCurveTo(i * 14.5, -80, i * 11, -104 + Math.abs(i) * 4); g.stroke(); }
        // 舱口的灯与人：灯在篷里，人坐在舱口
        g.save(); g.beginPath(); g.moveTo(-94, -5); g.bezierCurveTo(-94, -113, 94, -113, 94, -5); g.closePath(); g.clip();
        var gr = g.createRadialGradient(92, -34, 3, 92, -34, 78); gr.addColorStop(0, 'rgba(255,220,160,1)'); gr.addColorStop(.35, 'rgba(240,165,80,.85)'); gr.addColorStop(1, 'rgba(180,90,40,0)');
        g.fillStyle = gr; g.fillRect(10, -110, 90, 110); g.restore();
        g.save(); g.translate(122, -6); K.figure(g, 100, { col: '#070B12', sit: true, lean: -.1 }); g.restore();
        g.strokeStyle = 'rgba(240,170,90,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(108, -44); g.quadraticCurveTo(104, -26, 106, -8); g.stroke();
        g.strokeStyle = '#070B12'; g.lineWidth = 4; g.beginPath(); g.moveTo(-230, -30); g.lineTo(-262, -168); g.stroke(); // 篙
      });
      st.lamp = F.glowSprite(260, '#F0A04B', .55, 2.0); st.lampS = F.glowSprite(60, '#FFC878', .9, 1.6);
      st.frost = F.sprite(8, 8, function (g) { var gr = g.createRadialGradient(4, 4, 0, 4, 4, 4); gr.addColorStop(0, 'rgba(235,242,250,.9)'); gr.addColorStop(1, 'rgba(235,242,250,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 8); });
      st.fboat = F.sprite(120, 70, function (g) { g.translate(60, 52); K.skiff(g, 96, '#070C14'); });
    },

    moon: function (t) { var q = p(t, 61, 76, E.inOutS), M = F.MOON; return { x: lerp(M.x, 196, Math.pow(q, .8)), y: lerp(M.y, HZ + 60, q * q * (3 - 2 * q)), a: lerp(1, .5, q) }; },

    paint: function (ctx, t) {
      var i, z = 1 + .05 * p(t, 62, 86, E.inOutS), m = this.moon(t);
      ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
      ctx.drawImage(st.bg.c, 0, 0, W, H);
      // 月落
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HZ); ctx.clip();
      F.blit(ctx, st.halo, m.x, m.y, { a: m.a * .9 }); F.blit(ctx, st.moon, m.x, m.y, { a: m.a });
      ctx.restore();
      // 霜满天
      K.fall(ctx, st.frost, t, { n: 90, seed: 8, life: 16, x0: -100, x1: 1100, y0: -20, y1: 1300, dx: 220, sway: 30, sc: 1.2, alpha: .5, acc: 1 });
      ctx.drawImage(st.far.c, 0, HZ - 262, W, 300);
      K.mist(ctx, st.mist, HZ - 110, t, 6, .55, 200);
      // 远处渔火
      var fl = function (x, y, s, ph) {
        var fk = (.8 + .2 * Math.sin(t * 7 + ph) * Math.sin(t * 2.3 + ph)) * E.outBack(seg(t, 62 + 4.6 + ph * .08, 62 + 5.3 + ph * .08));
        F.blit(ctx, st.fboat, x, y, { sc: s, ay: 52 / 70 });
        ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.lampS, x + 6 * s, y - 12 * s, { sc: s * 1.3, a: fk }); ctx.globalCompositeOperation = 'source-over';
        K.ripples(ctx, t, { n: 14, y0: y + 6, y1: y + 120 * s, focus: [x + 6 * s, 9 * s], col: '#F0A04B', seed: ph, len: 12 * s, alpha: .8 * fk, lw: 1.6 });
      };
      fl(388 + Math.sin(t * .2) * 6, HZ + 30, .7, 3); fl(936, HZ + 52, .9, 11);
      // 桥与倒影
      ctx.globalAlpha = .3; ctx.save(); ctx.translate(60, 1256 + 196); ctx.scale(1, -1); ctx.drawImage(st.bridge.c, 0, -196 + 64, 720, 260); ctx.restore(); ctx.globalAlpha = 1;
      ctx.drawImage(st.bridge.c, 60, 1060, 720, 260);
      K.ripples(ctx, t, { n: 90, x0: 0, x1: W, y0: HZ + 14, y1: 1900, col: '#8FA6C0', seed: 13, len: 30, alpha: .22, lw: 1.3, pow: 1.2 });
      ctx.drawImage(st.bank.c, 0, 1020, W, 900);
      K.mist(ctx, st.mist, 1290, t, -9, .4, 900);
      // 客船、灯
      var bob = Math.sin(t * .9) * 2.5, fk2 = (.86 + .14 * Math.sin(t * 6.3) * Math.sin(t * 1.7)) * p(t, 62 + 3.6, 62 + 5.2, E.out);
      ctx.globalAlpha = .22; ctx.save(); ctx.translate(590, 1620 + bob); ctx.scale(1, -.6); ctx.drawImage(st.boat.c, -280, -176, 560, 240); ctx.restore(); ctx.globalAlpha = 1;
      F.blit(ctx, st.boat, 590, 1616 + bob, { ax: .5, ay: 176 / 240, rot: Math.sin(t * .7) * .006 });
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.lamp, 682, 1578 + bob, { a: .6 * fk2 }); ctx.globalCompositeOperation = 'source-over';
      K.ripples(ctx, t, { n: 40, y0: 1630, y1: 1880, focus: [690, 34], col: '#F2A552', seed: 21, len: 22, alpha: .85 * fk2, lw: 2 });
      // 江枫：最近一层
      if (t < 62 + 8.4) K.inkReveal(ctx, st.maple, -60, 700, 700, 980, [[110, 1640, 62 + 2.8, 4.4, 1100]], t, { col: '#05080E', soft: .32 }); else F.blit(ctx, st.maple, -60, 1680, { ax: 0, ay: 1, rot: Math.sin(t * .5) * .004 * p(t, 70.4, 73) });
      K.bird(ctx, 318, 1108, 1.5, 0, '#05080E', -.1 + Math.sin(t * 1.3) * .03); // 栖鸦
      K.fall(ctx, st.leaf, t, { n: 7, seed: 5, life: 10, x0: 40, x1: 560, y0: 900, y1: 1700, dx: 150, sway: 50, sc: 1.2, alpha: .9 });
      ctx.restore();
      // 乌啼：一只掠过
      var cq = seg(t, 65.5, 73.5); if (cq > 0 && cq < 1) K.bird(ctx, lerp(1160, -80, cq), 470 + cq * 190 + Math.sin(cq * 9) * 16, -1.9, t * 8.5, '#04070C', .06);
      // 钟声：看得见的回响
      ctx.lineWidth = 1.6;
      for (i = 0; i < 3; i++) for (var k = 0; k < 3; k++) {
        var age = t - BELL.at[i] - k * .32; if (age <= 0 || age > 5.2) continue;
        ctx.strokeStyle = 'rgba(236,216,164,' + (.34 * Math.pow(1 - age / 5.2, 1.5) / (1 + k * .7)) + ')'; ctx.beginPath(); ctx.arc(BELL.x, BELL.y, 30 + age * 330, 0, 6.3); ctx.stroke();
      }
      F.curtain(ctx, 'feng', t);
    },
    mask: function (g, q) { // 夜从潭水里漫上来
      var yb = lerp(H + 560, -560, E.inOutS(q)), gr = g.createLinearGradient(0, yb - 520, 0, yb + 520);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'f0', 262, 250, { color: TXT, halo: HALO, weight: 400 });
      F.say(ctx, t, 'f1', 962, 240, { color: TXT, halo: HALO });
      F.say(ctx, t, 'f2', 962, 240, { color: TXT, halo: HALO });
      F.say(ctx, t, 'f3', 262, 250, { color: TXT, halo: HALO, weight: 400 });
      F.sign(ctx, t, 'feng', 78, 250, { color: TXT, halo: HALO, delay: 6.8, early: 2.4, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
