/* score.js — 《薛定谔的签》original soundtrack: 96 BPM, D minor, 'guochao electronic'. Pure JS DSP, no samples.
   Synth core shared with the earlier films (pluck / additive / bell / wavetable voices / FFT reverb). */
(function (root) {
  'use strict';
  var SR = 48000, DUR = 150, N = SR * DUR, TAU = Math.PI * 2;
  var seed = 20261119;
  function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296); }
  function nz() { return rnd() * 2 - 1; }
  var NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function m(n) { var mt = /^([A-G])([#b]?)(-?\d)$/.exec(n); return 12 * (parseInt(mt[3], 10) + 1) + NOTE[mt[1]] + (mt[2] === '#' ? 1 : mt[2] === 'b' ? -1 : 0); }
  function hz(mid) { return 440 * Math.pow(2, (mid - 69) / 12); }
  function f(n) { return hz(typeof n === 'string' ? m(n) : n); }
  function db(x) { return Math.pow(10, x / 20); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------------- stems ---------------- */
  function Stem() { this.L = new Float32Array(N); this.R = new Float32Array(N); this.hall = new Float32Array(N); this.cath = null; }
  /** mix mono buffer at time t. o:{g, pan(-1..1), hall, cath} */
  Stem.prototype.add = function (buf, t, o) {
    var i0 = Math.round(t * SR), g = o.g === undefined ? 1 : o.g, pan = o.pan || 0, a = (pan + 1) * Math.PI / 4, gl = Math.cos(a) * g, gr = Math.sin(a) * g, h = (o.hall || 0) * g, c = (o.cath || 0) * g;
    var L = this.L, R = this.R, H = this.hall, Cc = this.cath, n = buf.length;
    for (var i = 0; i < n; i++) { var j = i0 + i; if (j < 0) continue; if (j >= N) break; var s = buf[i]; L[j] += s * gl; R[j] += s * gr; if (h) H[j] += s * h; }
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

  /* ================= electronic instruments ================= */
  var S = (typeof require !== 'undefined') ? require('./script.js') : root.SCRIPT;
  var BT = S.BEAT, BAR = S.BAR, ST = BT / 4;   // 16th step
  function buf(d) { return new Float32Array(Math.round(d * SR)); }
  function kick(v) {
    var o = buf(.55), ph = 0;
    for (var i = 0; i < o.length; i++) { var t = i / SR, fq = 52 + 120 * Math.exp(-t / .03) + 40 * Math.exp(-t / .006); ph += TAU * fq / SR; o[i] = Math.tanh(1.8 * Math.sin(ph) * Math.exp(-t / .2)) * (v || 1); }
    for (i = 0; i < 160; i++) o[i] += nz() * .5 * (1 - i / 160);
    return o;
  }
  function clap(v) {
    var o = buf(.32), i;
    for (i = 0; i < o.length; i++) { var t = i / SR, e = 0; [0, .011, .022].forEach(function (d) { if (t >= d) e += Math.exp(-(t - d) / .007); }); e += .55 * Math.exp(-Math.max(0, t - .03) / .09) * (t > .03 ? 1 : 0); o[i] = nz() * e; }
    biquadBP(o, 1300, 1100, .9);
    var body = additive(185, .14, [[1, .7, .05], [1.6, .3, .03]], .001); for (i = 0; i < body.length; i++) o[i] += body[i];
    for (i = 0; i < o.length; i++) o[i] *= (v || 1) * 1.2;
    return o;
  }
  function hat(open, v) {
    var o = buf(open ? .34 : .07), dk = open ? .11 : .022;
    for (var i = 0; i < o.length; i++) o[i] = nz() * Math.exp(-i / SR / dk);
    biquadBP(o, 9500, 8000, .7);
    for (i = 0; i < o.length; i++) o[i] *= (v || 1) * 1.6;
    return o;
  }
  function saw(freq, dur, o) {   // filtered saw voice: o:{cut0, cut1, tau, att, rel, det:[cents], sub}
    var n = Math.round(dur * SR), out = new Float32Array(n), dets = o.det || [0], k, i;
    var att = Math.round((o.att || .005) * SR), rel = Math.round((o.rel || .05) * SR);
    for (k = 0; k < dets.length; k++) {
      var f0 = freq * Math.pow(2, dets[k] / 1200), ph = rnd(), inc = f0 / SR, lp1 = 0, lp2 = 0;
      for (i = 0; i < n; i++) {
        ph += inc; if (ph >= 1) ph -= 1; var x = 2 * ph - 1;
        var cut = o.cut1 + (o.cut0 - o.cut1) * Math.exp(-i / SR / (o.tau || .15)), a = 1 - Math.exp(-TAU * cut / SR);
        lp1 += a * (x - lp1); lp2 += a * (lp1 - lp2); out[i] += lp2 / dets.length;
      }
    }
    if (o.sub) { var sp = 0; for (i = 0; i < n; i++) { sp += TAU * freq / 2 / SR; out[i] += Math.sin(sp) * o.sub; } }
    for (i = 0; i < n; i++) { var e = 1; if (i < att) e = i / att; if (i > n - rel) e *= (n - i) / rel; if (o.dec) e *= o.sus + (1 - o.sus) * Math.exp(-i / SR / o.dec); out[i] *= e; }
    return out;
  }
  function sweep(f0, f1, dur, shape) {   // sine glide
    var o = buf(dur), ph = 0;
    for (var i = 0; i < o.length; i++) { var u = i / o.length, fq = f0 * Math.pow(f1 / f0, shape ? Math.pow(u, shape) : u); ph += TAU * fq / SR; o[i] = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, u * 8)) * (1 - u); }
    return o;
  }
  function riser(dur) {
    var o = noise(dur, { f0: 300, f1: 9000, Q: 1.1, env: function (u) { return Math.pow(u, 2.2); } }), s = buf(dur), ph = 0;
    for (var i = 0; i < s.length; i++) { var u = i / s.length; ph += TAU * (120 * Math.pow(8, u)) / SR; s[i] = ((ph / TAU) % 1 * 2 - 1) * .18 * u * u; }
    biquadBP(s, 400, 5000, .8); for (i = 0; i < o.length; i++) o[i] += s[i];
    return o;
  }
  function impact() {
    var o = buf(2.2), ph = 0;
    for (var i = 0; i < o.length; i++) { var t = i / SR, fq = 32 + 60 * Math.exp(-t / .08); ph += TAU * fq / SR; o[i] = Math.sin(ph) * Math.exp(-t / .7) * 1.1; }
    var n = noise(.9, { f0: 2500, f1: 200, Q: .6, env: function (u) { return Math.exp(-u * 5); } }); for (i = 0; i < n.length; i++) o[i] += n[i] * .9;
    return o;
  }
  function whoosh(dur) { return noise(dur, { f0: 350, f1: 4200, Q: 1.4, env: function (u) { return Math.pow(Math.sin(Math.PI * u), 2); } }); }
  function pop(fr) { var o = sweep(fr || 520, (fr || 520) * 2.3, .07, .5); return o; }
  function tick(fr) { return wood(fr || 2600, .06); }

  /* ================= the score ================= */
  function compose(log) {
    var duck = new Stem(), mus = new Stem(), drm = new Stem(), fx = new Stem();
    var kicks = [];
    var CH = [['D3', 'F3', 'A3', 'D4'], ['Bb2', 'D3', 'F3', 'Bb3'], ['F2', 'A3', 'C4', 'F4'], ['C3', 'E3', 'G3', 'C4']];
    var ROOT = ['D2', 'Bb1', 'F2', 'C2'];
    function chordAt(bar) { return bar % 4; }
    function bt(bar, step) { return bar * BAR + step * ST; }
    // ---- instruments as calls
    function K(t, v) { drm.add(kick(v), t, { g: .5 }); kicks.push(t); }
    function CL(t, v) { drm.add(clap(v), t, { g: .55, hall: .18, pan: .05 }); }
    function HH(t, open, v, pan) { drm.add(hat(open, v), t, { g: .22, pan: pan || .25 }); }
    function BASS(n, t, d, v) { duck.add(saw(f(n), d, { cut0: 2600, cut1: 520, tau: .1, att: .004, rel: .04, det: [0, 6], sub: .3 }), t, { g: .26 * (v || 1) }); }
    function PAD(bar, d, g, bright) { CH[chordAt(bar)].forEach(function (n, i) { duck.add(saw(f(n) * 2, d, { cut0: bright || 1800, cut1: bright || 1800, tau: 1, att: .35, rel: .7, det: [-11, -4, 0, 5, 12] }), bar * BAR, { g: (g || .1) * 1.7 * (i ? .8 : 1), pan: (i - 1.5) * .3, hall: .5 }); }); }
    function ZHENG(n, t, g, pan) { mus.add(pluck(f(n), 2.2, { t60: 1.8, bright: .86, damp: .2, pos: .16, body: .66 }), t, { g: g * 1.6, pan: pan || 0, hall: .32 }); }
    function ARP(n, t, g, pan, cut) { mus.add(saw(f(n), .3, { cut0: cut || 4800, cut1: 500, tau: .07, att: .002, rel: .05, det: [0, 8] }), t, { g: g * 1.5, pan: pan || 0, hall: .3 }); }
    function BOX(n, t, g, pan) { mus.add(bell(f(n), 1.6, 'box'), t, { g: g, pan: pan || 0, hall: .55 }); }
    function CEL(n, t, g, pan) { mus.add(bell(f(n), 2.6, 'cel'), t, { g: g, pan: pan || 0, hall: .6 }); }
    function GONG(n, t, g) { fx.add(bell(f(n), 6, 'chime'), t, { g: g, hall: .6 }); fx.add(bell(f(n) * 1.5, 4, 'rin'), t, { g: g * .4, hall: .6, pan: .2 }); }
    function DIZI(n, t, d, g, pan) { mus.add(voice(f(n), d, { kind: 'obo', att: .03, rel: .12, vib: [5.6, .006, .2], det: [0], swell: [.4, .2], breath: .06 }), t, { g: g * .55, pan: pan || 0, hall: .38 }); mus.add(voice(f(n), d, { kind: 'flu', att: .03, rel: .12, vib: [5.6, .006, .2], det: [0], swell: [.4, .2], breath: .1 }), t, { g: g, pan: pan || 0, hall: .38 }); }

    // ---- drum grooves
    function grooveA(bar, o) {
      o = o || {};
      var kp = o.kick || [0, 7, 10], i;
      kp.forEach(function (s) { K(bt(bar, s), s ? .85 : 1); });
      if (!o.noClap) [4, 12].forEach(function (s) { CL(bt(bar, s), 1); });
      for (i = 0; i < 16; i += 2) HH(bt(bar, i) + (i % 4 === 2 ? ST * .12 : 0), false, i % 4 ? .7 : .45, .22);
      if (o.roll) for (i = 12; i < 16; i++) HH(bt(bar, i), false, .5 + .1 * (i - 12), -.2);
      if (bar % 2) HH(bt(bar, 14), true, .6, -.25);
    }
    function halfTime(bar) { K(bt(bar, 0), 1); K(bt(bar, 10), .7); CL(bt(bar, 8), 1.1); for (var i = 0; i < 16; i += 2) HH(bt(bar, i), false, .4, .22); }
    function fourFloor(bar, v) { for (var i = 0; i < 16; i += 4) K(bt(bar, i), v || .8); for (i = 2; i < 16; i += 4) HH(bt(bar, i), true, .45, .2); }
    function bassLine(bar, v) { var r = ROOT[chordAt(bar)]; BASS(r, bt(bar, 0), ST * 5.5, v); BASS(r, bt(bar, 6), ST * 3.5, v); BASS(oct(r, 1), bt(bar, 10), ST * 1.8, v * .8); BASS(r, bt(bar, 12), ST * 3.5, v); }
    function oct(n, k) { return m(n) + 12 * k; }
    var RIFF = [['A4', null, 'D5', null, 'C5', 'A4', 'G4', 'A4'], ['F4', null, 'G4', 'A4', null, 'C5', 'A4', 'G4'], ['A4', 'C5', 'D5', null, 'F5', 'D5', 'C5', 'A4'], ['G4', null, 'A4', 'C5', 'D5', null, 'C5', null]];
    function riff(bar, g, up) { RIFF[chordAt(bar)].forEach(function (n, i) { if (n) ZHENG(up ? oct(n, 1) : n, bt(bar, i * 2) + (i % 2 ? ST * .1 : 0), g * (i % 2 ? .75 : 1), (i % 2 ? .3 : -.2)); }); }
    var LEAD = [[0, 1.5, 'D5'], [1.5, .5, 'F5'], [2, 1, 'G5'], [3, 1, 'A5'], [4, 2, 'F5'], [6, 1, 'D5'], [7, 1, 'C5'], [8, 1.5, 'A4'], [9.5, .5, 'C5'], [10, 1, 'D5'], [11, 1, 'F5'], [12, 1.5, 'C5'], [13.5, 2.5, 'D5']];
    function lead(bar0, g) { LEAD.forEach(function (q) { DIZI(q[2], bar0 * BAR + q[0] * BT, q[1] * BT * .95, g, -.05); }); }
    var MOTIF = ['D6', 'A5', 'C6', 'D6', 'F6', 'D6', 'C6', 'A5'];
    function motif(bar, g) { MOTIF.forEach(function (n, i) { BOX(n, bt(bar, i * 2), g, i % 2 ? .35 : -.35); }); }
    function arp(bar, g, cut) { var c = CH[chordAt(bar)]; for (var i = 0; i < 16; i++) { var n = oct(c[(i % 4) + 0 === 3 ? 3 : i % 4], i % 8 < 4 ? 1 : 2); ARP(n, bt(bar, i), g * (i % 4 ? .7 : 1), (i % 2 ? .4 : -.4), cut); } }
    var bar, i;

    // ---------- 0–10 intro: pad, music box, clock ticks, riser into the drop
    for (bar = 0; bar < 4; bar++) { PAD(bar, BAR + .4, .07, 900 + bar * 300); motif(bar, .1); for (i = 0; i < 16; i += 4) fx.add(tick(i % 8 ? 2200 : 2900), bt(bar, i), { g: .16, pan: i % 8 ? .3 : -.3, hall: .2 }); }
    fx.add(riser(2.6), 7.4, { g: .5, hall: .3 });
    for (i = 0; i < 12; i++) { var rt = 8.75 + (1 - Math.pow(1 - i / 12, 1.6)) * 1.2; CL(rt, .3 + i * .05); }
    fx.add(whoosh(.5), S.HITS.whoosh[0] - .1, { g: .45, hall: .3 });
    // ---------- 10–40 groove A
    for (bar = 4; bar < 16; bar++) {
      grooveA(bar, { roll: bar % 4 === 3 }); bassLine(bar, 1); PAD(bar, BAR + .3, bar < 6 ? .07 : .055, 2200);
      if (bar >= 4 && bar < 6) motif(bar, .07);
      if (bar >= 6) riff(bar, .3);
      if (bar >= 10 && bar < 14 && bar % 2 === 0) CEL(oct(CH[chordAt(bar)][3], 1), bar * BAR, .1, .4);
    }
    fx.add(riser(2.2), 37.7, { g: .5, hall: .3 });
    for (i = 0; i < 16; i++) CL(37.5 + 1.875 + i * ST * .5 * (i < 8 ? 1 : .8), .25 + i * .04);
    // ---------- 40: 铁口直断 — a gong, the drums stop for one bar, the wave collapses
    GONG('D3', 40.0, .5); fx.add(impact(), 40.0, { g: .55, hall: .3 });
    fx.add(sweep(1800, 70, .6, .5), S.HITS.collapse[0] - .05, { g: .35, hall: .4 });
    PAD(16, BAR, .05, 900);
    BASS('D1', 40.6, 1.6, 1.2);
    // ---------- 42.5–52.5 groove A' with the lead
    for (bar = 17; bar < 21; bar++) { grooveA(bar, { roll: bar === 20 }); bassLine(bar, 1); PAD(bar, BAR + .3, .05, 2200); riff(bar, .22); }
    lead(17, .2);
    fx.add(whoosh(.6), S.HITS.whoosh[2] - .1, { g: .45, hall: .3 });
    // ---------- 52.5–80 double slit: arps; one particle at a time, then a flood
    for (bar = 21; bar < 32; bar++) {
      var sb = bar - 21;
      PAD(bar, BAR + .3, .06, bar >= 25 && bar < 28 ? 1100 : 1900);
      if (sb >= 0) arp(bar, bar >= 25 && bar < 28 ? .05 : .065, bar >= 25 && bar < 28 ? 1600 : 5200);
      if (bar >= 23 && bar < 31) fourFloor(bar, .75);
      if (bar >= 23) bassLine(bar, .8);
      if (bar < 31) for (i = 2; i < 16; i += 4) CL(bt(bar, i + 2), bar >= 23 ? .55 : 0);
    }
    // a soft click for each early electron (the slow start, before the flood)
    for (i = 0; i < 12; i++) fx.add(tick(3400 + (i % 3) * 300), 53.2 + Math.pow(i / 12, 1 / .35) * 9.5 * .25 + .5, { g: .12, pan: (i % 2 ? .4 : -.4), hall: .3 });
    fx.add(riser(2.3), 77.6, { g: .5, hall: .3 });
    for (i = 0; i < 12; i++) CL(78.75 + i * ST * .6, .25 + i * .05);
    fx.add(whoosh(.55), S.HITS.whoosh[3] - .1, { g: .45, hall: .3 });
    // ---------- 80–107.5 decoherence: half time, a molecule plink on each beat
    fx.add(impact(), 80.0, { g: .55, hall: .3 });
    for (bar = 32; bar < 43; bar++) {
      if (bar < 39 || bar >= 41) halfTime(bar);
      var r2 = ROOT[chordAt(bar)]; BASS(r2, bar * BAR, BT * 2.8, .9); BASS(r2, bar * BAR + BT * 3, BT * .9, .7);
      PAD(bar, BAR + .3, .055, 1500);
    }
    for (i = 0; i < 10; i++) { var mt = 85.0 + i * BT; ARP(['D6', 'F6', 'A6', 'C7', 'D7'][i % 5], mt + .35, .07, (i % 2 ? .5 : -.5), 7000); fx.add(pop(900 + i * 60), mt + .35, { g: .1, pan: (i % 2 ? .5 : -.5) }); }
    fx.add(impact(), 90.0, { g: .45, hall: .3 });
    // the molecule storm: a granular rush
    fx.add(noise(4.4, { f0: 2000, f1: 7000, Q: .9, crackle: .6, env: function (u) { return Math.min(1, u * 3) * (1 - Math.pow(u, 6)); } }), 92.5, { g: .32, hall: .2 });
    // cat: playful music box + pizzicato
    for (bar = 39; bar < 41; bar++) { motif(bar, .1); for (i = 0; i < 16; i += 4) ZHENG(oct(CH[chordAt(bar)][i / 4 % 4], 1), bt(bar, i), .18, .3); }
    // glasses fall: a slide whistle down
    fx.add(sweep(1500, 280, .7, 1), 105.0, { g: .16, hall: .3 });
    fx.add(whoosh(.55), S.HITS.whoosh[4] - .1, { g: .45, hall: .3 });
    // ---------- 107.5–122.5 dice
    for (bar = 43; bar < 49; bar++) {
      if (bar < 47) { grooveA(bar, { kick: [0, 10] }); bassLine(bar, .9); }
      if (bar === 45) for (i = 0; i < 16; i += 4) fx.add(wood(i % 8 ? 1500 : 1900, .1), bt(bar, i), { g: .25, pan: i % 8 ? .3 : -.3, hall: .2 });   // tick-tock: clockwork
      if (bar === 46) for (i = 0; i < 8; i++) ARP(['D6', 'G5', 'C7', 'A5', 'F6', 'D7', 'A6', 'C6'][i], bt(bar, i * 2 + (i % 3 === 1 ? 1 : 0)), .07, (i % 2 ? .5 : -.5), 6000);   // random bleeps
      PAD(bar, BAR + .3, bar === 47 ? .09 : .05, bar === 47 ? 1400 : 1800); if (bar === 47) { CEL('A5', bar * BAR, .14, .2); CEL('D5', bar * BAR + BT * 2, .12, -.2); }
      if (bar < 47) riff(bar, .2, true);
    }
    S.HITS.dice.forEach(function (t0) { for (var j = 0; j < 7; j++) fx.add(wood(1800 + rnd() * 1400, .05), t0 + j * .05 + rnd() * .03, { g: .2, pan: rnd() - .5, hall: .15 }); });
    fx.add(impact(), 120.0, { g: .45, hall: .3 }); grooveA(48, { roll: true }); bassLine(48, 1);
    fx.add(riser(1.4), 121.0, { g: .4 });
    fx.add(whoosh(.55), S.HITS.whoosh[5] - .1, { g: .45, hall: .3 });
    // ---------- 122.5–140 the real collapse: full chorus
    fx.add(impact(), 122.5, { g: .5, hall: .3 });
    for (bar = 49; bar < 56; bar++) { grooveA(bar, { roll: bar % 4 === 0 }); bassLine(bar, 1.05); PAD(bar, BAR + .3, .06, 2400); riff(bar, .2, bar >= 53); }
    lead(49, .21); lead(53, .21);
    S.HITS.stamp.forEach(function (t0) { drm.add(kick(.8), t0, { g: .5 }); fx.add(noise(.12, { f0: 1800, f1: 900, Q: .8, env: function (u) { return Math.exp(-u * 8); } }), t0, { g: .45, hall: .2 }); });
    fx.add(whoosh(.55), S.HITS.whoosh[6] - .1, { g: .45, hall: .3 });
    // ---------- 140–150 ending
    for (bar = 56; bar < 60; bar++) { PAD(bar, BAR + (bar === 59 ? 2.5 : .3), .07, 1500 + (bar - 56) * 300); if (bar < 58) { motif(bar, .09); K(bt(bar, 0), .6); CL(bt(bar, 8), .5); } }
    BASS('D2', 140, 5, .8);
    fx.add(riser(1.6), 144.6, { g: .45 });
    fx.add(impact(), S.HITS.collapse[1], { g: .5, hall: .35 }); GONG('D4', S.HITS.collapse[1], .25);
    ['D5', 'F5', 'A5', 'D6'].forEach(function (n, j) { CEL(n, 147.5 + j * .08, .12, (j - 1.5) * .3); });
    BASS('D2', 147.5, 2.4, .7);
    // slams on the big stamps + caption pops
    S.HITS.slam.forEach(function (t0) { if (t0 === 40 || t0 === 80 || t0 === 90) return; drm.add(kick(1), t0, { g: .55 }); fx.add(noise(.25, { f0: 3000, f1: 400, Q: .7, env: function (u) { return Math.exp(-u * 6); } }), t0, { g: .35, hall: .3 }); });
    S.CAPS.forEach(function (c, j) { if (c[3] === 'big') return; fx.add(pop(560 + (j % 4) * 70), c[0], { g: .07, pan: (j % 2 ? .2 : -.2) }); });
    // sidechain: duck pads + bass under every kick
    var env = new Float32Array(N); for (i = 0; i < N; i++) env[i] = 1;
    kicks.forEach(function (t0) { var a = Math.round(t0 * SR), L2 = Math.round(.32 * SR); for (var q = 0; q < L2 && a + q < N; q++) { var d = 1 - .6 * Math.exp(-q / SR / .09) * Math.min(1, q / 60 + .4); if (d < env[a + q]) env[a + q] = d; } });
    for (i = 0; i < N; i++) { duck.L[i] *= env[i]; duck.R[i] *= env[i]; duck.hall[i] *= env[i]; }
    log('kicks ' + kicks.length);
    return { duck: duck, music: mus, drums: drm, fx: fx };
  }

  /* ---------------- master ---------------- */
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
    for (i = 0; i < N + LA; i++) {
      if (i < N) { while (tail > head && g[dq[tail - 1]] >= g[i]) tail--; dq[tail++] = i; }
      var j = i - LA; if (j < 0) continue; while (dq[head] < j) head++; mn[j] = g[dq[head]];
    }
    var e = 1, aC = Math.exp(-1 / (.0012 * SR)), rC = Math.exp(-1 / (.15 * SR));
    for (i = 0; i < N; i++) { var tg = mn[i]; e = tg < e ? tg + (e - tg) * aC : tg + (e - tg) * rC; var gg = Math.min(e, g[i] < 1 ? g[i] : 1, 1); if (gg < .944) red++; if (gg < mnG) mnG = gg; L[i] *= gg; R[i] *= gg; }
    limiter.maxGR = -20 * Math.log10(mnG);
    return red / N;
  }
  function render(opts, log) {
    opts = opts || {}; log = log || function () { };
    var t0 = Date.now(); seed = 20261119; tcache = {};
    var stems = compose(log); log('composed in ' + (Date.now() - t0) + ' ms');
    var irL = makeIR(2.6, 2.2, 1.2, .014, 9001), irR = makeIR(2.6, 2.2, 1.2, .017, 9203);
    var names = ['duck', 'music', 'drums', 'fx'];
    names.forEach(function (k) { var st = stems[k]; convolve(st.hall, irL, st.L, .9); convolve(st.hall, irR, st.R, .9); st.hall = null;
      [st.L, st.R].forEach(function (x) { var y1 = 0, x1 = 0, a = 1 / (1 + TAU * 30 / SR); for (var i = 0; i < N; i++) { var y = a * (y1 + x[i] - x1); x1 = x[i]; y1 = y; x[i] = y; } }); });
    [stems.music.L, stems.music.R, stems.duck.L, stems.duck.R].forEach(function (x) { shelf(x, 'lo', 220, -3); shelf(x, 'hi', 4000, 3); });
    [stems.drums.L, stems.drums.R].forEach(function (x) { shelf(x, 'lo', 110, -3); shelf(x, 'hi', 5000, 2); });
    log('reverb done at ' + (Date.now() - t0) + ' ms');
    var G = db(opts.gain || 0), L = new Float32Array(N), R = new Float32Array(N), i;
    var secs = S.SCENES.map(function (s) { return [s[1], s[2]]; });
    var TARGET = opts.target || [-21, -14.5, -15, -15.5, -16, -16.5, -15.5, -14, -18];
    var pre = [], trim = [];
    secs.forEach(function (sc, k) {
      var a = Math.round(sc[0] * SR), b = Math.round(sc[1] * SR), e = 0;
      for (var j = a; j < b; j++) { var l = 0, r = 0; names.forEach(function (key) { l += stems[key].L[j]; r += stems[key].R[j]; }); e += l * l + r * r; }
      pre.push(10 * Math.log10(e / (2 * (b - a)) + 1e-12)); trim.push(db(TARGET[k] - pre[k]));
    });
    log('pre-master rms: ' + pre.map(function (x) { return x.toFixed(1); }).join('  ') + '   trims dB: ' + trim.map(function (x) { return (20 * Math.log10(x)).toFixed(1); }).join('  '));
    var ride = new Float32Array(N), XF = 1.0 * SR;
    for (i = 0; i < N; i++) {
      var k = 0, KL = secs.length - 1; while (k < KL && i >= secs[k][1] * SR) k++;
      var g = trim[k], dn = secs[k][1] * SR - i, up = i - secs[k][0] * SR;
      if (k < KL && dn < XF / 2) g = trim[k] + (trim[k + 1] - trim[k]) * (.5 - .5 * Math.cos(Math.PI * (.5 - dn / XF)));
      else if (k > 0 && up < XF / 2) g = trim[k - 1] + (trim[k] - trim[k - 1]) * (.5 - .5 * Math.cos(Math.PI * (.5 + up / XF)));
      ride[i] = g;
    }
    var fo0 = 148.6 * SR, fo1 = 149.95 * SR;
    names.forEach(function (k) { var s = stems[k]; for (i = 0; i < N; i++) { var fd = (i < fo0 ? 1 : i > fo1 ? 0 : .5 + .5 * Math.cos(Math.PI * (i - fo0) / (fo1 - fo0))) * G * ride[i]; L[i] += s.L[i] * fd; R[i] += s.R[i] * fd; } });
    var red = limiter(L, R, db(-2.0));
    var stats = [];
    secs.forEach(function (s) { var a = Math.round(s[0] * SR), b = Math.round(s[1] * SR), e = 0, pk = 0; for (i = a; i < b; i++) { e += L[i] * L[i] + R[i] * R[i]; var p = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (p > pk) pk = p; } stats.push({ sec: s, rms: 10 * Math.log10(e / (2 * (b - a)) + 1e-12), peak: 20 * Math.log10(pk + 1e-9) }); });
    log('limiter: >0.5 dB on ' + (red * 100).toFixed(2) + '% of samples, max ' + limiter.maxGR.toFixed(1) + ' dB; total ' + (Date.now() - t0) + ' ms');
    return { sr: SR, mix: { L: L, R: R }, stats: stats };
  }
  function wav(L, R) {
    var n = L.length, b = Buffer.alloc(44 + n * 4), o = 44;
    b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
    b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
    for (var i = 0; i < n; i++) { var d = (rnd() - rnd()) / 32768; b.writeInt16LE(Math.round(clamp(L[i] + d, -1, 1) * 32767), o); b.writeInt16LE(Math.round(clamp(R[i] + d, -1, 1) * 32767), o + 2); o += 4; }
    return b;
  }
  var API = { render: render, wav: wav, SR: SR, DUR: DUR };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SCORE = API;
})(typeof window !== 'undefined' ? window : globalThis);
