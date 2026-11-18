/* score.js — 《夜是一只很大的猫》的摇篮曲：一只八音盒、一架竖琴、一点弦乐。全部由算术合成，可无缝循环。 */
(function (root) {
  'use strict';
  var SR = 48000, DUR = 62, N = SR * DUR, TAU = Math.PI * 2;
  var seed = 20261113;
  function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296); }
  function nz() { return rnd() * 2 - 1; }
  var NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function m(n) { var mt = /^([A-G])([#b]?)(-?\d)$/.exec(n); return 12 * (parseInt(mt[3], 10) + 1) + NOTE[mt[1]] + (mt[2] === '#' ? 1 : mt[2] === 'b' ? -1 : 0); }
  function hz(mid) { return 440 * Math.pow(2, (mid - 69) / 12); }
  function f(n) { return hz(typeof n === 'string' ? m(n) : n); }
  function db(x) { return Math.pow(10, x / 20); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------------- stems ---------------- */
  function Stem() { this.L = new Float32Array(N); this.R = new Float32Array(N); this.hall = new Float32Array(N); this.cath = new Float32Array(N); }
  /** mix mono buffer at time t. o:{g, pan(-1..1), hall, cath} */
  Stem.prototype.add = function (buf, t, o) {
    var i0 = Math.round(t * SR), g = o.g === undefined ? 1 : o.g, pan = o.pan || 0, a = (pan + 1) * Math.PI / 4, gl = Math.cos(a) * g, gr = Math.sin(a) * g, h = (o.hall || 0) * g, c = (o.cath || 0) * g;
    var L = this.L, R = this.R, H = this.hall, Cc = this.cath, n = buf.length;
    for (var i = 0; i < n; i++) { var j = i0 + i; if (j < 0) continue; if (j >= N) break; var s = buf[i]; L[j] += s * gl; R[j] += s * gr; if (h) H[j] += s * h; if (c) Cc[j] += s * c; }
  };

  /* ---------------- instruments ---------------- */
  /** Karplus–Strong string (koto / harp). o:{t60, bright(0..1), damp(0..0.5), pos(0..1)} */
  function pluck(freq, dur, o) {
    var n = Math.round(dur * SR), out = new Float32Array(n), damp = o.damp === undefined ? .3 : o.damp, D = SR / freq - damp, M = Math.ceil(D) + 4, d = new Float32Array(M);
    var Li = Math.round(SR / freq), ex = new Float32Array(Li), lp = 0, i, pk = 0, br = o.bright === undefined ? .5 : o.bright;
    for (i = 0; i < Li; i++) { lp += br * (nz() - lp); ex[i] = lp; }
    var pp = Math.max(1, Math.round(Li * (o.pos || .22)));
    for (i = 0; i < Li; i++) { var v = ex[i] - ex[(i + pp) % Li] * .85; d[i] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
    for (i = 0; i < Li; i++) d[i] /= pk || 1;
    var gLoop = Math.pow(10, -3 * (1 / freq) / (o.t60 || 3)), w = Li, prev = 0, body = 0, bc = o.body || .55;
    for (i = 0; i < n; i++) {
      var rp = w - D; while (rp < 0) rp += M; var i0 = Math.floor(rp), fr = rp - i0, a = d[i0 % M], b = d[(i0 + 1) % M], y = a + fr * (b - a);
      var y2 = gLoop * ((1 - damp) * y + damp * prev); prev = y; d[w % M] = y2; w = (w + 1) % M;
      body += bc * (y - body); out[i] = body;
    }
    var rel = Math.min(n, Math.round(.08 * SR)); for (i = 0; i < rel; i++) out[n - 1 - i] *= i / rel;
    return out;
  }
  /** additive tone with exponentially decaying partials. parts: [ratio, amp, tau] */
  function additive(freq, dur, parts, att) {
    var n = Math.round(dur * SR), out = new Float32Array(n), i, k;
    for (k = 0; k < parts.length; k++) {
      var fr = freq * parts[k][0]; if (fr > 18000) continue;
      var w = TAU * fr / SR, c = 2 * Math.cos(w), ph = rnd() * TAU, y1 = Math.sin(ph - w), y2 = Math.sin(ph - 2 * w), e = parts[k][1], dk = Math.exp(-1 / (parts[k][2] * SR));
      for (i = 0; i < n; i++) { var y = c * y1 - y2; y2 = y1; y1 = y; out[i] += y * e; e *= dk; }
    }
    var a = Math.round((att || .004) * SR); for (i = 0; i < a && i < n; i++) out[i] *= .5 - .5 * Math.cos(Math.PI * i / a);
    var rel = Math.min(n, Math.round(.12 * SR)); for (i = 0; i < rel; i++) out[n - 1 - i] *= i / rel;
    return out;
  }
  function piano(freq, dur, vel) { // soft felt piano
    var parts = [], B = .00035, t0 = clamp(5.2 * Math.pow(220 / freq, .55), .7, 7), v = vel === undefined ? .7 : vel;
    for (var k = 1; k <= 14; k++) { var a = Math.pow(k, -1.75 - (1 - v) * .9) * (k === 1 ? 1 : .9); parts.push([k * Math.sqrt(1 + B * k * k), a * .72, t0 / (1 + .42 * (k - 1))]); parts.push([k * Math.sqrt(1 + B * k * k) * 1.0007, a * .28, t0 * 2.6 / (1 + .2 * (k - 1))]); }
    var out = additive(freq, dur, parts, .006), n = Math.min(out.length, Math.round(.03 * SR)), lp = 0;
    for (var i = 0; i < n; i++) { lp += .08 * (nz() - lp); out[i] += lp * .5 * v * (1 - i / n) * (1 - i / n); } // felt thump
    return out;
  }
  function bell(freq, dur, kind) { // 'rin' (singing bowl) | 'box' (music box) | 'cel' (celesta) | 'chime'
    var p = kind === 'rin' ? [[1, 1, dur * .45], [1.003, .6, dur * .5], [2.71, .34, dur * .22], [2.72, .2, dur * .2], [5.15, .1, dur * .1], [8.2, .04, dur * .05]] :
      kind === 'box' ? [[1, 1, .9], [2.0, .12, .5], [5.4, .22, .12], [8.9, .08, .05]] :
        kind === 'cel' ? [[1, 1, 1.3], [2, .28, .8], [3, .07, .45], [4.02, .1, .3], [6.3, .04, .12]] :
          [[1, 1, dur * .4], [2.0, .5, dur * .3], [2.99, .28, dur * .22], [4.2, .2, dur * .14], [5.43, .1, dur * .1], [6.8, .05, dur * .07]];
    return additive(freq, dur, p, kind === 'rin' ? .012 : .002);
  }
  function wood(freq, dur) { // small wooden strike
    var out = additive(freq, dur, [[1, 1, .045], [2.42, .5, .02], [4.1, .25, .01]], .0008), n = Math.min(out.length, 300);
    for (var i = 0; i < n; i++) out[i] += nz() * .5 * Math.pow(1 - i / n, 3);
    return out;
  }
  /* wavetable voices: strings / winds / horn / organ */
  var TS = 2048, tcache = {};
  var SPEC = {
    str: function (k, fr) { return (1 / k) * (1 / (1 + Math.pow(fr / 4300, 4))) * (1 + .9 * Math.exp(-Math.pow((fr - 520) / 260, 2)) + .5 * Math.exp(-Math.pow((fr - 2500) / 700, 2))); },
    strS: function (k, fr) { return (1 / Math.pow(k, 1.3)) * (1 / (1 + Math.pow(fr / 2400, 4))) * (1 + .7 * Math.exp(-Math.pow((fr - 480) / 260, 2))); },
    cla: function (k, fr) { return (k % 2 ? 1 / k : .07 / k) * (1 / (1 + Math.pow(fr / 2600, 4))); },
    flu: function (k, fr) { return [1, .34, .11, .05, .02, .01][k - 1] || 0; },
    obo: function (k, fr) { return (1 / Math.pow(k, .8)) * (.25 + Math.exp(-Math.pow((fr - 1150) / 520, 2)) + .4 * Math.exp(-Math.pow((fr - 2900) / 600, 2))) * (1 / (1 + Math.pow(fr / 4200, 4))); },
    hrn: function (k, fr) { return (1 / Math.pow(k, 1.25)) * (1 / (1 + Math.pow(fr / 1300, 3))); },
    hrnB: function (k, fr) { return (1 / k) * (1 / (1 + Math.pow(fr / 2600, 3))); },
    org: function (k, fr) { return ({ 1: 1, 2: .62, 3: .2, 4: .42, 6: .12, 8: .2 })[k] || 0; }
  };
  function table(kind, freq) {
    var key = kind + Math.round(freq); if (tcache[key]) return tcache[key];
    var t = new Float32Array(TS + 1), K = Math.min(48, Math.floor(15000 / freq)), k, i, pk = 0;
    for (k = 1; k <= K; k++) { var a = SPEC[kind](k, k * freq); if (a < 1e-4) continue; var ph = kind === 'org' ? 0 : rnd() * TAU; for (i = 0; i < TS; i++) t[i] += a * Math.sin(TAU * k * i / TS + ph); }
    for (i = 0; i < TS; i++) if (Math.abs(t[i]) > pk) pk = Math.abs(t[i]);
    for (i = 0; i < TS; i++) t[i] /= pk; t[TS] = t[0];
    return (tcache[key] = t);
  }
  /** sustained voice. o:{kind, kindB, att, rel, vib:[rate,depth,delay], det:[cents], swell:[pos,amount], bright:[b0,b1], breath, gliss:[fromHz, time]} */
  function voice(freq, dur, o) {
    var n = Math.round(dur * SR), out = new Float32Array(n), tA = table(o.kind, freq), tB = o.kindB ? table(o.kindB, freq) : null;
    var det = o.det || [0], nv = det.length, att = (o.att || .15) * SR, rel = (o.rel || .3) * SR, vib = o.vib || [5.4, .004, .25], sw = o.swell || [.5, 0], br = o.bright || [0, 0], i, v;
    var env = new Float32Array(n);
    for (i = 0; i < n; i++) {
      var e = i < att ? Math.pow(.5 - .5 * Math.cos(Math.PI * i / att), 1.2) : 1; if (i > n - rel) e *= Math.pow((n - i) / rel, 1.6);
      var u = i / n; e *= 1 + sw[1] * (Math.exp(-Math.pow((u - sw[0]) / .3, 2)) - .5); env[i] = e;
    }
    for (v = 0; v < nv; v++) {
      var f0 = freq * Math.pow(2, det[v] / 1200), ph = rnd() * TS, vr = vib[0] * (1 + (rnd() - .5) * .12), vp = rnd() * TAU, g = 1 / Math.sqrt(nv), drift = rnd() * 10;
      for (i = 0; i < n; i++) {
        var t = i / SR, vd = vib[1] * clamp((t - vib[2]) / .5, 0, 1), fi = f0 * (1 + vd * Math.sin(TAU * vr * t + vp) + .0008 * Math.sin(t * 1.3 + drift));
        if (o.gliss && t < o.gliss[1]) fi *= Math.pow(o.gliss[0] / freq, 1 - t / o.gliss[1]);
        ph += fi * TS / SR; if (ph >= TS) ph -= TS;
        var ip = ph | 0, fr = ph - ip, s = tA[ip] + fr * (tA[ip + 1] - tA[ip]);
        if (tB) { var b = clamp(br[0] + (br[1] - br[0]) * env[i], 0, 1); s = s * (1 - b) + (tB[ip] + fr * (tB[ip + 1] - tB[ip])) * b; }
        out[i] += s * g * env[i];
      }
    }
    if (o.breath) { var lp = 0, lp2 = 0, c = clamp(TAU * freq * 2.2 / SR, 0, .9); for (i = 0; i < n; i++) { lp += c * (nz() - lp); lp2 += c * .5 * (lp - lp2); out[i] += (lp - lp2) * o.breath * env[i]; } }
    return out;
  }
  /* formant-synthesised soprano / choir (a synthetic vocal timbre — not a recording of a singer) */
  var VOW = {
    a: [[800, 80, 1], [1150, 90, .5], [2900, 120, .05], [3900, 130, .1], [4950, 140, .01]],
    o: [[450, 70, 1], [800, 80, .3], [2830, 100, .08], [3800, 120, .08], [4950, 135, .006]],
    u: [[325, 50, 1], [700, 60, .16], [2700, 170, .03], [3800, 180, .02], [4950, 200, .002]]
  };
  /** line: [[t, midi], ...] sung legato from line[0].t for dur seconds. o:{vowel:[v0,v1], singers, vib, g} */
  function vox(line, dur, o) {
    var n = Math.round(dur * SR), out = new Float32Array(n), BL = 96, K = 22, singers = o.singers || 1, s, k, i;
    var att = (o.att || .5) * SR, rel = (o.rel || .9) * SR, v0 = VOW[o.vowel[0]], v1 = VOW[o.vowel[1]];
    for (s = 0; s < singers; s++) {
      var det = singers > 1 ? (s - (singers - 1) / 2) * 9 + (rnd() - .5) * 4 : 0, vr = 5.3 + rnd() * .7, vp = rnd() * TAU, lag = singers > 1 ? rnd() * .03 : 0;
      var ph = new Float64Array(K), amp = new Float64Array(K), tgt = new Float64Array(K), cur = line[0][1], idx = 0, lpn = 0, lpn2 = 0, fl = 0;
      for (k = 0; k < K; k++) ph[k] = rnd() * TAU;
      for (i = 0; i < n; i += BL) {
        var t = i / SR - lag; while (idx + 1 < line.length && t >= line[idx + 1][0] - line[0][0]) idx++;
        cur += (line[idx][1] - cur) * (1 - Math.exp(-BL / SR / .05)); // portamento
        var vdep = (o.vib === undefined ? .011 : o.vib) * clamp((t - .35) / .8, 0, 1), jit = .0015 * Math.sin(t * 2.3 + s * 3) + .001 * Math.sin(t * 7.1 + s);
        var f0 = hz(cur + det / 100) * (1 + vdep * Math.sin(TAU * vr * t + vp) + jit), mixv = clamp(t / dur, 0, 1), ev = 1;
        if (i < att) ev = Math.pow(.5 - .5 * Math.cos(Math.PI * i / att), 1.3); if (i > n - rel) ev *= Math.pow(Math.max(0, n - i) / rel, 1.5);
        var F1 = Math.max(v0[0][0] + (v1[0][0] - v0[0][0]) * mixv, f0 * 1.03);
        for (k = 0; k < K; k++) {
          var fr = f0 * (k + 1), a = 0;
          if (fr < 9000) { for (var j = 0; j < 5; j++) { var Fc = j === 0 ? F1 : v0[j][0] + (v1[j][0] - v0[j][0]) * mixv, bw = (v0[j][1] + (v1[j][1] - v0[j][1]) * mixv) * 1.5, ga = v0[j][2] + (v1[j][2] - v0[j][2]) * mixv, x = (fr - Fc) / bw; a += ga / (1 + x * x); } a *= Math.pow(k + 1, -1.15); }
          tgt[k] = a * ev;
        }
        var end = Math.min(n, i + BL);
        for (k = 0; k < K; k++) {
          if (tgt[k] < 1e-5 && amp[k] < 1e-5) { amp[k] = tgt[k]; continue; }
          var w = TAU * f0 * (k + 1) / SR, p = ph[k], a0 = amp[k], da = (tgt[k] - a0) / BL;
          for (var q = i; q < end; q++) { out[q] += Math.sin(p) * a0; p += w; a0 += da; }
          ph[k] = p % TAU; amp[k] = tgt[k];
        }
        for (q = i; q < end; q++) { lpn += .22 * (nz() - lpn); lpn2 += .05 * (lpn - lpn2); out[q] += (lpn - lpn2) * .05 * ev; } // breath
      }
    }
    var g = 1 / Math.sqrt(singers); for (i = 0; i < n; i++) out[i] *= g;
    return out;
  }
  /* noise shaping for foley */
  function biquadBP(buf, fc0, fc1, Q) { // band-pass with swept centre
    var n = buf.length, x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, a1 = 0, a2 = 0, a0 = 1;
    for (var i = 0; i < n; i++) {
      if ((i & 63) === 0) { var fc = fc0 * Math.pow(fc1 / fc0, i / n), w = TAU * fc / SR, al = Math.sin(w) / (2 * Q); a0 = 1 + al; b0 = al / a0; a1 = -2 * Math.cos(w) / a0; a2 = (1 - al) / a0; }
      var x = buf[i], y = b0 * x - b0 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; buf[i] = y;
    }
    return buf;
  }
  /** shaped noise. o:{f0,f1,Q, env(u)->amp, crackle(0..1), mod:[rate,depth]} */
  function noise(dur, o) {
    var n = Math.round(dur * SR), buf = new Float32Array(n), i, cr = o.crackle || 0, gate = 1, hold = 0;
    for (i = 0; i < n; i++) {
      var s = nz();
      if (cr) { if (hold-- <= 0) { gate = rnd() < cr ? Math.pow(rnd(), 2) * 1.6 : 0; hold = 20 + (rnd() * 500 | 0); } s *= gate; }
      buf[i] = s;
    }
    biquadBP(buf, o.f0, o.f1 || o.f0, o.Q || 1);
    for (i = 0; i < n; i++) { var u = i / n, e = o.env ? o.env(u) : Math.sin(Math.PI * u); if (o.mod) e *= 1 - o.mod[1] * (.5 + .5 * Math.sin(TAU * o.mod[0] * i / SR + (o.mod[2] || 0))); buf[i] *= e; }
    return buf;
  }
  function drop(f0, f1, dur) { // water / ink drop: rising chirp with fast decay
    var n = Math.round(dur * SR), out = new Float32Array(n), ph = 0;
    for (var i = 0; i < n; i++) { var u = i / n, fq = f0 * Math.pow(f1 / f0, Math.pow(u, .35)); ph += TAU * fq / SR; out[i] = Math.sin(ph) * Math.exp(-u * 9) * Math.min(1, i / 60); }
    return out;
  }
  function chirp(dur, fa, fb, wob) { // small bird
    var n = Math.round(dur * SR), out = new Float32Array(n), ph = 0;
    for (var i = 0; i < n; i++) { var u = i / n, fq = fa + (fb - fa) * u + Math.sin(u * wob * TAU) * 260; ph += TAU * fq / SR; out[i] = Math.sin(ph) * Math.pow(Math.sin(Math.PI * u), 1.5) * (.6 + .4 * Math.sin(u * wob * 2 * TAU)); }
    return out;
  }

  /* ---------------- reverb: FFT convolution with synthetic decaying-noise rooms ---------------- */
  function fft(re, im, inv) {
    var n = re.length, i, j = 0, k, t;
    for (i = 1; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (var len = 2; len <= n; len <<= 1) {
      var ang = TAU / len * (inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
      for (i = 0; i < n; i += len) {
        var cr = 1, ci = 0;
        for (k = 0; k < half; k++) {
          var a = i + k, b = a + half, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
    if (inv) for (i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  function makeIR(len, rtLo, rtHi, pre, sd) {
    var n = Math.round(len * SR), ir = new Float32Array(n), s = sd, lp = 0, lp2 = 0, p0 = Math.round(pre * SR), i, e = 0;
    function r() { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; }
    for (i = p0; i < n; i++) {
      var t = (i - p0) / SR, w = r() + r() + r(); lp += .14 * (w - lp); var hi = w - lp; lp2 += .45 * (hi - lp2);
      ir[i] = (lp * 1.05 * Math.exp(-6.91 * t / rtLo) + lp2 * Math.exp(-6.91 * t / rtHi)) * Math.min(1, t / .012);
    }
    [[.011, .5], [.017, -.42], [.023, .36], [.031, -.3], [.043, .24], [.057, -.18]].forEach(function (er, k) { var j = p0 + Math.round((er[0] + (sd % 7) * .0009 * (k + 1)) * SR); if (j < n) ir[j] += er[1] * .9; });
    for (i = 0; i < n; i++) e += ir[i] * ir[i]; e = Math.sqrt(e); for (i = 0; i < n; i++) ir[i] /= e;
    return ir;
  }
  function convolve(x, ir, out, gain) {
    var M = ir.length, size = 1; while (size < M * 2) size <<= 1; var hop = size - M, hr = new Float64Array(size), hi = new Float64Array(size), i;
    for (i = 0; i < M; i++) hr[i] = ir[i]; fft(hr, hi, false);
    var xr = new Float64Array(size), xi = new Float64Array(size);
    for (var pos = 0; pos < x.length; pos += hop) {
      xr.fill(0); xi.fill(0); var any = false, lim = Math.min(hop, x.length - pos);
      for (i = 0; i < lim; i++) { var v = x[pos + i]; xr[i] = v; if (v !== 0) any = true; }
      if (!any) continue;
      fft(xr, xi, false);
      for (i = 0; i < size; i++) { var a = xr[i], b = xi[i]; xr[i] = a * hr[i] - b * hi[i]; xi[i] = a * hi[i] + b * hr[i]; }
      fft(xr, xi, true);
      for (i = 0; i < size && pos + i < out.length; i++) out[pos + i] += xr[i] * gain;
    }
  }

  /* ---------------- 摇篮曲 ---------------- */
  function compose(log) {
    var mus = new Stem(), vocal = new Stem(), fol = new Stem();
    function box(n, t, g, pan) { mus.add(bell(f(n), 2.2, 'box'), t, { g: g, pan: pan || 0, hall: .5, cath: .15 }); }
    function harp(n, t, g, pan) { mus.add(pluck(f(n), 3.2, { t60: 3.4, bright: .4, damp: .34, pos: .3, body: .45 }), t, { g: g, pan: pan || 0, hall: .45 }); }
    function pad(n, t, dur, g, pan) { mus.add(voice(f(n), dur, { kind: 'strS', kindB: 'str', bright: [.04, .3], att: 1.2, rel: 1.8, vib: [5.2, .004, .5], det: [-7, 0, 6, 11], swell: [.5, .25] }), t, { g: g, pan: pan || 0, hall: .5, cath: .25 }); }
    function cel(n, t, g, pan) { mus.add(bell(f(n), 2.6, 'cel'), t, { g: g, pan: pan || 0, hall: .6, cath: .2 }); }
    var BAR = 2.4, Q = BAR / 3, T0 = .4;
    // 三段，各八小节：A A' B（最后一小节留白，接回开头）
    var A = [[['F#5', 0], ['A5', 2]], [['B5', 0]], [['A5', 0], ['F#5', 2]], [['E5', 0]], [['D5', 0], ['E5', 2]], [['F#5', 0], ['A5', 2]], [['E5', 0]], []];
    var A2 = [[['F#5', 0], ['A5', 2]], [['B5', 0]], [['A5', 0], ['F#5', 2]], [['E5', 0]], [['D5', 0], ['E5', 2]], [['F#5', 0], ['E5', 2]], [['D5', 0]], []];
    var B = [[['B5', 0], ['A5', 2]], [['F#5', 0]], [['A5', 0], ['F#5', 2]], [['E5', 0]], [['G5', 0], ['F#5', 2]], [['E5', 0], ['D5', 2]], [['E5', 0]], []];
    var CH = [['D3', 'A3', 'F#4'], ['B2', 'F#3', 'D4'], ['D3', 'A3', 'F#4'], ['A2', 'E3', 'C#4'], ['G2', 'D3', 'B3'], ['D3', 'A3', 'F#4'], ['A2', 'E3', 'C#4'], ['A2', 'E3', 'A3']];
    var CH2 = CH.slice(); CH2[6] = ['D3', 'A3', 'F#4']; CH2[7] = ['D3', 'A3', 'D4'];
    var CHB = [['G2', 'D3', 'B3'], ['D3', 'A3', 'F#4'], ['B2', 'F#3', 'D4'], ['A2', 'E3', 'C#4'], ['G2', 'D3', 'B3'], ['A2', 'E3', 'C#4'], ['A2', 'E3', 'A3'], ['A2', 'E3', 'C#4']];
    [[A, CH], [A2, CH2], [B, CHB]].forEach(function (sec, si) {
      for (var b = 0; b < 8; b++) {
        var t = T0 + (si * 8 + b) * BAR, ch = sec[1][b];
        sec[0][b].forEach(function (q) { box(q[0], t + q[1] * Q + (rnd() - .5) * .012, .26, .15); if (si === 2) box(m(q[0]) - 12, t + q[1] * Q + .02, .08, -.2); });
        harp(ch[0], t, .2, -.25); harp(ch[1], t + Q, .12, 0); harp(ch[2], t + 2 * Q, .12, .25);
        pad(ch[0], t - .2, BAR + .8, .045, -.2); pad(ch[2], t - .1, BAR + .7, .03, .2);
        if (b % 4 === 3) cel(m(ch[2]) + 24, t + 1.5 * Q, .05, .4);
      }
    });
    return { music: mus, vocal: vocal, foley: fol };
  }

  /* ---------------- master ---------------- */
  function finishStem(st, irs, log) {
    convolve(st.hall, irs.hallL, st.L, 1); convolve(st.hall, irs.hallR, st.R, 1);
    convolve(st.cath, irs.cathL, st.L, 1); convolve(st.cath, irs.cathR, st.R, 1);
    st.hall = st.cath = null;
    // 28 Hz high-pass
    [st.L, st.R].forEach(function (x) { var y1 = 0, x1 = 0, a = 1 / (1 + TAU * 28 / SR); for (var i = 0; i < N; i++) { var y = a * (y1 + x[i] - x1); x1 = x[i]; y1 = y; x[i] = y; } });
  }
  /** RBJ shelving filter, in place. type 'lo' | 'hi' */
  function shelf(x, type, fc, gainDb) {
    var A = Math.pow(10, gainDb / 40), w = TAU * fc / SR, cs = Math.cos(w), al = Math.sin(w) / 2 * Math.SQRT2, sq = 2 * Math.sqrt(A) * al, b0, b1, b2, a0, a1, a2;
    if (type === 'lo') { b0 = A * ((A + 1) - (A - 1) * cs + sq); b1 = 2 * A * ((A - 1) - (A + 1) * cs); b2 = A * ((A + 1) - (A - 1) * cs - sq); a0 = (A + 1) + (A - 1) * cs + sq; a1 = -2 * ((A - 1) + (A + 1) * cs); a2 = (A + 1) + (A - 1) * cs - sq; }
    else { b0 = A * ((A + 1) + (A - 1) * cs + sq); b1 = -2 * A * ((A - 1) + (A + 1) * cs); b2 = A * ((A + 1) + (A - 1) * cs - sq); a0 = (A + 1) - (A - 1) * cs + sq; a1 = 2 * ((A - 1) - (A + 1) * cs); a2 = (A + 1) - (A - 1) * cs - sq; }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (var i = 0; i < x.length; i++) { var xi = x[i], y = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = xi; y2 = y1; y1 = y; x[i] = y; }
  }
  function limiter(L, R, ceil) {
    var LA = 288, g = new Float32Array(N), i, dq = new Int32Array(N), head = 0, tail = 0, red = 0, mnG = 1;
    for (i = 0; i < N; i++) { var pk = Math.max(Math.abs(L[i]), Math.abs(R[i])); g[i] = pk > ceil ? ceil / pk : 1; }
    var mn = new Float32Array(N);
    for (i = 0; i < N + LA; i++) { // sliding minimum over the look-ahead window
      if (i < N) { while (tail > head && g[dq[tail - 1]] >= g[i]) tail--; dq[tail++] = i; }
      var j = i - LA; if (j < 0) continue; while (dq[head] < j) head++; mn[j] = g[dq[head]];
    }
    var e = 1, aC = Math.exp(-1 / (.0012 * SR)), rC = Math.exp(-1 / (.22 * SR));
    for (i = 0; i < N; i++) { var tg = mn[i]; e = tg < e ? tg + (e - tg) * aC : tg + (e - tg) * rC; var gg = Math.min(e, g[i] < 1 ? g[i] : 1, 1); if (gg < .944) red++; if (gg < mnG) mnG = gg; L[i] *= gg; R[i] *= gg; }
    limiter.maxGR = -20 * Math.log10(mnG);
    return red / N;
  }
  /** Render everything. opts:{gain (dB, applied to the full mix before limiting)} -> {sr, mix:{L,R}, stems:{music,vocal,foley}, stats} */
  function render(opts, log) {
    opts = opts || {}; log = log || function () { };
    var t0 = Date.now(); seed = 20261113; tcache = {};
    var stems = compose(log); log('composed in ' + (Date.now() - t0) + ' ms');
    var irs = { hallL: makeIR(3.4, 2.9, 1.5, .018, 9001), hallR: makeIR(3.4, 2.9, 1.5, .021, 9203), cathL: makeIR(5.4, 5.6, 2.4, .034, 9407), cathR: makeIR(5.4, 5.6, 2.4, .039, 9601) };
    ['music', 'vocal', 'foley'].forEach(function (k) { finishStem(stems[k], irs, log); });
    // tone: keep the warmth, clear the mud, let the air through (so it also speaks on small speakers)
    [stems.music.L, stems.music.R].forEach(function (x) { shelf(x, 'lo', 190, -6.5); shelf(x, 'hi', 3600, 4); });
    [stems.vocal.L, stems.vocal.R].forEach(function (x) { shelf(x, 'lo', 260, -8); shelf(x, 'hi', 4200, 2.5); });
    log('reverb done at ' + (Date.now() - t0) + ' ms');
    var G = db(opts.gain === undefined ? 0 : opts.gain), L = new Float32Array(N), R = new Float32Array(N), i;
    var secs = [[0, 62]];
    function rmsOf(Ls, Rs, a, b) { var e = 0; for (var j = a; j < b; j++) e += Ls[j] * Ls[j] + Rs[j] * Rs[j]; return 10 * Math.log10(e / (2 * (b - a)) + 1e-12); }
    // --- mastering ride: bring each act to its place on the dynamic curve (quiet → tender → grand → intimate → sacred → still)
    var TARGET = opts.target || [-22], pre = [], trim = [];
    secs.forEach(function (sc, k) {
      var a = sc[0] * SR, b = sc[1] * SR, e = 0;
      ['music', 'vocal', 'foley'].forEach(function (key) { var st = stems[key]; log('  pre ' + key + ' ' + sc[0] + '-' + sc[1] + ': ' + rmsOf(st.L, st.R, a, b).toFixed(1) + ' dB'); });
      for (var j = a; j < b; j++) { var l = stems.music.L[j] + stems.vocal.L[j] + stems.foley.L[j], r = stems.music.R[j] + stems.vocal.R[j] + stems.foley.R[j]; e += l * l + r * r; }
      pre.push(10 * Math.log10(e / (2 * (b - a)) + 1e-12)); trim.push(db(TARGET[k] - pre[k]));
    });
    log('  pre-master rms: ' + pre.map(function (x) { return x.toFixed(1); }).join('  ') + '   trims dB: ' + trim.map(function (x) { return (20 * Math.log10(x)).toFixed(1); }).join('  '));
    var ride = new Float32Array(N), XF = 2.2 * SR;
    for (i = 0; i < N; i++) {
      var k = 0, KL = secs.length - 1; while (k < KL && i >= secs[k][1] * SR) k++;
      var g = trim[k], dn = secs[k][1] * SR - i, up = i - secs[k][0] * SR;
      if (k < KL && dn < XF / 2) g = trim[k] + (trim[k + 1] - trim[k]) * (.5 - .5 * Math.cos(Math.PI * (.5 - dn / XF)));
      else if (k > 0 && up < XF / 2) g = trim[k - 1] + (trim[k] - trim[k - 1]) * (.5 - .5 * Math.cos(Math.PI * (.5 + up / XF)));
      ride[i] = g;
    }
    // natural ending: everything is silent by 149.9 s
    var fo0 = 60.4 * SR, fo1 = 61.95 * SR;
    ['music', 'vocal', 'foley'].forEach(function (k) { var s = stems[k]; for (i = 0; i < N; i++) { var fd = (i < fo0 ? 1 : i > fo1 ? 0 : .5 + .5 * Math.cos(Math.PI * (i - fo0) / (fo1 - fo0))) * G * ride[i]; s.L[i] *= fd; s.R[i] *= fd; L[i] += s.L[i]; R[i] += s.R[i]; } });
    var red = limiter(L, R, db(-1.5));
    // section loudness report
    var stats = [];
    secs.forEach(function (s) { var a = s[0] * SR, b = s[1] * SR, e = 0, pk = 0; for (i = a; i < b; i++) { e += L[i] * L[i] + R[i] * R[i]; var p = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (p > pk) pk = p; } stats.push({ sec: s, rms: 10 * Math.log10(e / (2 * (b - a)) + 1e-12), peak: 20 * Math.log10(pk + 1e-9) }); });
    log('gain reduction > 0.5 dB on ' + (red * 100).toFixed(2) + '% of samples, max ' + limiter.maxGR.toFixed(1) + ' dB; total ' + (Date.now() - t0) + ' ms');
    return { sr: SR, mix: { L: L, R: R }, stems: stems, stats: stats };
  }
  function wav(L, R) { // 16-bit PCM with TPDF dither
    var n = L.length, buf = Buffer.alloc(44 + n * 4), o = 44;
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
    buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
    for (var i = 0; i < n; i++) {
      var d = (rnd() - rnd()) / 32768, a = Math.round(clamp(L[i] + d, -1, 1) * 32767), b = Math.round(clamp(R[i] + d, -1, 1) * 32767);
      buf.writeInt16LE(a, o); buf.writeInt16LE(b, o + 2); o += 4;
    }
    return buf;
  }
  var API = { render: render, wav: wav, SR: SR, DUR: DUR };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SCORE = API;
})(typeof window !== 'undefined' ? window : globalThis);
