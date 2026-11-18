/* plates2.js — 《村子与夜空》《很高很高的鹭》《背着山的老龟》。 */
(function (G) {
  'use strict';
  var F = G.F, E = F.E, I = F.I, P = I.P, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg;
  var PL = F.plates;
  function sky(g, y1, c0, c1, c2) { var gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, c0 || P.night0); gr.addColorStop(.6, c1 || P.night1); gr.addColorStop(1, c2 || P.night2); g.fillStyle = gr; g.fillRect(0, 0, W, y1 + 2); }
  function hill(pts, base) { var s = F.spline(pts, false, 10), p = new Path2D(), i; p.moveTo(pts[0][0], base); for (i = 0; i < s.n; i++) p.lineTo(s.p[2 * i], s.p[2 * i + 1]); p.lineTo(pts[pts.length - 1][0], base); p.closePath(); p.top = function (x) { for (var k = 1; k < s.n; k++) if (s.p[2 * k] >= x) return s.p[2 * k + 1]; return base; }; return p; }

  /* ===================== 村子与夜空 ===================== */
  var MOON = { x: 540, y: 500, r: 122 };
  PL.village = {
    build: function () {
      var st = this.st = {}, R = F.rng(1101), i;
      st.back = F.sprite(W, H, function (g) {
        sky(g, 1120, '#0B1130', P.night1, '#33478C');
        I.mottle(g, null, R, { box: [0, 0, W, 1100], n: 120, cols: [P.blue, P.night0], a: .08, rx: [80, 260] });
        // 夜空里一对竖着的耳朵：比夜更暗一点，没有星
        [[300, 1], [780, -1]].forEach(function (e) {
          var tri = [[e[0] - e[1] * 190, 520], [e[0], 110], [e[0] + e[1] * 210, 480]], gr = g.createLinearGradient(0, 110, 0, 520);
          gr.addColorStop(0, 'rgba(5,7,24,.92)'); gr.addColorStop(.7, 'rgba(5,7,24,.55)'); gr.addColorStop(1, 'rgba(5,7,24,0)');
          g.fillStyle = gr; g.beginPath(); g.moveTo(tri[0][0], tri[0][1]); g.lineTo(tri[1][0], tri[1][1]); g.lineTo(tri[2][0], tri[2][1]); g.closePath(); g.fill();
          g.lineCap = 'round';
          for (var k = 0; k < 150; k++) { var u = R(), sd = R() < .5 ? 0 : 2, x = lerp(tri[1][0], tri[sd][0], u), y = lerp(tri[1][1], tri[sd][1], u), a = Math.atan2(tri[sd][1] - tri[1][1], tri[sd][0] - tri[1][0]) + (sd ? -1 : 1) * e[1] * 1.2; g.strokeStyle = k % 3 ? 'rgba(5,7,24,.9)' : 'rgba(64,85,158,' + (.5 * (1 - u)) + ')'; g.lineWidth = R.range(1.4, 2.6); g.globalAlpha = 1 - u * .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * R.range(10, 28), y + Math.sin(a) * R.range(10, 28)); g.stroke(); }
          g.globalAlpha = 1;
        });
        // 远山两重
        var h1 = hill([[-20, 1010], [160, 950], [340, 990], [560, 930], [760, 980], [940, 940], [1100, 990]], 1200); I.fill(g, h1, '#2B3C7C');
        I.hatch(g, h1, R, { box: [0, 920, W, 200], ang: .5, gap: 13, col: P.night0, a: .3, lw: 1.2, dash: [20, 70] });
        var h2 = hill([[-20, 1090], [200, 1040], [420, 1080], [640, 1050], [860, 1090], [1100, 1060]], 1300); I.fill(g, h2, P.night2);
        I.meadow(g, R, { n: 700, x0: 0, x1: W, y0: 1040, y1: 1200, cols: ['#1B2756', '#33478C', '#5068B4'], size: 12, inside: function (x, y) { return y > h2.top(x) + 4; } });
      });
      // 村子所在的山丘、屋、路、近草、框景的树
      st.win = [];
      st.front = F.sprite(W, H, function (g) {
        var hv = hill([[-60, 1340], [140, 1300], [300, 1250], [470, 1120], [640, 1050], [820, 1040], [980, 1090], [1100, 1150]], 1700); I.shape(g, hv, '#22316C', 0);
        I.hatch(g, hv, R, { box: [-20, 1040, 1120, 320], ang: -.5, gap: 12, col: P.night0, a: .32, lw: 1.2, dash: [16, 60] });
        I.meadow(g, R, { n: 520, x0: 320, x1: W, y0: 1050, y1: 1330, cols: ['#1B2756', '#3A4F96', '#6F86CC'], size: 14, inside: function (x, y) { return y > hv.top(x) + 6; } });
        // 屋：自远而近
        [[560, 1082, 70, 54], [642, 1056, 62, 62], [706, 1050, 84, 70], [800, 1046, 70, 58], [870, 1058, 96, 78], [962, 1088, 80, 64], [600, 1128, 92, 72], [760, 1112, 108, 86], [900, 1140, 100, 78]].forEach(function (h, k) {
          var w = I.house(g, h[0], h[1], h[2], h[3], R, { wall: k % 3 ? '#93A5DC' : '#B7C3EA', roof: k % 2 ? '#1B2756' : '#2B3C7C' }); st.win.push(w);
          g.fillStyle = P.night0; g.fillRect(w.wx - w.ww / 2, w.wy, w.ww, w.wh); g.fillRect(w.dx - w.ww * .45, w.dy, w.ww * .9, h[3] * .42);
        });
        // 尖塔
        I.shape(g, 'M716,1050 v-96 h28 v96 Z', '#A6B5E6', 1.6); I.shape(g, 'M708,954 L730,870 L752,954 Z', '#1B2756', 1.6); g.fillStyle = P.night0; g.fillRect(724, 980, 12, 20);
        // 路
        var path = F.spline([[640, 1150], [560, 1230], [600, 1310], [470, 1390], [330, 1440], [250, 1520], [210, 1640]], false, 8);
        g.fillStyle = '#93A5DC'; g.globalAlpha = .55; F.ribbon(g, path, 0, 1, function (u) { return lerp(10, 62, u * u); }); g.globalAlpha = 1; st.path = path;
        // 近处的坡
        var hf = hill([[-20, 1420], [180, 1380], [420, 1450], [700, 1400], [900, 1440], [1100, 1390]], 1700);
        g.save(); g.globalCompositeOperation = 'destination-over'; g.restore();
        I.meadow(g, R, { n: 2600, x0: -10, x1: W + 10, y0: 1300, y1: H + 10, pow: .9, cols: ['#17224F', '#2B3C7C', '#5068B4', '#93A5DC', '#DCE2F2'], size: 26, scale: function (x, y) { return lerp(.5, 1.2, (y - 1300) / 320); }, inside: function (x, y) { for (var k = 0; k <= 20; k++) { var q = F.at(path, k / 20); if (Math.hypot(x - q.x, y - q.y) < lerp(8, 34, (k / 20) * (k / 20))) return false; } return y > hv.top(x) + 30 || y > 1420; }, tone: function (x, y) { return clamp(.3 + .3 * F.noise(x * .008, 2) + (y - 1300) / 900); } });
        // 框景：左右各一棵树
        I.tree(g, 40, 1650, 760, R, { lean: .06, depth: 4, dark: '#0C1232', lit: '#263672', trunk: '#080B22' });
        I.tree(g, 1040, 1660, 640, R, { lean: -.16, depth: 3, dark: '#0C1232', lit: '#263672', trunk: '#080B22' });
      });
      st.stars = I.starList(R, 330, 0, 0, W, 980, { pow: 1.15 }).filter(function (s) { var inEar = false; [300, 780].forEach(function (ax) { var d = Math.abs(s.x - ax), yy = 110 + d * 2.0; if (s.y > yy + 14 && s.y < 430 && d < 170) inEar = true; }); return !inEar && Math.hypot(s.x - MOON.x, s.y - MOON.y) > MOON.r + 26; });
      st.halo = F.glowSprite(430, '#FBE7B4', .5, 2.0); st.wglow = F.glowSprite(46, '#F7B25A', .8, 1.7);
      st.lamp = F.glowSprite(170, '#F7B25A', .55, 2.0); st.lampS = F.glowSprite(30, '#FFE2A6', .95, 1.5);
      st.moon = F.sprite(260, 260, function (g) {
        var gr = g.createRadialGradient(118, 112, 10, 130, 130, 124); gr.addColorStop(0, '#FFF8E2'); gr.addColorStop(.6, '#FBE7B4'); gr.addColorStop(1, '#F0C878'); g.fillStyle = gr; g.beginPath(); g.arc(130, 130, 122, 0, 6.3); g.fill();
        g.save(); g.clip(); g.lineCap = 'round'; for (i = 0; i < 150; i++) { var a = R() * 6.28, r0 = R.range(24, 60), r1 = r0 + R.range(20, 60); g.strokeStyle = 'rgba(190,130,50,' + R.range(.08, .22) + ')'; g.lineWidth = R.range(.8, 1.8); g.beginPath(); g.moveTo(130 + Math.cos(a) * r0, 130 + Math.sin(a) * r0); g.lineTo(130 + Math.cos(a) * r1, 130 + Math.sin(a) * r1); g.stroke(); }
        g.fillStyle = 'rgba(40,36,70,.5)'; g.beginPath(); g.ellipse(130, 130, 9, 64, 0, 0, 6.3); g.fill(); g.restore();
      });
    },
    /** s:{open 0..1, squint 0..1, lit 0..1, home 0|1, walk 0..1} */
    draw: function (ctx, t, s, par) {
      var st = this.st, px = par.x, py = par.y, i, o = clamp(s.open || 0) * (1 - .86 * clamp(s.squint || 0));
      ctx.drawImage(st.back.c, -14 + px * 6, -10 + py * 4, W + 28, H + 20);
      I.drawStars(ctx, st.stars, t, 1);
      // 月：夜的眼睛。睁开是满月，眯起来是月牙
      var mx = MOON.x + px * 5, my = MOON.y + py * 3, r = MOON.r;
      if (o > .003) {
        ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.halo, mx, my, { a: o * .85 }); ctx.globalCompositeOperation = 'source-over';
        ctx.save(); var cl = new Path2D(); cl.rect(mx - r - 4, my - r - 4, 2 * r + 8, 2 * r + 8); cl.arc(mx, my - r * 2.06 * o, r * 1.02, 0, 6.3); ctx.clip(cl, 'evenodd');
        ctx.drawImage(st.moon.c, mx - 130, my - 130, 260, 260); ctx.restore();
      } else { ctx.strokeStyle = 'rgba(166,181,230,.4)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(mx, my - r * .5, r * 1.1, .42 * Math.PI, .58 * Math.PI); ctx.stroke(); }
      ctx.drawImage(st.front.c, -22 + px * 18, -14 + py * 10, W + 44, H + 28);
      // 窗：一扇一扇亮
      var lit = clamp(s.lit || 0);
      for (i = 0; i < st.win.length; i++) {
        var w = st.win[i], a = clamp(lit * st.win.length - i); if (a <= 0) continue;
        var wx = w.wx + px * 18, wy = w.wy + py * 10, fk = .85 + .15 * Math.sin(t * 5 + i * 2);
        ctx.fillStyle = 'rgba(247,186,96,' + a + ')'; ctx.fillRect(wx - w.ww / 2, wy, w.ww, w.wh);
        ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.wglow, wx, wy + w.wh / 2, { a: a * .8 * fk }); ctx.globalCompositeOperation = 'source-over';
      }
      // 小灯
      var gp;
      if (s.home) gp = I.girl(ctx, 574 + px * 18, 1246 + py * 10, .62, { dir: 1, up: .9 });
      else { var q = F.at(st.path, lerp(.9, .62, clamp(s.walk || 0))); gp = I.girl(ctx, q.x + px * 18, q.y + py * 10, lerp(1.05, .8, clamp(s.walk || 0)), { dir: 1, up: .1, walk: t * 5 * (s.walking ? 1 : 0) }); }
      I.lampGlow(ctx, st.lamp, gp.x, gp.y, s.home ? .7 : 1.2, .9, t); I.lampGlow(ctx, st.lampS, gp.x, gp.y, s.home ? .5 : .8, 1, t);
    }
  };

  /* ===================== 很高很高的鹭 ===================== */
  PL.heron = {
    build: function () {
      var st = this.st = {}, R = F.rng(2101), i;
      st.back = F.sprite(W, H, function (g) {
        sky(g, 470, '#0B1130', P.night1, '#3A4F96');
        var gr = g.createLinearGradient(0, 440, 0, H); gr.addColorStop(0, '#7187CF'); gr.addColorStop(.22, '#8FA2DE'); gr.addColorStop(.6, '#5068B4'); gr.addColorStop(1, '#263672'); g.fillStyle = gr; g.fillRect(0, 440, W, H - 440);
        I.mottle(g, null, R, { box: [0, 440, W, H - 440], n: 160, cols: ['#A6B5E6', '#33478C'], a: .1, rx: [60, 240] });
        // 对岸的林
        for (i = 0; i < 40; i++) { var x = i * 28 + R.range(-10, 10), hh = R.range(40, 110); g.fillStyle = i % 3 ? '#1B2756' : '#263672'; g.beginPath(); g.ellipse(x, 448, R.range(18, 34), hh, 0, Math.PI, 0); g.fill(); g.globalAlpha = .28; g.beginPath(); g.ellipse(x, 452, R.range(18, 34), hh * .7, 0, 0, Math.PI); g.fill(); g.globalAlpha = 1; }
        // 水纹
        I.hatch(g, null, R, { box: [0, 470, W, H - 470], ang: 0, gap: 15, col: '#DCE2F2', a: .4, lw: 1.3, dash: [10, 70], wob: 1.5 });
        I.hatch(g, null, R, { box: [0, 700, W, H - 700], ang: 0, gap: 21, col: P.night0, a: .3, lw: 1.5, dash: [20, 110], wob: 2 });
        // 雾
        for (i = 0; i < 26; i++) { var mx = R() * W, my = 440 + R.gauss() * 40, rx = R.range(140, 340), ry = R.range(16, 40), mg = g.createRadialGradient(0, 0, 0, 0, 0, 1); mg.addColorStop(0, 'rgba(205,214,243,.34)'); mg.addColorStop(1, 'rgba(205,214,243,0)'); g.save(); g.translate(mx, my); g.scale(rx, ry); g.fillStyle = mg; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore(); }
      });
      function reeds(g, x0, x1, y, n, hmin, hmax, cols) {
        for (var k = 0; k < n; k++) {
          var x = lerp(x0, x1, R()), hh = R.range(hmin, hmax), bend = R.range(-70, 70), col = cols[(R() * cols.length) | 0];
          g.strokeStyle = col; g.lineWidth = R.range(2, 4.4); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y + 30); g.quadraticCurveTo(x + bend * .2, y - hh * .5, x + bend, y - hh); g.stroke();
          if (R() < .45) { g.fillStyle = col; g.save(); g.translate(x + bend, y - hh); g.rotate(Math.atan2(-hh * .5, bend * .8) + Math.PI / 2); g.beginPath(); g.ellipse(0, -16, 5.5, 22, 0, 0, 6.3); g.fill(); g.restore(); }
          else { g.lineWidth = 2; g.beginPath(); g.moveTo(x + bend * .5, y - hh * .62); g.quadraticCurveTo(x + bend * .5 + 34, y - hh * .7, x + bend * .5 + 70, y - hh * .5); g.stroke(); }
        }
      }
      st.reedB = F.sprite(W, H, function (g) { reeds(g, 760, 1090, 1180, 40, 160, 420, ['#1B2756', '#263672', '#33478C']); reeds(g, -20, 150, 1120, 22, 140, 330, ['#1B2756', '#263672']); });
      st.reedF = F.sprite(W, H, function (g) {
        reeds(g, -30, 330, 1600, 46, 260, 640, ['#0C1232', '#141C46', '#1B2756']); reeds(g, 820, 1110, 1610, 50, 300, 760, ['#0C1232', '#141C46', '#1B2756']);
        I.meadow(g, R, { n: 260, x0: -10, x1: 360, y0: 1500, y1: 1640, cols: ['#0C1232', '#1B2756', '#33478C'], size: 34 }); I.meadow(g, R, { n: 260, x0: 800, x1: 1090, y0: 1500, y1: 1640, cols: ['#0C1232', '#1B2756', '#33478C'], size: 34 });
        // 小灯脚下的草墩
        I.shape(g, 'M70,1440 Q170,1380 300,1436 Q200,1470 70,1440 Z', '#1B2756', 1.6); I.meadow(g, R, { n: 90, x0: 80, x1: 290, y0: 1404, y1: 1440, cols: ['#33478C', '#6F86CC', '#DCE2F2'], size: 20 });
      });
      // 翅：一片一片的羽
      st.wing = F.sprite(560, 420, function (g) { // 原点 (480, 620)
        g.translate(-480, -620);
        var wp = I.shape(g, 'M556,744 C690,690 862,756 990,968 C1020,1010 1046,1040 1060,1064 C980,1010 900,1000 820,1004 C740,1006 660,990 612,940 C574,896 552,820 556,744 Z', '#6C82CC', 2.4);
        g.save(); g.clip(wp);
        for (var row = 0; row < 6; row++) for (var k = 0; k < 13; k++) { var fx = 574 + k * 36 + (row % 2) * 18 + row * 16, fy = 760 + row * 30 + k * 13; g.fillStyle = row > 3 ? '#40559E' : (row % 2 ? '#7C90D4' : '#6C82CC'); g.strokeStyle = P.ink; g.lineWidth = 1.3; g.beginPath(); g.moveTo(fx - 20, fy - 6); g.quadraticCurveTo(fx, fy + 26, fx + 22, fy - 2); g.fill(); g.stroke(); }
        g.restore();
        // 飞羽
        for (i = 0; i < 7; i++) { var a = F.path('M' + (700 + i * 40) + ',' + (930 + i * 10) + ' C' + (800 + i * 36) + ',' + (966 + i * 10) + ' ' + (900 + i * 26) + ',' + (1000 + i * 8) + ' ' + (1010 + i * 9) + ',' + (1040 + i * 5), 6)[0]; g.fillStyle = '#33478C'; F.ribbon(g, a, 0, 1, function (u) { return 16 * Math.sin(Math.PI * Math.pow(u, .6)) + 1; }); g.strokeStyle = P.ink; g.lineWidth = 1; F.draw(g, a, 1); }
      });
      st.stars = I.starList(R, 150, 0, 0, W, 400, { pow: 1.2 });
      st.refl = I.starList(R, 60, 0, 500, W, 1000, {});
      st.lamp = F.glowSprite(190, '#F7B25A', .55, 2.0); st.lampS = F.glowSprite(32, '#FFE2A6', .95, 1.5);
      st.R = F.rng(2199);
    },
    /** s:{dip 0..1, ripples:[{x,y,t0}], eaten:n} */
    draw: function (ctx, t, s, par) {
      var st = this.st, px = par.x, py = par.y, i, dip = E.inOutS(clamp(s.dip || 0)), sw = Math.sin(t * .7);
      ctx.drawImage(st.back.c, -12 + px * 6, -8 + py * 4, W + 24, H + 16);
      I.drawStars(ctx, st.stars, t, 1);
      // 水里的星星
      for (i = 0; i < st.refl.length; i++) { var r = st.refl[i]; if (s.eaten && i < s.eaten) continue; var tw = .5 + .5 * Math.sin(t * r.sp + r.ph); ctx.globalAlpha = .75 * tw; ctx.fillStyle = r.c; ctx.beginPath(); ctx.ellipse(r.x + Math.sin(t * .8 + i) * 3, r.y, r.r * 1.5, r.r * 3.2 * (.7 + .3 * tw), 0, 0, 6.3); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.drawImage(st.reedB.c, -16 + px * 10, -10 + py * 6, W + 32, H + 20);
      // ---- 鹭 ----
      ctx.save(); ctx.translate(px * 14, py * 8); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var bob = sw * 3;
      // 腿
      [[612, 984, 646, 1214, 600, 1474], [704, 994, 748, 1234, 720, 1492]].forEach(function (L, k) {
        ctx.strokeStyle = P.ink; ctx.lineWidth = 12 - k; ctx.beginPath(); ctx.moveTo(L[0], L[1] + bob); ctx.lineTo(L[2], L[3]); ctx.lineTo(L[4], L[5]); ctx.stroke();
        ctx.strokeStyle = '#5068B4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L[0] - 2, L[1] + bob); ctx.lineTo(L[2] - 2, L[3]); ctx.lineTo(L[4] - 2, L[5]); ctx.stroke();
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(L[2], L[3], 9, 0, 6.3); ctx.fill();
        for (var j = 0; j < 3; j++) { var rr = 30 + j * 26 + (t * 14 + k * 20) % 26; ctx.strokeStyle = 'rgba(220,226,242,' + (.5 - j * .14) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(L[4], L[5], rr, rr * .24, 0, 0, 6.3); ctx.stroke(); }
      });
      ctx.translate(0, bob);
      // 身
      I.shape(ctx, 'M418,762 C470,640 722,620 862,742 C962,822 1004,902 1046,1014 C944,992 862,1012 762,1012 C622,1018 470,962 418,762 Z', '#C6D0EF', 2.6);
      ctx.strokeStyle = '#8FA2DE'; ctx.lineWidth = 1.4; for (i = 0; i < 16; i++) { var hx = 450 + i * 20, hy = 800 + i * 9; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 12, hy + 26, hx + 6, hy + 50); ctx.stroke(); }
      ctx.drawImage(st.wing.c, 480, 620, 560, 420);
      // 颈：俯身时，慢慢探向水面
      var N0 = [[452, 772], [384, 640], [374, 506], [452, 404], [470, 312], [432, 250]], N1 = [[452, 772], [372, 700], [300, 690], [246, 760], [226, 880], [214, 990]];
      var np = N0.map(function (q, k) { return [lerp(q[0], N1[k][0], dip), lerp(q[1], N1[k][1], dip) + (k > 2 ? sw * 4 : 0)]; }), ns = F.spline(np, false, 8);
      var wf = function (u) { return lerp(92, 34, Math.pow(u, .55)); };
      ctx.fillStyle = P.ink; F.ribbon(ctx, ns, 0, 1, function (u) { return wf(u) + 5.2; });
      ctx.fillStyle = '#D6DEF4'; F.ribbon(ctx, ns, 0, 1, wf);
      ctx.strokeStyle = '#8FA2DE'; ctx.lineWidth = 1.3; for (i = 1; i < 16; i++) { var q = F.at(ns, i / 17), w2 = wf(i / 17) * .3; ctx.beginPath(); ctx.moveTo(q.x - Math.sin(q.a) * w2, q.y + Math.cos(q.a) * w2); ctx.lineTo(q.x - Math.sin(q.a) * w2 + Math.cos(q.a) * 16, q.y + Math.cos(q.a) * w2 + Math.sin(q.a) * 16); ctx.stroke(); }
      // 胸前的长羽
      ctx.strokeStyle = '#E9EEFA'; ctx.lineWidth = 3; for (i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(438 + i * 7, 800 + i * 4); ctx.quadraticCurveTo(410 + i * 9 + sw * 3, 880, 420 + i * 12 + sw * 6, 960 + i * 6); ctx.stroke(); }
      // 头与喙
      var hd = F.at(ns, 1), ha = lerp(3.02, 2.02, dip) + sw * .015;
      ctx.save(); ctx.translate(hd.x, hd.y); ctx.rotate(ha);
      I.shape(ctx, 'M30,-9 L222,3 L30,13 Z', P.gold, 2.2); ctx.strokeStyle = P.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(40, 2); ctx.lineTo(210, 3); ctx.stroke();
      I.shape(ctx, 'M-44,2 C-44,-26 -10,-34 22,-24 C40,-18 44,-6 40,6 C34,24 -4,30 -30,22 C-40,18 -44,10 -44,2 Z', '#E4EAF8', 2.4);
      I.fill(ctx, 'M-46,-4 C-40,-30 -6,-38 26,-26 C8,-22 -18,-16 -30,-6 C-70,10 -120,6 -168,-22 C-120,-6 -80,-8 -46,-4 Z', P.ink);
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(14, -6, 6.5, 0, 6.3); ctx.fill(); ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(15, -6, 3, 0, 6.3); ctx.fill();
      ctx.restore();
      st.beak = { x: hd.x + Math.cos(ha) * 222 + px * 14, y: hd.y + Math.sin(ha) * 222 + py * 8 + bob };
      ctx.restore();
      // 涟漪
      (s.ripples || []).forEach(function (rp) { var a = t - rp.t0; if (a < 0 || a > 3) return; for (var j = 0; j < 3; j++) { var rr = (a - j * .28) * 120; if (rr <= 0) continue; ctx.strokeStyle = 'rgba(232,238,250,' + (.7 * (1 - a / 3)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rr, rr * .26, 0, 0, 6.3); ctx.stroke(); } });
      ctx.drawImage(st.reedF.c, -26 + px * 24, -16 + py * 14, W + 52, H + 32);
      var gp = I.girl(ctx, 178 + px * 24, 1420 + py * 14, .86, { dir: 1, up: .25 });
      I.lampGlow(ctx, st.lamp, gp.x, gp.y, 1.1, .9, t); I.lampGlow(ctx, st.lampS, gp.x, gp.y, .7, 1, t);
    }
  };

  /* ===================== 背着山的老龟 ===================== */
  PL.turtle = {
    build: function () {
      var st = this.st = {}, R = F.rng(3101), i;
      st.back = F.sprite(W, H, function (g) { sky(g, H, '#0B1130', '#1B2756', '#40559E'); I.mottle(g, null, R, { box: [0, 0, W, H], n: 140, cols: [P.blue, P.night0], a: .08, rx: [80, 260] }); for (i = 0; i < 5; i++) I.cloud(g, R.range(60, 1020), R.range(990, 1130), R.range(260, 460), R.range(80, 130), R, { shade: '#33478C', light: '#8FA2DE', mid: '#5068B4', line: '#1B2756' }); });
      st.cloudsM = F.sprite(W, 520, function (g) { for (i = 0; i < 7; i++) I.cloud(g, 60 + i * 170 + R.range(-30, 30), 300 + R.range(-30, 40), R.range(300, 460), R.range(120, 170), R, { shade: '#5068B4', light: '#F5E8CF', mid: '#F2CBAA', line: '#33478C' }); });
      st.cloudsF = F.sprite(W + 200, 460, function (g) { for (i = 0; i < 7; i++) I.cloud(g, 40 + i * 210 + R.range(-30, 30), 330 + R.range(-20, 50), R.range(380, 560), R.range(150, 210), R, { shade: '#6C82CC', light: '#FAF0DC', mid: '#F2CBAA', line: '#40559E' }); });
      // 壳与山
      st.shell = F.sprite(820, 800, function (g) { // 世界坐标 (170, 330)
        g.translate(-170, -330);
        // 山
        var mt = I.shape(g, 'M392,760 L452,640 L500,560 L540,430 L566,372 L600,440 L628,470 L664,430 L708,520 L760,600 L816,760 Z', '#6C82CC', 2.4);
        g.save(); g.clip(mt);
        I.fill(g, 'M566,372 L540,430 L500,560 L452,640 L392,760 L520,760 L548,600 L560,470 Z', '#A6B5E6'); I.fill(g, 'M664,430 L628,470 L640,560 L620,760 L700,760 L690,600 Z', '#8FA2DE');
        I.fill(g, 'M566,372 L548,420 L560,440 L574,418 L590,446 L600,440 Z', P.cream); I.fill(g, 'M664,430 L650,456 L664,470 L676,452 L690,476 L684,460 Z', P.cream);
        g.restore();
        I.hatch(g, mt, R, { box: [392, 372, 424, 388], ang: 1.15, gap: 10, col: P.ink, a: .34, lw: 1.1, dash: [10, 46] });
        g.strokeStyle = P.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(566, 372); g.lineTo(556, 470); g.lineTo(540, 600); g.lineTo(522, 760); g.moveTo(664, 430); g.lineTo(642, 560); g.lineTo(630, 760); g.stroke();
        // 壳
        var sh = I.shape(g, 'M246,1012 C262,800 424,690 604,690 C786,690 926,820 936,1012 Z', '#40559E', 2.8);
        g.save(); g.clip(sh);
        I.fill(g, 'M246,1012 C262,800 424,690 604,690 C520,720 380,830 330,1012 Z', '#5068B4');
        g.strokeStyle = P.ink; g.lineWidth = 2; // 甲片
        [[330, 1012, 372, 860, 470, 760], [470, 1012, 500, 870, 560, 740], [610, 1012, 610, 870, 610, 730], [750, 1012, 720, 880, 664, 750], [860, 1012, 836, 900, 760, 780]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(q[2], q[3], q[4], q[5]); g.stroke(); });
        g.beginPath(); g.moveTo(270, 900); g.quadraticCurveTo(600, 800, 916, 900); g.moveTo(330, 800); g.quadraticCurveTo(600, 716, 860, 800); g.stroke();
        g.restore();
        I.hatch(g, sh, R, { box: [246, 690, 690, 322], ang: -.25, gap: 11, col: P.ink, a: .3, lw: 1.1, dash: [10, 40] });
        I.shape(g, 'M226,1012 Q590,1074 956,1012 L946,1056 Q590,1118 236,1056 Z', '#263672', 2.6);
        g.strokeStyle = P.ink; g.lineWidth = 1.4; for (i = 0; i < 16; i++) { var rx = 262 + i * 44; g.beginPath(); g.moveTo(rx, 1024 + Math.sin(i / 15 * Math.PI) * 34); g.lineTo(rx - 2, 1064 + Math.sin(i / 15 * Math.PI) * 34); g.stroke(); }
        // 壳上的林、小屋、瀑布
        [[430, 742, 110], [468, 716, 130], [760, 740, 120], [800, 760, 96], [520, 700, 90], [712, 706, 100], [356, 800, 120], [860, 806, 110], [640, 690, 76]].forEach(function (q) { I.pine(g, q[0], q[1], q[2], R, { dark: '#12203A', lit: '#33504A', trunk: '#080B22' }); });
        var w = I.house(g, 590, 706, 62, 44, R, { wall: '#DCE2F2', roof: '#8E3327' }); st.hut = { x: w.wx + 170 - 170, y: w.wy };
        g.fillStyle = '#F7BA60'; g.fillRect(w.wx - w.ww / 2, w.wy, w.ww, w.wh); g.fillStyle = P.night0; g.fillRect(w.dx - 5, w.dy, 10, 18);
        g.strokeStyle = '#E9EEFA'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(420, 772); g.quadraticCurveTo(360, 850, 300, 1010); g.stroke();
        g.strokeStyle = '#A6B5E6'; g.lineWidth = 2; g.beginPath(); g.moveTo(424, 776); g.quadraticCurveTo(366, 852, 306, 1010); g.stroke();
      });
      function limb(w, h, d, hatchAng) { return F.sprite(w, h, function (g) { var p = I.shape(g, d, '#8FA2DE', 2.6); I.hatch(g, p, R, { box: [0, 0, w, h], ang: hatchAng, gap: 9, col: P.ink, a: .32, lw: 1.1, dash: [8, 34] }); g.save(); g.clip(p); g.strokeStyle = P.ink; g.lineWidth = 1.5; for (var k = 0; k < 9; k++) { g.beginPath(); g.arc(R.range(20, w - 20), R.range(20, h - 20), R.range(8, 16), 0, 6.3); g.stroke(); } g.restore(); }); }
      st.flipF = limb(330, 300, 'M286,30 C230,10 150,40 96,110 C50,170 20,230 14,284 C80,270 150,230 210,170 C260,120 300,80 316,60 Z', .9);
      st.flipR = limb(240, 230, 'M30,24 C90,10 150,50 190,110 C214,150 226,190 226,218 C170,206 120,170 80,120 C50,84 30,50 30,24 Z', -.8);
      st.head = F.sprite(360, 300, function (g) { // 颈根在右下 (330, 250)
        var p = I.shape(g, 'M342,286 C330,220 280,150 210,110 C170,60 96,40 50,70 C16,92 10,130 30,150 C60,176 110,180 150,176 C190,200 220,250 240,292 Z', '#A6B5E6', 2.8);
        I.hatch(g, p, R, { box: [0, 0, 360, 300], ang: .7, gap: 10, col: P.ink, a: .3, lw: 1.1, dash: [8, 30] });
        g.strokeStyle = P.ink; g.lineWidth = 1.6; for (var k = 0; k < 6; k++) { g.beginPath(); g.moveTo(206 + k * 20, 130 + k * 22); g.quadraticCurveTo(196 + k * 22, 170 + k * 20, 214 + k * 18, 204 + k * 18); g.stroke(); }
        g.beginPath(); g.moveTo(24, 132); g.quadraticCurveTo(70, 150, 124, 138); g.stroke(); // 嘴
        g.fillStyle = P.ink; g.beginPath(); g.arc(40, 104, 2.6, 0, 6.3); g.fill();
      });
      st.stars = I.starList(R, 260, 0, 0, W, 1000, { pow: 1.1 });
      st.wglow = F.glowSprite(60, '#F7B25A', .8, 1.7); st.lamp = F.glowSprite(180, '#F7B25A', .55, 2.0); st.lampS = F.glowSprite(30, '#FFE2A6', .95, 1.5);
    },
    /** s:{step 0..1 (脉冲), blinkAt, shoot:[{t0,x,y}]} */
    draw: function (ctx, t, s, par) {
      var st = this.st, px = par.x, py = par.y, i, bob = Math.sin(t * .6) * 8, pad = Math.sin(t * .8) * .16 + (s.step || 0) * .5;
      ctx.drawImage(st.back.c, -10 + px * 5, -8 + py * 3, W + 20, H + 16);
      I.drawStars(ctx, st.stars, t, 1);
      (s.shoot || []).forEach(function (sh) { var a = (t - sh.t0) / 1.1; if (a < 0 || a > 1) return; var x = sh.x + a * 420, y = sh.y + a * 250; ctx.strokeStyle = 'rgba(245,232,207,' + (1 - a) + ')'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 150 * (1 - a * .5), y - 90 * (1 - a * .5)); ctx.stroke(); });
      var cx = (t * 6) % 170;
      ctx.drawImage(st.cloudsM.c, -cx + px * 9, 960 + py * 5, W, 520); ctx.drawImage(st.cloudsM.c, -cx + W + px * 9, 960 + py * 5, W, 520);
      // ---- 龟 ----
      ctx.save(); ctx.translate(px * 15, py * 9 + bob);
      F.blit(ctx, st.flipR, 880, 1030, { ax: .12, ay: .1, rot: -pad * .6 });
      F.blit(ctx, st.head, 280, 1010, { ax: 330 / 360, ay: 250 / 300, rot: Math.sin(t * .5) * .04 - (s.step || 0) * .06 });
      // 眼：会眨
      var hr = Math.sin(t * .5) * .04 - (s.step || 0) * .06, ex = 280 + (-290 * Math.cos(hr) + 146 * Math.sin(hr)), ey = 1010 + (-290 * Math.sin(hr) - 146 * Math.cos(hr));
      var bl = (t % 5.3 < .16 || (s.blinkAt && t - s.blinkAt < .22 && t >= s.blinkAt)) ? .12 : 1;
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.ellipse(ex + 72, ey + 6, 15, 12 * bl, -.2, 0, 6.3); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(ex + 70, ey + 6, 6, 8 * bl, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ex + 52, ey - 8); ctx.quadraticCurveTo(ex + 72, ey - 18, ex + 92, ey - 6); ctx.stroke();
      ctx.drawImage(st.shell.c, 170, 330, 820, 800);
      // 小屋的灯、瀑布的水
      ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.wglow, 592, 680, { a: .7 + .15 * Math.sin(t * 4) }); ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (i = 0; i < 9; i++) { var u = (i / 9 + t * .5) % 1, wx = lerp(420, 300, u * u * .6 + u * .4), wy = lerp(772, 1010, u); ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx - 5, wy + 16); ctx.stroke(); }
      for (i = 0; i < 12; i++) { var u2 = (i / 12 + t * .4) % 1; ctx.globalAlpha = 1 - u2; ctx.beginPath(); ctx.moveTo(296 + (I.hash(i) - .5) * 30, 1016 + u2 * 190); ctx.lineTo(296 + (I.hash(i) - .5) * 30, 1030 + u2 * 190); ctx.stroke(); } ctx.globalAlpha = 1;
      F.blit(ctx, st.flipF, 330, 1040, { ax: 290 / 330, ay: 40 / 300, rot: pad });
      ctx.restore();
      // 近处的云海与小船
      var cf = (t * 14) % 210;
      ctx.drawImage(st.cloudsF.c, -cf - 100 + px * 26, 1230 + py * 14, W + 200, 460); ctx.drawImage(st.cloudsF.c, -cf - 100 + W + 200 + px * 26, 1230 + py * 14, W + 200, 460);
      var bx = 250 + px * 22, by = 1500 + Math.sin(t * 1.1) * 6 + py * 12;
      I.shape(ctx, 'M' + (bx - 70) + ',' + (by - 16) + ' Q' + bx + ',' + (by + 30) + ' ' + (bx + 78) + ',' + (by - 22) + ' Q' + bx + ',' + (by - 2) + ' ' + (bx - 70) + ',' + (by - 16) + ' Z', '#8E3327', 2);
      var gp = I.girl(ctx, bx - 6, by - 4, .7, { dir: 1, up: .3 });
      I.lampGlow(ctx, st.lamp, gp.x, gp.y, 1.05, .9, t); I.lampGlow(ctx, st.lampS, gp.x, gp.y, .7, 1, t);
      ctx.save(); ctx.beginPath(); ctx.rect(0, by + 4, W, 200); ctx.clip(); ctx.drawImage(st.cloudsF.c, -cf - 100 + px * 26, 1262 + py * 14, W + 200, 460); ctx.drawImage(st.cloudsF.c, -cf - 100 + W + 200 + px * 26, 1262 + py * 14, W + 200, 460); ctx.restore();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
