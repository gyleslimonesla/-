/* kit2.js — 舟各不同 · 点墨成形 · 逐瓣花开 · 烟火 · 古画与画帘 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, K = F.K, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p, hash = K.hash;

  /* ================= 舟：五首诗，五种船 ================= */
  /** 扁舟：无篷，一人立而撑篙（春江） */
  K.skiff = function (g, L, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(-L * .52, -L * .05); g.quadraticCurveTo(-L * .2, L * .06, L * .1, L * .05); g.quadraticCurveTo(L * .36, L * .03, L * .54, -L * .09);
    g.quadraticCurveTo(L * .3, -L * .012, 0, -L * .012); g.quadraticCurveTo(-L * .3, -L * .012, -L * .52, -L * .05); g.fill();
    g.save(); g.translate(-L * .2, -L * .012); K.figure(g, L * .38, { col: col, lean: .04 }); g.restore();
    g.strokeStyle = col; g.lineWidth = Math.max(1.5, L * .014); g.lineCap = 'round'; g.beginPath(); g.moveTo(-L * .1, -L * .36); g.lineTo(-L * .44, L * .12); g.stroke();
  };
  /** 竹筏：渔翁垂钓，筏头微翘（山居） */
  K.raft = function (g, L, col) {
    g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = Math.max(2, L * .016);
    for (var i = 0; i < 5; i++) { var y = i * L * .013; g.beginPath(); g.moveTo(-L * .5, y); g.lineTo(L * .3, y); g.quadraticCurveTo(L * .44, y - L * .01, L * .52, -L * .075 + y * .6); g.stroke(); }
    g.lineWidth = Math.max(1.5, L * .01); [-.3, .02, .26].forEach(function (u) { g.beginPath(); g.moveTo(L * u, -L * .008); g.lineTo(L * u, L * .06); g.stroke(); });
    g.save(); g.translate(-L * .12, -L * .004); K.figure(g, L * .34, { col: col, hat: true, sit: true }); g.restore();
    g.fillStyle = col; g.fillRect(-L * .32, -L * .07, L * .08, L * .07); // 鱼篓
    g.lineWidth = Math.max(1.2, L * .008); g.beginPath(); g.moveTo(-L * .07, -L * .12); g.quadraticCurveTo(L * .16, -L * .36, L * .4, -L * .3); g.stroke();
    g.lineWidth = .8; g.beginPath(); g.moveTo(L * .4, -L * .3); g.lineTo(L * .41, L * .05); g.stroke();
  };
  /** 轻舟：一帆饱满（白帝） */
  K.sailboat = function (g, L, o) {
    o = o || {}; var col = o.col || '#33281E', Hm = L * .86, mx = -L * .04;
    g.fillStyle = col; g.beginPath(); g.moveTo(-L * .5, -L * .13); g.quadraticCurveTo(-L * .3, L * .08, 0, L * .08); g.quadraticCurveTo(L * .36, L * .07, L * .56, -L * .1);
    g.quadraticCurveTo(L * .3, -L * .03, 0, -L * .03); g.quadraticCurveTo(-L * .3, -L * .03, -L * .44, -L * .16); g.closePath(); g.fill();
    g.fillStyle = o.cabin || '#7A6646'; g.beginPath(); g.moveTo(-L * .34, -L * .03); g.quadraticCurveTo(-L * .22, -L * .19, -L * .08, -L * .03); g.closePath(); g.fill();
    g.strokeStyle = col; g.lineWidth = Math.max(2, L * .014); g.beginPath(); g.moveTo(mx, -L * .03); g.lineTo(mx, -Hm); g.stroke();
    // 帆：席帆，风自船尾来
    var sg = g.createLinearGradient(mx, 0, mx + L * .4, 0); sg.addColorStop(0, o.sail0 || '#E9DFC6'); sg.addColorStop(1, o.sail1 || '#FBF6E8');
    g.fillStyle = sg; g.beginPath(); g.moveTo(mx, -Hm * .98); g.quadraticCurveTo(mx + L * .26, -Hm * .98, mx + L * .34, -Hm * .86);
    g.quadraticCurveTo(mx + L * .47, -Hm * .52, mx + L * .32, -Hm * .2); g.quadraticCurveTo(mx + L * .16, -Hm * .14, mx, -Hm * .16); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(70,56,36,.5)'; g.lineWidth = 1.1; g.stroke();
    for (var i = 1; i < 7; i++) { var u = i / 7, y = lerp(-Hm * .98, -Hm * .16, u); g.beginPath(); g.moveTo(mx, y); g.quadraticCurveTo(mx + L * .22, y + L * .02, mx + L * (.34 + .1 * Math.sin(Math.PI * u)) - L * .02, y + L * .05); g.stroke(); }
    g.fillStyle = C.cinnabar; g.beginPath(); g.moveTo(mx, -Hm); g.lineTo(mx - L * .13, -Hm - L * .03); g.lineTo(mx, -Hm - L * .06); g.fill();
  };
  /** 画舫：朱栏、歇山顶、檐下灯（西湖） */
  K.huafang = function (g, L, o) {
    o = o || {}; var col = o.col || '#4A3326', cx = -L * .03, top = -L * .27;
    g.fillStyle = col; g.beginPath(); g.moveTo(-L * .52, -L * .1); g.quadraticCurveTo(-L * .46, L * .04, -L * .3, L * .05); g.lineTo(L * .32, L * .05); g.quadraticCurveTo(L * .48, L * .03, L * .56, -L * .13);
    g.quadraticCurveTo(L * .44, -L * .035, L * .3, -L * .03); g.lineTo(-L * .34, -L * .03); g.quadraticCurveTo(-L * .46, -L * .04, -L * .52, -L * .1); g.fill();
    g.strokeStyle = '#B8402E'; g.lineWidth = Math.max(1.5, L * .012); g.beginPath(); g.moveTo(-L * .34, -L * .012); g.lineTo(L * .32, -L * .012); g.stroke();
    // 舱：朱柱 + 明窗
    var wg = g.createLinearGradient(0, top, 0, -L * .03); wg.addColorStop(0, '#F6E6C0'); wg.addColorStop(1, '#E7CFA0'); g.fillStyle = wg; g.fillRect(cx - L * .25, top + L * .04, L * .5, L * .2);
    g.fillStyle = '#A8402E'; for (var i = 0; i <= 5; i++) g.fillRect(cx - L * .25 + i * L * .1 - L * .008, top + L * .03, L * .016, L * .21);
    g.strokeStyle = 'rgba(168,64,46,.8)'; g.lineWidth = 1; g.beginPath(); for (i = 0; i < 5; i++) { var x0 = cx - L * .25 + i * L * .1; g.moveTo(x0, -L * .09); g.lineTo(x0 + L * .1, -L * .09); g.moveTo(x0 + L * .05, -L * .09); g.lineTo(x0 + L * .05, -L * .03); } g.stroke();
    K.roof(g, cx, top - L * .045, L * .68, L * .095, '#2E4A52', { curl: L * .04, ridge: .3, line: 'rgba(226,190,110,.95)', lw: 1.6 });
    g.fillStyle = '#2E4A52'; g.fillRect(cx - L * .1, top - L * .085, L * .2, L * .045); K.roof(g, cx, top - L * .13, L * .34, L * .06, '#2E4A52', { curl: L * .028, ridge: .3, line: 'rgba(226,190,110,.95)', lw: 1.4 });
    g.fillStyle = '#D8482C'; [-.34, .3].forEach(function (u) { g.beginPath(); g.ellipse(cx + L * u, top + L * .085, L * .018, L * .024, 0, 0, 6.3); g.fill(); });
    g.save(); g.translate(L * .4, -L * .03); K.figure(g, L * .2, { col: col, hat: true }); g.restore();
    g.strokeStyle = col; g.lineWidth = Math.max(1.5, L * .012); g.beginPath(); g.moveTo(L * .43, -L * .15); g.lineTo(L * .56, L * .08); g.stroke();
  };

  /* ================= 点墨成形 ================= */
  /**
   * Reveal a sprite as ink spreading from drop points. drops: [[x, y, t0, dur, rMax]] in world coords.
   * While a drop is young its blot is visible; once every drop has spread, the sprite is simply drawn.
   */
  K.inkReveal = function (ctx, spr, x, y, w, h, drops, t, o) {
    o = o || {}; var i, done = true, any = false;
    for (i = 0; i < drops.length; i++) { var q = seg(t, drops[i][2], drops[i][2] + drops[i][3]); if (q < 1) done = false; if (q > 0) any = true; }
    if (done) { ctx.drawImage(spr.c, x, y, w, h); return; }
    if (any) {
      var sc = F.scratch(), g = sc.g;
      for (i = 0; i < drops.length; i++) { var d = drops[i], q2 = E.out(seg(t, d[2], d[2] + d[3])); if (q2 > 0) F.softDisc(g, d[0], d[1], 12 + d[4] * q2, o.soft || .4); }
      g.globalCompositeOperation = 'source-in'; g.drawImage(spr.c, x, y, w, h); g.globalCompositeOperation = 'source-over';
      ctx.drawImage(sc.c, 0, 0, W, H);
    }
    // 墨滴落下、初晕
    for (i = 0; i < drops.length; i++) {
      var dd = drops[i], fall = seg(t, dd[2] - .45, dd[2]), age = t - dd[2], col = o.col || C.ink;
      if (fall > 0 && fall < 1) { var fy = dd[1] - 260 * (1 - fall * fall); ctx.fillStyle = col; ctx.globalAlpha = clamp(fall * 4) * .9; ctx.beginPath(); ctx.moveTo(dd[0], fy - 20); ctx.bezierCurveTo(dd[0] + 4, fy - 8, dd[0] + 6, fy - 3, dd[0] + 6, fy + 1); ctx.arc(dd[0], fy + 1, 6, 0, Math.PI); ctx.bezierCurveTo(dd[0] - 6, fy - 3, dd[0] - 4, fy - 8, dd[0], fy - 20); ctx.fill(); ctx.globalAlpha = 1; }
      if (age > 0 && age < 1.6) { ctx.globalAlpha = (1 - age / 1.6) * .5; F.softDisc(ctx, dd[0], dd[1], 16 + age * 90, .7, col); ctx.globalAlpha = 1; }
    }
  };

  /* ================= 逐瓣花开 ================= */
  /** 水彩花瓣（基部在下方正中，尖向上）。kind: 'round' 桃李 | 'lotus' 荷 */
  K.petal = function (kind, c0, c1, c2, seed) {
    var w = kind === 'lotus' ? 76 : 60, h = kind === 'lotus' ? 150 : 70;
    return F.sprite(w, h, function (g) {
      var R = F.rng(seed), cx = w / 2, by = h - 4, L = h - 10, Wd = w - 12, raw = kind === 'lotus' ?
        [[0, 0], [-.34, -.2], [-.5, -.5], [-.36, -.8], [0, -1], [.36, -.8], [.5, -.5], [.34, -.2]] :
        [[0, 0], [-.36, -.22], [-.5, -.58], [-.34, -.9], [-.1, -1], [0, -.93], [.1, -1], [.34, -.9], [.5, -.58], [.36, -.22]];
      var sp = F.spline(raw.map(function (q) { return [cx + q[0] * Wd, by + q[1] * L]; }), true, 5), pts = F.pts(sp, 2);
      F.wash(g, pts, c0, { R: R, layers: 14, alpha: .13, mag: .06 });
      F.wash(g, pts, c1, { R: R, layers: 8, alpha: .05, mag: .08, edge: .5, edgeW: 1 });
      var tip = pts.map(function (q) { return [cx + (q[0] - cx) * .82, by + (q[1] - by) * 1.0]; }).filter(function (q) { return q[1] < by - L * .55; });
      if (tip.length > 3) F.wash(g, tip, c2, { R: R, layers: 8, alpha: .06, mag: .1 });
      g.strokeStyle = F.rgba(c2, .32); g.lineWidth = .8; for (var i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(cx + i * 2, by - 6); g.quadraticCurveTo(cx + i * Wd * .2, by - L * .5, cx + i * Wd * .13, by - L * .9); g.stroke(); }
      g.strokeStyle = F.rgba(c2, .55); g.lineWidth = 1; g.lineJoin = 'round'; F.draw(g, sp, 1);
    });
  };
  /** 五瓣花，open 0..1：瓣自蕊心旋开 */
  K.bloom5 = function (ctx, petal, x, y, s, rot, open, t) {
    if (open <= 0) return;
    var o = E.out(open), i;
    for (i = 0; i < 5; i++) {
      var a = rot + i / 5 * 6.2832 + (1 - o) * 1.1, ps = s * lerp(.2, 1, o);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.translate(0, -3 * s * o); ctx.scale(ps * .52, ps * .52); ctx.drawImage(petal.c, -30, -66, 60, 70); ctx.restore();
    }
    var c = clamp((open - .55) / .45); if (c > 0) {
      ctx.fillStyle = F.rgba(C.rouge, .8 * c); for (i = 0; i < 7; i++) { var an = rot + i / 7 * 6.2832; ctx.beginPath(); ctx.arc(x + Math.cos(an) * 6 * s, y + Math.sin(an) * 6 * s, 1.3 * s, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = F.rgba(C.gold, c); ctx.beginPath(); ctx.arc(x, y, 2.6 * s, 0, 6.3); ctx.fill();
    }
  };
  /** 荷：由苞而放。petals: [outer, inner] sprites */
  K.lotus = function (ctx, petals, x, y, s, open, t, tilt) {
    var o = E.out(clamp(open)), i, tr = Math.sin(t * 1.3) * .012;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.scale(s, s);
    function ring(spr, angs, len, o2) { angs.forEach(function (a, k) { ctx.save(); ctx.rotate(a * lerp(.1, 1, o2) + tr * (k % 2 ? 1 : -1)); ctx.scale(lerp(.62, 1, o2), len * lerp(.74, 1, o2)); ctx.drawImage(spr.c, -38, -146, 76, 150); ctx.restore(); }); }
    ring(petals[0], [-1.35, 1.35, -.98, .98], .86, E.out(clamp(open * 1.5)));
    ring(petals[1], [-.62, .62, -.3, .3], .98, E.out(clamp(open * 1.25 - .15)));
    if (o > .5) { var c = (o - .5) * 2; ctx.fillStyle = F.rgba('#D9B24A', c); ctx.beginPath(); ctx.ellipse(0, -30, 15, 9, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = F.rgba('#B08A2E', c); for (i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-10 + i * 4, -31 + (i % 2) * 3, 1.5, 0, 6.3); ctx.fill(); } }
    ring(petals[1], [0], 1.0, E.out(clamp(open * 1.1 - .1)));
    ctx.restore();
  };

  /* ================= 烟火 ================= */
  /**
   * shows: [[time, x, y, kind, hue]] kind 0 牡丹(圆) 1 垂柳(星如雨) 2 环+蕊. Deterministic in t.
   * Draws with additive light. fade scales everything.
   */
  var FW = [['255,232,170', '255,170,84', '236,96,70'], ['255,222,206', '244,128,110', '176,82,110'], ['236,250,226', '170,214,176', '90,150,150'], ['255,244,214', '240,206,128', '214,150,70']];
  K.fireworks = function (ctx, shows, t, fade, glow) {
    if (fade <= 0) return;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (var b = 0; b < shows.length; b++) {
      var B = shows[b], age = t - B[0], kind = B[3], col = FW[B[4] % 4];
      if (age < -1.2 || age > 5.6) continue;
      if (age < 0) { // 升空：一线火星，微微摆动
        var u = 1 + age / 1.2, ry = lerp(1200, B[2], E.out(u)), wob = Math.sin(u * 22 + b) * 5 * (1 - u);
        for (var k = 0; k < 7; k++) { var yy = ry + k * 16, a = (1 - k / 7) * .8 * fade; ctx.strokeStyle = 'rgba(255,220,150,' + a + ')'; ctx.lineWidth = 2.6 - k * .25; ctx.beginPath(); ctx.moveTo(B[1] + wob * (1 - k / 7), yy); ctx.lineTo(B[1] + wob * (1 - (k + 1) / 7), yy + 15); ctx.stroke(); }
        continue;
      }
      var n = kind === 1 ? 64 : 110, rings = kind === 2 ? 2 : 1;
      for (var r = 0; r < rings; r++) for (var i = 0; i < n; i++) {
        var h1 = hash(i * 1.37 + b * 9.1 + r * 3.3), an = i / n * 6.2832 + h1 * .34, sp = (kind === 1 ? 190 + 150 * hash(i * 2.9 + b) : kind === 2 ? (r ? 150 : 420) * (.94 + .12 * h1) : 250 + 300 * Math.sqrt(hash(i * 2.9 + b)));
        var drag = kind === 1 ? 1.1 : 1.7, grav = kind === 1 ? 120 : 50, life = (kind === 1 ? 3.6 : 2.4) + 1.5 * h1; if (age > life) continue;
        var pos = function (a2) { var d = sp * (1 - Math.exp(-drag * a2)) / drag; return [B[1] + Math.cos(an) * d, B[2] + Math.sin(an) * d + grav * a2 * a2]; };
        var lf = age / life, tw = lf > .55 ? (.45 + .55 * (hash(i * 7.1 + Math.floor(t * 18) * 1.3) > .45 ? 1 : 0)) : 1, al = Math.pow(1 - lf, kind === 1 ? .8 : 1.25) * fade * tw;
        var c = lf < .22 ? col[0] : lf < .62 ? col[1] : col[2], tail = kind === 1 ? .34 + age * .1 : .1 + age * .05;
        // 彗尾：三段渐隐
        for (var sgm = 0; sgm < 3; sgm++) {
          var a0 = Math.max(0, age - tail * (sgm + 1) / 3), a1 = Math.max(0, age - tail * sgm / 3), p0 = pos(a0), p1 = pos(a1);
          ctx.strokeStyle = 'rgba(' + c + ',' + (al * (1 - sgm * .32)) + ')'; ctx.lineWidth = (kind === 1 ? 2.2 : 3) * (1 - sgm * .25) * (1 - lf * .5);
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        }
        if (kind !== 1 && lf > .5 && i % 5 === 0) { var pp = pos(age), cr = hash(i + Math.floor(t * 24)) * 9; ctx.fillStyle = 'rgba(255,246,220,' + al + ')'; ctx.beginPath(); ctx.arc(pp[0] + cr - 4, pp[1] + hash(i * 3 + Math.floor(t * 24)) * 9 - 4, 1.6, 0, 6.3); ctx.fill(); } // 末梢爆裂的碎星
      }
      if (age < .6 && glow) F.blit(ctx, glow, B[1], B[2], { sc: .5 + age * 1.6, a: (1 - age / .6) * .7 * fade });
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  /** 烟火照亮夜空的一瞬（0..1） */
  K.fwFlash = function (shows, t) { var f = 0; for (var b = 0; b < shows.length; b++) { var a = t - shows[b][0]; if (a > 0 && a < 1.2) f = Math.max(f, Math.pow(1 - a / 1.2, 2)); } return f; };

  /* ================= 古画（绢本水墨）与画帘 ================= */
  var SILK = '#C8B38A', SEPIA = '#2B2216';
  function silkGround(g, R) {
    K.vgrad(g, 0, 0, W, H, [[0, '#BBA57C'], [.3, '#CDB98F'], [.7, '#C9B48A'], [1, '#B39C72']]);
    var i;
    for (i = 0; i < 46; i++) F.wash(g, F.blob(R() * W, R() * H, R.range(90, 380), R.range(60, 300), R, 12, .35), i % 3 ? '#8E7448' : '#E2D2A8', { R: R, layers: 5, alpha: .014, mag: .3 });
    g.strokeStyle = 'rgba(70,52,24,.05)'; g.lineWidth = 1; g.beginPath(); for (i = 0; i < H; i += 4) { g.moveTo(0, i + .5); g.lineTo(W, i + .5); } for (i = 0; i < W; i += 4) { g.moveTo(i + .5, 0); g.lineTo(i + .5, H); } g.stroke(); // 绢丝
    for (i = 0; i < 9; i++) { var x = R() * W; g.strokeStyle = i % 2 ? 'rgba(240,226,190,.2)' : 'rgba(60,44,20,.12)'; g.lineWidth = R.range(.6, 1.6); g.beginPath(); g.moveTo(x, R() * H * .3); g.lineTo(x + R.range(-14, 14), H * R.range(.6, 1)); g.stroke(); } // 折痕
    var vg = g.createRadialGradient(540, 960, 500, 540, 960, 1250); vg.addColorStop(0, 'rgba(70,50,20,0)'); vg.addColorStop(1, 'rgba(70,50,20,.34)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  function waterLines(g, R, y0, y1, n) { g.strokeStyle = F.rgba(SEPIA, .3); g.lineWidth = 1.1; for (var i = 0; i < n; i++) { var y = lerp(y0, y1, Math.pow(R(), 1.3)), x = R() * W, L = R.range(30, 130); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L * .5, y - 2, x + L, y); g.stroke(); } }
  function bareTree(g, R, x, y, h, lean) {
    var tips = [];
    (function limb(px, py, a, L, w, d) {
      var x2 = px + Math.cos(a) * L, y2 = py + Math.sin(a) * L, s = F.spline([[px, py], [(px + x2) / 2 + R.range(-8, 8), (py + y2) / 2 + R.range(-8, 8)], [x2, y2]], false, 5);
      g.fillStyle = F.rgba(SEPIA, .88); F.ribbon(g, s, 0, 1, function (u) { return lerp(w, w * .55, u); });
      if (d <= 0) return; for (var i = 0; i < 2; i++) limb(x2, y2, a + (i ? 1 : -1) * R.range(.3, .7), L * R.range(.6, .76), w * .58, d - 1);
    })(x, y, -Math.PI / 2 + (lean || 0), h * .4, h * .045, 4);
  }
  /**
   * 一幅“古画”：绢本、水墨、题款、朱印。motif 决定画的是什么。
   * motif: 'jiang' | 'shan' | 'feng' | 'baidi' | 'xihu' | 'yuan'
   */
  K.oldPainting = function (motif, title, who, sealSpr, seed) {
    return F.sprite(W, H, function (g) {
      var R = F.rng(seed), i, INK = SEPIA;
      silkGround(g, R);
      function far(peaks, base, a, sd) { K.inkMount(g, K.ridge({ x0: -20, x1: 1100, base: base, amp: 110, seed: sd, peaks: peaks }), base + 160, INK, a, .5, R, .3); }
      function mass(x0, x1, base, peaks, a, sd) { K.inkMount(g, K.ridge({ x0: x0, x1: x1, base: base, amp: 70, seed: sd, taper: 240, f: [.005, .018, .06], peaks: peaks }), base, INK, a, .92, R, .85); }
      function mistBand(y, a) { for (var k = 0; k < 16; k++) { var x = R() * W, rx = R.range(160, 380), ry = R.range(24, 60), gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, F.rgba('#D2BE94', a)); gr.addColorStop(1, F.rgba('#D2BE94', 0)); g.save(); g.translate(x, y + R.gauss() * 26); g.scale(rx, ry); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore(); } }
      var txtX = 930; // 题款在右上；山石重心在左
      if (motif === 'jiang') {
        far([[250, 220, 170], [820, 170, 200]], 1060, .22, seed + 1); mistBand(1040, .5);
        g.strokeStyle = F.rgba(INK, .6); g.lineWidth = 2; g.beginPath(); g.arc(560, 620, 96, 0, 6.3); g.stroke();
        mass(-380, 640, 1460, [[120, 250, 220]], .7, seed + 2); mass(520, 1500, 1720, [[980, 190, 240]], .78, seed + 3);
        waterLines(g, R, 1080, 1900, 110);
        g.save(); g.translate(600, 1300); K.skiff(g, 150, INK); g.restore();
        bareTree(g, R, 150, 1240, 300, .1); bareTree(g, R, 930, 1560, 260, -.14);
        for (i = 0; i < 40; i++) { var rx = R.range(40, 420), ry = R.range(1740, 1900); g.strokeStyle = F.rgba(INK, .6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx, ry); g.quadraticCurveTo(rx + R.range(-10, 20), ry - 60, rx + R.range(-30, 50), ry - R.range(90, 160)); g.stroke(); }
      } else if (motif === 'shan') {
        far([[760, 520, 170], [980, 300, 140]], 1000, .2, seed + 1);
        mass(-420, 900, 1500, [[330, 1040, 190], [150, 560, 150], [560, 480, 130]], .5, seed + 2); mistBand(980, .75); mistBand(1240, .6);
        mass(360, 1520, 1920, [[900, 560, 260]], .82, seed + 3); mass(-420, 520, 1920, [[60, 380, 230]], .8, seed + 4);
        g.strokeStyle = '#D9C8A0'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(470, 1090); g.quadraticCurveTo(520, 1290, 470, 1470); g.quadraticCurveTo(450, 1640, 540, 1800); g.stroke();
        K.pine(g, 840, 1420, 620, R, INK, { lean: -.2, branches: 9 }); K.pine(g, 960, 1470, 380, R, INK, { lean: .12, branches: 6, alpha: .8 });
        g.fillStyle = INK; K.roof(g, 250, 1480, 150, 40, INK, { curl: 12 }); g.fillRect(200, 1518, 100, 46);
        waterLines(g, R, 1800, 1900, 30);
      } else if (motif === 'feng') {
        far([[300, 300, 220], [760, 220, 200]], 1000, .2, seed + 1); mistBand(1010, .55);
        mass(480, 1500, 1160, [[900, 150, 240]], .6, seed + 2);
        K.pagoda(g, 840, 1040, 7, 86, 250, INK, {}); K.roof(g, 700, 988, 170, 38, INK, { curl: 13 }); g.fillStyle = INK; g.fillRect(640, 1024, 120, 44);
        K.bridge(g, 120, 760, 1250, 50, 140, F.rgba(INK, .86), { waterY: 1360, line: 'rgba(210,190,150,.5)' });
        mass(-420, 380, 1920, [[40, 620, 210]], .82, seed + 4); mass(640, 1500, 1920, [[1020, 420, 230]], .8, seed + 5);
        bareTree(g, R, 190, 1420, 520, .16); bareTree(g, R, 900, 1560, 300, -.2);
        waterLines(g, R, 1380, 1900, 90);
        g.save(); g.translate(520, 1620); K.boat(g, 330, { col: INK }); g.restore();
      } else if (motif === 'baidi') {
        far([[540, 420, 200]], 1050, .2, seed + 1); mistBand(960, .6);
        K.inkMount(g, K.ridge({ x0: -420, x1: 470, base: 1560, amp: 90, seed: seed + 2, sharp: 1.6, taper: 220, peaks: [[130, 1180, 170], [330, 760, 120]] }), 1560, INK, .74, .9, R, .9);
        K.inkMount(g, K.ridge({ x0: 620, x1: 1500, base: 1560, amp: 90, seed: seed + 3, sharp: 1.6, taper: 220, peaks: [[940, 1040, 180], [760, 620, 110]] }), 1560, INK, .7, .9, R, .9);
        mistBand(1470, .7); K.pine(g, 190, 640, 250, R, INK, { lean: .3, branches: 5 }); K.pine(g, 930, 760, 220, R, INK, { lean: -.3, branches: 5 });
        waterLines(g, R, 1500, 1900, 120);
        g.save(); g.translate(540, 1640); K.sailboat(g, 230, { col: INK, cabin: INK, sail0: '#B9A67C', sail1: '#D6C6A0' }); g.restore();
        txtX = 600;
      } else if (motif === 'xihu') {
        far([[220, 260, 200], [820, 320, 240]], 1020, .22, seed + 1); far([[540, 160, 180]], 1060, .3, seed + 6); mistBand(1040, .6);
        g.fillStyle = F.rgba(INK, .7); g.fillRect(0, 1180, W, 9); [250, 560, 860].forEach(function (x) { g.strokeStyle = F.rgba(INK, .8); g.lineWidth = 4; g.beginPath(); g.moveTo(x - 34, 1182); g.quadraticCurveTo(x, 1158, x + 34, 1182); g.stroke(); });
        for (i = 0; i < 26; i++) { var wx = 30 + i * 41 + R.range(-8, 8); g.strokeStyle = F.rgba(INK, .7); g.lineWidth = 2; g.beginPath(); g.moveTo(wx, 1180); g.lineTo(wx + R.range(-4, 4), 1136); g.stroke(); g.lineWidth = 1; for (var k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(wx + k * 3, 1128); g.quadraticCurveTo(wx + k * 8, 1150, wx + k * 9, 1174); g.stroke(); } }
        K.pagoda(g, 200, 880, 6, 44, 150, INK, {});
        waterLines(g, R, 1200, 1900, 120);
        g.save(); g.translate(600, 1420); K.huafang(g, 240, { col: INK }); g.restore();
        mass(-420, 460, 1920, [[60, 360, 230]], .8, seed + 4); bareTree(g, R, 170, 1640, 520, .22);
        for (i = 0; i < 9; i++) { var sx = 200 + i * 44, s2 = F.spline([[sx, 1140 + i * 10], [sx + 30, 1320 + i * 6], [sx + 20, 1520]], false, 6); g.strokeStyle = F.rgba(INK, .55); g.lineWidth = 1.3; F.draw(g, s2, 1); }
      } else { // yuan
        far([[280, 240, 220], [860, 200, 220]], 1100, .18, seed + 1); mistBand(1100, .5);
        g.strokeStyle = F.rgba(INK, .6); g.lineWidth = 2; g.beginPath(); g.arc(250, 560, 90, 0, 6.3); g.stroke();
        g.fillStyle = F.rgba(INK, .85); g.beginPath(); g.moveTo(240, 1500); g.lineTo(270, 1290); g.lineTo(810, 1290); g.lineTo(840, 1500); g.closePath(); g.fill();
        g.fillStyle = SILK; g.beginPath(); g.moveTo(470, 1500); g.lineTo(470, 1410); g.arc(540, 1410, 70, Math.PI, 0); g.lineTo(610, 1500); g.closePath(); g.fill();
        g.fillStyle = F.rgba(INK, .85); g.fillRect(330, 1200, 420, 90); K.roof(g, 540, 1140, 600, 64, INK, { curl: 30, ridge: .3 }); g.fillRect(390, 1060, 300, 80); K.roof(g, 540, 1004, 460, 58, INK, { curl: 28, ridge: .3 });
        bareTree(g, R, 130, 1560, 760, .24); bareTree(g, R, 960, 1560, 720, -.26);
        g.strokeStyle = F.rgba(INK, .7); g.lineWidth = 1.6; for (i = 0; i < 70; i++) { var lx = R() < .5 ? R.range(60, 420) : R.range(660, 1020), ly = R.range(820, 1300); g.beginPath(); g.arc(lx, ly, R.range(5, 9), 0, 6.3); g.stroke(); }
        for (i = 0; i < 30; i++) { g.save(); g.translate(R.range(120, 960), R.range(1540, 1700)); K.figure(g, R.range(60, 110), { col: F.rgba(INK, .85) }); g.restore(); }
      }
      F.granulate(g, W, H, R, 16000, .1);
      // 题款
      F.vtext(g, [title], txtX, 230, { font: 'xing', size: 118, pitch: 124, color: '#231B10' });
      F.vtext(g, [who], txtX - 118, 262, { font: 'xing', size: 58, pitch: 64, color: '#231B10', alpha: .92 });
      var n = who.replace(/　/g, '').length + .5 * (who.split('　').length - 1);
      F.blit(g, sealSpr, txtX - 118, 262 + n * 64 + 96, { sc: .95 });
      // 鉴藏印
      [[txtX + 40, 1180 + (seed % 5) * 60, 54], [96, 1760, 70], [96, 1668, 46]].forEach(function (s3, k) { g.fillStyle = F.rgba(C.cinnabar, .72); g.fillRect(s3[0] - s3[2] / 2, s3[1], s3[2], s3[2]); g.strokeStyle = F.rgba('#E6D6B0', .8); g.lineWidth = 2; for (var j = 1; j < 4; j++) { g.beginPath(); if ((j + k) % 2) { g.moveTo(s3[0] - s3[2] / 2 + 6, s3[1] + s3[2] * j / 4); g.lineTo(s3[0] + s3[2] / 2 - 6, s3[1] + s3[2] * j / 4); } else { g.moveTo(s3[0] - s3[2] / 2 + s3[2] * j / 4, s3[1] + 6); g.lineTo(s3[0] - s3[2] / 2 + s3[2] * j / 4, s3[1] + s3[2] - 6); } g.stroke(); } });
    }, Math.min(F.Q, .75));
  };
  /** 画帘：古画自正中向两侧拉开。q 0..1 */
  K.curtain = function (ctx, spr, q) {
    if (q >= 1) return;
    var e = E.inOut(q), half = W / 2, qq = F.Q, sw = spr.c.width, sh = spr.c.height, i;
    for (var s = -1; s <= 1; s += 2) {
      var wNow = half * (1 - e * .93), x = s < 0 ? -e * 30 : W - wNow + e * 30, sx = s < 0 ? 0 : sw / 2;
      ctx.drawImage(spr.c, sx, 0, sw / 2, sh, x, 0, wNow, H);
      // 褶：收拢时的明暗
      if (e > 0.01) for (i = 0; i < 6; i++) { var fx = x + wNow * (i + .5) / 6, fw = wNow / 6, gr = ctx.createLinearGradient(fx - fw / 2, 0, fx + fw / 2, 0), a = Math.min(.34, e * .5); gr.addColorStop(0, 'rgba(40,28,10,' + a + ')'); gr.addColorStop(.5, 'rgba(255,244,214,' + a * .35 + ')'); gr.addColorStop(1, 'rgba(40,28,10,' + a + ')'); ctx.fillStyle = gr; ctx.fillRect(fx - fw / 2, 0, fw, H); }
      // 帘边与投影
      var ex = s < 0 ? x + wNow : x, sg = ctx.createLinearGradient(ex, 0, ex + s * -70, 0); sg.addColorStop(0, 'rgba(20,14,6,' + (.42 * Math.min(1, e * 4)) + ')'); sg.addColorStop(1, 'rgba(20,14,6,0)');
      ctx.fillStyle = sg; ctx.fillRect(s < 0 ? ex : ex - 70, 0, 70, H);
      var ea = Math.min(1, e * 8); ctx.fillStyle = 'rgba(58,42,24,' + ea + ')'; ctx.fillRect(ex - 4, 0, 8, H); ctx.fillStyle = 'rgba(214,178,92,' + (.8 * ea) + ')'; ctx.fillRect(ex - 1, 0, 2, H);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
