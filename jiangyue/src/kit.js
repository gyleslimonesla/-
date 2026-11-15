/* kit.js — 山水笔法：山、松、舟、桥、屋宇、花、灯、水纹、印章。纯程序绘制，无外部素材。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg;
  var K = F.K = {}; F.acts = {}; F.assets = {};
  function hash(n) { var x = Math.sin(n * 91.3458 + 47.77) * 43758.5453; return x - Math.floor(x); }
  K.hash = hash;

  /** vertical gradient fill. stops: [[pos, colour], ...] */
  K.vgrad = function (g, x, y, w, h, stops, alpha) {
    var gr = g.createLinearGradient(0, y, 0, y + h);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    var ga = g.globalAlpha; if (alpha !== undefined) g.globalAlpha = ga * alpha;
    g.fillStyle = gr; g.fillRect(x, y, w, h); g.globalAlpha = ga;
  };

  /* ---------- 印 ---------- */
  K.sealSprite = function (text, seed) {
    var n = text.length, w = 62, h = 20 + n * 46;
    return F.sprite(w + 12, h + 12, function (g) {
      var R = F.rng(seed || 5), i;
      g.translate(6, 6); g.fillStyle = C.cinnabar;
      g.beginPath(); // slightly irregular carved edge
      var pts = [[2, 3], [w - 3, 1], [w - 1, h - 4], [3, h - 1]];
      g.moveTo(pts[0][0] + 6, pts[0][1]);
      for (i = 0; i < 4; i++) { var a = pts[(i + 1) % 4], b = pts[(i + 2) % 4]; g.arcTo(a[0], a[1], b[0], b[1], 7); }
      g.closePath(); g.fill();
      g.strokeStyle = F.rgba(C.paper, .82); g.lineWidth = 1.5; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = C.paper; g.font = '600 38px ' + F.FONT.sc; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (i = 0; i < n; i++) g.fillText(text[i], w / 2, 33 + i * 46);
      // 残破：印泥不匀
      g.globalCompositeOperation = 'destination-out';
      for (i = 0; i < 90; i++) { g.globalAlpha = R.range(.15, .7); g.beginPath(); g.arc(R() * w, R() * h, R.range(.4, 1.7), 0, 6.3); g.fill(); }
      for (i = 0; i < 8; i++) { g.globalAlpha = .5; var ex = R() < .5 ? R.range(-2, 4) : R.range(w - 4, w + 2), ey = R() * h; g.beginPath(); g.arc(ex, ey, R.range(1.5, 4), 0, 6.3); g.fill(); }
    });
  };

  /* ---------- 月 ---------- */
  K.moonSprite = function (r, core, shade, seed) {
    var s = r * 2 + 8;
    return F.sprite(s, s, function (g) {
      var R = F.rng(seed || 3), c = s / 2, gr = g.createRadialGradient(c - r * .2, c - r * .25, r * .1, c, c, r);
      gr.addColorStop(0, core); gr.addColorStop(.75, core); gr.addColorStop(1, F.mix(core, shade, .35));
      g.fillStyle = gr; g.beginPath(); g.arc(c, c, r, 0, 6.3); g.fill(); g.save(); g.clip();
      for (var i = 0; i < 14; i++) F.wash(g, F.blob(c + R.range(-r * .7, r * .7), c + R.range(-r * .7, r * .7), R.range(r * .1, r * .34), R.range(r * .08, r * .26), R, 10, .3), shade, { R: R, layers: 5, alpha: .022, mag: .3 });
      g.restore();
    });
  };

  /* ---------- 云气 ---------- */
  K.mistSprite = function (w, h, seed, col, dens) {
    return F.sprite(w, h, function (g) {
      var R = F.rng(seed), n = Math.round((dens || 1) * w / 26);
      for (var i = 0; i < n; i++) {
        var x = R() * w, y = h * (.5 + R.gauss() * .16), rx = R.range(90, 260), ry = R.range(16, 46) * (h / 160);
        var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, F.rgba(col, R.range(.1, .22))); gr.addColorStop(1, F.rgba(col, 0));
        g.save(); g.translate(x, y); g.scale(rx, ry); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore();
      }
    }, Math.min(F.Q, .5));
  };
  /** draw a mist sprite tiled & drifting */
  K.mist = function (ctx, spr, y, t, speed, alpha, phase) {
    var x = -(((t * speed + (phase || 0)) % spr.w) + spr.w) % spr.w, ga = ctx.globalAlpha; ctx.globalAlpha = ga * alpha;
    for (; x < W; x += spr.w) ctx.drawImage(spr.c, x, y, spr.w, spr.h);
    ctx.globalAlpha = ga;
  };

  /* ---------- 山 ---------- */
  /** silhouette polyline. o:{x0,x1,step,base,amp,seed,f,sharp,peaks:[[x,h,w]]} */
  K.ridge = function (o) {
    var pts = [], f = o.f || [.0032, .011, .034], st = o.step || 6;
    for (var x = o.x0; x <= o.x1; x += st) {
      var n = F.noise(x * f[0], o.seed) * .56 + F.noise(x * f[1], o.seed + 3) * .3 + F.noise(x * f[2], o.seed + 7) * .14, v;
      if (o.sharp) { v = Math.pow(1 - Math.abs(n), o.sharp); } else v = (n + 1) / 2;
      var y = o.base - o.amp * v;
      if (o.peaks) for (var i = 0; i < o.peaks.length; i++) { var pk = o.peaks[i], d = (x - pk[0]) / pk[2]; y -= pk[1] * Math.exp(-d * d) * (1 + .12 * F.noise(x * .02, o.seed + 11)); }
      if (o.taper) { var e1 = clamp((x - o.x0) / o.taper), e2 = clamp((o.x1 - x) / o.taper), e = e1 * e1 * (3 - 2 * e1) * e2 * e2 * (3 - 2 * e2); y = o.base - (o.base - y) * e; }
      pts.push([x, y]);
    }
    return pts;
  };
  function tracePts(g, pts, baseY) { g.beginPath(); g.moveTo(pts[0][0], baseY); for (var i = 0; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.lineTo(pts[pts.length - 1][0], baseY); g.closePath(); }
  K.tracePts = tracePts;
  /** 水墨远山：自峰顶向山脚化入云气 */
  K.inkMount = function (g, pts, baseY, col, a, fade, R, cun) {
    var top = baseY, i, k; for (i = 0; i < pts.length; i++) if (pts[i][1] < top) top = pts[i][1];
    var gr = g.createLinearGradient(0, top, 0, baseY); gr.addColorStop(0, F.rgba(col, a)); gr.addColorStop(.55, F.rgba(col, a * (fade === undefined ? .4 : fade))); gr.addColorStop(1, F.rgba(col, 0));
    g.fillStyle = gr;
    for (k = 0; k < 3; k++) { g.beginPath(); g.moveTo(pts[0][0], baseY); for (i = 0; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1] + k * 2.4 + (R ? R.range(-.7, .7) : 0)); g.lineTo(pts[pts.length - 1][0], baseY); g.closePath(); g.globalAlpha = k === 0 ? .55 : .3; g.fill(); }
    g.globalAlpha = 1;
    if (cun && R) { // 披麻皴：顺山势的长线
      g.save(); tracePts(g, pts, baseY); g.clip(); g.strokeStyle = F.rgba(col, a * .5); g.lineWidth = 1;
      for (i = 2; i < pts.length - 2; i += 2) {
        var up = pts[i][1] < pts[i - 2][1] && pts[i][1] <= pts[i + 2][1]; if (!up && R() > cun) continue;
        var x = pts[i][0], y = pts[i][1], L = R.range(40, 150), dx = R.range(-34, 34);
        g.globalAlpha = R.range(.15, .5); g.beginPath(); g.moveTo(x, y + 3); g.quadraticCurveTo(x + dx * .3, y + L * .5, x + dx, y + L); g.stroke();
      }
      g.restore(); g.globalAlpha = 1;
    }
  };
  /** 青绿山：石青峰顶、石绿山腰、赭石山脚，勾金线 */
  K.greenMount = function (g, pts, baseY, pal, R, o) {
    o = o || {}; var top = baseY, i; for (i = 0; i < pts.length; i++) if (pts[i][1] < top) top = pts[i][1];
    var gr = g.createLinearGradient(0, top, 0, baseY);
    gr.addColorStop(0, pal.top); gr.addColorStop(.34, pal.mid); gr.addColorStop(.72, pal.foot); gr.addColorStop(1, F.rgba(pal.foot, o.footA === undefined ? 0 : o.footA));
    tracePts(g, pts, baseY); g.fillStyle = gr; g.fill();
    g.save(); tracePts(g, pts, baseY); g.clip();
    // 向阳一侧提亮，背阴一侧压暗（光从左上来）
    for (i = 1; i < pts.length - 1; i++) {
      var isPeak = pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1]; if (!isPeak) continue;
      var px = pts[i][0], py = pts[i][1], hgt = Math.min(baseY - py, 520), k;
      for (k = 0; k < 9; k++) { // 背阴：宽而淡的几笔叠出体积
        var sx0 = px + 6 + k * hgt * .028, Ls = hgt * R.range(.5, .9);
        g.strokeStyle = F.rgba(pal.shade, .075); g.lineWidth = hgt * R.range(.05, .11); g.lineCap = 'round';
        g.beginPath(); g.moveTo(sx0 + hgt * .04, py + hgt * .12); g.quadraticCurveTo(sx0 + hgt * .14, py + Ls * .5, sx0 + hgt * R.range(.2, .36), py + Ls); g.stroke();
      }
      for (k = -5; k <= 5; k++) {
        if (!k) continue;
        var L = hgt * R.range(.35, .85), dx = k * R.range(10, 24) * (hgt / 260);
        g.strokeStyle = k < 0 ? F.rgba(pal.light, R.range(.16, .36)) : F.rgba(pal.shade, R.range(.18, .4)); g.lineWidth = R.range(.9, 1.8);
        g.beginPath(); g.moveTo(px + k * 2.5, py + Math.abs(k) * 5 + 4); g.quadraticCurveTo(px + dx * .45, py + L * .5, px + dx, py + L); g.stroke();
      }
    }
    // 苔点
    g.fillStyle = F.rgba(pal.shade, .55);
    for (i = 0; i < pts.length; i++) if (R() < (o.moss === undefined ? .42 : o.moss)) for (var m = 0; m < 3; m++) { g.beginPath(); g.ellipse(pts[i][0] + R.range(-5, 5), pts[i][1] + R.range(5, 30), R.range(1.2, 3), R.range(.8, 1.8), 0, 0, 6.3); g.fill(); }
    g.restore();
    // 勾金
    if (pal.gold) { g.strokeStyle = F.rgba(pal.gold, o.goldA === undefined ? .8 : o.goldA); g.lineWidth = o.goldW || 1.6; g.lineJoin = 'round'; g.beginPath(); for (i = 0; i < pts.length; i++) g[i ? 'lineTo' : 'moveTo'](pts[i][0], pts[i][1]); g.stroke(); }
  };

  /* ---------- 松 ---------- */
  /** 松：虬干、平伸的枝、层层如盖的针叶。o:{lean, branches, alpha, bend} */
  K.pine = function (g, x, y, h, R, col, o) {
    o = o || {}; var lean = o.lean || 0, i, a = o.alpha || 1, bend = (o.bend === undefined ? .07 : o.bend) * h;
    var sp = F.spline([[x, y], [x + lean * h * .22 + bend, y - h * .3], [x + lean * h * .5 - bend * .8, y - h * .62], [x + lean * h * .74 + bend * .3, y - h * .86], [x + lean * h * .8, y - h]], false, 6), w0 = Math.max(3, h * .034);
    g.fillStyle = F.rgba(col, .9 * a); F.ribbon(g, sp, 0, 1, function (u) { return lerp(w0, w0 * .3, u); });
    g.fillStyle = F.rgba(C.paper, .1 * a); F.ribbon(g, sp, 0, .9, function (u) { return lerp(w0, w0 * .3, u) * .3; });
    if (h > 200) { g.strokeStyle = F.rgba(C.paper, .2 * a); g.lineWidth = 1; for (i = 0; i < 40; i++) { var q = F.at(sp, R.range(.02, .85)); g.beginPath(); g.arc(q.x + R.range(-w0 * .3, w0 * .3), q.y, R.range(2, 5), .3, 2.6); g.stroke(); } }
    var fr = clamp(h * .052, 13, 40);
    function fan(cx, cy, r) {
      g.fillStyle = F.rgba(col, .16 * a); g.beginPath(); g.ellipse(cx, cy - r * .16, r * 1.2, r * .56, 0, 0, 6.3); g.fill();
      g.strokeStyle = F.rgba(col, .7 * a); g.lineWidth = h > 200 ? 1.15 : .9;
      var n = h > 200 ? 30 : 16;
      for (var k = 0; k < n; k++) { var an = -Math.PI * (.04 + .92 * (k + R()) / n), L = r * R.range(.7, 1.1); g.beginPath(); g.moveTo(cx + R.range(-3, 3), cy + 2); g.lineTo(cx + Math.cos(an) * L * 1.25, cy + Math.sin(an) * L * .7); g.stroke(); }
    }
    function pad(bs, len) { var n = Math.max(2, Math.round(len / (fr * .95))); for (var c = 0; c < n; c++) { var qq = F.at(bs, lerp(.22, 1, c / (n - 1))); fan(qq.x + R.range(-5, 5), qq.y - R.range(2, 9), fr * R.range(.85, 1.15)); if (c % 2 === 0) fan(qq.x + R.range(-12, 12), qq.y - fr * .55, fr * R.range(.7, .95)); } }
    var nb = o.branches || 7;
    for (i = 0; i < nb; i++) {
      var f = lerp(.36, .95, i / (nb - 1)), q2 = F.at(sp, f), side = (i % 2 ? 1 : -1) * (lean > 0 ? -1 : 1), L2 = h * lerp(.46, .15, Math.pow(f, 1.3)) * R.range(.8, 1.12);
      if (o.oneSide && side !== o.oneSide && i % 3) L2 *= .5;
      var bs = F.spline([[q2.x, q2.y], [q2.x + side * L2 * .4, q2.y - L2 * .02], [q2.x + side * L2 * .8, q2.y + L2 * .06], [q2.x + side * L2, q2.y - L2 * .04]], false, 5);
      g.fillStyle = F.rgba(col, .85 * a); F.ribbon(g, bs, 0, 1, function (u) { return lerp(w0 * .36, 1.2, u); });
      pad(bs, L2);
    }
    var tp = F.at(sp, 1); fan(tp.x, tp.y - 4, fr * 1.15); fan(tp.x - fr, tp.y + fr * .5, fr); fan(tp.x + fr, tp.y + fr * .55, fr);
  };

  /* ---------- 石 ---------- */
  K.rock = function (g, cx, cy, rx, ry, R, col, a) {
    var pts = F.blob(cx, cy, rx, ry, R, 9, .28).map(function (q) { return [q[0], Math.min(q[1], cy + ry * .55)]; });
    F.wash(g, pts, col, { R: R, layers: 10, alpha: .1 * a, mag: .12, edge: .5 * a, edgeW: 1.4 });
    F.wash(g, pts.map(function (q) { return [cx + (q[0] - cx) * .75 + rx * .12, cy + (q[1] - cy) * .7 + ry * .16]; }), col, { R: R, layers: 8, alpha: .07 * a, mag: .16 });
    g.strokeStyle = F.rgba(col, .4 * a); g.lineWidth = 1.1;
    for (var i = 0; i < 5; i++) { var x = cx + R.range(-rx * .6, rx * .6), y = cy - ry * R.range(.1, .7); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + R.range(-12, 12), y + ry * .3, x + R.range(-18, 18), y + ry * R.range(.4, .8)); g.stroke(); }
  };

  /* ---------- 舟与人 ---------- */
  /** 乌篷船。原点在水线中心。o:{col, lamp, mat} */
  K.boat = function (g, L, o) {
    o = o || {}; var h = L * .1, col = o.col || C.ink;
    g.fillStyle = col; g.beginPath(); g.moveTo(-L * .52, -h * .95); g.quadraticCurveTo(-L * .3, h * .5, 0, h * .55); g.quadraticCurveTo(L * .34, h * .5, L * .5, -h * 1.2);
    g.quadraticCurveTo(L * .3, -h * .2, 0, -h * .15); g.quadraticCurveTo(-L * .3, -h * .2, -L * .52, -h * .95); g.fill();
    if (o.mat !== false) {
      var x0 = -L * .2, x1 = L * .2, top = -h * 2.3;
      g.fillStyle = o.matCol || col; g.beginPath(); g.moveTo(x0, -h * .1); g.bezierCurveTo(x0, top * 1.05, x1, top * 1.05, x1, -h * .1); g.closePath(); g.fill();
      if (o.lamp) { g.fillStyle = o.lamp; g.beginPath(); g.moveTo(x0 + L * .05, -h * .1); g.bezierCurveTo(x0 + L * .05, top * .8, x1 - L * .1, top * .8, x1 - L * .1, -h * .1); g.closePath(); g.fill(); }
    }
  };
  /** 人影。原点在足底。o:{col, hat, sit, lean} */
  K.figure = function (g, h, o) {
    o = o || {}; var col = o.col || C.ink, hr = h * .085, bh = o.sit ? h * .5 : h, lean = o.lean || 0;
    g.fillStyle = col; g.beginPath();
    g.moveTo(-h * .16, 0); g.quadraticCurveTo(-h * .15, -bh * .5, -h * .07 + lean * bh, -bh * .82);
    g.lineTo(h * .07 + lean * bh, -bh * .82); g.quadraticCurveTo(h * .2, -bh * .45, h * .19, 0); g.closePath(); g.fill();
    g.beginPath(); g.arc(lean * bh * 1.1, -bh * .82 - hr * .7, hr, 0, 6.3); g.fill();
    if (o.hat) { g.beginPath(); g.moveTo(lean * bh * 1.1 - hr * 2.3, -bh * .82 - hr * .9); g.lineTo(lean * bh * 1.1, -bh * .82 - hr * 2.5); g.lineTo(lean * bh * 1.1 + hr * 2.3, -bh * .82 - hr * .9); g.closePath(); g.fill(); }
  };

  /* ---------- 花 ---------- */
  K.blossomSprite = function (inner, outer, seed) {
    return F.sprite(56, 56, function (g) {
      var R = F.rng(seed || 2);
      for (var i = 0; i < 5; i++) {
        g.save(); g.translate(28, 28); g.rotate(i / 5 * 6.2832 + R.range(-.1, .1)); g.translate(0, -11);
        var gr = g.createRadialGradient(0, 6, 1, 0, -2, 14); gr.addColorStop(0, outer); gr.addColorStop(.55, inner); gr.addColorStop(1, inner);
        g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 9.5 * R.range(.9, 1.1), 12.5, 0, 0, 6.3); g.fill();
        g.strokeStyle = F.rgba(C.rouge, .22); g.lineWidth = .7; g.stroke(); g.restore();
      }
      g.fillStyle = F.rgba(C.rouge, .75); for (i = 0; i < 7; i++) { var a = i / 7 * 6.2832; g.beginPath(); g.arc(28 + Math.cos(a) * 5, 28 + Math.sin(a) * 5, 1.1, 0, 6.3); g.fill(); }
      g.fillStyle = F.rgba(C.gold, .9); g.beginPath(); g.arc(28, 28, 2.2, 0, 6.3); g.fill();
    });
  };
  K.petalSprite = function (col, col2) {
    return F.sprite(26, 18, function (g) { var gr = g.createLinearGradient(2, 0, 24, 0); gr.addColorStop(0, col2); gr.addColorStop(1, col); g.fillStyle = gr; g.beginPath(); g.moveTo(2, 9); g.quadraticCurveTo(12, -2, 24, 8); g.quadraticCurveTo(13, 19, 2, 9); g.fill(); });
  };
  /** 飘落：花瓣 / 枫叶 / 火星。deterministic in t. */
  K.fall = function (ctx, spr, t, o) {
    for (var i = 0; i < o.n; i++) {
      var life = o.life * (.7 + .6 * hash(i * 3.1 + o.seed)), ph = (t / life + hash(i * 7.7 + o.seed)) % 1, cyc = Math.floor(t / life + hash(i * 7.7 + o.seed));
      var x0 = o.x0 + hash(i * 1.3 + cyc * 5.1 + o.seed) * (o.x1 - o.x0), sway = Math.sin(ph * 6.28 * (1.5 + hash(i)) + i) * o.sway;
      var x = x0 + o.dx * ph + sway, y = o.y0 + (o.y1 - o.y0) * Math.pow(ph, o.acc || 1.1), a = Math.min(1, ph * 6, (1 - ph) * 4) * (o.alpha || 1);
      if (a <= 0) continue;
      F.blit(ctx, spr, x, y, { rot: ph * 9 * (hash(i * 2.2) - .5) * 2 + i, sc: (o.sc || 1) * (.6 + .7 * hash(i * 9.1)), sx: .45 + .55 * Math.abs(Math.cos(ph * 11 + i)), a: a });
    }
  };

  /* ---------- 水纹 ---------- */
  /** shimmering strokes. o:{x0,x1,y0,y1,n,col,seed,len,pow,alpha,lw,speed, focus:[x,width]} */
  K.ripples = function (ctx, t, o) {
    ctx.strokeStyle = o.col; ctx.lineCap = 'round'; var ga = ctx.globalAlpha;
    for (var i = 0; i < o.n; i++) {
      var d = Math.pow(hash(i * 1.7 + o.seed), o.pow || 1.6), y = lerp(o.y0, o.y1, d), xr = hash(i * 3.3 + o.seed);
      var x = o.focus ? o.focus[0] + (xr - .5) * 2 * o.focus[1] * (.25 + d * 1.6) * (.4 + hash(i * 5.9)) : lerp(o.x0, o.x1, xr);
      x += Math.sin(t * .5 + i) * 7 * (o.speed || 1);
      var tw = .5 + .5 * Math.sin(t * (1.1 + hash(i * 2.9) * 2.2) * (o.speed || 1) + i * 1.9), L = (o.len || 30) * (.35 + d * 1.5) * (.5 + .8 * hash(i * 4.1));
      ctx.globalAlpha = ga * (o.alpha || .6) * tw * (.35 + .65 * (o.near ? d : 1 - d * .4)); ctx.lineWidth = (o.lw || 1.6) * (.6 + d * 1.1);
      ctx.beginPath(); ctx.moveTo(x - L, y); ctx.quadraticCurveTo(x, y - 1.6, x + L, y); ctx.stroke();
    }
    ctx.globalAlpha = ga;
  };

  /* ---------- 屋宇 ---------- */
  K.roof = function (g, cx, y, w, h, col, o) {
    o = o || {}; var cu = o.curl === undefined ? h * .5 : o.curl, rw = o.ridge === undefined ? .26 : o.ridge;
    g.fillStyle = col; g.beginPath(); g.moveTo(cx - w * rw, y);
    g.quadraticCurveTo(cx - w * .36, y + h * .8, cx - w / 2 - cu * .8, y + h - cu);
    g.quadraticCurveTo(cx - w / 2 + cu * .2, y + h - cu * .1, cx - w / 2 + w * .08, y + h);
    g.lineTo(cx + w / 2 - w * .08, y + h); g.quadraticCurveTo(cx + w / 2 - cu * .2, y + h - cu * .1, cx + w / 2 + cu * .8, y + h - cu);
    g.quadraticCurveTo(cx + w * .36, y + h * .8, cx + w * rw, y); g.closePath(); g.fill();
    if (o.line) { g.strokeStyle = o.line; g.lineWidth = o.lw || 1.5; g.beginPath(); g.moveTo(cx - w / 2 - cu * .8, y + h - cu); g.quadraticCurveTo(cx - w / 2 + cu * .2, y + h - cu * .1, cx - w / 2 + w * .08, y + h); g.lineTo(cx + w / 2 - w * .08, y + h); g.quadraticCurveTo(cx + w / 2 - cu * .2, y + h - cu * .1, cx + w / 2 + cu * .8, y + h - cu); g.stroke(); g.beginPath(); g.moveTo(cx - w * rw, y); g.lineTo(cx + w * rw, y); g.stroke(); }
  };
  /** 塔。原点为塔基中心。 */
  K.pagoda = function (g, cx, baseY, n, w, h, col, o) {
    o = o || {}; var lh = h / (n + 1.2), y = baseY;
    for (var i = 0; i < n; i++) {
      var ww = w * lerp(1, .52, i / (n - 1));
      g.fillStyle = col; g.fillRect(cx - ww * .32, y - lh, ww * .64, lh);
      if (o.light && i % 2 === 0) { g.fillStyle = o.light; g.fillRect(cx - ww * .07, y - lh * .62, ww * .14, lh * .36); }
      K.roof(g, cx, y - lh - lh * .34, ww, lh * .42, col, { curl: lh * .2, ridge: .3, line: o.line });
      y -= lh;
    }
    g.strokeStyle = col; g.lineWidth = Math.max(1.5, w * .035); g.beginPath(); g.moveTo(cx, y - lh * .3); g.lineTo(cx, y - lh * 1.5); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(cx, y - lh * .62, w * .045, 0, 6.3); g.arc(cx, y - lh * .95, w * .035, 0, 6.3); g.fill();
  };
  /** 拱桥。deck 自 x0 到 x1，拱心 cx。 */
  K.bridge = function (g, x0, x1, deckY, rise, archR, col, o) {
    o = o || {}; var cx = (x0 + x1) / 2;
    g.fillStyle = col; g.beginPath(); g.moveTo(x0, deckY + rise); g.quadraticCurveTo(cx, deckY - rise * .9, x1, deckY + rise);
    g.lineTo(x1, o.waterY); g.lineTo(cx + archR, o.waterY); g.arc(cx, o.waterY, archR, 0, Math.PI, true); g.lineTo(x0, o.waterY); g.closePath(); g.fill();
    if (o.line) {
      g.strokeStyle = o.line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, deckY + rise); g.quadraticCurveTo(cx, deckY - rise * .9, x1, deckY + rise); g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.arc(cx, o.waterY, archR + 9, Math.PI, 0); g.stroke();
      for (var i = 0; i <= 12; i++) { var a = Math.PI + i / 12 * Math.PI; g.beginPath(); g.moveTo(cx + Math.cos(a) * archR, o.waterY + Math.sin(a) * archR); g.lineTo(cx + Math.cos(a) * (archR + 9), o.waterY + Math.sin(a) * (archR + 9)); g.stroke(); }
      // 栏杆
      g.lineWidth = 1.2; g.beginPath(); for (i = 1; i < 16; i++) { var u = i / 16, bx = lerp(x0, x1, u), by = (1 - u) * (1 - u) * (deckY + rise) + 2 * u * (1 - u) * (deckY - rise * .9) + u * u * (deckY + rise); g.moveTo(bx, by); g.lineTo(bx, by - 13); } g.stroke();
      g.beginPath(); g.moveTo(x0, deckY + rise - 13); g.quadraticCurveTo(cx, deckY - rise * .9 - 13, x1, deckY + rise - 13); g.stroke();
    }
  };

  /* ---------- 灯 ---------- */
  K.lanternSprite = function (body, core) {
    return F.sprite(40, 60, function (g) {
      var gr = g.createRadialGradient(20, 26, 2, 20, 26, 17); gr.addColorStop(0, core); gr.addColorStop(.55, body); gr.addColorStop(1, F.mix(body, '#5A1C14', .45));
      g.fillStyle = gr; g.beginPath(); g.ellipse(20, 26, 14, 17, 0, 0, 6.3); g.fill();
      g.strokeStyle = F.rgba('#5A1C14', .35); g.lineWidth = .8; for (var i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(20, 26, Math.abs(i) * 5 + .5, 17, 0, 0, 6.3); g.stroke(); }
      g.fillStyle = C.gold; g.fillRect(13, 6, 14, 4); g.fillRect(14, 42, 12, 3.5);
      g.strokeStyle = F.rgba(C.gold, .9); g.lineWidth = 1.2; g.beginPath(); g.moveTo(20, 0); g.lineTo(20, 6); g.moveTo(20, 45); g.lineTo(20, 58); g.moveTo(17, 46); g.lineTo(16, 55); g.moveTo(23, 46); g.lineTo(24, 55); g.stroke();
    });
  };

  /* ---------- 彩云 ---------- */
  K.cloudSprite = function (w, h, seed, top, body, line) {
    return F.sprite(w, h, function (g) {
      var R = F.rng(seed), n = Math.round(w / 70), i, lobes = [];
      for (i = 0; i < n; i++) { var u = (i + .5) / n, r = h * (.2 + .26 * Math.sin(Math.PI * u)) * R.range(.8, 1.2); lobes.push([w * (.08 + .84 * u) + R.range(-14, 14), h * .66 - r * .6, r]); }
      g.beginPath(); lobes.forEach(function (l) { g.moveTo(l[0] + l[2], l[1]); g.arc(l[0], l[1], l[2], 0, 6.3); });
      g.rect(w * .1, h * .52, w * .8, h * .16); g.save(); g.clip();
      K.vgrad(g, 0, 0, w, h * .72, [[0, top], [.6, body], [1, F.rgba(body, .0)]]);
      g.restore();
      // 底边化入天色
      g.globalCompositeOperation = 'destination-out'; K.vgrad(g, 0, h * .48, w, h * .26, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); g.fillStyle = '#000'; g.fillRect(0, h * .74, w, h);
      var sg = g.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(.14, 'rgba(0,0,0,0)'); sg.addColorStop(.86, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
      if (line) { g.strokeStyle = line; g.lineWidth = 1.5; lobes.forEach(function (l, k) { g.beginPath(); g.arc(l[0], l[1], l[2], Math.PI * 1.05, Math.PI * 1.9); g.stroke(); if (k % 2) { g.beginPath(); g.arc(l[0] + l[2] * .2, l[1] + l[2] * .1, l[2] * .5, Math.PI * .9, Math.PI * 2.2); g.stroke(); } }); }
    });
  };

  /* ---------- 鸟 ---------- */
  K.bird = function (ctx, x, y, s, flap, col, tilt) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.scale(s, s); ctx.fillStyle = col;
    var w = Math.sin(flap) * 13;
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 4.2, 0, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(11, -1.5); ctx.lineTo(21, .5); ctx.lineTo(11, 2); ctx.fill();          // 头颈
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-22, -3); ctx.lineTo(-21, 3); ctx.fill();           // 尾
    ctx.beginPath(); ctx.moveTo(6, -1); ctx.quadraticCurveTo(-2, -10 - w, -20, -8 - w * 1.5); ctx.quadraticCurveTo(-8, -3 - w * .4, -7, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.quadraticCurveTo(-4, -6 + w * .7, -17, -2 + w * 1.3); ctx.quadraticCurveTo(-8, 1 + w * .3, -6, 1); ctx.fill();
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
