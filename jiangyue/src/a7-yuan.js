/* 六 · 黄昏 · 辛弃疾《青玉案·元夕》（139–165 s）：东风夜放花千树……灯火阑珊处。灯火金、朱红、深靛、琥珀。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, TXT = '#F6EBD0', HALO = 'rgba(8,8,22,.8)', VP = { x: 540, y: 1150 }, DARK = '#0B0C1C';
  var MOON = F.YMOON = { x: 236, y: 330, r: 92 };
  var BURST = [[144.6, 690, 470, 0, 0], [145.9, 380, 600, 1, 3], [147.3, 820, 640, 2, 1], [148.4, 520, 400, 1, 3], [149.6, 250, 700, 0, 2], [150.7, 760, 500, 2, 0], [151.9, 440, 560, 1, 3], [152.9, 640, 380, 0, 1], [153.9, 330, 470, 2, 2], [154.8, 820, 560, 1, 3]];
  F.BURST = BURST;

  function lightTree(R, pts, w0, depth, tips, limbs) { // 枝干骨架 + 灯位
    var s = F.spline(pts, false, 8); limbs.push([s, w0]);
    for (var k = 0; k < 9; k++) { var q = F.at(s, lerp(.3, 1, k / 8)); tips.push([q.x, q.y]); }
    if (depth <= 0) return;
    for (var i = 0; i < 3; i++) {
      var q2 = F.at(s, lerp(.45, .95, i / 2)), a = q2.a + (i % 2 ? 1 : -1) * R.range(.5, 1.0), L = R.range(140, 260) * (depth / 2);
      lightTree(R, [[q2.x, q2.y], [q2.x + Math.cos(a) * L * .5, q2.y + Math.sin(a) * L * .5 - 10], [q2.x + Math.cos(a + R.range(-.3, .3)) * L, q2.y + Math.sin(a) * L - R.range(0, 40)]], w0 * .45, depth - 1, tips, limbs);
    }
  }

  F.acts.yuan = {
    pre: 2.6, post: 1.6,
    build: function () {
      var i, k;
      st.bg = F.sprite(W, H, function (g) {
        var R = F.rng(701);
        K.vgrad(g, 0, 0, W, H, [[0, '#0A0E20'], [.32, '#141B38'], [.56, '#232A4C'], [.64, '#3A2C46'], [.72, '#2A2034'], [1, '#110E1A']]);
        for (i = 0; i < 20; i++) F.wash(g, F.blob(R() * W, R() * 900, R.range(180, 420), R.range(40, 110), R, 12, .3), i % 2 ? '#2E3A66' : '#04050E', { R: R, layers: 5, alpha: .016, mag: .3 });
      }, Math.min(F.Q, .5));
      st.moon = K.moonSprite(MOON.r, '#F8EDCB', '#C9B47E', 41);
      st.mhalo = F.glowSprite(360, '#F1DFA8', .45, 2.1);
      st.glowA = F.glowSprite(26, '#FFC773', 1, 1.5); st.glowR = F.glowSprite(26, '#FF8E5C', 1, 1.5); st.glowG = F.glowSprite(26, '#FFE9A8', 1, 1.5);
      st.haze = F.glowSprite(700, '#F2A552', .5, 1.6);
      st.lantern = K.lanternSprite('#D8482C', '#FFD890');
      // 城楼
      st.tower = F.sprite(700, 660, function (g) {
        var R = F.rng(703), cx = 350, by = 600, eave = 'rgba(232,190,104,.95)';
        g.fillStyle = '#4E211E'; g.beginPath(); g.moveTo(cx - 300, by); g.lineTo(cx - 270, by - 210); g.lineTo(cx + 270, by - 210); g.lineTo(cx + 300, by); g.closePath(); g.fill();
        g.fillStyle = '#6B2C24'; g.fillRect(cx - 276, by - 232, 552, 26);
        g.strokeStyle = 'rgba(232,190,104,.5)'; g.lineWidth = 1.5; g.strokeRect(cx - 276, by - 232, 552, 26);
        for (k = 0; k < 22; k++) { g.fillStyle = '#4E211E'; g.fillRect(cx - 270 + k * 25, by - 246, 14, 14); }
        // 门洞
        var gg = g.createRadialGradient(cx, by - 30, 10, cx, by - 30, 150); gg.addColorStop(0, '#FFD08A'); gg.addColorStop(.6, '#C8702F'); gg.addColorStop(1, '#3A1A14');
        g.fillStyle = gg; g.beginPath(); g.moveTo(cx - 74, by); g.lineTo(cx - 74, by - 96); g.arc(cx, by - 96, 74, Math.PI, 0); g.lineTo(cx + 74, by); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(232,190,104,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, by - 96, 82, Math.PI, 0); g.stroke();
        // 两重楼
        function storey(y, w, h, rw, rh) {
          g.fillStyle = '#7E2E24'; g.fillRect(cx - w / 2, y - h, w, h);
          var n = Math.round(w / 46); for (k = 0; k <= n; k++) { g.fillStyle = '#5A1F1A'; g.fillRect(cx - w / 2 + k * (w / n) - 4, y - h, 8, h); }
          for (k = 0; k < n; k++) { var wx = cx - w / 2 + (k + .5) * (w / n), wg = g.createLinearGradient(0, y - h + 10, 0, y - 8); wg.addColorStop(0, '#FFDCA0'); wg.addColorStop(1, '#E88F3C'); g.fillStyle = wg; g.fillRect(wx - w / n * .3, y - h + 12, w / n * .6, h - 24); g.strokeStyle = 'rgba(90,31,26,.7)'; g.lineWidth = 1; g.strokeRect(wx - w / n * .3, y - h + 12, w / n * .6, h - 24); g.beginPath(); g.moveTo(wx, y - h + 12); g.lineTo(wx, y - 12); g.stroke(); }
          K.roof(g, cx, y - h - rh + 4, rw, rh, '#1A2640', { curl: rh * .52, ridge: .3, line: eave, lw: 2.2 });
          g.strokeStyle = 'rgba(232,190,104,.25)'; g.lineWidth = 1; for (k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(cx + k * rw * .034, y - h - rh + 6); g.lineTo(cx + k * rw * .055, y - h + 2); g.stroke(); }
        }
        storey(by - 246, 440, 88, 600, 62); storey(by - 400, 320, 76, 460, 58);
        g.fillStyle = eave; g.beginPath(); g.arc(cx, by - 400 - 76 - 62, 7, 0, 6.3); g.fill();
      });
      // 两侧街屋
      st.shops = F.sprite(W, 520, function (g) {
        var R = F.rng(705);
        [-1, 1].forEach(function (s) {
          for (k = 0; k < 4; k++) {
            var sc = lerp(1, .42, k / 3), x = 540 + s * lerp(520, 300, k / 3), y = lerp(500, 300, k / 3), w = 230 * sc, h = 200 * sc;
            g.fillStyle = '#181428'; g.fillRect(x - w / 2, y - h, w, h);
            K.roof(g, x, y - h - 40 * sc, w * 1.3, 46 * sc, '#10122A', { curl: 14 * sc, line: 'rgba(232,190,104,.55)' });
            for (var j = 0; j < 3; j++) { g.fillStyle = 'rgba(245,170,80,' + R.range(.5, .9) + ')'; g.fillRect(x - w * .36 + j * w * .27, y - h * .7, w * .18, h * .34); }
          }
        });
      });
      // 花千树：两株灯树的骨架
      var R = F.rng(707); st.limbs = []; st.tips = [];
      lightTree(R, [[70, 1560], [110, 1240], [200, 980], [330, 800], [470, 700]], 44, 2, st.tips, st.limbs);
      lightTree(R, [[1010, 1540], [990, 1230], [900, 960], [770, 790], [640, 700]], 42, 2, st.tips, st.limbs);
      st.treeS = F.sprite(W, 1100, function (g) { g.translate(0, -500); st.limbs.forEach(function (l) { g.fillStyle = DARK; F.ribbon(g, l[0], 0, 1, function (u) { return lerp(l[1], 1.6, u); }); }); });
      st.lights = [];
      st.tips.forEach(function (tp, n) { for (k = 0; k < 2; k++) { var a = R() * 6.28, d = Math.sqrt(R()) * 50, x = tp[0] + Math.cos(a) * d, y = tp[1] + Math.sin(a) * d * .8 + R.range(0, 26); st.lights.push([x, y, R.range(.5, 1.25), (R() * 3) | 0, R() * 6.28, Math.hypot(x - 540, y - 1010) / 1100 + R.range(-.04, .04)]); } });
      // 人潮
      function crowd(n, y0, y1, h0, h1, seed, rim) {
        var Rc = F.rng(seed), arr = [];
        for (k = 0; k < n; k++) arr.push({ x: Rc.range(-30, W + 30), y: Rc.range(y0, y1), h: Rc.range(h0, h1), ph: Rc() * 6.28, lamp: Rc() < .22, hat: Rc() < .2, lean: Rc.range(-.05, .05), rim: rim });
        return arr.sort(function (a, b) { return a.y - b.y; });
      }
      st.crowdFar = crowd(54, 1196, 1250, 34, 52, 711, .5); st.crowdMid = crowd(26, 1330, 1450, 86, 124, 713, .4); st.crowdNear = crowd(8, 1930, 2000, 300, 400, 715, .25); st.crowdNear.forEach(function (f) { f.lamp = false; });
      st.person = F.sprite(120, 220, function (g) { g.translate(60, 214); K.figure(g, 200, { col: '#0D0E20' }); g.strokeStyle = 'rgba(245,170,90,.5)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(36, -2); g.quadraticCurveTo(38, -90, 14, -164); g.stroke(); g.beginPath(); g.arc(0, -178, 17, -1.2, .9); g.stroke(); });
      st.personHat = F.sprite(120, 220, function (g) { g.translate(60, 214); K.figure(g, 200, { col: '#0D0E20', hat: true }); g.strokeStyle = 'rgba(245,170,90,.5)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(36, -2); g.quadraticCurveTo(38, -90, 14, -164); g.stroke(); });
      // 宝马雕车
      st.cart = F.sprite(420, 220, function (g) {
        g.fillStyle = '#0D0E20'; g.strokeStyle = '#0D0E20'; g.lineCap = 'round';
        g.beginPath(); g.ellipse(300, 104, 62, 30, 0, 0, 6.3); g.fill(); // 马身
        g.beginPath(); g.moveTo(346, 90); g.quadraticCurveTo(372, 50, 384, 34); g.lineTo(404, 50); g.lineTo(398, 62); g.quadraticCurveTo(376, 84, 356, 112); g.closePath(); g.fill();
        g.lineWidth = 8; [[262, 124, 250, 196], [282, 128, 290, 196], [326, 128, 318, 196], [344, 122, 358, 194]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
        g.lineWidth = 6; g.beginPath(); g.moveTo(240, 96); g.quadraticCurveTo(214, 110, 208, 150); g.stroke();
        g.fillRect(40, 60, 150, 84); K.roof(g, 115, 26, 210, 40, '#0D0E20', { curl: 16, line: 'rgba(232,190,104,.8)' }); // 车厢
        g.lineWidth = 5; g.beginPath(); g.moveTo(188, 120); g.lineTo(250, 110); g.stroke();
        g.lineWidth = 5; g.beginPath(); g.arc(112, 160, 44, 0, 6.3); g.stroke(); g.lineWidth = 2; for (var j = 0; j < 8; j++) { g.beginPath(); g.moveTo(112, 160); g.lineTo(112 + Math.cos(j * .785) * 44, 160 + Math.sin(j * .785) * 44); g.stroke(); }
        var wg = g.createLinearGradient(0, 70, 0, 130); wg.addColorStop(0, '#FFDCA0'); wg.addColorStop(1, '#E88F3C'); g.fillStyle = wg; g.fillRect(70, 76, 44, 46); g.fillRect(126, 76, 44, 46);
        g.strokeStyle = 'rgba(232,190,104,.8)'; g.lineWidth = 1.6; g.strokeRect(40, 60, 150, 84);
      });
      st.spark = F.sprite(10, 10, function (g) { var gr = g.createRadialGradient(5, 5, 0, 5, 5, 5); gr.addColorStop(0, 'rgba(255,236,180,1)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 10, 10); });
      // 灯火阑珊处：那个人
      st.her = F.sprite(300, 460, function (g) {
        var cx = 150, by = 440;
        var rg = g.createLinearGradient(cx - 90, 0, cx + 90, 0); rg.addColorStop(0, '#6E7486'); rg.addColorStop(.5, '#AEB0B4'); rg.addColorStop(.82, '#D9CDB8'); rg.addColorStop(1, '#F0D2A0');
        // 裙
        g.fillStyle = rg; g.beginPath(); g.moveTo(cx - 34, by - 250); g.bezierCurveTo(cx - 58, by - 150, cx - 86, by - 60, cx - 96, by); g.quadraticCurveTo(cx, by + 14, cx + 100, by - 2); g.bezierCurveTo(cx + 80, by - 70, cx + 52, by - 160, cx + 32, by - 250); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(90,80,76,.35)'; g.lineWidth = 1.2; [-50, -22, 8, 36, 62].forEach(function (x, i2) { g.beginPath(); g.moveTo(cx + x * .35, by - 236); g.quadraticCurveTo(cx + x * .8, by - 120, cx + x * 1.2, by - 4); g.stroke(); });
        // 上襦与广袖
        g.fillStyle = rg; g.beginPath(); g.moveTo(cx - 40, by - 330); g.quadraticCurveTo(cx - 52, by - 290, cx - 36, by - 246); g.lineTo(cx + 34, by - 246); g.quadraticCurveTo(cx + 50, by - 290, cx + 38, by - 330); g.quadraticCurveTo(cx, by - 346, cx - 40, by - 330); g.fill();
        g.beginPath(); g.moveTo(cx + 34, by - 326); g.bezierCurveTo(cx + 76, by - 300, cx + 92, by - 230, cx + 84, by - 170); g.quadraticCurveTo(cx + 60, by - 160, cx + 44, by - 176); g.quadraticCurveTo(cx + 50, by - 250, cx + 26, by - 290); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(cx - 36, by - 326); g.bezierCurveTo(cx - 70, by - 296, cx - 80, by - 240, cx - 70, by - 190); g.quadraticCurveTo(cx - 52, by - 184, cx - 40, by - 196); g.quadraticCurveTo(cx - 44, by - 256, cx - 26, by - 292); g.closePath(); g.fill();
        g.fillStyle = '#B0525E'; g.fillRect(cx - 36, by - 262, 70, 16); g.fillStyle = '#C9A04E'; g.fillRect(cx - 3, by - 262, 6, 60);
        // 颈、回首的侧脸、发髻
        g.fillStyle = '#EBDDC8'; g.beginPath(); g.moveTo(cx - 8, by - 336); g.lineTo(cx - 6, by - 356); g.lineTo(cx + 12, by - 356); g.lineTo(cx + 12, by - 334); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(cx - 14, by - 392); g.bezierCurveTo(cx - 8, by - 410, cx + 22, by - 412, cx + 28, by - 392); g.bezierCurveTo(cx + 34, by - 384, cx + 32, by - 372, cx + 26, by - 364); g.quadraticCurveTo(cx + 16, by - 350, cx + 2, by - 352); g.quadraticCurveTo(cx - 14, by - 362, cx - 14, by - 392); g.fill();
        g.fillStyle = '#16141C'; g.beginPath(); g.moveTo(cx - 20, by - 380); g.bezierCurveTo(cx - 26, by - 420, cx + 14, by - 432, cx + 26, by - 404); g.quadraticCurveTo(cx + 6, by - 404, cx - 2, by - 388); g.quadraticCurveTo(cx - 8, by - 366, cx - 12, by - 352); g.quadraticCurveTo(cx - 22, by - 362, cx - 20, by - 380); g.fill();
        g.beginPath(); g.ellipse(cx - 8, by - 424, 22, 15, -.3, 0, 6.3); g.fill();
        g.fillStyle = '#D8B25C'; g.beginPath(); g.arc(cx + 10, by - 428, 3.2, 0, 6.3); g.fill(); g.strokeStyle = '#D8B25C'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx - 28, by - 430); g.lineTo(cx + 12, by - 428); g.stroke();
      });
      st.rail = F.sprite(W, 240, function (g) {
        g.fillStyle = '#0A0B18'; g.fillRect(0, 96, W, 150);
        g.strokeStyle = '#0A0B18'; g.lineWidth = 9; g.beginPath(); g.moveTo(0, 60); g.lineTo(W, 60); g.stroke();
        for (k = 0; k < 13; k++) { var x = 30 + k * 86; g.fillStyle = '#0A0B18'; g.fillRect(x - 9, 36, 18, 70); g.beginPath(); g.arc(x, 32, 12, 0, 6.3); g.fill(); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 30, 60); g.lineTo(x + 30, 100); g.moveTo(x + 56, 60); g.lineTo(x + 56, 100); g.stroke(); }
        g.strokeStyle = 'rgba(245,170,90,.28)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 55); g.lineTo(W, 55); g.stroke();
      });
      st.plum = F.sprite(700, 620, function (g) {
        var Rp = F.rng(721), limbs = [[[-20, 40], [140, 90], [300, 190], [430, 330], [520, 470]], [[160, 96], [260, 70], [380, 80], [500, 50]], [[300, 190], [380, 180], [470, 210], [560, 200]], [[430, 330], [400, 420], [420, 520]]];
        limbs.forEach(function (pts, i2) { var s = F.spline(pts, false, 6); g.fillStyle = '#07080F'; F.ribbon(g, s, 0, 1, function (u) { return lerp(i2 ? 9 : 20, 1.4, u); }); for (var j = 0; j < (i2 ? 7 : 10); j++) { var q = F.at(s, lerp(.25, 1, Rp())); g.fillStyle = F.rgba(j % 3 ? '#C9828A' : '#E9D9D2', Rp.range(.5, .85)); for (var m = 0; m < 5; m++) { var a = m / 5 * 6.28; g.beginPath(); g.arc(q.x + Math.cos(a) * 5 + Rp.range(-10, 10) * 0, q.y + Math.sin(a) * 5, 3.6, 0, 6.3); g.fill(); } } });
      });
    },

    figures: function (ctx, arr, t, sway) {
      for (var i = 0; i < arr.length; i++) {
        var f = arr[i], s = f.h / 200, x = f.x + Math.sin(t * .5 + f.ph) * sway * s * 30, y = f.y + Math.abs(Math.sin(t * 1.6 + f.ph)) * -3 * s;
        F.blit(ctx, f.hat ? st.personHat : st.person, x, y, { ax: .5, ay: 214 / 220, sc: s, rot: f.lean + Math.sin(t * .8 + f.ph) * .02 });
        if (f.lamp) { var lx = x + 34 * s, ly = y - 96 * s; ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.glowA, lx, ly, { sc: s * 2.4, a: .5 + .12 * Math.sin(t * 5 + f.ph) }); ctx.globalCompositeOperation = 'source-over'; F.blit(ctx, st.lantern, lx, ly, { sc: s * 1.0 }); }
      }
    },

    street: function (ctx, t) {
      var i, on = p(t, 139.4, 146.5, E.inOutS), push = p(t, 139, 157, E.inOutS), z = 1 + push * .07;
      ctx.save(); ctx.translate(VP.x, VP.y); ctx.scale(z, z); ctx.translate(-VP.x, -VP.y);
      // 地：灯在石板上的光
      K.vgrad(ctx, -60, VP.y - 10, W + 120, H - VP.y + 80, [[0, '#3A2A3A'], [.25, '#2A1F2E'], [1, '#0E0B16']]);
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.haze, 540, 1210, { a: .4 * on, sx: 1.3, sy: .6 }); ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(st.shops.c, 0, 760, W, 520);
      ctx.globalAlpha = lerp(.5, 1, on); F.blit(ctx, st.tower, 540, 1220, { ax: .5, ay: 600 / 660 }); ctx.globalAlpha = 1;
      // 檐下一排灯
      ctx.globalCompositeOperation = 'lighter';
      [[974, 300, 13], [820, 230, 10]].forEach(function (row, r) { for (i = 0; i <= row[2]; i++) { var u = i / row[2], x = 540 + (u - .5) * 2 * row[1], y = row[0] + Math.pow(Math.abs(u - .5) * 2, 2) * -14, l = clamp(on * 3 - Math.abs(u - .5) * 2 - r * .4); if (l > 0) F.blit(ctx, r ? st.glowG : st.glowA, x, y, { sc: .8, a: l * .6 * (.75 + .25 * Math.sin(t * 6 + i * 1.3 + r)) }); } });
      ctx.globalCompositeOperation = 'source-over';
      this.figures(ctx, st.crowdFar, t, .3);
      // 宝马雕车香满路
      var cq = seg(t, 146.4, 154.6); if (cq > 0 && cq < 1) F.blit(ctx, st.cart, lerp(-260, 1340, cq), 1318 + Math.sin(t * 9) * 1.5, { ax: .5, ay: 196 / 220, sc: .86 });
      // 鱼龙舞：一条灯龙
      var dq = F.io(t, 150.2, 151.6, 156.4, 158); if (dq > 0) {
        ctx.globalCompositeOperation = 'lighter';
        for (i = 17; i >= 0; i--) { var u2 = i / 17, ph = t * 1.5 - u2 * 4.2, dx = 540 + 400 * Math.sin(ph * .62) + 120 * Math.sin(ph * 1.3), dy = 1330 + 46 * Math.sin(ph * 1.9) - 60 * Math.cos(ph * .62), sc = lerp(2.6, 1.1, u2) * (i === 0 ? 1.3 : 1); F.blit(ctx, i % 2 ? st.glowR : st.glowA, dx, dy, { sc: sc, a: dq * .6 }); F.blit(ctx, st.glowG, dx, dy, { sc: sc * .32, a: dq * .9 }); }
        ctx.globalCompositeOperation = 'source-over';
      }
      this.figures(ctx, st.crowdMid, t, .5);
      // 花千树
      ctx.drawImage(st.treeS.c, 0, 500, W, 1100);
      var LC = ['#FFC773', '#F08A58', '#FFE9A8'];
      for (i = 0; i < st.lights.length; i++) {
        var L = st.lights[i], l2 = clamp((on * 1.25 - L[5]) * 5); if (l2 <= 0) continue;
        var fk = .7 + .3 * Math.sin(t * (3 + L[2] * 2) + L[4]), ly2 = L[1] + Math.sin(t * 1.2 + L[4]) * 2;
        ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, L[3] === 0 ? st.glowA : L[3] === 1 ? st.glowR : st.glowG, L[0], ly2, { sc: L[2] * .8, a: l2 * fk * .34 }); ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = l2 * (.75 + .25 * fk); ctx.fillStyle = LC[L[3]]; ctx.beginPath(); ctx.arc(L[0], ly2, 2.1 + L[2] * 1.5, 0, 6.3); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // 街上一串串灯笼
      [[1010, 60, 1020, 34, 9, .9], [860, 150, 930, 22, 7, .62]].forEach(function (c, r) {
        ctx.strokeStyle = 'rgba(10,10,24,.9)'; ctx.lineWidth = 2; ctx.beginPath();
        for (i = 0; i <= 20; i++) { var u3 = i / 20, x3 = lerp(c[1], c[2], u3), y3 = c[0] + Math.sin(Math.PI * u3) * c[3] * 3; ctx[i ? 'lineTo' : 'moveTo'](x3, y3); } ctx.stroke();
        for (i = 0; i < c[4]; i++) { var u4 = (i + .5) / c[4], x4 = lerp(c[1], c[2], u4), y4 = c[0] + Math.sin(Math.PI * u4) * c[3] * 3 + 26 * c[5], l3 = clamp(on * 2.4 - Math.abs(u4 - .5) * 2 - .2); ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.glowA, x4, y4, { sc: 3 * c[5], a: l3 * .45 }); ctx.globalCompositeOperation = 'source-over'; F.blit(ctx, st.lantern, x4, y4, { sc: 1.5 * c[5], rot: Math.sin(t * 1.4 + i + r) * .08, a: lerp(.35, 1, l3) }); }
      });
      ctx.restore();
      this.figures(ctx, st.crowdNear, t, .8);
    },

    fireworks: function (ctx, t, fade) { K.fireworks(ctx, BURST, t, fade, st.haze); },

    corner: function (ctx, t) { // 灯火阑珊处
      var i, a = p(t, 156.5, 160.5, E.inOutS);
      // 远处的热闹，已在身后：虚化的灯
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < 26; i++) { var x = 620 + K.hash(i * 1.7) * 520, y = 1090 + K.hash(i * 3.1) * 250, s = 2 + K.hash(i * 5.3) * 5; F.blit(ctx, i % 3 ? st.glowA : st.glowR, x, y, { sc: s, a: .16 + .08 * Math.sin(t * 1.7 + i) }); }
      ctx.globalCompositeOperation = 'source-over';
      K.vgrad(ctx, 0, 1380, W, 540, [[0, '#191830'], [1, '#090914']]);
      K.ripples(ctx, t, { n: 50, x0: 500, x1: W, y0: 1520, y1: 1900, col: '#F0A04B', seed: 31, len: 30, alpha: .3, lw: 1.5 });
      ctx.drawImage(st.rail.c, 0, 1330, W, 240);
      F.blit(ctx, st.plum, -40, 500, { ax: 0, ay: 0, rot: Math.sin(t * .5) * .006 });
      // 一盏孤灯
      var fk = .8 + .2 * Math.sin(t * 5.1) * Math.sin(t * 1.3), lx = 468, ly = 1010 + Math.sin(t * 1.1) * 4;
      ctx.strokeStyle = '#07080F'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 960); ctx.lineTo(lx, ly - 30); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.haze, lx, ly + 60, { sc: .62, a: .5 * fk }); F.blit(ctx, st.glowA, lx, ly, { sc: 5, a: .7 * fk }); ctx.globalCompositeOperation = 'source-over';
      F.blit(ctx, st.lantern, lx, ly, { sc: 1.7, rot: Math.sin(t * 1.1) * .06 });
      // 那人
      var hx = 356, hy = 1420;
      ctx.fillStyle = 'rgba(245,170,90,.1)'; ctx.beginPath(); ctx.ellipse(hx + 40, hy + 4, 190, 26, 0, 0, 6.3); ctx.fill();
      // 披帛当风
      ctx.strokeStyle = 'rgba(176,82,94,.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx - 30, hy - 300); ctx.bezierCurveTo(hx - 90, hy - 250 + Math.sin(t * 1.6) * 10, hx - 120 + Math.sin(t * 1.3) * 14, hy - 150, hx - 170 + Math.sin(t * 1.1 + 1) * 22, hy - 90 + Math.sin(t * 1.9) * 12); ctx.stroke();
      F.blit(ctx, st.her, hx, hy, { ax: .5, ay: 440 / 460, rot: Math.sin(t * .6) * .006, a: a, sc: .92 });
      K.fall(ctx, st.spark, t, { n: 26, seed: 6, life: 9, x0: 0, x1: W, y0: 200, y1: 1500, dx: 80, sway: 24, sc: 1.2, alpha: .55, acc: 1 });
    },

    paint: function (ctx, t) {
      var pan = p(t, 155.2, 159.6, E.inOutS), mfade = 1 - p(t, 154.6, 157.4, E.inOutS), out = p(t, 162.6, 166.6, E.inOutS);
      ctx.drawImage(st.bg.c, 0, 0, W, H);
      var fl = K.fwFlash(BURST, t) * mfade; if (fl > 0) { ctx.fillStyle = 'rgba(255,214,150,' + (.1 * fl) + ')'; ctx.fillRect(0, 0, W, H); }
      var mx = MOON.x + pan * 190, my = MOON.y - pan * 20;
      F.blit(ctx, st.mhalo, mx, my, { a: .9 }); F.blit(ctx, st.moon, mx, my, {});
      if (pan < 1) { ctx.save(); ctx.translate(pan * (W + 80), 0); this.fireworks(ctx, t, mfade); this.street(ctx, t); ctx.restore(); }
      if (pan > 0) { ctx.save(); ctx.translate((pan - 1) * (W + 80), 0); this.corner(ctx, t); ctx.restore(); }
      // 灯一盏一盏熄了，只剩月亮
      if (out > 0) { ctx.fillStyle = 'rgba(10,12,28,' + (.86 * out) + ')'; ctx.fillRect(0, 0, W, H); F.blit(ctx, st.mhalo, mx, my, { a: .9 * out }); F.blit(ctx, st.moon, mx, my, { a: out }); }
      F.curtain(ctx, 'yuan', t);
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'y0', 962, 230, { color: TXT, halo: HALO, weight: 400 });
      F.say(ctx, t, 'y1', 962, 230, { color: TXT, halo: HALO });
      F.say(ctx, t, 'y2', 956, 230, { color: TXT, halo: HALO, size: 80 });
      F.say(ctx, t, 'y3', 968, 320, { color: TXT, halo: HALO, size: 84, gap: 102, stagger: 44, dur: 4.6 });
      F.sign(ctx, t, 'yuan', 70, 130, { color: TXT, halo: HALO, delay: 5.4, early: 10, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
