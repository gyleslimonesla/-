/* ink.js — 墨线与水粉：平涂、勾线、排线、毛、草、云、星。整本书的笔法都在这里。 */
(function (G) {
  'use strict';
  var F = G.F, E = F.E, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp;
  var I = F.I = {};
  var P = I.P = {
    ink: '#11173A', night0: '#0E1534', night1: '#18234F', night2: '#263672', blue: '#40559E', peri: '#6C82CC', pale: '#A6B5E6', mist: '#CDD6F3',
    cream: '#F5E8CF', peach: '#F2CBAA', gold: '#F3C66C', lamp: '#F7A94C', red: '#C94F3B', redD: '#8E3327',
    moss: '#33504A', pine: '#1B302E', leaf: '#4B6C60', paper: '#F3EBDA', fur0: '#0C1130', fur1: '#1B2552', fur2: '#34468A'
  };
  function hash(n) { var x = Math.sin(n * 91.3458 + 47.77) * 43758.5453; return x - Math.floor(x); }
  I.hash = hash;
  function P2(d) { return typeof d === 'string' ? new Path2D(d) : d; }
  I.P2 = P2;

  /* ---------- fill / line ---------- */
  I.fill = function (g, d, col) { g.fillStyle = col; g.fill(P2(d)); };
  I.line = function (g, d, w, col) { g.strokeStyle = col || P.ink; g.lineWidth = w || 2; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(P2(d)); };
  /** flat gouache shape with an ink contour */
  I.shape = function (g, d, col, w, inkCol) { var p = P2(d); g.fillStyle = col; g.fill(p); if (w !== 0) I.line(g, p, w || 2.2, inkCol); return p; };
  I.clip = function (g, d, fn) { g.save(); g.clip(P2(d)); fn(); g.restore(); };

  /** 排线：在 d 内画一组近乎平行的手绘线。o:{box:[x,y,w,h], ang, gap, col, a, lw, wob, dash} */
  I.hatch = function (g, d, R, o) {
    var b = o.box, cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2, D = Math.hypot(b[2], b[3]) / 2, ca = Math.cos(o.ang), sa = Math.sin(o.ang), gap = o.gap || 9, wob = o.wob === undefined ? 2.5 : o.wob;
    g.save(); if (d) g.clip(P2(d));
    g.strokeStyle = o.col || P.ink; g.lineCap = 'round';
    for (var k = -D; k <= D; k += gap * R.range(.75, 1.25)) {
      var ox = cx - sa * k, oy = cy + ca * k, t = -D, seg;
      while (t < D) {
        seg = R.range(o.dash ? o.dash[0] : 40, o.dash ? o.dash[1] : 150); var t1 = Math.min(D, t + seg);
        g.globalAlpha = (o.a || .5) * R.range(.5, 1); g.lineWidth = (o.lw || 1.2) * R.range(.7, 1.3);
        g.beginPath(); g.moveTo(ox + ca * t, oy + sa * t); g.quadraticCurveTo(ox + ca * (t + t1) / 2 - sa * R.range(-wob, wob), oy + sa * (t + t1) / 2 + ca * R.range(-wob, wob), ox + ca * t1, oy + sa * t1); g.stroke();
        t = t1 + R.range(4, 16);
      }
    }
    g.restore();
  };
  /** 水粉的不匀：横向的短笔触 */
  I.mottle = function (g, d, R, o) {
    var b = o.box, n = o.n || 60;
    g.save(); if (d) g.clip(P2(d));
    for (var i = 0; i < n; i++) {
      var x = b[0] + R() * b[2], y = b[1] + R() * b[3], rx = R.range(o.rx ? o.rx[0] : 30, o.rx ? o.rx[1] : 110), ry = R.range(5, 14) * (o.ry || 1);
      g.globalAlpha = R.range(.03, o.a || .1); g.fillStyle = o.cols[i % o.cols.length];
      g.beginPath(); g.ellipse(x, y, rx, ry, (o.ang || 0) + R.range(-.08, .08), 0, 6.3); g.fill();
    }
    g.restore();
  };

  /* ---------- 星 ---------- */
  I.starList = function (R, n, x0, y0, w, h, o) {
    o = o || {}; var a = [];
    for (var i = 0; i < n; i++) { var r = Math.pow(R(), 3.2); a.push({ x: x0 + R() * w, y: y0 + Math.pow(R(), o.pow || 1) * h, r: .7 + r * 2.6, c: R() < .25 ? P.peach : (R() < .5 ? P.pale : P.cream), ph: R() * 6.28, sp: .6 + R() * 2.2, big: r > .78 }); }
    return a;
  };
  I.drawStars = function (g, list, t, alpha, twinkle) {
    for (var i = 0; i < list.length; i++) {
      var s = list[i], tw = twinkle === false ? 1 : .6 + .4 * Math.sin(t * s.sp + s.ph); g.globalAlpha = (alpha === undefined ? 1 : alpha) * tw; g.fillStyle = s.c;
      if (s.big) { var r = s.r * 2.3; g.beginPath(); g.moveTo(s.x, s.y - r); g.quadraticCurveTo(s.x + r * .14, s.y - r * .14, s.x + r, s.y); g.quadraticCurveTo(s.x + r * .14, s.y + r * .14, s.x, s.y + r); g.quadraticCurveTo(s.x - r * .14, s.y + r * .14, s.x - r, s.y); g.quadraticCurveTo(s.x - r * .14, s.y - r * .14, s.x, s.y - r); g.fill(); }
      else { g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.3); g.fill(); }
    }
    g.globalAlpha = 1;
  };

  /* ---------- 草 ---------- */
  /** 一丛草：从根部散开的几笔。 */
  I.tuft = function (g, x, y, s, R, col, o) {
    o = o || {}; var n = o.n || 7, up = o.up === undefined ? -Math.PI / 2 : o.up, sp = o.spread || 1.1;
    g.strokeStyle = col; g.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var a = up + (i / (n - 1) - .5) * sp + R.range(-.12, .12), L = s * R.range(.6, 1.15), bend = R.range(-.5, .5);
      g.lineWidth = Math.max(.8, s * .07 * R.range(.7, 1.2));
      g.beginPath(); g.moveTo(x + R.range(-s * .1, s * .1), y); g.quadraticCurveTo(x + Math.cos(a) * L * .55, y + Math.sin(a) * L * .55, x + Math.cos(a + bend) * L, y + Math.sin(a + bend) * L); g.stroke();
    }
  };
  /** 一片草地：按 tone(x,y)∈0..1 在暗/亮之间取色。 */
  I.meadow = function (g, R, o) {
    var n = o.n, cols = o.cols;
    for (var i = 0; i < n; i++) {
      var x = o.x0 + R() * (o.x1 - o.x0), y = o.y0 + Math.pow(R(), o.pow || 1) * (o.y1 - o.y0); if (o.inside && !o.inside(x, y)) continue;
      var tn = clamp(o.tone ? o.tone(x, y) : R()), k = Math.min(cols.length - 1, Math.floor(tn * cols.length + R.range(-.35, .35) * 1.2)), sc = (o.size || 22) * (o.scale ? o.scale(x, y) : 1) * R.range(.7, 1.3);
      g.globalAlpha = o.alpha ? o.alpha(x, y) : 1;
      I.tuft(g, x, y, sc, R, cols[Math.max(0, k)], { n: 5 + (R() * 4 | 0), up: o.up ? o.up(x, y) : -Math.PI / 2 + R.range(-.35, .35), spread: o.spread || 1.2 });
    }
    g.globalAlpha = 1;
  };

  /* ---------- 毛 ---------- */
  /** 在 d 内沿 flow(x,y) 的方向排毛。o:{box, n, len:[a,b], cols:[...], lw:[a,b], curl} */
  I.fur = function (g, d, R, flow, o) {
    var b = o.box, n = o.n, cols = o.cols;
    g.save(); if (d) g.clip(P2(d)); g.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var x = b[0] + R() * b[2], y = b[1] + R() * b[3], a = flow(x, y) + R.range(-.28, .28), L = R.range(o.len[0], o.len[1]), cu = (o.curl === undefined ? .5 : o.curl) * R.range(-1, 1);
      var tn = o.tone ? clamp(o.tone(x, y) + R.range(-.2, .2)) : R();
      g.strokeStyle = cols[Math.min(cols.length - 1, Math.floor(tn * cols.length))]; g.lineWidth = R.range(o.lw ? o.lw[0] : 1.4, o.lw ? o.lw[1] : 2.6); g.globalAlpha = R.range(.55, 1) * (o.alpha || 1);
      var mx = x + Math.cos(a) * L * .5 - Math.sin(a) * L * cu * .3, my = y + Math.sin(a) * L * .5 + Math.cos(a) * L * cu * .3;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, x + Math.cos(a + cu * .5) * L, y + Math.sin(a + cu * .5) * L); g.stroke();
    }
    g.restore();
  };

  /* ---------- 云 ---------- */
  /** 一朵积云：扇贝形的顶，平的底；暗部 + 受光的奶油色 + 几笔排线 */
  I.cloud = function (g, x, y, w, h, R, o) {
    o = o || {}; var n = Math.max(3, Math.round(w / (h * .5))), i, lobes = [];
    for (i = 0; i < n; i++) { var u = (i + .5) / n, r = h * (.3 + .34 * Math.sin(Math.PI * u)) * R.range(.82, 1.18); lobes.push([x + w * (u - .5) * .96 + R.range(-h * .08, h * .08), y - r * .55, r]); }
    var p = new Path2D(); lobes.forEach(function (l) { p.moveTo(l[0] + l[2], l[1]); p.arc(l[0], l[1], l[2], 0, 6.3); }); p.rect(x - w * .46, y - h * .2, w * .92, h * .24);
    g.fillStyle = o.shade || P.peri; g.fill(p);
    g.save(); g.clip(p);
    g.fillStyle = o.light || P.cream; lobes.forEach(function (l) { g.beginPath(); g.arc(l[0] - l[2] * .16, l[1] - l[2] * .2, l[2] * .8, 0, 6.3); g.fill(); });
    g.fillStyle = o.mid || P.peach; g.globalAlpha = .55; lobes.forEach(function (l) { g.beginPath(); g.arc(l[0] + l[2] * .22, l[1] + l[2] * .34, l[2] * .62, 0, 6.3); g.fill(); });
    g.globalAlpha = .9; g.fillStyle = o.shade || P.peri; lobes.forEach(function (l) { g.beginPath(); g.ellipse(l[0] + l[2] * .2, l[1] + l[2] * .86, l[2] * 1.1, l[2] * .42, 0, 0, 6.3); g.fill(); });
    g.globalAlpha = 1; g.restore();
    I.hatch(g, p, R, { box: [x - w / 2, y - h, w, h * 1.1], ang: .12, gap: h * .11, col: o.line || P.blue, a: .38, lw: 1.1, dash: [14, 50], wob: 2 });
    if (o.ink) { g.strokeStyle = o.ink; g.lineWidth = 1.3; lobes.forEach(function (l) { g.beginPath(); g.arc(l[0], l[1], l[2], Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }); }
  };

  /* ---------- 树 ---------- */
  I.pine = function (g, x, y, h, R, o) {
    o = o || {}; var dark = o.dark || P.pine, lit = o.lit || P.moss, n = 6 + (R() * 3 | 0), i;
    g.strokeStyle = o.trunk || P.ink; g.lineWidth = Math.max(1.5, h * .035); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.range(-2, 2), y - h); g.stroke();
    for (i = 0; i < n; i++) {
      var u = i / (n - 1), yy = y - h * (.22 + .76 * u), ww = h * .3 * (1 - u * .82) * R.range(.85, 1.15), hh = h * .2 * (1 - u * .4);
      g.fillStyle = dark; g.beginPath(); g.moveTo(x, yy - hh); g.quadraticCurveTo(x + ww * .5, yy - hh * .2, x + ww, yy + hh * .18); g.quadraticCurveTo(x + ww * .4, yy + hh * .02, x, yy + hh * .12); g.quadraticCurveTo(x - ww * .4, yy + hh * .02, x - ww, yy + hh * .18); g.quadraticCurveTo(x - ww * .5, yy - hh * .2, x, yy - hh); g.fill();
      g.strokeStyle = lit; g.lineWidth = 1; g.globalAlpha = .8; for (var k = 0; k < 5; k++) { var fx = x - ww * R.range(.1, .85), fy = yy + hh * R.range(-.4, .1); g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx - ww * .12, fy + hh * .16); g.stroke(); } g.globalAlpha = 1;
    }
  };
  /** 阔叶树：墨色枝干 + 一团一团的小叶 */
  I.tree = function (g, x, y, h, R, o) {
    o = o || {}; var dark = o.dark || P.pine, lit = o.lit || P.leaf, tips = [];
    (function limb(px, py, a, L, w, d) {
      var x2 = px + Math.cos(a) * L, y2 = py + Math.sin(a) * L, s = F.spline([[px, py], [(px + x2) / 2 + R.range(-L * .12, L * .12), (py + y2) / 2 + R.range(-L * .1, L * .1)], [x2, y2]], false, 6);
      g.fillStyle = o.trunk || P.ink; F.ribbon(g, s, 0, 1, function (u) { return lerp(w, w * .55, u); });
      if (d <= 0) { tips.push([x2, y2]); return; } tips.push([(px + x2) / 2, (py + y2) / 2 - L * .1]);
      for (var i = 0; i < 2; i++) limb(x2, y2, a + (i ? 1 : -1) * R.range(.28, .62), L * R.range(.6, .76), w * .6, d - 1);
    })(x, y, -Math.PI / 2 + (o.lean || 0), h * .34, h * .06, o.depth || 3);
    tips.forEach(function (tp, k) {
      if (k % 2 === 0 && tp[1] > y - h * .3) return;
      var r = h * R.range(.09, .15);
      for (var j = 0; j < 26; j++) { var a = R() * 6.28, d = Math.sqrt(R()) * r, lx = tp[0] + Math.cos(a) * d, ly = tp[1] + Math.sin(a) * d * .8, lr = h * R.range(.014, .026); g.fillStyle = (ly < tp[1] - r * .1 && lx < tp[0] + r * .3) ? lit : dark; g.beginPath(); g.ellipse(lx, ly, lr * 1.5, lr, R() * 3.1, 0, 6.3); g.fill(); }
    });
  };

  /* ---------- 小灯（主人公）---------- */
  /** 原点在脚下。o:{dir:1|-1, up:0..1 举灯, walk:phase} 返回灯的位置 */
  I.girl = function (g, x, y, s, o) {
    o = o || {}; var dir = o.dir || 1, up = o.up || 0, bob = o.walk === undefined ? 0 : Math.sin(o.walk) * 1.5;
    g.save(); g.translate(x, y + bob); g.scale(s * dir, s);
    g.lineJoin = 'round'; g.lineCap = 'round';
    I.shape(g, 'M-17,0 Q-23,-40 -9,-62 Q0,-72 9,-62 Q21,-40 19,0 Q0,5 -17,0 Z', P.red, 1.6);
    g.strokeStyle = P.redD; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-6, -50); g.quadraticCurveTo(-10, -24, -8, -2); g.moveTo(6, -48); g.quadraticCurveTo(10, -24, 9, -1); g.stroke();
    I.shape(g, 'M-13,-66 Q-13,-88 2,-88 Q16,-87 14,-68 Q8,-60 -2,-60 Q-12,-60 -13,-66 Z', P.red, 1.6);
    I.fill(g, 'M3,-80 Q12,-80 12,-70 Q10,-63 3,-63 Q-1,-70 3,-80 Z', P.cream);
    g.fillStyle = P.ink; g.beginPath(); g.arc(8, -72, 1.2, 0, 6.3); g.fill();
    // 灯杆与灯笼
    var lx = lerp(34, 20, up), ly = lerp(-64, -118, up), hx = lerp(12, 8, up), hy = lerp(-46, -60, up);
    g.strokeStyle = P.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(lx, ly); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly + 9); g.stroke();
    I.shape(g, 'M' + (lx - 6) + ',' + (ly + 9) + ' h12 l2,13 h-16 Z', P.gold, 1.3);
    g.restore();
    return { x: x + dir * s * lx, y: y + bob + s * (ly + 16) };
  };
  /** 暖光 */
  I.lampGlow = function (ctx, spr, x, y, sc, a, t) { var fk = .9 + .1 * Math.sin(t * 6.1) * Math.sin(t * 1.9); ctx.globalCompositeOperation = 'lighter'; F.blit(ctx, spr, x, y, { sc: sc * (1 + .03 * Math.sin(t * 3.3)), a: a * fk }); ctx.globalCompositeOperation = 'source-over'; };

  /* ---------- 屋 ---------- */
  I.house = function (g, x, y, w, h, R, o) {
    o = o || {}; var rh = h * R.range(.75, 1.05), wall = o.wall || P.mist;
    I.shape(g, 'M' + (x - w / 2) + ',' + y + ' v' + (-h) + ' h' + w + ' v' + h + ' Z', wall, 1.6);
    g.strokeStyle = P.blue; g.lineWidth = 1.2; g.globalAlpha = .7; g.beginPath(); g.moveTo(x - w / 2, y - h * .5); g.lineTo(x + w / 2, y - h * .5); g.moveTo(x - w * .16, y - h); g.lineTo(x - w * .16, y); g.moveTo(x + w * .2, y - h); g.lineTo(x + w * .2, y - h * .5); g.stroke(); g.globalAlpha = 1;
    I.shape(g, 'M' + (x - w * .62) + ',' + (y - h) + ' L' + x + ',' + (y - h - rh) + ' L' + (x + w * .62) + ',' + (y - h) + ' Z', o.roof || P.night2, 1.6);
    I.hatch(g, 'M' + (x - w * .62) + ',' + (y - h) + ' L' + x + ',' + (y - h - rh) + ' L' + (x + w * .62) + ',' + (y - h) + ' Z', R, { box: [x - w * .62, y - h - rh, w * 1.24, rh], ang: .9, gap: 7, col: P.ink, a: .4, lw: 1, dash: [8, 30] });
    I.shape(g, 'M' + (x + w * .22) + ',' + (y - h - rh * .5) + ' v' + (-rh * .5) + ' h' + (w * .12) + ' v' + (rh * .62) + ' Z', wall, 1.4);
    return { wx: x + w * .02, wy: y - h * .72, ww: w * .2, wh: h * .26, dx: x - w * .34, dy: y - h * .42 };
  };
})(typeof window !== 'undefined' ? window : globalThis);
/* 纸感：整幅最后压一层纤维与颗粒 */
(function (G) {
  'use strict';
  var F = G.F, W = F.W, H = F.H;
  F.buildCommon = function () {
    F.grain = F.sprite(W, H, function (g) {
      var R = F.rng(99), i; g.lineCap = 'round';
      for (i = 0; i < 1300; i++) { var x = R() * W, y = R() * H, L = R.range(18, 90), a = R() * 6.28, b = R.range(-.5, .5); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + b) * L * .5, y + Math.sin(a + b) * L * .5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.strokeStyle = R() < .6 ? 'rgba(255,250,236,' + R.range(.03, .08) + ')' : 'rgba(8,10,30,' + R.range(.03, .08) + ')'; g.lineWidth = R.range(.5, 1.4); g.stroke(); }
      for (i = 0; i < 5200; i++) { g.fillStyle = R() < .5 ? 'rgba(255,250,236,' + R.range(.03, .1) + ')' : 'rgba(8,10,30,' + R.range(.04, .12) + ')'; g.fillRect(R() * W, R() * H, R.range(.8, 2), R.range(.8, 2)); }
      var vg = g.createRadialGradient(W / 2, H / 2, H * .34, W / 2, H / 2, H * .74); vg.addColorStop(0, 'rgba(6,8,26,0)'); vg.addColorStop(1, 'rgba(6,8,26,.38)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    });
  };
  F.finish = function (ctx) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(F.grain.c, 0, 0, W, H); };
})(typeof window !== 'undefined' ? window : globalThis);
