/* lib.js — cut-paper toolkit. Everything is drawn in a 1920×1080 logical space; L.k is the device scale. */
(function (G) {
  'use strict';
  var L = G.L = { W: 1920, H: 1080, k: 1 };
  var P = L.P = {
    night: '#0c1230', ink: '#121a3a', deep: '#19264f', navy: '#1f3164', blue: '#2b4683', mid: '#3d5e9f', soft: '#6283c0',
    pale: '#a2b6de', mist: '#cbd6ec', cream: '#f0e5cc', paper: '#e6d7b8', white: '#fbf6ea',
    gold: '#d9b261', goldL: '#f1d48e', goldD: '#9c7633', red: '#c33f2d', redD: '#8a2a22', redL: '#e0644a',
    pink: '#f3d3cb', blush: '#e9a597', rose: '#d9776b', bark: '#2a2440', barkL: '#4a3f63', leaf: '#3f6a8a'
  };

  /* ---------- math ---------- */
  L.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  L.lerp = function (a, b, t) { return a + (b - a) * t; };
  L.seg = function (t, a, b) { return L.clamp((t - a) / (b - a), 0, 1); };
  L.smooth = function (t, a, b) { var x = L.seg(t, a, b); return x * x * (3 - 2 * x); };
  var E = L.E = {
    out3: function (x) { return 1 - Math.pow(1 - x, 3); },
    out5: function (x) { return 1 - Math.pow(1 - x, 5); },
    in2: function (x) { return x * x; },
    io: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    sine: function (x) { return .5 - .5 * Math.cos(Math.PI * x); },
    back: function (x, s) { s = s || 1.70158; x -= 1; return x * x * ((s + 1) * x + s) + 1; },
    elastic: function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * 2.0944) + 1; }
  };
  L.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    function r() { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    r.range = function (a, b) { return a + (b - a) * r(); };
    r.pick = function (a) { return a[Math.floor(r() * a.length)]; };
    r.sign = function () { return r() < .5 ? -1 : 1; };
    return r;
  };
  // smooth 1-D value noise
  var NP = []; (function () { var r = L.rng(77); for (var i = 0; i < 512; i++) NP.push(r()); })();
  L.noise = function (x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return L.lerp(NP[i & 511], NP[(i + 1) & 511], u) * 2 - 1; };

  /* ---------- colour ---------- */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  L.mix = function (a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; };
  L.rgba = function (c, a) { var A = hex(c); return 'rgba(' + A.join(',') + ',' + a + ')'; };
  L.light = function (c, t) { return L.mix(c, '#ffffff', t); };
  L.dark = function (c, t) { return L.mix(c, '#05081a', t); };

  /* ---------- canvases ---------- */
  L.canvas = function (w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  // sprite in logical units; drawn at device scale. returns {c,w,h,ox,oy} — (ox,oy) = logical anchor inside sprite
  L.sprite = function (w, h, fn, ox, oy) {
    var k = L.k, c = L.canvas(w * k, h * k), g = c.getContext('2d');
    g.scale(k, k); if (ox || oy) g.translate(ox || 0, oy || 0); fn(g);
    return { c: c, w: w, h: h, ox: ox || 0, oy: oy || 0 };
  };
  // draw sprite with its anchor at (x,y), uniform scale s, rotation r, alpha a
  L.blit = function (g, s, x, y, sc, r, a, sx) {
    if (a === 0 || sc === 0) return;
    g.save(); g.translate(x, y); if (r) g.rotate(r); if (sc !== undefined && sc !== 1) g.scale(sc, sc); if (sx !== undefined) g.scale(sx, 1);
    if (a !== undefined && a < 1) g.globalAlpha *= a;
    g.drawImage(s.c, -s.ox, -s.oy, s.w, s.h); g.restore();
  };

  /* ---------- paper texture ---------- */
  L.buildTexture = function () {
    var N = 512, c = L.canvas(N, N), g = c.getContext('2d'), r = L.rng(11);
    g.fillStyle = '#808080'; g.fillRect(0, 0, N, N);
    var id = g.getImageData(0, 0, N, N), d = id.data;
    for (var i = 0; i < d.length; i += 4) { var v = 128 + (r() - .5) * 26; d[i] = d[i + 1] = d[i + 2] = v; }
    g.putImageData(id, 0, 0);
    for (i = 0; i < 2600; i++) {               // fibres
      var x = r() * N, y = r() * N, a = r() * 6.283, l = 4 + r() * 22;
      g.strokeStyle = r() < .5 ? 'rgba(255,255,255,' + (.05 + r() * .12) + ')' : 'rgba(0,0,0,' + (.04 + r() * .08) + ')';
      g.lineWidth = .5 + r() * .9; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a + 1) * l * .5, y + Math.sin(a + 1) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    L.tex = c;
  };
  L.texPat = function (g) { if (!g.__tp) g.__tp = g.createPattern(L.tex, 'repeat'); return g.__tp; };

  /**
   * Fill a Path2D like a sheet of cut paper: soft drop shadow, a thin lit rim on the upper-left edge, fibre texture.
   * o: {shadow:[dx,dy,blur,alpha] | false, rim: px, rimCol, tex: alpha, rule, dark: bottom-edge shade px}
   */
  L.paper = function (g, path, col, o) {
    o = o || {};
    var k = L.k, sh = o.shadow === undefined ? [5, 9, 16, .5] : o.shadow, rule = o.rule || 'nonzero';
    g.save();
    if (sh) { g.shadowColor = 'rgba(3,6,20,' + sh[3] + ')'; g.shadowOffsetX = sh[0] * k; g.shadowOffsetY = sh[1] * k; g.shadowBlur = sh[2] * k; }
    g.fillStyle = col; g.fill(path, rule);
    g.restore();
    var rim = o.rim === undefined ? 2.2 : o.rim, tex = o.tex === undefined ? .55 : o.tex;
    if (!rim && !tex && !o.dark) return;
    g.save(); g.clip(path, rule);
    if (rim) {
      g.fillStyle = o.rimCol || (typeof col === 'string' ? L.light(col, .32) : 'rgba(255,255,255,.3)');
      g.fillRect(-4000, -4000, 8000, 8000);
      g.translate(rim * .7, rim); g.fillStyle = col; g.fill(path, rule); g.translate(-rim * .7, -rim);
    }
    if (o.dark) {   // shade along the lower-right edge
      g.save(); g.globalCompositeOperation = 'source-atop';
      g.translate(-o.dark * .6, -o.dark); g.lineWidth = o.dark * 2.4; g.strokeStyle = 'rgba(4,8,26,.22)'; g.stroke(path); g.restore();
    }
    if (tex) { g.globalCompositeOperation = 'overlay'; g.globalAlpha = tex; g.fillStyle = L.texPat(g); g.fillRect(-4000, -4000, 8000, 8000); }
    g.restore();
  };

  /* ---------- paths ---------- */
  // Catmull-Rom through points → bezier segments appended to path p (moveTo first point unless cont)
  L.curve = function (p, pts, closed, cont, tension) {
    var n = pts.length, T = (tension === undefined ? 1 : tension) / 6;
    if (!cont) p.moveTo(pts[0][0], pts[0][1]); else p.lineTo(pts[0][0], pts[0][1]);
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * T, p1[1] + (p2[1] - p0[1]) * T, p2[0] - (p3[0] - p1[0]) * T, p2[1] - (p3[1] - p1[1]) * T, p2[0], p2[1]);
    }
    if (closed) p.closePath();
    return p;
  };
  /** layered-mountain ridge: closed Path2D from x0..x1 with peaks; bottom at yb. opts {n, h:[min,max], seed, sharp, y} */
  L.ridge = function (x0, x1, y, yb, o) {
    var r = L.rng(o.seed || 1), n = o.n || 6, pts = [[x0 - 40, y + (o.edge || 30)]], step = (x1 - x0) / n;
    for (var i = 0; i <= n; i++) {
      var px = x0 + step * i + r.range(-.25, .25) * step;
      var hh = r.range(o.h[0], o.h[1]) * (o.prof ? o.prof(i / n) : 1);
      var w = step * r.range(.22, .36) * (o.sharp ? .6 : 1);
      pts.push([px - w * 1.6, y - hh * .32]);
      pts.push([px - w * .45, y - hh * .9]);
      pts.push([px, y - hh]);
      pts.push([px + w * .5, y - hh * .86]);
      pts.push([px + w * 1.7, y - hh * .28]);
    }
    pts.push([x1 + 40, y + (o.edge || 30)]);
    var p = new Path2D(); L.curve(p, pts, false, false, o.tension || .9);
    p.lineTo(x1 + 40, yb); p.lineTo(x0 - 40, yb); p.closePath();
    return { path: p, pts: pts };
  };
  // path from an SVG-ish list of circles (union)
  L.circles = function (list, p) { p = p || new Path2D(); list.forEach(function (c) { p.moveTo(c[0] + c[2], c[1]); p.arc(c[0], c[1], c[2], 0, 6.2832); }); return p; };

  /* ---------- motifs ---------- */
  /** auspicious cloud (祥云): lobes + curled tail. returns sprite */
  L.cloud = function (w, seed, o) {
    o = o || {};
    var r = L.rng(seed), h = w * .42, pad = 40;
    return L.sprite(w + pad * 2, h + pad * 2, function (g) {
      var lobes = [], n = 3 + Math.floor(r() * 2), base = h * .78, x = w * .1;
      for (var i = 0; i < n; i++) {
        var R = h * r.range(.26, .4) * (i === 1 || i === 2 ? 1.18 : 1);
        lobes.push([x + R, base - R * .9, R]); x += R * r.range(1.25, 1.55);
      }
      var sc = (w * .86) / x; lobes.forEach(function (c) { c[0] *= sc; c[2] *= sc; c[1] = base - (base - c[1]) * sc; });
      var p = L.circles(lobes);
      p.moveTo(w * .06, base);                                // flat underside, same winding as the lobes
      p.quadraticCurveTo(w * .0, base - h * .1, w * .12, base - h * .2); p.lineTo(w * .9, base - h * .2);
      p.quadraticCurveTo(w * 1.0, base - h * .1, w * .96, base); p.closePath();
      var col = o.col || P.cream;
      L.paper(g, p, col, { shadow: o.shadow === undefined ? [4, 7, 12, .45] : o.shadow, rim: 1.6, tex: .5 });
      // curls
      g.save(); g.clip(p);
      g.strokeStyle = o.line || L.mix(col, P.blue, .35); g.lineWidth = Math.max(1.6, w * .012); g.lineCap = 'round';
      lobes.forEach(function (c, i) {
        g.beginPath();
        for (var a = 0; a <= 1; a += .02) {
          var ang = Math.PI * (.95 + a * 1.6) * (i % 2 ? -1 : 1), rr = c[2] * (.72 - a * .48);
          var px = c[0] + Math.cos(ang) * rr, py = c[1] + Math.sin(ang) * rr * .9;
          a === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
        }
        g.stroke();
      });
      g.beginPath(); g.moveTo(w * .1, base - h * .08); g.lineTo(w * .92, base - h * .08); g.stroke();
      g.restore();
    }, pad, pad);
  };

  /** seigaiha wave field (青海波) drawn into g over rect; r = scale radius; cols: ring colours outer→inner */
  L.seigaiha = function (g, x0, y0, w, h, R, cols, o) {
    o = o || {};
    var rows = Math.ceil(h / (R * .5)) + 2, persp = o.persp || 0;
    for (var j = 0; j < rows; j++) {
      var yy = y0 + j * R * .5, s = 1 + persp * (j / rows), Rs = R * s, off = (j % 2) * Rs;
      for (var x = x0 - 2 * Rs + off; x < x0 + w + 2 * Rs; x += Rs * 2) {
        for (var q = 0; q < cols.length; q++) {
          var rr = Rs * (1 - q / cols.length) - (q ? 0 : 0);
          g.beginPath(); g.arc(x, yy, Math.max(1, rr - (q ? Rs * .05 : 0)), Math.PI, 0); g.closePath();
          g.fillStyle = cols[q]; g.fill();
        }
      }
    }
  };

  /** wave crest (浪花) path: a curling breaker, centred at (0,0), width w */
  L.crest = function (w, curl) {
    var p = new Path2D(), h = w * .55, c = curl || 1;
    p.moveTo(-w * .5, h * .5);
    p.bezierCurveTo(-w * .38, h * .1, -w * .2, -h * .55, w * .05, -h * .6);
    p.bezierCurveTo(w * .32, -h * .64, w * .48, -h * .3, w * .36, -h * .06 * c);
    p.bezierCurveTo(w * .28, h * .08, w * .1, h * .02, w * .1, -h * .14);
    p.bezierCurveTo(w * .1, -h * .26, w * .22, -h * .3, w * .26, -h * .22);
    p.bezierCurveTo(w * .14, -h * .36, -w * .08, -h * .3, -w * .1, -h * .06);
    p.bezierCurveTo(-w * .12, h * .18, w * .1, h * .3, w * .5, h * .5);
    p.closePath();
    return p;
  };

  /* ---------- petals & blossoms ---------- */
  // single cherry-ish petal pointing up (base at 0,0), length l
  L.petalPath = function (l, notch) {
    var p = new Path2D(), w = l * .62, n = notch === undefined ? .14 : notch;
    p.moveTo(0, 0);
    p.bezierCurveTo(-w * .25, -l * .1, -w * .62, -l * .55, -w * .42, -l * .9);
    p.quadraticCurveTo(-w * .22, -l * 1.02, -w * .02, -l * (1 - n * .25));
    p.lineTo(0, -l * (1 - n));
    p.lineTo(w * .02, -l * (1 - n * .25));
    p.quadraticCurveTo(w * .22, -l * 1.02, w * .42, -l * .9);
    p.bezierCurveTo(w * .62, -l * .55, w * .25, -l * .1, 0, 0);
    p.closePath();
    return p;
  };
  /** falling-petal sprites (anchored at centre). variants of colour */
  L.buildPetals = function () {
    var sets = [[P.pink, P.white], [P.blush, P.pink], [P.white, P.pink], [P.rose, P.blush], [P.cream, P.white], [P.redL, P.blush]];
    L.petals = sets.map(function (c, i) {
      return L.sprite(70, 70, function (g) {
        g.translate(0, 26);
        var path = L.petalPath(50, .16);
        var gr = g.createLinearGradient(0, 0, 0, -50); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
        L.paper(g, path, gr, { shadow: [2, 4, 5, .35], rim: 1.3, rimCol: 'rgba(255,255,255,.55)', tex: .4 });
        g.strokeStyle = L.rgba(P.rose, .35); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -30); g.stroke();
      }, 35, 35);
    });
  };
  /** five-petal blossom sprite (anchored at centre). kind: 'plum'|'peach'|'white'|'red' */
  L.blossom = function (R, kind, seed) {
    var r = L.rng(seed || 3);
    var cols = { plum: [P.pink, P.white, P.rose], peach: [P.blush, P.pink, P.redD], white: [P.white, P.cream, P.gold], red: [P.red, P.redL, P.goldL] }[kind || 'plum'];
    return L.sprite(R * 2.8, R * 2.8, function (g) {
      var rot = r() * 6.28;
      for (var i = 0; i < 5; i++) {
        g.save(); g.rotate(rot + i * 1.2566 + r.range(-.08, .08));
        var p = L.petalPath(R * r.range(.95, 1.05), .1);
        var gr = g.createLinearGradient(0, 0, 0, -R); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
        L.paper(g, p, gr, { shadow: [2, 4, R * .18, .4], rim: R * .05, rimCol: 'rgba(255,255,255,.5)', tex: .35 });
        g.restore();
      }
      // heart
      g.fillStyle = cols[2]; g.beginPath(); g.arc(0, 0, R * .2, 0, 6.283); g.fill();
      g.strokeStyle = P.goldD; g.lineWidth = R * .03; g.fillStyle = P.goldL;
      for (i = 0; i < 9; i++) {
        var a = i * .698 + rot, l = R * r.range(.36, .5);
        g.beginPath(); g.moveTo(Math.cos(a) * R * .12, Math.sin(a) * R * .12); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.stroke();
        g.beginPath(); g.arc(Math.cos(a) * l, Math.sin(a) * l, R * .055, 0, 6.283); g.fill();
      }
    }, R * 1.4, R * 1.4);
  };
  L.bud = function (R, kind) {
    var c = kind === 'red' ? [P.red, P.redL] : [P.blush, P.pink];
    return L.sprite(R * 2.4, R * 2.4, function (g) {
      var p = new Path2D(); p.ellipse(0, 0, R * .55, R * .7, 0, 0, 6.283);
      var gr = g.createLinearGradient(0, R * .7, 0, -R * .7); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
      L.paper(g, p, gr, { shadow: [2, 3, 4, .4], rim: 1.2, rimCol: 'rgba(255,255,255,.5)', tex: .3 });
      g.fillStyle = P.redD; g.beginPath(); g.ellipse(0, R * .6, R * .3, R * .16, 0, 0, 6.283); g.fill();
    }, R * 1.2, R * 1.2);
  };

  /* ---------- light ---------- */
  L.glow = function (R, col, hard) {
    return L.sprite(R * 2, R * 2, function (g) {
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, L.rgba(col, 1)); gr.addColorStop(hard || .2, L.rgba(col, .45)); gr.addColorStop(1, L.rgba(col, 0));
      g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2);
    }, R, R);
  };

  /** falling petal field. analytic: positions depend only on t (and gust impulses). */
  L.petalField = function (seed, n, o) {
    var r = L.rng(seed), list = [];
    for (var i = 0; i < n; i++) list.push({
      x: r() * (L.W + 600) - 300, y: r() * (L.H + 300) - 150, v: r.range(o.v[0], o.v[1]), s: r.range(o.s[0], o.s[1]),
      sw: r.range(20, 70), f: r.range(.5, 1.4), ph: r() * 6.28, rot: r() * 6.28, spin: r.range(-2, 2), flip: r.range(1.5, 4.5),
      sp: r() < .25 ? 1 : 0, z: r(), kind: Math.floor(r() * (o.kinds || 6))
    });
    return { list: list, o: o };
  };
  // gust(t) = horizontal displacement from gusts so far
  L.drawPetals = function (g, F, t, gust, zA, zB, alpha) {
    var o = F.o, W = L.W + 600, H = L.H + 300, wind = o.wind || 60;
    for (var i = 0; i < F.list.length; i++) {
      var p = F.list[i]; if (p.z < (zA || 0) || p.z >= (zB === undefined ? 1 : zB)) continue;
      var depth = .55 + p.z * .9;
      var y = ((p.y + p.v * depth * t) % H + H) % H - 150;
      var x = p.x + wind * t * depth + Math.sin(t * p.f + p.ph) * p.sw + (gust ? gust * depth * (.6 + p.z * .8) : 0);
      x = ((x + 300) % W + W) % W - 300;
      var flip = Math.cos(t * p.flip + p.ph);
      var s = p.s * depth;
      L.blit(g, L.petals[p.kind % L.petals.length], x, y, s, p.rot + t * p.spin, alpha === undefined ? 1 : alpha, Math.abs(flip) < .12 ? .12 : flip);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
