/* plates1.js — 第四幅《这不是草，这是毛》与第五幅《夜的眼睛》。 */
(function (G) {
  'use strict';
  var F = G.F, E = F.E, I = F.I, P = I.P, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg;
  var PL = F.plates = F.plates || {};
  function poly(pts) { var p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
  function ell(cx, cy, rx, ry, rot, n) { var a = [], c = Math.cos(rot), s = Math.sin(rot); for (var i = 0; i < n; i++) { var t = i / n * 6.2832, x = Math.cos(t) * rx, y = Math.sin(t) * ry; a.push([cx + x * c - y * s, cy + x * s + y * c]); } return a; }
  function inEll(x, y, cx, cy, rx, ry, rot, k) { var c = Math.cos(rot), s = Math.sin(rot), dx = x - cx, dy = y - cy, u = (dx * c + dy * s) / (rx * k), v = (-dx * s + dy * c) / (ry * k); return u * u + v * v < 1; }
  /** 毛茸茸的轮廓：沿边缘向外的短毛 */
  function fringe(g, pts, R, o) {
    g.lineCap = 'round';
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], nx = b[1] - a[1], ny = -(b[0] - a[0]), L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L; if (o.flip) { nx = -nx; ny = -ny; }
      for (var k = 0; k < (o.dens || 2); k++) {
        var u = R(), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), len = R.range(o.len[0], o.len[1]), sk = R.range(-.7, .7) + (o.skew || 0);
        g.strokeStyle = o.cols[(R() * o.cols.length) | 0]; g.lineWidth = R.range(1.4, 2.8); g.globalAlpha = R.range(.6, 1);
        g.beginPath(); g.moveTo(x - nx * 6, y - ny * 6); g.quadraticCurveTo(x + nx * len * .5 + ny * sk * 8, y + ny * len * .5 - nx * sk * 8, x + nx * len + ny * sk * len * .5, y + ny * len - nx * sk * len * .5); g.stroke();
      }
    }
    g.globalAlpha = 1;
  }
  PL.util = { poly: poly, ell: ell, inEll: inEll, fringe: fringe };

  /* ===================== 第四幅：草原尽头 ===================== */
  var D = { body: [650, 1160, 440, 335, -.14], head: [330, 935, 178, 152, -.2], girl: [176, 742], th: 3.4 };
  PL.fur = {
    build: function () {
      var st = this.st = {}, R = F.rng(4101), b = D.body, h = D.head, i;
      var tailC = [[1010, 1400], [800, 1540], [470, 1530], [230, 1420], [130, 1250], [176, 1120]];
      var tailS = F.spline(tailC, false, 10), tailPts = [], tl = [], tr = [];
      for (i = 0; i <= 40; i++) { var q = F.at(tailS, i / 40), w = lerp(64, 30, i / 40) * (i > 36 ? Math.sqrt((40 - i) / 4 + .12) : 1), nx = -Math.sin(q.a), ny = Math.cos(q.a); tl.push([q.x + nx * w, q.y + ny * w]); tr.unshift([q.x - nx * w, q.y - ny * w]); }
      tailPts = tl.concat(tr); st.tailS = tailS;
      function onTail(x, y, m) { for (var k = 0; k <= 40; k += 2) { var q = F.at(tailS, k / 40); if (Math.hypot(x - q.x, y - q.y) < lerp(64, 30, k / 40) + m) return q; } return null; }
      function inCat(x, y, m) { return inEll(x, y, b[0], b[1], b[2] + m, b[3] + m, b[4], 1) || inEll(x, y, h[0], h[1], h[2] + m, h[3] + m, h[4], 1) || !!onTail(x, y, m); }
      st.inCat = inCat;
      var trail = F.spline([[560, 330], [470, 430], [380, 500], [300, 590], [228, 660], [186, 730]], false, 8);
      function nearTrail(x, y) { for (var k = 0; k <= 20; k++) { var q = F.at(trail, k / 20); if (Math.hypot(x - q.x, y - q.y) < 15 + k * .5) return true; } return false; }
      var gx = D.girl[0] + 22, gy = D.girl[1] - 30;

      /* ---- 地：天、远草、近草 ---- */
      st.ground = F.sprite(W, H, function (g) {
        var gr = g.createLinearGradient(0, 0, 0, 430); gr.addColorStop(0, P.night0); gr.addColorStop(.75, P.night1); gr.addColorStop(1, P.night2); g.fillStyle = gr; g.fillRect(0, 0, W, 430);
        gr = g.createLinearGradient(0, 300, 0, H); gr.addColorStop(0, '#1C2A5E'); gr.addColorStop(.25, P.night2); gr.addColorStop(1, '#22316C'); g.fillStyle = gr; g.fillRect(0, 320, W, H - 320);
        I.mottle(g, null, R, { box: [0, 320, W, H - 320], n: 150, cols: [P.blue, P.night0], a: .1, rx: [60, 220] });
        // 远处的林线
        g.fillStyle = P.night0; for (i = 0; i < 46; i++) { var tx = i * 25 + R.range(-8, 8), thh = R.range(14, 40); g.beginPath(); g.ellipse(tx, 322, R.range(12, 22), thh, 0, Math.PI, 0); g.fill(); }
        g.fillStyle = 'rgba(14,21,52,.42)'; F.ribbon(g, trail, 0, 1, function (u) { return lerp(14, 34, u); });
        var cols = ['#17224F', '#243570', '#3A4F96', '#6F86CC', '#B6C3EA', '#EDE6D6'];
        I.meadow(g, R, {
          n: 7600, x0: -20, x1: W + 20, y0: 326, y1: H + 20, pow: .8, cols: cols, size: 30, spread: 1.5,
          scale: function (x, y) { return lerp(.22, 1.15, Math.pow((y - 326) / (H - 326), .8)); },
          inside: function (x, y) { return !inCat(x, y, -14) && !nearTrail(x, y); },
          tone: function (x, y) {
            var d = Math.hypot(x - gx, y - gy), lampL = Math.exp(-d * d / 52000), nearCat = inCat(x, y, 60) ? .0 : (inCat(x, y, 150) ? .2 : .46);
            return clamp(nearCat + .34 * F.noise(x * .005 + y * .0035, 7) + .16 * F.noise(x * .02, 3) + lampL * .6 - (y < 470 ? (470 - y) / 500 : 0));
          },
          up: function (x, y) { return -Math.PI / 2 + R.range(-.9, .9); }
        });
        // 灯下：暖色的草
        I.meadow(g, R, { n: 150, x0: gx - 190, x1: gx + 190, y0: gy - 130, y1: gy + 190, cols: [P.peach, P.gold, P.cream], size: 22, spread: 1.4, inside: function (x, y) { return Math.hypot(x - gx, y - gy) < 185 && !inCat(x, y, 4) && !nearTrail(x, y); }, alpha: function (x, y) { return clamp(1.1 - Math.hypot(x - gx, y - gy) / 190); } });
      });

      /* ---- 猫 ---- */
      var bodyPts = ell(b[0], b[1], b[2], b[3], b[4], 110), headPts = ell(h[0], h[1], h[2], h[3], h[4], 64);
      var cols = ['#11183F', '#19234F', '#243268', '#33468A', '#4C63AE'];
      function lightTone(x, y, cx, cy, r) { return clamp(.3 + .55 * (((cx - x) * .55 + (cy - y) * .83) / r) + .1); }
      st.cat = F.sprite(W, H, function (g) {
        var fringeC = ['#0C1130', '#151D48', '#222F66'];
        // 尾
        fringe(g, tailPts, R, { len: [12, 30], cols: fringeC, dens: 3 }); I.fill(g, poly(tailPts), P.fur0);
        I.fur(g, poly(tailPts), R, function (x, y) { var q = onTail(x, y, 30); return q ? q.a : 0; }, { box: [80, 1040, 1000, 560], n: 3600, len: [20, 46], cols: cols, lw: [1.4, 2.6], tone: function (x, y) { return clamp(.5 - (y - 1380) / 400); } });
        // 身
        fringe(g, bodyPts, R, { len: [14, 38], cols: fringeC, dens: 3, skew: .5 }); I.fill(g, poly(bodyPts), P.fur0);
        I.fur(g, poly(bodyPts), R, function (x, y) { var dx = x - b[0], dy = y - b[1], r = Math.hypot(dx, dy), k = clamp((r - 60) / 170); return lerp(-.5, Math.atan2(dy, dx) + Math.PI / 2 + .25, k) + .35 * F.noise(x * .012 + y * .009, 4); }, { box: [190, 800, 920, 720], n: 12500, len: [22, 54], cols: cols, lw: [1.5, 2.8], tone: function (x, y) { return lightTone(x, y, b[0], b[1], 420); } });
        // 脊背的暗纹
        g.save(); g.clip(poly(bodyPts)); g.strokeStyle = 'rgba(8,11,34,.5)'; g.lineWidth = 16; g.lineCap = 'round';
        for (i = 0; i < 6; i++) { var a0 = -2.5 + i * .34; g.beginPath(); g.ellipse(b[0], b[1], b[2] * .86, b[3] * .86, b[4], a0, a0 + .16); g.stroke(); }
        g.restore();
        // 爪
        var paw = ell(200, 1040, 96, 52, .35, 40); fringe(g, paw, R, { len: [8, 20], cols: fringeC, dens: 2 }); I.fill(g, poly(paw), P.fur0);
        I.fur(g, poly(paw), R, function () { return 2.9; }, { box: [90, 970, 230, 140], n: 520, len: [14, 30], cols: cols, tone: function (x, y) { return clamp(.75 - (y - 1000) / 90); } });
        g.strokeStyle = P.fur0; g.lineWidth = 3; [[-.5], [0], [.5]].forEach(function (q, k) { g.beginPath(); g.moveTo(128 + k * 24, 1012 + k * 8); g.quadraticCurveTo(118 + k * 24, 1034 + k * 8, 124 + k * 24, 1056 + k * 8); g.stroke(); });
        // 耳（一只朝上，一只压在身侧）
        [[452, 800, -.5], [470, 1052, 1.25]].forEach(function (e) {
          var c = Math.cos(e[2]), s = Math.sin(e[2]), tri = [[-66, 40], [8, -96], [70, 34]].map(function (q) { return [e[0] + q[0] * c - q[1] * s, e[1] + q[0] * s + q[1] * c]; });
          fringe(g, tri, R, { len: [8, 22], cols: fringeC, dens: 5 }); I.fill(g, poly(tri), P.fur0);
          I.fur(g, poly(tri), R, function () { return e[2] - Math.PI / 2; }, { box: [e[0] - 110, e[1] - 110, 220, 220], n: 420, len: [14, 30], cols: cols, tone: function () { return .7; } });
          var inn = [[-26, 22], [8, -52], [34, 20]].map(function (q) { return [e[0] + q[0] * c - q[1] * s, e[1] + q[0] * s + q[1] * c]; }); g.globalAlpha = .55; I.fill(g, poly(inn), '#3A2F5C'); g.globalAlpha = 1;
        });
        // 头
        fringe(g, headPts, R, { len: [12, 30], cols: fringeC, dens: 3 }); I.fill(g, poly(headPts), P.fur0);
        I.fur(g, poly(headPts), R, function (x, y) { return D.th + Math.PI + .5 * Math.atan2(y - h[1], x - h[0] + 60) * .4; }, { box: [130, 760, 400, 350], n: 3400, len: [16, 40], cols: cols, lw: [1.4, 2.6], tone: function (x, y) { return lightTone(x, y, h[0], h[1], 170) + .08; } });
        // 额上的纹、合着的眼、鼻
        g.strokeStyle = 'rgba(8,11,34,.6)'; g.lineWidth = 9; g.lineCap = 'round';
        [[-26], [0], [26]].forEach(function (q, k) { g.beginPath(); g.moveTo(330 + 40, 900 + k * 30 - 30); g.quadraticCurveTo(400, 890 + k * 32 - 30, 452, 906 + k * 34 - 30); g.stroke(); });
        g.strokeStyle = '#C9D2F0'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(232, 872); g.quadraticCurveTo(262, 894, 300, 876); g.stroke(); g.beginPath(); g.moveTo(236, 976); g.quadraticCurveTo(266, 998, 304, 984); g.stroke();
        g.lineWidth = 1.4; for (i = 0; i < 5; i++) { g.beginPath(); g.moveTo(244 + i * 12, 884 + (i % 2) * 3); g.lineTo(240 + i * 12, 896); g.stroke(); g.beginPath(); g.moveTo(248 + i * 12, 989 + (i % 2) * 3); g.lineTo(244 + i * 12, 1001); g.stroke(); }
        I.fill(g, 'M166,918 q-16,10 -4,24 q18,2 22,-12 z', '#3A2F5C');
        // 须
        g.strokeStyle = 'rgba(214,222,246,.7)'; g.lineWidth = 1.6; [[-70, -70], [-96, -30], [-100, 14], [-84, 60]].forEach(function (q) { g.beginPath(); g.moveTo(186, 934); g.quadraticCurveTo(186 + q[0] * .6, 934 + q[1] * .5, 186 + q[0] * 1.5, 934 + q[1] * 1.5); g.stroke(); });
      });
      // 灯照到的毛：暖色的边
      st.warm = F.sprite(W, H, function (g) {
        I.fur(g, poly(headPts), R, function () { return D.th + Math.PI; }, { box: [140, 770, 300, 220], n: 520, len: [16, 34], cols: ['#8C6A4E', '#C79A64', '#F1C98C'], lw: [1.3, 2.4], tone: function (x, y) { return clamp(1.2 - Math.hypot(x - gx, y - gy) / 230); }, alpha: .9 });
        g.globalCompositeOperation = 'destination-in'; var gr = g.createRadialGradient(gx, gy, 20, gx, gy, 250); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      });
      st.glow = F.glowSprite(240, '#F7B25A', .55, 2.0); st.glowS = F.glowSprite(40, '#FFE2A6', .95, 1.5);
      st.sky = I.starList(R, 190, 0, 0, W, 318, { pow: 1.3 });
      st.furStars = []; while (st.furStars.length < 120) { var sx = R.range(100, 1070), sy = R.range(780, 1590); if (inCat(sx, sy, -26)) st.furStars.push({ x: sx, y: sy, r: R.range(.9, 2.6), c: R() < .3 ? P.peach : P.cream, ph: R() * 6.28, sp: R.range(.8, 2.6), big: R() < .12 }); }
    },
    /** s:{purr 0..1} */
    draw: function (ctx, t, s, par) {
      var st = this.st, br = Math.sin(t * .9), px = par.x, py = par.y;
      ctx.drawImage(st.ground.c, -20 + px * 8, -14 + py * 6, W + 40, H + 28);
      I.drawStars(ctx, st.sky, t, .95);
      // 一起一伏
      var z = 1 + .009 * br + .006 * (s.purr || 0) * Math.sin(t * 9);
      ctx.save(); ctx.translate(px * 16, py * 10); ctx.translate(650, 1250); ctx.scale(z, z); ctx.translate(-650, -1250);
      ctx.drawImage(st.cat.c, 0, 0, W, H);
      ctx.drawImage(st.warm.c, 0, 0, W, H);
      I.drawStars(ctx, st.furStars, t * (1 + (s.purr || 0) * 2), .9 + .1 * (s.purr || 0));
      ctx.restore();
      var gp = I.girl(ctx, D.girl[0] + px * 20, D.girl[1] + py * 12, .62, { dir: 1, up: .1 });
      I.lampGlow(ctx, st.glow, gp.x, gp.y, 1.25 + .3 * (s.purr || 0), .95, t); I.lampGlow(ctx, st.glowS, gp.x, gp.y, .6, 1, t);
    }
  };

  /* ===================== 第五幅：夜的眼睛 ===================== */
  var EY = { x0: 96, x1: 984, y: 742, low: 86, up: 372 };
  PL.eye = {
    build: function () {
      var st = this.st = {}, R = F.rng(5101), i;
      var cols = ['#0F1538', '#18214D', '#232F66', '#34478C', '#5068B4'];
      function flow(x, y) { var dx = x - 540, dy = y - EY.y; return Math.atan2(dy * 1.5, dx) + (dy > 0 ? .5 : -.5) * Math.sign(dx || 1) + Math.PI * (dx < 0 ? 0 : 0); }
      st.fur = F.sprite(W, H, function (g) {
        var gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, P.night0); gr.addColorStop(1, P.night1); g.fillStyle = gr; g.fillRect(0, 0, W, 320);
        // 头的轮廓：一只耳朵立在星空里
        var head = [[-40, 420], [60, 300], [150, 96], [300, 250], [520, 196], [760, 218], [940, 300], [1120, 380], [1120, 1700], [-40, 1700]];
        fringe(g, head, R, { len: [16, 44], cols: ['#0C1130', '#151D48', '#222F66'], dens: 2, flip: false });
        I.fill(g, poly(head), P.fur0);
        I.fur(g, poly(head), R, function (x, y) { return Math.atan2((y - EY.y + 90) * 1.5, (x - 540) * .62) + Math.PI / 2 + .3 * F.noise(x * .008 + y * .006, 9); }, { box: [0, 90, W, H - 90], n: 30000, len: [22, 58], cols: cols, lw: [1.5, 3], tone: function (x, y) { return clamp(.5 - (y - 500) / 1700 + .25 * F.noise(x * .004 + y * .003, 5) - (x - 300) / 2600); } });
        // 眼周一圈更密、更亮的短毛
        I.fur(g, null, R, function (x, y) { return Math.atan2((y - EY.y + 90) * 1.5, (x - 540) * .62) + Math.PI / 2; }, { box: [40, EY.y - 420, 1000, 620], n: 5200, len: [14, 34], cols: ['#27356E', '#3A4E94', '#5D75C0'], lw: [1.2, 2.2], tone: function (x, y) { var u = (x - 540) / 470, v = (y - EY.y + 120) / 300; return clamp(1.25 - Math.abs(Math.sqrt(u * u + v * v) - 1) * 3.2); }, alpha: .8 });
        // 须根
        g.strokeStyle = 'rgba(214,222,246,.55)'; g.lineWidth = 2.2; g.lineCap = 'round';
        [[820, 1250, 300, 200], [760, 1320, 330, 300], [860, 1190, 260, 110]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(q[0] + q[2] * .5, q[1] + q[3] * .25, q[0] + q[2], q[1] + q[3]); g.stroke(); });
      });
      // 虹膜
      st.iris = F.sprite(900, 560, function (g) { // 原点：眼心 (450, 330)
        var cx = 450, cy = 330, gr = g.createRadialGradient(cx, cy, 30, cx, cy, 470);
        gr.addColorStop(0, '#FFF8E2'); gr.addColorStop(.3, '#FBE7B4'); gr.addColorStop(.62, '#F3C66C'); gr.addColorStop(1, '#C98A3C'); g.fillStyle = gr; g.fillRect(0, 0, 900, 560);
        g.lineCap = 'round';
        for (i = 0; i < 520; i++) { var a = R() * 6.2832, r0 = R.range(70, 200), r1 = r0 + R.range(60, 250); g.strokeStyle = i % 3 ? 'rgba(160,104,40,' + R.range(.12, .34) + ')' : 'rgba(255,250,230,' + R.range(.2, .5) + ')'; g.lineWidth = R.range(1, 2.6); g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .9); g.lineTo(cx + Math.cos(a + R.range(-.03, .03)) * r1, cy + Math.sin(a) * r1 * .9); g.stroke(); }
        var rim = g.createRadialGradient(cx, cy, 250, cx, cy, 480); rim.addColorStop(0, 'rgba(120,70,20,0)'); rim.addColorStop(1, 'rgba(90,48,16,.6)'); g.fillStyle = rim; g.fillRect(0, 0, 900, 560);
      });
      st.glow = F.glowSprite(700, '#FBE2A8', .5, 1.5); st.lamp = F.glowSprite(200, '#F7B25A', .6, 2.0); st.lampS = F.glowSprite(36, '#FFE2A6', .95, 1.5);
      st.sky = I.starList(R, 120, 0, 0, W, 300, { pow: 1.2 });
      st.furStars = I.starList(R, 150, 30, 330, W - 60, H - 380, {}).filter(function (s) { var u = (s.x - 540) / 480, v = (s.y - EY.y + 120) / 300; return u * u + v * v > 1.25; });
    },
    lid: function (o) { // 上睑的控制点
      var cy = lerp(EY.y + EY.low, EY.y - EY.up, o); var p = new Path2D(); p.moveTo(EY.x0, EY.y); p.quadraticCurveTo(540, cy * 2 - EY.y, EY.x1, EY.y); p.quadraticCurveTo(540, EY.y + EY.low * 2, EY.x0, EY.y); p.closePath(); return p;
    },
    /** s:{open 0..1, up 0..1} */
    draw: function (ctx, t, s, par) {
      var st = this.st, o = E.inOutS(clamp(s.open || 0)), px = par.x, py = par.y, i;
      ctx.save(); ctx.translate(px * 10, py * 7); ctx.drawImage(st.fur.c, -16, -12, W + 32, H + 24); ctx.restore();
      I.drawStars(ctx, st.sky, t, .9);
      I.drawStars(ctx, st.furStars, t, .75 + .25 * o);
      ctx.save(); ctx.translate(px * 14, py * 9);
      if (o > .004) {
        var almond = this.lid(o);
        ctx.save(); ctx.clip(almond);
        var look = Math.sin(t * .4) * 10;
        ctx.drawImage(st.iris.c, 90 + look, EY.y - 330 - 60 * o + 60, 900, 560);
        // 瞳孔：一道竖缝，随光收窄；里面映着一盏小灯
        var pw = lerp(120, 46, o) + Math.sin(t * .7) * 4, ph = 250;
        ctx.fillStyle = '#0A0E28'; ctx.beginPath(); ctx.ellipse(540 + look, EY.y - 50 * o, pw, ph, 0, 0, 6.3); ctx.fill();
        ctx.fillStyle = 'rgba(247,178,90,.95)'; ctx.beginPath(); ctx.arc(552 + look, EY.y + 60 - 50 * o, 7, 0, 6.3); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(470 + look, EY.y - 150 * o - 30, 34, 20, -.5, 0, 6.3); ctx.fill();
        // 上睑投下的影
        var sh = ctx.createLinearGradient(0, EY.y - EY.up * o - 40, 0, EY.y - EY.up * o + 190); sh.addColorStop(0, 'rgba(10,14,40,.75)'); sh.addColorStop(1, 'rgba(10,14,40,0)'); ctx.fillStyle = sh; ctx.fillRect(0, EY.y - 460, W, 700);
        ctx.restore();
        ctx.strokeStyle = '#080B22'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.stroke(almond);
      }
      // 睫：合着的时候是一道弯弯的缝
      var cyU = lerp(EY.y + EY.low, EY.y - EY.up, o);
      ctx.strokeStyle = o < .02 ? '#C9D2F0' : '#080B22'; ctx.lineWidth = o < .02 ? 5 : 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(EY.x0, EY.y); ctx.quadraticCurveTo(540, cyU * 2 - EY.y, EY.x1, EY.y); ctx.stroke();
      ctx.lineWidth = 2.4; ctx.strokeStyle = o < .5 ? 'rgba(201,210,240,' + (1 - o * 1.6) + ')' : 'rgba(8,11,34,.0)';
      for (i = 1; i < 26; i++) { var u = i / 26, lx = (1 - u) * (1 - u) * EY.x0 + 2 * u * (1 - u) * 540 + u * u * EY.x1, ly = (1 - u) * (1 - u) * EY.y + 2 * u * (1 - u) * (cyU * 2 - EY.y) + u * u * EY.y; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + (u - .5) * 26, ly + 30 + Math.sin(u * 3.1) * 12); ctx.stroke(); }
      ctx.restore();
      // 光
      if (o > 0) { ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, st.glow, 540, EY.y - 60, { a: o * .7, sx: 1.25, sy: .9 }); ctx.globalCompositeOperation = 'source-over'; }
      // 小灯站在猫的脸颊上，把灯举高
      var gp = I.girl(ctx, 500 + px * 22, 1400 + py * 14, 1.0, { dir: 1, up: s.up || 0 });
      I.lampGlow(ctx, st.lamp, gp.x, gp.y, 1 + .8 * (s.up || 0), .9, t); I.lampGlow(ctx, st.lampS, gp.x, gp.y, .7 + .5 * (s.up || 0), 1, t);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
