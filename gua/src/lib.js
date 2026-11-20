/* lib.js — gilt-engraving toolkit (鎏金线刻) for a 1080×1920 film. L.k = device scale. */
(function (G) {
  'use strict';
  var L = G.L = { W: 1080, H: 1920, k: 1 };
  var C = L.C = {
    ink: '#06070c', night: '#0c0f18', indigo: '#151b2e', blue: '#1f2a45',
    gold: '#d9b06a', goldL: '#f7e4b0', goldD: '#8a6731', ivory: '#efe6d2', paper: '#e8dcc0', cinnabar: '#c43d2c', cinL: '#e2604a',
    jade: '#5aa597', q: '#9ad8d4', qD: '#3f8f8c',
    wood: '#76b483', fire: '#d65a40', earth: '#cfa253', metal: '#ece6d6', water: '#5a8fc8'
  };
  /* ---------- math ---------- */
  L.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  L.lerp = function (a, b, t) { return a + (b - a) * t; };
  L.seg = function (t, a, b) { return L.clamp((t - a) / (b - a), 0, 1); };
  L.win = function (t, a, b, fi, fo) { return Math.min(L.seg(t, a, a + (fi || .3)), 1 - L.seg(t, b - (fo || .3), b)); };
  var E = L.E = {
    out3: function (x) { return 1 - Math.pow(1 - x, 3); }, out5: function (x) { return 1 - Math.pow(1 - x, 5); },
    in2: function (x) { return x * x; }, in3: function (x) { return x * x * x; },
    io: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    sine: function (x) { return .5 - .5 * Math.cos(Math.PI * x); },
    back: function (x, s) { s = s || 1.70158; x -= 1; return x * x * ((s + 1) * x + s) + 1; }
  };
  L.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    function r() { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    r.range = function (a, b) { return a + (b - a) * r(); };
    return r;
  };
  var NP = []; (function () { var r = L.rng(77); for (var i = 0; i < 1024; i++) NP.push(r()); })();
  L.noise = function (x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return L.lerp(NP[i & 1023], NP[(i + 1) & 1023], u) * 2 - 1; };
  L.hash = function (i) { return NP[((i * 131 + 17) % 1024 + 1024) % 1024]; };
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  L.mix = function (a, b, t) { var A = hex(a), B = hex(b); return '#' + A.map(function (v, i) { var x = Math.round(v + (B[i] - v) * t); return (x < 16 ? '0' : '') + x.toString(16); }).join(''); };
  L.rgba = function (c, a) { var A = hex(c); return 'rgba(' + A.join(',') + ',' + a + ')'; };

  /* ---------- canvases ---------- */
  L.canvas = function (w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  L.sprite = function (w, h, fn, ox, oy) { var k = L.k, c = L.canvas(w * k, h * k), g = c.getContext('2d'); g.scale(k, k); g.translate(ox || 0, oy || 0); fn(g); return { c: c, w: w, h: h, ox: ox || 0, oy: oy || 0 }; };
  L.blit = function (g, s, x, y, sc, r, a) {
    if (a === 0 || sc === 0) return;
    g.save(); g.translate(x, y); if (r) g.rotate(r); if (sc !== undefined && sc !== 1) g.scale(sc, sc); if (a !== undefined && a < 1) g.globalAlpha *= a;
    g.drawImage(s.c, -s.ox, -s.oy, s.w, s.h); g.restore();
  };
  L.glow = function (R, col, core) { return L.sprite(R * 2, R * 2, function (g) { var gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, L.rgba(col, 1)); gr.addColorStop(core || .15, L.rgba(col, .45)); gr.addColorStop(.5, L.rgba(col, .1)); gr.addColorStop(1, L.rgba(col, 0)); g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2); }, R, R); };
  var GC = {};
  L.dot = function (g, x, y, R, col, a) { var key = col + Math.round(R); var s = GC[key] || (GC[key] = L.glow(R, col)); var op = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; L.blit(g, s, x, y, 1, 0, a === undefined ? 1 : a); g.globalCompositeOperation = op; };

  /* ---------- gold ---------- */
  L.goldGrad = function (g, x0, y0, x1, y1) {
    var gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, '#8a6731'); gr.addColorStop(.28, '#e7c27a'); gr.addColorStop(.45, '#fff0c6'); gr.addColorStop(.6, '#d6a85c'); gr.addColorStop(1, '#7d5c2a');
    return gr;
  };
  /** gilt line. o:{col, glow, a, reveal (0..1), len (path length for reveal), dash} */
  L.gline = function (g, path, w, o) {
    o = o || {};
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; if (o.a !== undefined) g.globalAlpha *= o.a;
    if (o.reveal !== undefined && o.reveal < 1) { var len = o.len || 3000; g.setLineDash([len * o.reveal, len * 2]); }
    else if (o.dash) g.setLineDash(o.dash);
    var col = o.col || (o.grad || L.GOLD);
    if (o.glow !== 0) { g.shadowColor = o.glowCol || 'rgba(255,196,110,.55)'; g.shadowBlur = (o.glow || 12) * L.k; }
    g.strokeStyle = col; g.lineWidth = w; g.stroke(path);
    g.restore();
  };
  L.gfill = function (g, path, o) {
    o = o || {};
    g.save(); if (o.a !== undefined) g.globalAlpha *= o.a;
    if (o.glow) { g.shadowColor = o.glowCol || 'rgba(255,196,110,.5)'; g.shadowBlur = o.glow * L.k; }
    g.fillStyle = o.col || L.GOLD; g.fill(path, o.rule || 'nonzero'); g.restore();
  };
  L.circle = function (x, y, r) { var p = new Path2D(); p.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); return p; };
  L.rrect = function (x, y, w, h, r) { var p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
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
  L.FONT = { serif: '"Noto Serif SC", serif', brush: '"Ma Shan Zheng", "Noto Serif SC", serif' };
  L.parse = function (str) { var out = [], re = /\{([^}]*)\}|([^{]+)/g, m; while ((m = re.exec(str))) out.push(m[1] !== undefined ? { s: m[1], hl: true } : { s: m[2], hl: false }); return out; };
  /** text. o:{font, weight, fill, hl, glow, align, reveal(i,n), maxW, track, vertical, lead, shadow} */
  L.text = function (g, str, x, y, size, o) {
    o = o || {};
    var parts = L.parse(str), font = (o.weight || 700) + ' ' + size + 'px ' + L.FONT[o.font || 'serif'];
    g.save(); g.font = font; g.textBaseline = 'middle'; g.textAlign = 'center';
    var chars = []; parts.forEach(function (p) { Array.from(p.s).forEach(function (ch) { chars.push({ ch: ch, hl: p.hl, w: g.measureText(ch).width }); }); });
    var n = chars.length, track = size * (o.track || 0);
    if (o.vertical) {
      var lead = size * (o.lead || 1.15);
      chars.forEach(function (c, i) {
        var a = o.reveal ? o.reveal(i, n) : 1; if (a <= 0) return;
        drawChar(g, c, x, y + i * lead + lead / 2, size, a, o);
      });
      g.restore(); return n * lead;
    }
    var total = chars.reduce(function (a, c) { return a + c.w + track; }, -track), sc = o.maxW && total > o.maxW ? o.maxW / total : 1;
    g.translate(x, y); g.scale(sc, sc);
    var x0 = o.align === 'left' ? 0 : -total / 2;
    chars.forEach(function (c, i) { var a = o.reveal ? o.reveal(i, n) : 1; if (a > 0) drawChar(g, c, x0 + c.w / 2, 0, size, a, o); x0 += c.w + track; });
    g.restore(); return total * sc;
  };
  function drawChar(g, c, x, y, size, a, o) {
    g.save(); g.translate(x, y + (1 - E.out3(L.clamp(a, 0, 1))) * size * .25); g.globalAlpha *= L.clamp(a * 1.6, 0, 1);
    var fill = c.hl ? (o.hl || L.GOLDTXT) : (o.fill || C.ivory);
    if (o.shadow !== false) { g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = size * .22 * L.k; g.shadowOffsetY = size * .04 * L.k; }
    g.fillStyle = fill === 'gold' ? L.GOLDTXT : fill; g.fillText(c.ch, 0, 0);
    if ((c.hl || fill === 'gold' || o.glow) && o.glow !== 0) { g.shadowColor = 'rgba(255,190,100,.7)'; g.shadowBlur = size * .3 * L.k; g.shadowOffsetY = 0; g.globalAlpha *= .55; g.fillText(c.ch, 0, 0); }
    g.restore();
  }

  /* ---------- the persistent sky: star chart + engraved rings + dust ---------- */
  L.buildSky = function () {
    var r = L.rng(8);
    L.GOLD = (function () { var c = L.canvas(4, 4).getContext('2d'); return '#e2bd74'; })();
    L.sky = L.sprite(1500, 1500, function (g) {
      // stars and a few constellations (lines between near neighbours)
      var st = [];
      for (var i = 0; i < 520; i++) { var a = r() * 6.283, d = Math.sqrt(r()) * 740; st.push([Math.cos(a) * d, Math.sin(a) * d, r()]); }
      st.forEach(function (s) { g.fillStyle = 'rgba(240,226,190,' + (.25 + s[2] * .6) + ')'; g.beginPath(); g.arc(s[0], s[1], .6 + s[2] * 1.7, 0, 6.283); g.fill(); });
      g.strokeStyle = 'rgba(217,176,106,.16)'; g.lineWidth = 1;
      for (i = 0; i < 26; i++) { var p = st[Math.floor(r() * 120)], q = st[Math.floor(r() * 120)]; for (var k = 0; k < 4; k++) { var nx = p[0] + r.range(-90, 90), ny = p[1] + r.range(-90, 90); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(nx, ny); g.stroke(); g.fillStyle = 'rgba(247,228,176,.6)'; g.beginPath(); g.arc(nx, ny, 2, 0, 6.283); g.fill(); p = [nx, ny]; } }
      // engraved astrolabe rings
      g.strokeStyle = 'rgba(217,176,106,.12)';
      [260, 420, 560, 700].forEach(function (R, j) { g.lineWidth = j % 2 ? 1 : 2; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.stroke(); });
      for (i = 0; i < 28; i++) { var an = i / 28 * 6.283; g.beginPath(); g.moveTo(Math.cos(an) * 560, Math.sin(an) * 560); g.lineTo(Math.cos(an) * 700, Math.sin(an) * 700); g.stroke(); }
      g.font = '500 22px ' + L.FONT.serif; g.fillStyle = 'rgba(217,176,106,.22)'; g.textAlign = 'center'; g.textBaseline = 'middle';
      Array.from('角亢氐房心尾箕斗牛女虚危室壁奎娄胃昴毕觜参井鬼柳星张翼轸').forEach(function (ch, i) { var an = (i + .5) / 28 * 6.283 - Math.PI / 2; g.save(); g.translate(Math.cos(an) * 630, Math.sin(an) * 630); g.rotate(an + Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); });
    }, 750, 750);
    var i, gr = L.canvas(256, 256), q = gr.getContext('2d'), id = q.createImageData(256, 256), d = id.data, r2 = L.rng(5);
    for (i = 0; i < d.length; i += 4) { var v = 128 + (r2() - .5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } q.putImageData(id, 0, 0); L.grain = gr;
    L.vig = L.sprite(L.W, L.H, function (g) { var gr2 = g.createRadialGradient(L.W / 2, L.H * .45, L.H * .25, L.W / 2, L.H * .45, L.H * .75); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(1, 'rgba(0,0,0,.7)'); g.fillStyle = gr2; g.fillRect(0, 0, L.W, L.H); });
    L.dust = []; for (i = 0; i < 90; i++) L.dust.push({ x: r() * L.W, y: r() * L.H, v: r.range(6, 26), s: r.range(3, 10), ph: r() * 6.28, f: r.range(.4, 1.6), z: r() });
    L.GOLDTXT = '#ecc982';
  };
  L.bgDraw = function (g, t, tint) {
    var gr = g.createRadialGradient(L.W / 2, L.H * .45, 50, L.W / 2, L.H * .45, L.H * .8);
    gr.addColorStop(0, tint || '#18203a'); gr.addColorStop(.55, '#0c101d'); gr.addColorStop(1, '#05060a');
    g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
    L.blit(g, L.sky, L.W / 2, L.H * .46, 1.25 + .05 * Math.sin(t * .05), t * .012, .85);
  };
  L.dustDraw = function (g, t, amt) {
    g.save(); g.globalCompositeOperation = 'lighter';
    L.dust.forEach(function (d) {
      var y = ((d.y - d.v * t) % (L.H + 80) + L.H + 80) % (L.H + 80) - 40, x = d.x + Math.sin(t * d.f * .4 + d.ph) * 40;
      var tw = .3 + .7 * Math.pow(.5 + .5 * Math.sin(t * d.f * 1.7 + d.ph), 2);
      L.dot(g, x, y, d.s * (d.z > .85 ? 2.2 : 1), d.z > .85 ? '#ffd796' : '#e8c27c', tw * (amt === undefined ? .6 : amt) * (d.z > .85 ? .5 : 1));
    });
    g.restore();
  };
  L.finish = function (g, t) {
    g.drawImage(L.vig.c, 0, 0, L.W, L.H);
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .12; var r = L.rng(Math.floor(t * 30) + 1);
    g.translate(-r() * 256, -r() * 256); g.fillStyle = g.createPattern(L.grain, 'repeat'); g.fillRect(0, 0, L.W + 256, L.H + 256); g.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
