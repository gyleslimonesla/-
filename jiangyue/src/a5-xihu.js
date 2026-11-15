/* 五 · 日中 · 苏轼《饮湖上初晴后雨》（108–131 s）：晴也好，雨也好。淡青灰、湖蓝、水白、柔粉。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var st = {}, HZ = 1010, HALO = 'rgba(244,242,230,.92)';
  function rain(t) { return p(t, 117.4, 122.6, E.inOutS); }
  F.RAIN = rain;

  function strandSprite(seed, len) {
    return F.sprite(90, len + 20, function (g) {
      var R = F.rng(seed), sp = F.spline([[45, 0], [45 + R.range(-8, 8), len * .35], [45 + R.range(-14, 14), len * .7], [45 + R.range(-18, 18), len]], false, 6), cols = ['#7E9E68', '#93B27A', '#5F8558', '#A7C08A'];
      g.strokeStyle = 'rgba(70,96,62,.75)'; g.lineWidth = 1.5; F.draw(g, sp, 1);
      var n = Math.round(len / 13);
      for (var i = 0; i < n; i++) {
        var q = F.at(sp, (i + .5) / n), side = i % 2 ? 1 : -1, L = R.range(20, 34) * (1 - i / n * .35), a = q.a + side * R.range(.35, .7);
        g.save(); g.translate(q.x, q.y); g.rotate(a); g.fillStyle = F.rgba(cols[(R() * 4) | 0], R.range(.7, .98));
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .5, -4.2, L, 0); g.quadraticCurveTo(L * .5, 4.2, 0, 0); g.fill(); g.restore();
      }
    });
  }
  function lotusFlower(seed) {
    return F.sprite(220, 200, function (g) {
      var R = F.rng(seed), cx = 110, cy = 150;
      function petal(a, L, w, t0, t1) {
        g.save(); g.translate(cx, cy); g.rotate(a);
        var gr = g.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, t0); gr.addColorStop(.7, t1); gr.addColorStop(1, '#D98C9A');
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(w, -L * .3, w * .9, -L * .75, 0, -L); g.bezierCurveTo(-w * .9, -L * .75, -w, -L * .3, 0, 0); g.fill();
        g.strokeStyle = 'rgba(176,96,110,.45)'; g.lineWidth = 1; g.stroke();
        g.strokeStyle = 'rgba(200,120,134,.22)'; g.lineWidth = .8; for (var k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 2, -4); g.quadraticCurveTo(k * w * .34, -L * .5, k * w * .12, -L * .92); g.stroke(); }
        g.restore();
      }
      [-1.25, 1.25, -.85, .85].forEach(function (a) { petal(a, 108, 26, '#FBF4EF', '#F0CBD0'); });
      [-.45, .45, -.2, .2, 0].forEach(function (a, i) { petal(a, 124 - i * 4, 28, '#FFFBF6', '#F3D6D8'); });
      g.fillStyle = '#D9B24A'; g.beginPath(); g.ellipse(cx, cy - 26, 15, 10, 0, 0, 6.3); g.fill();
    });
  }

  F.acts.xihu = {
    pre: 2.6, post: 2.2,
    build: function () {
      var hz = HZ / H;
      st.sun = F.sprite(W, H, function (g) {
        var R = F.rng(501);
        K.vgrad(g, 0, 0, W, H, [[0, '#B5CFD6'], [.3, '#D8E5E0'], [hz - .01, '#F2EFDE'], [hz, '#E4ECE2'], [hz + .2, '#BBD4D2'], [1, '#8DB4BA']]);
        for (var i = 0; i < 16; i++) F.wash(g, F.blob(R() * W, R() * 700, R.range(160, 380), R.range(30, 80), R, 12, .3), '#FFFFFF', { R: R, layers: 5, alpha: .03, mag: .3 });
      }, Math.min(F.Q, .5));
      st.rainBg = F.sprite(W, H, function (g) {
        var R = F.rng(503);
        K.vgrad(g, 0, 0, W, H, [[0, '#7D8E98'], [.32, '#A3B0B4'], [hz - .01, '#C2CAC6'], [hz, '#B3BFBD'], [hz + .2, '#93A6AA'], [1, '#6F858D']]);
        for (var i = 0; i < 24; i++) F.wash(g, F.blob(R() * W, R() * 800, R.range(200, 460), R.range(50, 130), R, 12, .3), i % 2 ? '#5F7078' : '#D5DBD8', { R: R, layers: 5, alpha: .022, mag: .3 });
      }, Math.min(F.Q, .5));
      st.mist = K.mistSprite(2160, 260, 505, '#E9EEEA', 1.3);
      st.far = F.sprite(W, 420, function (g) {
        var R = F.rng(507);
        K.inkMount(g, K.ridge({ x0: -20, x1: 1100, base: 400, amp: 150, seed: 71, peaks: [[220, 120, 180], [800, 150, 220]] }), 420, '#6F9FA2', .5, .7, R);
        K.inkMount(g, K.ridge({ x0: -20, x1: 1100, base: 410, amp: 110, seed: 73, peaks: [[520, 90, 160], [980, 110, 140]] }), 420, '#4E8880', .55, .8, R, .3);
      });
      st.mid = F.sprite(W, 300, function (g) {
        var R = F.rng(509), pts = K.ridge({ x0: -20, x1: 1100, base: 280, amp: 90, seed: 75, peaks: [[160, 120, 150], [900, 70, 170]] });
        K.inkMount(g, pts, 300, '#3F7468', .7, .9, R, .4);
        K.pagoda(g, 168, 96, 6, 34, 120, '#2E4B46', {});
        g.fillStyle = 'rgba(46,82,70,.5)'; for (var i = 0; i < 160; i++) { var q = pts[(R() * pts.length) | 0]; g.beginPath(); g.ellipse(q[0] + R.range(-6, 6), q[1] + R.range(4, 60), R.range(5, 12), R.range(4, 8), 0, 0, 6.3); g.fill(); }
      });
      // 苏堤：一线长堤、六桥烟柳
      st.dike = F.sprite(W, 190, function (g) { // world y = 990+
        var R = F.rng(511), y = 110, i;
        g.fillStyle = '#48685C'; g.beginPath(); g.moveTo(-10, y + 16); g.lineTo(-10, y); g.quadraticCurveTo(540, y - 10, 1090, y); g.lineTo(1090, y + 16); g.closePath(); g.fill();
        g.globalCompositeOperation = 'destination-out'; [250, 560, 860].forEach(function (x) { g.beginPath(); g.arc(x, y + 16, 15, Math.PI, 0); g.fill(); }); g.globalCompositeOperation = 'source-over';
        g.strokeStyle = '#48685C'; g.lineWidth = 3; [250, 560, 860].forEach(function (x) { g.beginPath(); g.moveTo(x - 30, y + 2); g.quadraticCurveTo(x, y - 18, x + 30, y + 2); g.stroke(); });
        for (i = 0; i < 34; i++) {
          var x = 20 + i * 31 + R.range(-8, 8); if ([250, 560, 860].some(function (b) { return Math.abs(b - x) < 34; })) continue;
          var pink = i % 4 === 1, h = R.range(34, 60);
          g.strokeStyle = 'rgba(52,70,58,.8)'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.range(-3, 3), y - h * .6); g.stroke();
          if (pink) { for (var k = 0; k < 26; k++) { g.fillStyle = F.rgba(k % 3 ? '#E9BFC6' : '#F6E3E4', R.range(.6, .95)); g.beginPath(); g.arc(x + R.gauss() * 13, y - h * .7 + R.gauss() * 9, R.range(1.6, 3.6), 0, 6.3); g.fill(); } }
          else { F.wash(g, F.blob(x, y - h * .72, R.range(15, 23), h * .42, R, 10, .2), '#86AA84', { R: R, layers: 8, alpha: .11, mag: .14 }); g.strokeStyle = 'rgba(110,146,104,.6)'; g.lineWidth = 1; for (k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * 3, y - h * .9); g.quadraticCurveTo(x + k * 7, y - h * .5, x + k * 8, y - h * .16); g.stroke(); } }
        }
      });
      // 湖心亭
      st.isle = F.sprite(300, 200, function (g) {
        var R = F.rng(513); F.wash(g, F.blob(150, 164, 130, 20, R, 14, .1), '#4F7566', { R: R, layers: 12, alpha: .12, mag: .05 });
        g.fillStyle = '#3A5A52'; [-34, -12, 12, 34].forEach(function (x) { g.fillRect(150 + x - 2, 104, 4, 50); }); g.fillRect(104, 150, 92, 6);
        K.roof(g, 150, 70, 130, 36, '#35544E', { curl: 16, line: 'rgba(240,236,214,.7)' }); g.fillRect(148, 52, 4, 20); g.beginPath(); g.arc(150, 50, 5, 0, 6.3); g.fill();
        F.wash(g, F.blob(238, 112, 30, 42, R, 10, .2), '#86AA84', { R: R, layers: 8, alpha: .11, mag: .14 });
      });
      st.boat = F.sprite(330, 220, function (g) { g.translate(160, 176); K.huafang(g, 270, {}); });
      // 近景：垂柳、荷
      st.limb = F.sprite(620, 200, function (g) { var s = F.spline([[640, 30], [480, 44], [320, 80], [180, 96], [40, 130]], false, 6); g.fillStyle = 'rgba(46,52,40,.92)'; F.ribbon(g, s, 0, 1, function (u) { return lerp(26, 4, u); }); st.limbS = s; });
      st.strands = []; for (var i = 0; i < 13; i++) st.strands.push({ s: strandSprite(520 + i, 430 + (i * 97) % 330), f: .08 + i * .07, ph: i * 1.7 });
      st.lpet = [K.petal('lotus', '#FBF4EF', '#F0CBD0', '#D98C9A', 531), K.petal('lotus', '#FFFBF6', '#F4D9DA', '#DC98A6', 533)];
      st.leaf = F.sprite(340, 150, function (g) {
        var R = F.rng(535), pts = F.blob(170, 75, 156, 56, R, 18, .08);
        F.wash(g, pts, '#6E9C82', { R: R, layers: 12, alpha: .12, mag: .04, edge: .4 }); F.wash(g, pts.map(function (q) { return [170 + (q[0] - 170) * .6, 75 + (q[1] - 75) * .6]; }), '#3C6A56', { R: R, layers: 8, alpha: .06, mag: .1 });
        g.strokeStyle = 'rgba(40,74,60,.4)'; g.lineWidth = 1.1; for (var k = 0; k < 14; k++) { var a = k / 14 * 6.28; g.beginPath(); g.moveTo(170, 75); g.lineTo(170 + Math.cos(a) * 146, 75 + Math.sin(a) * 52); g.stroke(); }
      });
    },

    paint: function (ctx, t) {
      var r = rain(t), i, cam = p(t, 106, 132, E.inOutS), dx = lerp(34, -34, cam);
      ctx.drawImage(st.sun.c, 0, 0, W, H);
      if (r > 0) { ctx.globalAlpha = r; ctx.drawImage(st.rainBg.c, 0, 0, W, H); ctx.globalAlpha = 1; }
      // 远山：晴时分明，雨里空蒙
      ctx.globalAlpha = lerp(1, .42, r); ctx.drawImage(st.far.c, dx * .2, HZ - 404, W, 420); ctx.globalAlpha = lerp(1, .6, r); ctx.drawImage(st.mid.c, dx * .35, HZ - 282, W, 300); ctx.globalAlpha = 1;
      K.mist(ctx, st.mist, HZ - 330, t, 8, .25 + r * .75, 300); K.mist(ctx, st.mist, HZ - 190, t, -12, .2 + r * .7, 1300);
      // 水光潋滟
      K.ripples(ctx, t, { n: 150, y0: HZ + 30, y1: 1900, focus: [520, 300], col: '#FFFEF4', seed: 7, len: 26, alpha: .95 * (1 - r), lw: 2, pow: 1.3, speed: 1.6 });
      K.ripples(ctx, t, { n: 70, x0: 0, x1: W, y0: HZ + 20, y1: 1900, col: '#5F8890', seed: 17, len: 34, alpha: .22 + .1 * r, lw: 1.3, pow: 1.2 });
      ctx.globalAlpha = lerp(1, .78, r); ctx.drawImage(st.dike.c, dx * .5, 990, W, 190);
      ctx.globalAlpha = .22; ctx.save(); ctx.translate(dx * .5, 1232); ctx.scale(1, -.5); ctx.drawImage(st.dike.c, 0, -190 + 60, W, 190); ctx.restore(); ctx.globalAlpha = 1;
      F.blit(ctx, st.isle, 800 + dx * .7, 1260, { ax: .5, ay: .82, a: lerp(1, .85, r) });
      ctx.globalAlpha = .2; ctx.save(); ctx.translate(800 + dx * .7, 1268); ctx.scale(1, -.5); ctx.drawImage(st.isle.c, -150, -164, 300, 200); ctx.restore(); ctx.globalAlpha = 1;
      var bx = lerp(330, 470, seg(t, 106, 132)) + dx, by = 1402 + Math.sin(t * 1.1) * 2;
      ctx.globalAlpha = .2; ctx.save(); ctx.translate(bx, by + 4); ctx.scale(1, -.6); ctx.drawImage(st.boat.c, -160, -176, 330, 220); ctx.restore(); ctx.globalAlpha = 1;
      F.blit(ctx, st.boat, bx, by, { ax: 160 / 330, ay: 176 / 220, rot: Math.sin(t * .8) * .01 });
      // 雨：圈
      if (r > 0) {
        ctx.strokeStyle = 'rgba(240,246,244,.7)'; ctx.lineWidth = 1.3;
        for (i = 0; i < 44; i++) { var ph = (t * (.6 + .5 * K.hash(i)) + K.hash(i * 3.1)) % 1, d = K.hash(i * 7.3 + Math.floor(t * (.6 + .5 * K.hash(i)) + K.hash(i * 3.1)) * 1.7), y = HZ + 40 + Math.pow(d, 1.4) * 860, rx = (8 + 46 * ph) * (.4 + d); ctx.globalAlpha = r * (1 - ph) * .7; ctx.beginPath(); ctx.ellipse(K.hash(i * 5.7 + Math.floor(t + i) * .9) * W, y, rx, rx * .28, 0, 0, 6.3); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // 荷（工笔）
      ctx.save(); ctx.translate(dx * 1.3, 0);
      [[150, 1800, 1.1, 0], [400, 1880, 1.3, 1], [-20, 1900, 1.2, 2], [270, 1730, .8, 3]].forEach(function (l) { F.blit(ctx, st.leaf, l[0], l[1] + Math.sin(t * 1.3 + l[3]) * (2 + r * 5), { sc: l[2], rot: Math.sin(t * .9 + l[3] * 2) * (.02 + r * .04) }); });
      ctx.strokeStyle = 'rgba(70,104,84,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      var u = F.since('xihu', t);
      [[236, 1640, 0, 1.0, 2.6], [92, 1700, 1, .78, 4.2]].forEach(function (f) { var sw = Math.sin(t * .8 + f[2] * 2) * (.03 + r * .05); ctx.beginPath(); ctx.moveTo(f[0] + 20, f[1] + 250); ctx.quadraticCurveTo(f[0] + 26, f[1] + 110, f[0], f[1]); ctx.stroke(); K.lotus(ctx, st.lpet, f[0], f[1] + 6, f[3], seg(u, f[4], f[4] + 5.5), t, sw + (f[2] ? -.2 : .12)); });
      ctx.restore();
      // 垂柳（最近）
      ctx.save(); ctx.translate(dx * 1.7, 0);
      for (i = 0; i < st.strands.length; i++) { var sd = st.strands[i], q = F.at(st.limbS, sd.f); F.blit(ctx, sd.s, 460 + q.x, -40 + q.y, { ax: .5, ay: 0, sy: E.out(seg(u, 1.4 + sd.f * 2.4, 4.6 + sd.f * 2.4)), rot: .03 + r * .09 + Math.sin(t * .9 + sd.ph) * (.035 + .05 * r) + Math.sin(t * 2.1 + sd.ph * 1.3) * .012 }); }
      ctx.drawImage(st.limb.c, 460, -40, 620, 200);
      ctx.restore();
      // 雨：丝
      if (r > 0) {
        ctx.lineWidth = 1.2; ctx.lineCap = 'round';
        for (i = 0; i < 300; i++) { var h1 = K.hash(i * 1.9), x = h1 * 1400 - 150, sp = 1500 * (.75 + .5 * K.hash(i * 4.3)), y2 = ((K.hash(i * 9.1) * 2200 + t * sp) % 2200) - 140, L = 34 + 50 * K.hash(i * 2.7); ctx.strokeStyle = i % 3 ? 'rgba(246,249,247,' + (.34 * r) + ')' : 'rgba(84,102,110,' + (.26 * r) + ')'; ctx.beginPath(); ctx.moveTo(x + y2 * .13, y2); ctx.lineTo(x + (y2 + L) * .13, y2 + L); ctx.stroke(); }
      }
      F.curtain(ctx, 'xihu', t);
    },
    mask: function (g, q) { // 山退去，湖从右边展开——横卷
      var xb = lerp(W + 520, -520, E.inOutS(q)), gr = g.createLinearGradient(xb - 480, 0, xb + 480, 0);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    },
    words: function (ctx, t) {
      F.say(ctx, t, 'x0', 250, 250, { color: C.ink, halo: HALO, weight: 400, size: 46 });
      F.say(ctx, t, 'x1', 250, 230, { color: C.ink, halo: HALO });
      F.say(ctx, t, 'x2', 250, 250, { color: C.ink, halo: HALO, weight: 400, size: 46 });
      F.say(ctx, t, 'x3', 250, 230, { color: C.ink, halo: HALO });
      F.sign(ctx, t, 'xihu', 70, 240, { color: C.ink, halo: HALO, delay: 5.6, early: 2.4, weight: 400 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
