/* lib.js — neon-sticker toolkit for a 1080×1920 vertical film. L.k = device scale. */
(function (G) {
  'use strict';
  var L = G.L = { W: 1080, H: 1920, k: 1 };
  var C = L.C = {
    night: '#110a2e', deep: '#1c1147', ink: '#1a0f3d', violet: '#7b5cff', lilac: '#b9a3ff', magenta: '#ff3ea5', pink: '#ff92c9',
    cyan: '#25e2ff', blue: '#3d6bff', sky: '#8fd8ff', yellow: '#ffd23f', orange: '#ff8a3d', red: '#ff4b4b', lime: '#a6ff4d', mint: '#3dffc0',
    white: '#fff8ef', cream: '#ffeccc', wood: '#e9b872', woodD: '#b97f3e', jade: '#2fcf9b'
  };
  L.RAINBOW = [C.magenta, C.orange, C.yellow, C.lime, C.cyan, C.blue, C.violet];

  /* ---------- math ---------- */
  L.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  L.lerp = function (a, b, t) { return a + (b - a) * t; };
  L.seg = function (t, a, b) { return L.clamp((t - a) / (b - a), 0, 1); };
  L.win = function (t, a, b, fi, fo) { return Math.min(L.seg(t, a, a + (fi || .25)), 1 - L.seg(t, b - (fo || .25), b)); };
  var E = L.E = {
    out3: function (x) { return 1 - Math.pow(1 - x, 3); }, out5: function (x) { return 1 - Math.pow(1 - x, 5); },
    in2: function (x) { return x * x; }, in3: function (x) { return x * x * x; },
    io: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    sine: function (x) { return .5 - .5 * Math.cos(Math.PI * x); },
    back: function (x, s) { s = s || 1.70158; x -= 1; return x * x * ((s + 1) * x + s) + 1; },
    elastic: function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * 2.0944) + 1; }
  };
  L.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    function r() { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    r.range = function (a, b) { return a + (b - a) * r(); }; r.pick = function (a) { return a[Math.floor(r() * a.length)]; };
    r.gauss = function () { return (r() + r() + r() + r() - 2) * 1.2; };
    return r;
  };
  var NP = []; (function () { var r = L.rng(77); for (var i = 0; i < 1024; i++) NP.push(r()); })();
  L.noise = function (x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return L.lerp(NP[i & 1023], NP[(i + 1) & 1023], u) * 2 - 1; };
  L.hash = function (i) { return NP[(i * 131 + 17) & 1023]; };

  /* ---------- colour ---------- */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  L.mix = function (a, b, t) { var A = hex(a), B = hex(b); return '#' + A.map(function (v, i) { var x = Math.round(v + (B[i] - v) * t); return (x < 16 ? '0' : '') + x.toString(16); }).join(''); };
  L.rgba = function (c, a) { var A = hex(c); return 'rgba(' + A.join(',') + ',' + a + ')'; };
  L.light = function (c, t) { return L.mix(c, '#ffffff', t); };
  L.dark = function (c, t) { return L.mix(c, '#0a0520', t); };
  L.rain = function (u) { var n = L.RAINBOW.length - 1, x = ((u % 1) + 1) % 1 * n, i = Math.floor(x); return L.mix(L.RAINBOW[i], L.RAINBOW[Math.min(n, i + 1)], x - i); };

  /* ---------- canvases ---------- */
  L.canvas = function (w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  L.sprite = function (w, h, fn, ox, oy) {
    var k = L.k, c = L.canvas(w * k, h * k), g = c.getContext('2d');
    g.scale(k, k); g.translate(ox || 0, oy || 0); fn(g);
    return { c: c, w: w, h: h, ox: ox || 0, oy: oy || 0 };
  };
  L.blit = function (g, s, x, y, sc, r, a) {
    if (a === 0 || sc === 0) return;
    g.save(); g.translate(x, y); if (r) g.rotate(r); if (sc !== undefined && sc !== 1) g.scale(sc, sc);
    if (a !== undefined && a < 1) g.globalAlpha *= a;
    g.drawImage(s.c, -s.ox, -s.oy, s.w, s.h); g.restore();
  };
  L.glow = function (R, col, core) {
    return L.sprite(R * 2, R * 2, function (g) {
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, L.rgba(col, 1)); gr.addColorStop(core || .18, L.rgba(col, .5)); gr.addColorStop(.5, L.rgba(col, .14)); gr.addColorStop(1, L.rgba(col, 0));
      g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2);
    }, R, R);
  };
  L.glowCache = {};
  L.dot = function (g, x, y, R, col, a) {   // additive soft light
    var key = col + '|' + Math.round(R); var s = L.glowCache[key] || (L.glowCache[key] = L.glow(R, col));
    var op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; L.blit(g, s, x, y, 1, 0, a === undefined ? 1 : a); g.globalCompositeOperation = op;
  };

  /* ---------- sticker look: hard offset shadow + ink outline + highlight ---------- */
  L.sticker = function (g, path, fill, o) {
    o = o || {};
    var lw = o.lw === undefined ? 6 : o.lw, sh = o.sh === undefined ? [7, 9] : o.sh;
    if (sh) { g.save(); g.translate(sh[0], sh[1]); g.fillStyle = o.shCol || 'rgba(10,4,32,.55)'; g.fill(path, o.rule || 'nonzero'); if (lw) { g.lineWidth = lw; g.strokeStyle = o.shCol || 'rgba(10,4,32,.55)'; g.stroke(path); } g.restore(); }
    g.fillStyle = fill; g.fill(path, o.rule || 'nonzero');
    if (o.hi !== false && typeof fill === 'string') {   // inner highlight band upper-left
      g.save(); g.clip(path, o.rule || 'nonzero');
      g.translate(o.hiD || 5, o.hiD || 5); g.lineWidth = (o.hiW || 5); g.strokeStyle = o.hiCol || 'rgba(255,255,255,.45)';
      g.stroke(path); g.restore();
    }
    if (lw) { g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = o.ink || C.ink; g.stroke(path); }
  };
  /** neon stroke: coloured glow + bright core */
  L.neon = function (g, path, col, lw, glow, core) {
    var k = L.k; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    g.shadowColor = col; g.shadowBlur = (glow === undefined ? 24 : glow) * k; g.strokeStyle = col; g.lineWidth = lw; g.stroke(path);
    g.shadowBlur = 0; g.strokeStyle = core || L.light(col, .65); g.lineWidth = Math.max(1, lw * .38); g.stroke(path);
    g.restore();
  };
  L.circle = function (x, y, r) { var p = new Path2D(); p.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); return p; };
  L.rrect = function (x, y, w, h, r) { var p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  L.star = function (x, y, R, r, n, rot) { var p = new Path2D(); for (var i = 0; i < n * 2; i++) { var a = (rot || 0) + i * Math.PI / n - Math.PI / 2, q = i % 2 ? r : R; i ? p.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : p.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } p.closePath(); return p; };
  L.sparkle = function (x, y, R) { var p = new Path2D(); p.moveTo(x, y - R); p.quadraticCurveTo(x, y, x + R, y); p.quadraticCurveTo(x, y, x, y + R); p.quadraticCurveTo(x, y, x - R, y); p.quadraticCurveTo(x, y, x, y - R); p.closePath(); return p; };
  L.curve = function (p, pts, closed, tension) {
    var n = pts.length, T = (tension === undefined ? 1 : tension) / 6; p.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < (closed ? n : n - 1); i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * T, p1[1] + (p2[1] - p0[1]) * T, p2[0] - (p3[0] - p1[0]) * T, p2[1] - (p3[1] - p1[1]) * T, p2[0], p2[1]);
    }
    if (closed) p.closePath(); return p;
  };

  /* ---------- type ---------- */
  L.FONT = { sans: '"Noto Sans SC", sans-serif', disp: '"ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif', fun: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif' };
  // parse "abc{hl}def" → [{s, hl}]
  L.parse = function (str) { var out = [], re = /\{([^}]*)\}|([^{]+)/g, m; while ((m = re.exec(str))) out.push(m[1] !== undefined ? { s: m[1], hl: true } : { s: m[2], hl: false }); return out; };
  /**
   * Kinetic text. o: {font:'sans'|'disp'|'fun', weight, fill, hl (highlight colour), stroke (ink width), shadow:[dx,dy,col],
   *  reveal(i,n)->0..1 per char, align:'center'|'left', maxW, marker (bool: draw marker box under highlights), wob}
   * returns total width.
   */
  L.text = function (g, str, x, y, size, o) {
    o = o || {};
    var parts = L.parse(str), font = (o.weight || 900) + ' ' + size + 'px ' + L.FONT[o.font || 'sans'];
    g.save(); g.font = font; g.textBaseline = 'middle'; g.textAlign = 'left';
    var chars = []; parts.forEach(function (p) { Array.from(p.s).forEach(function (ch) { chars.push({ ch: ch, hl: p.hl, w: g.measureText(ch).width }); }); });
    var track = size * (o.track || 0), total = chars.reduce(function (a, c) { return a + c.w + track; }, -track);
    var sc = o.maxW && total > o.maxW ? o.maxW / total : 1;
    g.translate(x, y); g.scale(sc, sc);
    var cx = o.align === 'left' ? 0 : -total / 2, n = chars.length, k = L.k;
    // marker boxes under highlighted runs
    if (o.marker !== false) {
      var xx = cx, runA = null, runEnd = 0, runRev = 0;
      var flush = function () {
        if (runA === null) return;
        g.save(); g.fillStyle = o.markerCol || L.rgba(C.yellow, .95); g.transform(1, 0, -.18, 1, 0, 0);
        g.fillRect(runA - size * .08 + size * .1, -size * .44, (runEnd - runA) * runRev + size * .16, size * .88); g.restore();
        runA = null;
      };
      chars.forEach(function (c, i) {
        var a = o.reveal ? o.reveal(i, n) : 1;
        if (c.hl && a > 0) { if (runA === null) runA = xx; runEnd = xx + c.w; runRev = L.clamp(a * 1.6, 0, 1) * (runA === xx ? 1 : 1); }
        else flush();
        xx += c.w + track;
      });
      flush();
    }
    var x0 = cx;
    chars.forEach(function (c, i) {
      var a = o.reveal ? o.reveal(i, n) : 1;
      if (a > 0) {
        var pop = o.pop === false ? 1 : E.back(L.clamp(a, 0, 1), 2.6), dy = (1 - L.clamp(a, 0, 1)) * size * .35 + (o.wob ? Math.sin(o.wob * 6 + i * .9) * size * .03 : 0);
        g.save(); g.translate(x0 + c.w / 2, dy); g.scale(pop, pop); g.globalAlpha *= L.clamp(a * 2.5, 0, 1);
        var fill = c.hl ? (o.hl || C.ink) : (o.fill || C.white);
        if (o.shadow !== false) { var sh = o.shadow || [size * .06, size * .08, C.magenta]; g.fillStyle = c.hl && o.marker !== false ? 'rgba(0,0,0,0)' : sh[2]; g.fillText(c.ch, -c.w / 2 + sh[0], sh[1]); }
        if (o.stroke && !(c.hl && o.marker !== false)) { g.lineWidth = o.stroke; g.lineJoin = 'round'; g.strokeStyle = o.ink || C.ink; g.strokeText(c.ch, -c.w / 2, 0); }
        g.fillStyle = fill; g.fillText(c.ch, -c.w / 2, 0);
        g.restore();
      }
      x0 += c.w + track;
    });
    g.restore();
    return total * sc;
  };

  /* ---------- background: drifting aurora blobs + grid + grain ---------- */
  L.buildGrain = function () {
    var N = 256, c = L.canvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N), d = id.data, r = L.rng(5);
    for (var i = 0; i < d.length; i += 4) { var v = 128 + (r() - .5) * 90; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(id, 0, 0); L.grain = c;
  };
  /** pal: {base, blobs:[col,col,col,col], grid} */
  L.bg = function (g, t, pal, amt) {
    g.fillStyle = pal.base; g.fillRect(0, 0, L.W, L.H);
    var A = amt === undefined ? 1 : amt;
    pal.blobs.forEach(function (col, i) {
      var x = L.W * (.5 + .55 * L.noise(t * .09 + i * 13.1)), y = L.H * (.5 + .5 * L.noise(t * .07 + i * 7.7 + 40)), R = 700 + 260 * L.noise(t * .1 + i * 3);
      var gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, L.rgba(col, .55 * A)); gr.addColorStop(1, L.rgba(col, 0));
      g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
    });
    if (pal.grid) {
      g.save(); g.strokeStyle = L.rgba(pal.grid, .08); g.lineWidth = 1.5; var s = 90, off = (t * 12) % s;
      g.beginPath(); for (var x = -s + off; x < L.W + s; x += s) { g.moveTo(x, 0); g.lineTo(x, L.H); } for (var y = -s + off; y < L.H + s; y += s) { g.moveTo(0, y); g.lineTo(L.W, y); } g.stroke(); g.restore();
    }
  };
  L.finish = function (g, t) {
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .16;
    var p = g.createPattern(L.grain, 'repeat'), r = L.rng(Math.floor(t * 30) + 1);
    g.translate(-r() * 256, -r() * 256); g.fillStyle = p; g.fillRect(0, 0, L.W + 256, L.H + 256); g.restore();
    if (!L.vig) L.vig = L.sprite(L.W, L.H, function (q) { var gr = q.createRadialGradient(L.W / 2, L.H / 2, L.H * .3, L.W / 2, L.H / 2, L.H * .72); gr.addColorStop(0, 'rgba(6,2,20,0)'); gr.addColorStop(1, 'rgba(6,2,20,.6)'); q.fillStyle = gr; q.fillRect(0, 0, L.W, L.H); });
    g.drawImage(L.vig.c, 0, 0, L.W, L.H);
  };
})(typeof window !== 'undefined' ? window : globalThis);
