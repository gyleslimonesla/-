/* score.js — the original soundtrack of FROM HAIKU TO MYTHOS, synthesised from nothing but arithmetic.
   One five-note motif (A B D E B → D) travels through five orchestrations on the film's master clock.
   Pure JS DSP (no samples, no recordings): runs in Node (tools/audio.mjs) and renders 48 kHz stereo stems. */
(function (root) {
  'use strict';
  var SR = 48000, DUR = 150, N = SR * DUR, TAU = Math.PI * 2;
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

  /* ---------------- the score ---------------- */
  function compose(log) {
    var mus = new Stem(), vocal = new Stem(), fol = new Stem();
    var MOT = ['A4', 'B4', 'D5', 'E5', 'B4'];
    function koto(n, t, g, pan, dur) { mus.add(pluck(f(n), dur || 3.2, { t60: 3.0, bright: .85, damp: .22, pos: .13, body: .7 }), t, { g: g, pan: pan || 0, hall: .5 }); }
    function harp(n, t, g, pan, dur) { mus.add(pluck(f(n), dur || 3.4, { t60: 3.6, bright: .42, damp: .34, pos: .3, body: .45 }), t, { g: g, pan: pan || 0, hall: .42 }); }
    function pno(n, t, dur, g, pan, vel) { mus.add(piano(f(n), dur, vel), t, { g: g, pan: pan || 0, hall: .5 }); }
    function bel(n, t, dur, g, kind, pan, cath) { mus.add(bell(f(n), dur, kind), t, { g: g, pan: pan || 0, hall: cath ? .2 : .55, cath: cath || 0 }); }
    function str(n, t, dur, g, pan, o) { o = o || {}; mus.add(voice(f(n), dur, { kind: o.soft ? 'strS' : 'strS', kindB: 'str', bright: o.bright || [.1, .6], att: o.att || .5, rel: o.rel || .8, vib: o.vib || [5.4, .0045, .3], det: o.det || [-7, 0, 6, 11], swell: o.swell || [.55, .35] }), t, { g: g, pan: pan || 0, hall: o.hall === undefined ? .5 : o.hall, cath: o.cath || 0 }); }
    function solo(n, t, dur, g, pan, o) { o = o || {}; mus.add(voice(f(n), dur, { kind: 'strS', kindB: 'str', bright: [.3, .85], att: o.att || .12, rel: o.rel || .3, vib: [5.8, .0065, .12], det: [0, 3], swell: [.5, .3] }), t, { g: g, pan: pan || 0, hall: .46 }); }
    function wind(kind, n, t, dur, g, pan, o) { o = o || {}; mus.add(voice(f(n), dur, { kind: kind, att: o.att || .07, rel: o.rel || .16, vib: o.vib || [5, .003, .25], det: [0], swell: [.45, .25], breath: kind === 'flu' ? .09 : .025, gliss: o.gliss }), t, { g: g, pan: pan || 0, hall: .45, cath: o.cath || 0 }); }
    function horn(n, t, dur, g, pan, o) { o = o || {}; mus.add(voice(f(n), dur, { kind: 'hrn', kindB: 'hrnB', bright: o.bright || [0, .55], att: o.att || .16, rel: o.rel || .5, vib: [4.8, .0015, .5], det: [0, 4], swell: o.swell || [.5, .4] }), t, { g: g, pan: pan || 0, hall: .6, cath: o.cath || 0 }); }
    function organ(n, t, dur, g, pan) { mus.add(voice(f(n), dur, { kind: 'org', att: .9, rel: 1.6, vib: [.7, .0012, 0], det: [-3, 3], swell: [.5, .15] }), t, { g: g, pan: pan || 0, hall: .2, cath: .7 }); }
    function timp(n, t, g) { var fr = f(n); mus.add(additive(fr, 2.6, [[1, 1, .7], [1.5, .5, .4], [1.98, .35, .3], [2.44, .16, .2], [.5, .25, .25]], .004), t, { g: g, hall: .6 }); }
    function chord(fn, notes, t, dur, g, spread) { notes.forEach(function (n, i) { fn(n, t, dur, g, spread ? (i / (notes.length - 1) - .5) * spread : 0); }); }

    /* ===== 0. PROLOGUE 0–12: the motif is found, one note at a time ===== */
    bel('A5', .3, 7, .055, 'rin', 0, .5);
    str('D2', 1.0, 11.6, .028, -.2, { att: 5, rel: 3, det: [-5, 4], bright: [0, .2], swell: [.7, .4] });
    str('A2', 2.2, 10.4, .026, .2, { att: 5, rel: 3, det: [-5, 4], bright: [0, .2], swell: [.7, .4] });
    str('A4', 2.0, 9.6, .018, 0, { att: 4, rel: 3, det: [-6, 5], bright: [0, .3] });
    [[3.0, 'A4'], [4.3, 'B4'], [6.25, 'D5'], [7.3, 'E5'], [8.5, 'B4']].forEach(function (q, i) { pno(q[1], q[0], 5, .2 + i * .01, (i - 2) * .08, .45); });
    chord(function (n, t, d, g, pan) { str(n, t, d, g, pan, { att: 1.6, rel: 2.6, bright: [0, .35] }); }, ['D3', 'A3', 'E4', 'A4'], 9.5, 4.6, .05, .8);
    harp('D3', 9.6, .2, -.2); harp('A3', 9.85, .17, 0); harp('E4', 10.1, .16, .15); harp('A4', 10.35, .15, .25); harp('D5', 10.7, .15, .1);

    /* ===== I. HAIKU 12–38: seventeen notes in 5–7–5, koto and air ===== */
    bel('D5', 12.15, 8, .07, 'rin', -.25, .4);
    var hk = [[13.0, 'A4'], [14.0, 'B4'], [15.0, 'D5'], [16.0, 'E5'], [17.0, 'B4'],
      [20.0, 'B4'], [20.75, 'D5'], [21.5, 'E5'], [22.25, 'G5'], [23.0, 'E5'], [23.75, 'D5'], [24.5, 'B4'],
      [27.0, 'A4'], [28.0, 'B4'], [29.0, 'D5'], [30.0, 'E5'], [31.0, 'D5']];
    hk.forEach(function (q, i) { koto(q[1], q[0] + (rnd() - .5) * .016, .34 + (i % 5 === 4 ? .04 : 0), (i % 5 - 2) * .12, 4.2); });
    [[13.0, 'D3'], [17.0, 'A2'], [20.0, 'D3'], [24.5, 'G2'], [27.0, 'D3'], [31.0, 'D2']].forEach(function (q) { koto(q[1], q[0] + .03, .17, -.15, 5.5); });
    [18.7, 25.9].forEach(function (t, i) { mus.add(wood(f(i ? 'E5' : 'D5') * 1.0, .3), t, { g: .1, pan: .3, hall: .6 }); mus.add(wood(f('A4'), .3), t + .42, { g: .06, pan: .35, hall: .6 }); });
    bel('A5', 19.4, 7, .05, 'rin', .3, .4); bel('E5', 26.4, 7, .05, 'rin', -.3, .4);
    wind('flu', 'D5', 30.9, 4.4, .07, .1, { att: .9, rel: 2.2, vib: [4.6, .006, .8], gliss: [f('C#5'), .25] }); // a breath, like shakuhachi
    wind('flu', 'A4', 23.9, 3.6, .04, -.2, { att: 1.0, rel: 2.0, vib: [4.4, .006, .8] });
    // water: the leaf lands (34.3 s), rings open into harp and the major third arrives
    bel('E6', 34.36, 5, .045, 'rin', 0, .5);
    [['D3', 35.2], ['A3', 35.6], ['D4', 36.0], ['F#4', 36.35], ['A4', 36.7], ['D5', 37.0], ['F#5', 37.3], ['A5', 37.6]].forEach(function (q, i) { harp(q[0], q[1], .15 + i * .014, (i / 7 - .5) * .7); });
    str('D3', 35.4, 3.4, .05, -.2, { att: 2.0, rel: 1.2, bright: [0, .3] }); str('A3', 35.8, 3.0, .045, .2, { att: 2.0, rel: 1.2, bright: [0, .3] });

    /* ===== II. SONNET 38–66: 3/4, fourteen bars = fourteen lines (4+4+3+3) ===== */
    var S0 = 38, BAR = 2, BT = BAR / 3;
    var prog = [['D3', ['D4', 'F#4', 'A4']], ['B2', ['D4', 'F#4', 'B4']], ['G2', ['D4', 'G4', 'B4']], ['A2', ['C#4', 'E4', 'A4']],
      ['F#2', ['D4', 'F#4', 'A4']], ['B2', ['D4', 'F#4', 'B4']], ['E3', ['D4', 'G4', 'B4']], ['A2', ['C#4', 'E4', 'G4']],
      ['G2', ['B3', 'D4', 'G4']], ['F#2', ['C#4', 'F#4', 'A4']], ['B2', ['B3', 'D4', 'F#4']],
      ['G2', ['B3', 'D4', 'G4']], ['A2', ['C#4', 'E4', 'G4']], ['D3', ['D4', 'F#4', 'A4']]];
    var mel = [[['A4', 0, 1], ['B4', 1, 1], ['D5', 2, 1]], [['E5', 0, 2], ['B4', 2, 1]], [['D5', 0, 1], ['E5', 1, 1], ['G5', 2, 1]], [['F#5', 0, 2], ['E5', 2, 1]],
      [['F#5', 0, 1], ['G5', 1, 1], ['A5', 2, 1]], [['B5', 0, 2], ['F#5', 2, 1]], [['G5', 0, 1], ['F#5', 1, 1], ['E5', 2, 1]], [['C#5', 0, 2], ['E5', 2, 1]],
      [['B4', 0, 1], ['D5', 1, 1], ['G5', 2, 1]], [['A5', 0, 2], ['F#5', 2, 1]], [['F#5', 0, 1], ['E5', 1, 1], ['D5', 2, 1]],
      [['E5', 0, 1], ['D5', 1, 1], ['B4', 2, 1]], [], []];
    prog.forEach(function (ch, b) {
      var t = S0 + b * BAR, dyn = b < 4 ? .8 : b < 8 ? 1 : b < 11 ? .9 : .75, last = b >= 12;
      // harp: broken chord in quavers
      var arp = [ch[0], ch[1][0], ch[1][1], ch[1][2], ch[1][1], ch[1][0]];
      if (!last) arp.forEach(function (n, i) { harp(n === ch[0] ? m(n) + 12 : n, t + i * BT / 2 + (rnd() - .5) * .012, (i === 0 ? .2 : .13) * dyn, (i / 5 - .5) * .6, 2.6); });
      else { harp(m(ch[0]) + 12, t, .16, -.2, 4); harp(ch[1][1], t + .08, .12, .1, 4); }
      // quartet: cello on the root, inner voices from bar 3
      str(ch[0], t, BAR + .5, (b < 2 ? .035 : .055) * dyn, -.25, { att: .35, rel: .7, det: [-4, 3], swell: [.3, .3] });
      if (b >= 2) { str(ch[1][0], t, BAR + .4, .05 * dyn, .1, { att: .4, rel: .7, det: [-3, 4] }); str(ch[1][1], t, BAR + .4, .045 * dyn, .32, { att: .4, rel: .7, det: [-4, 3] }); }
      // melody: felt piano (first quatrain), solo violin (second), both in the tercets
      mel[b].forEach(function (q) {
        var tt = t + q[1] * BT, d = q[2] * BT;
        if (b < 4 || b >= 8) pno(q[0], tt, d + 2.2, (b < 4 ? .3 : .2) * dyn, -.1, .6);
        if (b >= 4 && b < 12) solo(q[0], tt, d + .12, (b < 8 ? .12 : .1) * dyn, .22);
        if (b >= 8 && b < 11) solo(m(q[0]) - 12, tt, d + .12, .05, -.3);
      });
    });
    // each of the fourteen lines is ruled with one soft celesta tone (on the dotted-crotchet grid)
    ['A5', 'F#5', 'D5', 'E5', 'F#5', 'A5', 'B5', 'A5', 'G5', 'F#5', 'D5', 'E5', 'G5', 'F#5'].forEach(function (n, k) { bel(n, 44 + k * 1.0, 1.6, .05, 'cel', (k % 2 ? .35 : -.35)); });
    // the motif is written on the stave, note by note (63.0–65.5 s) — and resolves
    ['A4', 'B4', 'D5', 'E5', 'B4', 'D5'].forEach(function (n, i) { bel(m(n) + 12, 63 + i * .5, 2.2, .12, 'cel', (i - 2.5) * .12); harp(n, 63 + i * .5, .12, (i - 2.5) * .1, 3); });
    [['D3', 63.2], ['G2', 64.2], ['A3', 65.2]].forEach(function (q) { pno(q[0], q[1], 4, .14, -.2, .4); });

    /* ===== III. OPUS 66–94: 4/4, eight broad bars; the motif augmented, a hall built in sound ===== */
    var O0 = 66, OB = 3.5, OQ = OB / 4;
    var op = [['D2', ['A3', 'D4', 'F#4']], ['C#2', ['A3', 'C#4', 'E4']], ['B1', ['B3', 'D4', 'F#4']], ['G1', ['B3', 'D4', 'G4']],
      ['F#2', ['A3', 'D4', 'F#4']], ['E2', ['G3', 'B3', 'E4'], ['A1', ['A3', 'C#4', 'E4']]], ['B1', ['B3', 'D4', 'F#4'], ['G1', ['B3', 'D4', 'G4']]], ['D2', ['A3', 'D4', 'F#4']]];
    var om = [[['A4', 0, 2], ['B4', 2, 2]], [['D5', 0, 2], ['E5', 2, 2]], [['B4', 0, 4]], [['D5', 0, 2], ['E5', 2, 1], ['G5', 3, 1]],
      [['A5', 0, 2], ['B5', 2, 1], ['A5', 3, 1]], [['G5', 0, 2], ['E5', 2, 1], ['A5', 3, 1]], [['F#5', 0, 2], ['D5', 2, 1], ['B5', 3, 1]], [['A5', 0, 3.6]]];
    var odyn = [.5, .58, .68, .76, .9, 1.0, 1.0, .62];
    timp('D2', O0, .1);
    op.forEach(function (ch, b) {
      var t = O0 + b * OB, dy = odyn[b];
      var halves = ch.length > 2 ? [[ch[0], ch[1], 0, 2], [ch[2][0], ch[2][1], 2, 2]] : [[ch[0], ch[1], 0, 4]];
      halves.forEach(function (h) {
        var tt = t + h[2] * OQ, d = h[3] * OQ + .5;
        str(h[0], tt, d, .085 * dy, -.1, { att: .5, rel: .9, det: [-6, 5], bright: [.2, .6] });                 // basses
        str(m(h[0]) + 12, tt, d, .085 * dy, -.3, { att: .5, rel: .9 });                                        // celli
        h[1].forEach(function (n, i) { str(n, tt, d, .085 * dy, [-.05, .2, .4][i], { att: .6, rel: .9 }); });  // violas / violins II
        if (b >= 4) h[1].forEach(function (n, i) { if (i < 2) horn(n, tt, d, .07 * dy, [-.45, .45][i], { att: .4, rel: .8 }); });
        if (b >= 2) { harp(m(h[0]) + 24, tt, .14 * dy, -.3, 3); h[1].forEach(function (n, i) { harp(m(n) + (i === 2 ? 12 : 0), tt + .11 * (i + 1), .1 * dy, .1 * i, 3); }); }
        if (b >= 4 && b < 7) timp(m(h[0]) + (m(h[0]) < 36 ? 12 : 0), tt, .12 * dy);
      });
      // inner motion from bar 5: quaver arpeggios in the violas
      if (b >= 4 && b < 7) for (var e = 0; e < 8; e++) { var hh = halves[halves.length > 1 && e >= 4 ? 1 : 0], n = hh[1][[0, 1, 2, 1][e % 4]]; solo(m(n) + 12, t + e * OQ / 2, OQ / 2 + .05, .035 * dy, .15, { att: .04, rel: .1 }); }
      // melody: horn alone, then violins in octaves
      om[b].forEach(function (q) {
        var tt = t + q[1] * OQ, d = q[2] * OQ + .25;
        horn(b < 4 ? q[0] : m(q[0]) - 12, tt, d, (b < 2 ? .2 : .17) * dy, .12, { bright: [.05, .6 + dy * .3], att: .12, rel: .45 });
        if (b >= 2) str(q[0], tt, d, .15 * dy, .3, { att: .2, rel: .5, det: [-8, -3, 3, 8, 13], bright: [.2, .85], vib: [5.6, .006, .2] });
        if (b >= 4) str(m(q[0]) + 12, tt, d, .06 * dy, .45, { att: .25, rel: .5, det: [-7, 0, 7], bright: [.1, .6], vib: [5.8, .006, .2] });
      });
    });
    horn('A3', 91.3, 1.0, .07, -.3); horn('B3', 92.0, 1.0, .07, -.3); horn('D4', 92.7, 2.6, .07, -.3, { rel: 1.6 }); // the motif, left open

    /* ===== IV. FABLE 94–119: 6/8, G major with borrowed colours; clarinet tells, music box listens ===== */
    var F0 = 94, FB = 2.5, FE = FB / 6;
    var fp = [['G2', ['B4', 'D5', 'G5']], ['E2', ['B4', 'E5', 'G5']], ['C3', ['C5', 'E5', 'G5']], ['D3', ['A4', 'D5', 'F#5']], ['G2', ['B4', 'D5', 'G5']],
      ['B2', ['B4', 'D5', 'F#5']], ['C3', ['C5', 'E5', 'G5'], ['C3', ['C5', 'Eb5', 'G5']]], ['D3', ['B4', 'D5', 'G5']], ['Eb3', ['Bb4', 'Eb5', 'G5'], ['F3', ['A4', 'C5', 'F5']]], ['D3', ['A4', 'D5', 'F#5']]];
    var fm = [[['D5', 0, 2], ['E5', 2, 1], ['G5', 3, 2], ['A5', 5, 1]], [['E5', 0, 3], ['B4', 5, 1]], [['C5', 0, 2], ['D5', 2, 1], ['E5', 3, 2], ['G5', 5, 1]], [['F#5', 0, 3], ['D5', 3, 3]],
      [['B5', 0, 2], ['A5', 2, 1], ['G5', 3, 2], ['E5', 5, 1]], [['F#5', 0, 3], ['D5', 3, 2], ['F#5', 5, 1]], [['G5', 0, 2], ['E5', 2, 1], ['Eb5', 3, 3]], [['D5', 0, 3], ['B4', 3, 3]],
      [['G5', 0, 2], ['Eb5', 2, 1], ['F5', 3, 2], ['A5', 5, 1]], [['A5', 0, 6]]];
    fp.forEach(function (ch, b) {
      var t = F0 + b * FB, dy = b < 8 ? 1 : b === 8 ? .8 : .55;
      var halves = ch.length > 2 ? [[ch[0], ch[1]], [ch[2][0], ch[2][1]]] : [[ch[0], ch[1]], [ch[0], ch[1]]];
      halves.forEach(function (h, k) {
        var tt = t + k * 3 * FE;
        harp(h[0], tt, .15 * dy, -.25, 2.4); mus.add(pluck(f(m(h[0]) + 12), 1.4, { t60: .9, bright: .3, damp: .4, pos: .4, body: .35 }), tt, { g: .11 * dy, pan: -.1, hall: .35 }); // pizzicato bass
        if (b < 9) [0, 1, 2].forEach(function (i) { bel(m(h[1][(i + k) % 3]) + 12, tt + i * FE + .01, 1.4, .055 * dy, 'box', .25 + i * .12); }); // music box
        str(h[1][0], tt, 3 * FE + .4, .04 * dy, .1, { att: .3, rel: .6, det: [-4, 4], bright: [0, .3] }); str(h[1][1], tt, 3 * FE + .4, .035 * dy, .3, { att: .3, rel: .6, det: [-4, 4], bright: [0, .3] });
      });
      fm[b].forEach(function (q) {
        var tt = t + q[1] * FE, d = q[2] * FE + .06, fl = b >= 4 && b < 8;
        if (!fl || b === 5) wind('cla', m(q[0]) - 12, tt, d, .2 * dy, -.18, b === 9 ? { rel: 3.0, att: .2 } : null);
        if (fl) wind('flu', q[0], tt, d, .1 * dy, .25);
        if (b === 8) wind('obo', q[0], tt, d, .05, .2);
      });
    });
    // the fox looks up: each star of each constellation is one glass note (114.6–119 s)
    var starNotes = ['A5', 'B5', 'D6', 'E6', 'F#6', 'A6'];
    [114.6, 115.5, 116.5, 117.4].forEach(function (t0, c) { for (var j = 0; j < 5; j++) bel(m(starNotes[(j + c) % 6]), t0 + .1 + j * .29, 2.4, .05, 'cel', (c % 2 ? .5 : -.5) + j * .05 * (c % 2 ? -1 : 1), .3); });
    str('D3', 114, 6.2, .07, -.2, { att: 3.4, rel: 1.4, cath: .3, bright: [0, .4] }); str('A3', 114.6, 5.6, .06, .2, { att: 3.2, rel: 1.4, cath: .3, bright: [0, .4] }); str('E4', 115.4, 4.8, .05, 0, { att: 3, rel: 1.4, cath: .3, bright: [0, .4] });

    /* ===== V. MYTHOS 119–142: D Lydian, six slow bars; the motif sung ===== */
    var M0 = 119, MB = 23 / 6, MQ = MB / 4;
    var mp = [['D2', ['A3', 'D4', 'E4', 'F#4']], ['D2', ['B3', 'E4', 'G#4']], ['B1', ['A3', 'D4', 'F#4']], ['G1', ['B3', 'D4', 'F#4']], ['A1', ['A3', 'D4', 'E4'], ['A1', ['A3', 'C#4', 'E4']]], ['D2', ['A3', 'D4', 'F#4']]];
    var mdyn = [.62, .72, .8, .9, 1.0, .6];
    bel('D4', M0, 9, .08, 'chime', 0, .8); timp('D2', M0, .09);
    mp.forEach(function (ch, b) {
      var t = M0 + b * MB, dy = mdyn[b];
      var halves = ch.length > 2 ? [[ch[0], ch[1], 0, 2], [ch[2][0], ch[2][1], 2, 2]] : [[ch[0], ch[1], 0, 4]];
      halves.forEach(function (h) {
        var tt = t + h[2] * MQ, d = h[3] * MQ + .7, tail = b === 5 ? 2.2 : 0;
        organ(h[0], tt, d + tail, .085 * dy, 0); organ(m(h[0]) + 12, tt, d + tail, .07 * dy, 0);
        str(h[0], tt, d + tail, .07 * dy, -.1, { att: .8, rel: 1.2 + tail, det: [-6, 5], cath: .35 }); str(m(h[0]) + 12, tt, d + tail, .075 * dy, -.3, { att: .8, rel: 1.2 + tail, cath: .35 });
        h[1].forEach(function (n, i) {
          str(n, tt, d + tail, .075 * dy, -.2 + i * .2, { att: .9, rel: 1.2 + tail, cath: .35 }); str(m(n) + 12, tt, d + tail, .04 * dy, .3 - i * .2, { att: 1.0, rel: 1.2 + tail, cath: .35, det: [-6, 0, 7] });
          organ(n, tt, d + tail, .035 * dy, (i - 1.5) * .3);
          // choir pad: closed "oo" opening toward "ah" at the climax
          vocal.add(vox([[0, m(n) + 12]], d + tail + .4, { vowel: b < 3 ? ['u', 'o'] : ['o', 'a'], singers: 3, vib: .006, att: 1.2, rel: 1.6 }), tt - .1, { g: .0085 * dy, pan: (i - 1.5) * .45, hall: .2, cath: .9 });
        });
        if (b >= 3 && b < 5) { horn(h[1][0], tt, d, .07 * dy, -.4, { cath: .4 }); horn(h[1][2] || h[1][1], tt, d, .06 * dy, .4, { cath: .4 }); }
      });
      // harp: slow rising figures through the chord
      var notes = [m(ch[0]) + 24].concat(ch[1].map(function (n) { return m(n); })).concat(ch[1].map(function (n) { return m(n) + 12; }));
      if (b < 5) for (var e = 0; e < 8; e++) harp(notes[e % notes.length], t + e * MQ / 2, (.12 + (e % 4 === 0 ? .04 : 0)) * dy, (e / 7 - .5) * .8, 3.2);
      if (b === 4) timp('A1', t, .1);
      if (b > 0 && b < 5) bel(m(ch[1][ch[1].length - 1]) + 12, t, 5, .05, 'chime', .3, .7);
    });
    // soprano vocalise: A B D E B — D E F# — A (G#) F# — E D
    var sop = [[0, 'A4'], [2, 'B4'], [4, 'D5'], [6, 'E5'], [9, 'B4'], [10, 'D5'], [11, 'E5'], [12, 'F#5'], [14, 'A5'], [17, 'G#5'], [18, 'F#5'], [20, 'E5'], [21, 'D5']];
    var sopT0 = M0 + 2 * MQ, line = sop.map(function (q) { return [q[0] * MQ, m(q[1])]; });
    vocal.add(vox(line, 22.9 * MQ, { vowel: ['o', 'a'], singers: 1, vib: .012, att: .9, rel: 2.6 }), sopT0, { g: .075, pan: 0, hall: .25, cath: .8 });
    vocal.add(vox(line.map(function (q) { return [q[0], q[1] - 12]; }).filter(function (q, i) { return i >= 3; }), 22.9 * MQ - 6 * MQ, { vowel: ['u', 'o'], singers: 3, vib: .007, att: 1.4, rel: 2.6 }), sopT0 + 6 * MQ, { g: .022, pan: 0, hall: .2, cath: .9 });

    /* ===== CODA 142–150: the motif returns to the single plucked string, and comes home ===== */
    ['D2', 'A2', 'D3', 'F#3', 'A3', 'E4'].forEach(function (n, i) { str(n, 141.6 + i * .05, 7.9, (i < 2 ? .03 : .05) - i * .003, (i / 5 - .5) * .7, { att: 1.6, rel: 4.6, bright: [0, .3], swell: [.3, .3], cath: .3 }); });
    [[142.6, 'A4'], [143.4, 'B4'], [144.2, 'D5'], [145.0, 'E5'], [145.8, 'B4'], [146.8, 'D5']].forEach(function (q, i) { pno(q[1], q[0], 4, .22, -.1, .45); koto(q[1], q[0] + .012, .16, .15, 4); });
    ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5'].forEach(function (n, i) { harp(n, 146.86 + i * .13, .14 - i * .008, (i / 5 - .5) * .6, 3.6); });
    bel('A5', 147.9, 2.6, .04, 'rin', 0, .4);

    /* ===== FOLEY: paper, ink, air, water, stone ===== */
    function swish(t, dur, f0, f1, g, pan, cr, q) { fol.add(noise(dur, { f0: f0, f1: f1, Q: q || .9, crackle: cr || 0 }), t, { g: g, pan: pan || 0, hall: .25 }); }
    fol.add(noise(8, { f0: 3800, f1: 5200, Q: .7, crackle: .5, env: function (u) { return Math.sin(Math.PI * u) * .8; }, mod: [.9, .6] }), 2.4, { g: .075, pan: 0, hall: .2 }); // the gold line being drawn
    fol.add(drop(380, 900, .22), 5.5, { g: .34, hall: .5 }); fol.add(drop(900, 1700, .1), 5.56, { g: .1, pan: .2, hall: .5 }); swish(5.5, .5, 1800, 600, .04, 0, 0, .6);
    swish(11.6, 2.4, 1400, 3200, .07, 0, .55); swish(11.8, 2.0, 500, 900, .035, 0, 0, .5);                       // washi unrolls
    fol.add(noise(26, { f0: 420, f1: 520, Q: .5, env: function (u) { return .35 + .65 * Math.exp(-Math.pow((u - .46) / .2, 2)); }, mod: [.17, .5] }), 11.5, { g: .11, pan: -.2, hall: .3 }); // wind
    fol.add(noise(24, { f0: 900, f1: 760, Q: .6, env: function (u) { return .3 + .7 * Math.exp(-Math.pow((u - .5) / .22, 2)); }, mod: [.23, .6, 2] }), 12.5, { g: .06, pan: .3, hall: .3 });
    [16.9, 17.7, 18.5, 19.2, 20.0, 20.7, 21.3].forEach(function (t, i) { swish(t, .7, 2400, 1300, .035, (i % 2 ? .4 : -.2), 0, .7); });       // brush strokes: leaves
    swish(20.0, 3.2, 300, 180, .05, -.1, 0, .5);                                                                 // ink blooms into mountains
    [22.4, 24.1, 25.3, 27.8, 29.6].forEach(function (t, i) { swish(t, 1.1, 3000, 4200, .03, (i % 2 ? -.5 : .5), .35); });                    // bamboo leaves rustle
    fol.add(drop(520, 1250, .32), 34.3, { g: .26, pan: -.05, hall: .6 }); fol.add(drop(1100, 2100, .14), 34.4, { g: .07, pan: .2, hall: .6 }); swish(34.3, 1.6, 700, 380, .04, 0, 0, .5); // the leaf touches water
    for (var k = 0; k < 14; k++) fol.add(noise(1.9, { f0: 4200, f1: 5200, Q: 1.1, crackle: .6, env: function (u) { return Math.sin(Math.PI * u); } }), 44.1 + k, { g: .1, pan: (k % 2 ? .25 : -.25), hall: .15 }); // quill on fourteen lines
    swish(60.3, 3.2, 500, 1400, .14, 0, 0, .5);                                                                 // lines turn into staves
    fol.add(noise(7.5, { f0: 62, f1: 48, Q: .7, env: function (u) { return Math.sin(Math.PI * u) * (1 - u * .3); }, mod: [3.1, .35] }), 66.5, { g: .95, pan: 0, hall: .3 }); // columns rise: stone
    fol.add(noise(3.2, { f0: 70, f1: 54, Q: .7 }), 72.2, { g: .6, hall: .3 });
    swish(88.2, 5.2, 300, 1100, .16, 0, 0, .45);                                                                 // the camera breathes in
    swish(93.6, 2.4, 1100, 2600, .22, -.1, .5); swish(93.8, 1.2, 240, 420, .16, 0, 0, .6);                       // the book opens
    [95.3, 95.9, 96.6, 96.7, 97.3].forEach(function (t, i) { swish(t, .9, 2000, 3400, .17, (i - 2) * .25, .6); }); // paper stands up
    [[99.2, 3100, 4300, 5, -.6], [99.5, 3400, 3000, 3, -.55], [102.8, 2700, 3600, 4, .6], [105.1, 3900, 3300, 6, .3], [105.4, 3300, 4100, 3, .35], [108.6, 2900, 3900, 5, -.4], [111.2, 3600, 3000, 4, .55]].forEach(function (c) { fol.add(chirp(.16, c[1], c[2], c[3]), c[0], { g: .1, pan: c[4], hall: .7 }); fol.add(chirp(.12, c[2], c[1], c[3]), c[0] + .2, { g: .07, pan: c[4], hall: .7 }); });
    fol.add(noise(22, { f0: 600, f1: 500, Q: .5, env: function (u) { return Math.sin(Math.PI * u); }, mod: [.21, .5] }), 96, { g: .09, pan: .1, hall: .3 }); // forest air
    swish(138.8, 3.6, 900, 2400, .2, 0, .3); swish(139, 3, 260, 420, .12, 0, 0, .5);                             // night folds back into a page
    [142.4, 143.3, 144.1, 145.0].forEach(function (t, i) { swish(t, 1.2, 2600, 3600, .06, (i % 2 ? .5 : -.5), .4); }); // the border flowers

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
    var secs = [[0, 12], [12, 38], [38, 66], [66, 94], [94, 119], [119, 142], [142, 150]];
    function rmsOf(Ls, Rs, a, b) { var e = 0; for (var j = a; j < b; j++) e += Ls[j] * Ls[j] + Rs[j] * Rs[j]; return 10 * Math.log10(e / (2 * (b - a)) + 1e-12); }
    // --- mastering ride: bring each act to its place on the dynamic curve (quiet → tender → grand → intimate → sacred → still)
    var TARGET = opts.target || [-26.5, -23, -20, -16.5, -20, -15, -23], pre = [], trim = [];
    secs.forEach(function (sc, k) {
      var a = sc[0] * SR, b = sc[1] * SR, e = 0;
      ['music', 'vocal', 'foley'].forEach(function (key) { var st = stems[key]; log('  pre ' + key + ' ' + sc[0] + '-' + sc[1] + ': ' + rmsOf(st.L, st.R, a, b).toFixed(1) + ' dB'); });
      for (var j = a; j < b; j++) { var l = stems.music.L[j] + stems.vocal.L[j] + stems.foley.L[j], r = stems.music.R[j] + stems.vocal.R[j] + stems.foley.R[j]; e += l * l + r * r; }
      pre.push(10 * Math.log10(e / (2 * (b - a)) + 1e-12)); trim.push(db(TARGET[k] - pre[k]));
    });
    log('  pre-master rms: ' + pre.map(function (x) { return x.toFixed(1); }).join('  ') + '   trims dB: ' + trim.map(function (x) { return (20 * Math.log10(x)).toFixed(1); }).join('  '));
    var ride = new Float32Array(N), XF = 2.2 * SR;
    for (i = 0; i < N; i++) {
      var k = 0; while (k < 6 && i >= secs[k][1] * SR) k++;
      var g = trim[k], dn = secs[k][1] * SR - i, up = i - secs[k][0] * SR;
      if (k < 6 && dn < XF / 2) g = trim[k] + (trim[k + 1] - trim[k]) * (.5 - .5 * Math.cos(Math.PI * (.5 - dn / XF)));
      else if (k > 0 && up < XF / 2) g = trim[k - 1] + (trim[k] - trim[k - 1]) * (.5 - .5 * Math.cos(Math.PI * (.5 + up / XF)));
      ride[i] = g;
    }
    // natural ending: everything is silent by 149.9 s
    var fo0 = 148.6 * SR, fo1 = 149.92 * SR;
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
