/* core.js — math, easing, paths, sprites, typography. No scene knowledge. */
(function (G) {
  'use strict';
  var F = G.F = { W: 1080, H: 1620, Q: 1 };

  /* ---------- math ---------- */
  var clamp = F.clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
  var lerp = F.lerp = function (a, b, t) { return a + (b - a) * t; };
  /** normalised progress of t inside [a,b] */
  F.seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var E = F.E = {
    lin: function (t) { return t; },
    inOut: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    inOutS: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    inOutQ: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    outQ: function (t) { return 1 - Math.pow(1 - t, 4); },
    outS: function (t) { return Math.sin(t * Math.PI / 2); },
    outExpo: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    outBack: function (t) { var c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    in: function (t) { return t * t * t; },
    inQ: function (t) { return t * t; }
  };
  /** eased progress helper: p(t, start, end, ease) */
  F.p = function (t, a, b, e) { return (e || E.inOut)(F.seg(t, a, b)); };
  /** fade in over [a,b], hold, fade out over [c,d] */
  F.io = function (t, a, b, c, d) { return Math.min(F.seg(t, a, b), 1 - F.seg(t, c, d)); };

  F.rng = function (seed) {
    var s = seed >>> 0;
    var r = function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.range = function (a, b) { return a + (b - a) * r(); };
    r.gauss = function () { return (r() + r() + r() + r() - 2) / 1.0; };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    return r;
  };
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  /** smooth 1-D value noise in [-1,1] */
  F.noise = function (x, seed) {
    seed = seed || 0; var i = Math.floor(x), f = x - i; f = f * f * (3 - 2 * f);
    return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), f) * 2 - 1;
  };
  F.mix = function (c1, c2, t) { // hex colours -> rgb()
    var a = F.rgb(c1), b = F.rgb(c2);
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')';
  };
  var rgbCache = {};
  F.rgb = function (h) {
    if (rgbCache[h]) return rgbCache[h];
    var m;
    if (h[0] === '#') { m = [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    else { m = h.match(/[\d.]+/g).slice(0, 3).map(Number); }
    return (rgbCache[h] = m);
  };
  F.rgba = function (h, a) { var c = F.rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };

  /* ---------- palette: 东方古典色 ---------- */
  F.C = {
    paper: '#F2ECDD', paperD: '#E6DDC8', ink: '#262722', inkL: '#55564E', inkLL: '#8A8A80',
    moon: '#F5F2E7', silver: '#C9D3D6', bamboo: '#5E7F66', azur: '#2F5E86', malach: '#4F8F7C',
    rouge: '#C0606A', pink: '#E6C3C2', cinnabar: '#B8402E', indigo: '#1D2B45', gold: '#D2A857', goldL: '#EBD39A',
    ochre: '#B98A58', maple: '#B4482F', fire: '#F0A04B', amber: '#E0A050'
  };

  /* ---------- paths (sampled polylines with arc length) ---------- */
  function finish(arr, closed) {
    var n = arr.length / 2, p = new Float32Array(arr), cum = new Float32Array(n), L = 0;
    for (var i = 1; i < n; i++) { L += Math.hypot(p[2 * i] - p[2 * i - 2], p[2 * i + 1] - p[2 * i - 1]); cum[i] = L; }
    return { p: p, n: n, cum: cum, len: L, closed: !!closed };
  }
  F.poly = function (pts, closed) { // pts: [[x,y],...]
    var a = []; for (var i = 0; i < pts.length; i++) a.push(pts[i][0], pts[i][1]);
    if (closed) a.push(pts[0][0], pts[0][1]);
    return finish(a, closed);
  };
  /** Parse an SVG path string into sampled sub-paths. */
  F.path = function (d, step) {
    step = step || 5;
    var toks = d.match(/[MmLlHhVvCcSsQqZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g), i = 0, subs = [], cur = null;
    var x = 0, y = 0, sx = 0, sy = 0, cmd = '', pcx = 0, pcy = 0, prevC = false;
    function num() { return parseFloat(toks[i++]); }
    function cubic(x1, y1, x2, y2, x3, y3) {
      var L = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
      var n = Math.max(3, Math.ceil(L / step));
      for (var k = 1; k <= n; k++) { var t = k / n, m = 1 - t; cur.push(m * m * m * x + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3, m * m * m * y + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3); }
      pcx = x2; pcy = y2; x = x3; y = y3; prevC = true;
    }
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
      var rel = cmd >= 'a', C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0, a, b, c, dd, e, f;
      if (C === 'M') { x = num() + ox; y = num() + oy; cur = [x, y]; subs.push({ a: cur, closed: false }); sx = x; sy = y; cmd = rel ? 'l' : 'L'; prevC = false; }
      else if (C === 'L') { x = num() + ox; y = num() + oy; cur.push(x, y); prevC = false; }
      else if (C === 'H') { x = num() + ox; cur.push(x, y); prevC = false; }
      else if (C === 'V') { y = num() + oy; cur.push(x, y); prevC = false; }
      else if (C === 'C') { a = num() + ox; b = num() + oy; c = num() + ox; dd = num() + oy; e = num() + ox; f = num() + oy; cubic(a, b, c, dd, e, f); }
      else if (C === 'S') { a = prevC ? 2 * x - pcx : x; b = prevC ? 2 * y - pcy : y; c = num() + ox; dd = num() + oy; e = num() + ox; f = num() + oy; cubic(a, b, c, dd, e, f); }
      else if (C === 'Q') { a = num() + ox; b = num() + oy; e = num() + ox; f = num() + oy; cubic(x + 2 / 3 * (a - x), y + 2 / 3 * (b - y), e + 2 / 3 * (a - e), f + 2 / 3 * (b - f), e, f); prevC = false; }
      else if (C === 'Z') { cur.push(sx, sy); subs[subs.length - 1].closed = true; x = sx; y = sy; prevC = false; }
      else throw new Error('path cmd ' + cmd);
    }
    var out = subs.map(function (s) { return finish(s.a, s.closed); }), L = 0;
    out.forEach(function (s) { L += s.len; });
    out.len = L;
    return out;
  };
  /** Catmull-Rom spline through points -> sub-path */
  F.spline = function (pts, closed, step) {
    step = step || 6; var a = [], n = pts.length;
    function P(i) { if (closed) return pts[(i + n) % n]; return pts[clamp(i, 0, n - 1)]; }
    var last = closed ? n : n - 1;
    a.push(pts[0][0], pts[0][1]);
    for (var i = 0; i < last; i++) {
      var p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      var L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), m = Math.max(2, Math.ceil(L / step));
      for (var k = 1; k <= m; k++) {
        var t = k / m, t2 = t * t, t3 = t2 * t;
        a.push(.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3));
      }
    }
    return finish(a, closed);
  };
  /** point + tangent angle at fraction f of a sub-path */
  F.at = function (s, f) {
    var d = clamp(f) * s.len, lo = 0, hi = s.n - 1, cum = s.cum, p = s.p;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
    var span = cum[hi] - cum[lo] || 1, u = (d - cum[lo]) / span;
    var x0 = p[2 * lo], y0 = p[2 * lo + 1], x1 = p[2 * hi], y1 = p[2 * hi + 1];
    return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), a: Math.atan2(y1 - y0, x1 - x0), i: lo };
  };
  /** append sub-path section [f0,f1] to current canvas path */
  F.trace = function (ctx, s, f0, f1, cont) {
    f0 = f0 === undefined ? 0 : f0; f1 = f1 === undefined ? 1 : f1;
    if (f1 <= f0) return;
    var A = F.at(s, f0), B = F.at(s, f1), p = s.p;
    if (cont) ctx.lineTo(A.x, A.y); else ctx.moveTo(A.x, A.y);
    for (var i = A.i + 1; i <= B.i; i++) ctx.lineTo(p[2 * i], p[2 * i + 1]);
    ctx.lineTo(B.x, B.y);
  };
  /** stroke all sub-paths of P up to overall fraction f (sequential if seq, else simultaneous) */
  F.draw = function (ctx, P, f, seq) {
    if (f <= 0) return; if (!P.length) P = [P];
    ctx.beginPath();
    if (seq) {
      var total = 0, i; for (i = 0; i < P.length; i++) total += P[i].len;
      var d = f * total;
      for (i = 0; i < P.length && d > 0; i++) { F.trace(ctx, P[i], 0, Math.min(1, d / P[i].len)); d -= P[i].len; }
    } else for (var j = 0; j < P.length; j++) F.trace(ctx, P[j], 0, f);
    ctx.stroke();
  };
  F.fillPath = function (ctx, P) {
    if (!P.length) P = [P]; ctx.beginPath();
    for (var j = 0; j < P.length; j++) { var s = P[j], p = s.p; ctx.moveTo(p[0], p[1]); for (var i = 1; i < s.n; i++) ctx.lineTo(p[2 * i], p[2 * i + 1]); ctx.closePath(); }
    ctx.fill();
  };
  /** variable-width stroke (filled ribbon). wf(u) -> full width at fraction u */
  F.ribbon = function (ctx, s, f0, f1, wf) {
    if (f1 <= f0) return;
    var A = F.at(s, f0), B = F.at(s, f1), p = s.p, xs = [A.x], ys = [A.y], us = [f0], i;
    for (i = A.i + 1; i <= B.i; i++) { xs.push(p[2 * i]); ys.push(p[2 * i + 1]); us.push(s.cum[i] / s.len); }
    xs.push(B.x); ys.push(B.y); us.push(f1);
    var n = xs.length, lx = new Array(n), ly = new Array(n), rx = new Array(n), ry = new Array(n);
    for (i = 0; i < n; i++) {
      var i0 = i > 0 ? i - 1 : i, i1 = i < n - 1 ? i + 1 : i, dx = xs[i1] - xs[i0], dy = ys[i1] - ys[i0], L = Math.hypot(dx, dy) || 1, w = wf(us[i]) / 2;
      var nx = -dy / L * w, ny = dx / L * w;
      lx[i] = xs[i] + nx; ly[i] = ys[i] + ny; rx[i] = xs[i] - nx; ry[i] = ys[i] - ny;
    }
    ctx.beginPath(); ctx.moveTo(lx[0], ly[0]);
    for (i = 1; i < n; i++) ctx.lineTo(lx[i], ly[i]);
    for (i = n - 1; i >= 0; i--) ctx.lineTo(rx[i], ry[i]);
    ctx.closePath(); ctx.fill();
  };
  F.pts = function (s, every) { // sub-path -> [[x,y],...] decimated
    var out = [], st = Math.max(1, every || 1);
    for (var i = 0; i < s.n - (s.closed ? 1 : 0); i += st) out.push([s.p[2 * i], s.p[2 * i + 1]]);
    return out;
  };

  /* ---------- sprites ---------- */
  F.sprite = function (w, h, draw, q) {
    var c = document.createElement('canvas'); q = q || F.Q;
    c.width = Math.max(1, Math.ceil(w * q)); c.height = Math.max(1, Math.ceil(h * q));
    var g = c.getContext('2d'); g.scale(q, q); g.q = q;
    if (draw) draw(g, w, h);
    return { c: c, w: w, h: h, g: g };
  };
  /** draw sprite with anchor (ax,ay in 0..1), scale, rotation, alpha */
  F.blit = function (ctx, s, x, y, o) {
    o = o || {};
    var a = o.a === undefined ? 1 : o.a; if (a <= 0.003) return;
    var sx = (o.sx === undefined ? 1 : o.sx) * (o.sc === undefined ? 1 : o.sc), sy = (o.sy === undefined ? 1 : o.sy) * (o.sc === undefined ? 1 : o.sc);
    var ax = o.ax === undefined ? .5 : o.ax, ay = o.ay === undefined ? .5 : o.ay;
    var ga = ctx.globalAlpha; ctx.globalAlpha = ga * a;
    if (o.rot || sx !== 1 || sy !== 1) {
      ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(sx, sy);
      ctx.drawImage(s.c, -ax * s.w, -ay * s.h, s.w, s.h); ctx.restore();
    } else ctx.drawImage(s.c, x - ax * s.w, y - ay * s.h, s.w, s.h);
    ctx.globalAlpha = ga;
  };

  /* ---------- typography: 竖排，自右向左 ---------- */
  var FONT = { xing: '"Zhi Mang Xing","LXGW WenKai","Noto Serif SC",serif', kai: '"LXGW WenKai","Noto Serif SC","Songti SC",serif', sc: '"Noto Serif SC","Songti SC","STSong",serif' };
  F.FONT = FONT;
  var wcache = {};
  /**
   * Vertical text. cols: strings, first column at x (centre), following columns to the left.
   * o:{font:'kai'|'sc', size, weight, pitch, gap, color, alpha, reveal(0..1), halo (colour), haloBlur, stagger}
   * A full-width space is a half-beat pause. Returns {w,h}.
   */
  F.vtext = function (ctx, cols, x, y, o) {
    var size = o.size, pitch = o.pitch || size * 1.2, gap = o.gap || size * 1.75, A = o.alpha === undefined ? 1 : o.alpha;
    var total = 0, c, i; for (c = 0; c < cols.length; c++) total += cols[c].length;
    var hmax = 0; if (A <= 0.003) return { w: cols.length * gap, h: 0 };
    var ga = ctx.globalAlpha, rev = o.reveal, n = 0, span = Math.min(.5, 5 / (total + 4));
    ctx.font = (o.font === 'xing' ? 400 : (o.weight || 300)) + ' ' + size + 'px ' + FONT[o.font || 'kai']; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.color || F.C.ink;
    if (o.halo) { ctx.shadowColor = o.halo; ctx.shadowBlur = (o.haloBlur || 14) * F.Q; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
    for (c = 0; c < cols.length; c++) {
      var cx = x - c * gap, cy = y + (o.stagger ? c * o.stagger : 0), str = cols[c];
      for (i = 0; i < str.length; i++, n++) {
        var ch = str[i];
        if (ch === '\u3000') { cy += pitch * .5; continue; }
        var a = 1, dy = 0;
        if (rev !== undefined && rev < 1) { var st = total > 1 ? (n / (total - 1)) * (1 - span) : 0, q = E.out(clamp((rev - st) / span)); a = q; dy = (q - 1) * size * .14; }
        if (a > 0.003) { ctx.globalAlpha = ga * A * a; ctx.fillText(ch, cx, cy + size / 2 + dy); }
        cy += pitch;
      }
      if (cy - y > hmax) hmax = cy - y;
    }
    ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.globalAlpha = ga;
    return { w: cols.length * gap, h: hmax };
  };
  /** one horizontal line (UI-free; used sparingly) */
  F.htext = function (ctx, str, x, y, o) {
    ctx.font = (o.font === 'xing' ? 400 : (o.weight || 300)) + ' ' + o.size + 'px ' + FONT[o.font || 'sc']; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = o.color || F.C.ink;
    var ga = ctx.globalAlpha; ctx.globalAlpha = ga * (o.alpha === undefined ? 1 : o.alpha); ctx.fillText(str, x, y); ctx.globalAlpha = ga;
  };

  /* ---------- fonts ---------- */
  F.FACES = [
    ['LXGW WenKai', 'lxgw-wenkai-light.woff2', { weight: '300' }]
  ];
  function b64buf(b64) { var s = atob(b64), n = s.length, u = new Uint8Array(n); for (var i = 0; i < n; i++) u[i] = s.charCodeAt(i); return u.buffer; }
  F.b64buf = b64buf;
  /** Load fonts either from embedded base64 (single-file build) or from assets/fonts/. */
  F.loadFonts = function () {
    var emb = G.EMBED && G.EMBED.fonts;
    return Promise.all(F.FACES.map(function (fc) {
      var src = emb ? b64buf(emb[fc[1]]) : 'url(assets/fonts/' + fc[1] + ')';
      var ff = new FontFace(fc[0], src, fc[2]);
      return ff.load().then(function (l) { document.fonts.add(l); });
    }));
  };
})(typeof window !== 'undefined' ? window : globalThis);
