/* score.js — 《薛定谔的卦》original soundtrack: 96 BPM, D minor pentatonic — guqin, xiao, zheng, frame drums, gongs, a light electronic pulse. Pure JS DSP, no samples.
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
    var duck = new Stem(), mus = new Stem(), drm = new Stem(), fx = new Stem(), kicks = [];
    function bt(bar, step) { return bar * BAR + step * ST; }
    function oct(n, k) { return m(n) + 12 * k; }
    // ---- instruments
    function QIN(n, t, g, pan, dur) { mus.add(pluck(f(n), dur || 6, { t60: 5.2, bright: .3, damp: .42, pos: .12, body: .32 }), t, { g: g, pan: pan || 0, hall: .55 }); }
    function FAN(n, t, g, pan) { mus.add(bell(f(n), 3.4, 'cel'), t, { g: g, pan: pan || 0, hall: .6 }); }
    function ZHENG(n, t, g, pan) { mus.add(pluck(f(n), 2.6, { t60: 2.4, bright: .8, damp: .22, pos: .16, body: .62 }), t, { g: g, pan: pan || 0, hall: .42 }); }
    function XIAO(n, t, dur, g, pan) { mus.add(voice(f(n), dur, { kind: 'flu', att: .2, rel: .45, vib: [4.6, .007, .5], det: [0], swell: [.5, .3], breath: .13 }), t, { g: g, pan: pan || 0, hall: .6 }); }
    function DIZI(n, t, d, g, pan) { mus.add(voice(f(n), d, { kind: 'obo', att: .03, rel: .12, vib: [5.6, .006, .2], det: [0], swell: [.4, .2], breath: .06 }), t, { g: g * .55, pan: pan || 0, hall: .38 }); mus.add(voice(f(n), d, { kind: 'flu', att: .03, rel: .12, vib: [5.6, .006, .2], det: [0], swell: [.4, .2], breath: .1 }), t, { g: g, pan: pan || 0, hall: .38 }); }
    function PAD(notes, t, d, g, o) { o = o || {}; notes.forEach(function (n, i) { duck.add(voice(f(n), d, { kind: 'strS', kindB: 'str', bright: o.bright || [.08, .45], att: o.att || 1.4, rel: o.rel || 1.8, vib: [5.2, .004, .5], det: [-7, 0, 6, 11], swell: [.55, .3] }), t, { g: g * (i ? .8 : 1), pan: (i - 1.5) * .3, hall: .5 }); }); }
    function GU(t, g, n) { drm.add(additive(f(n || 'D2'), 1.4, [[1, 1, .38], [1.5, .5, .22], [2.1, .3, .14], [.5, .3, .18]], .003), t, { g: g, hall: .35 }); drm.add(noise(.06, { f0: 900, f1: 300, Q: .7, env: function (u) { return 1 - u; } }), t, { g: g * .3, hall: .3 }); }
    function ZHONG(n, t, g) { fx.add(bell(f(n), 6, 'chime'), t, { g: g, hall: .6 }); fx.add(bell(f(n) * 1.5, 4, 'rin'), t, { g: g * .35, hall: .6, pan: .2 }); }
    function COIN(t, g, pan) { fx.add(bell(2700 + rnd() * 600, .9, 'box'), t, { g: g, pan: pan || 0, hall: .35 }); fx.add(bell(4100 + rnd() * 500, .5, 'box'), t + .004, { g: g * .5, pan: pan || 0, hall: .3 }); fx.add(noise(.03, { f0: 6000, f1: 4000, Q: 1, env: function (u) { return 1 - u; } }), t, { g: g * .4, pan: pan || 0 }); }
    function K(t, v) { drm.add(kick(v), t, { g: .42 }); kicks.push(t); }
    function CL(t, v) { drm.add(clap(v), t, { g: .38, hall: .25, pan: .05 }); }
    function HH(t, open, v, pan) { drm.add(hat(open, v), t, { g: .16, pan: pan || .25 }); }
    function BASS(n, t, d, v) { duck.add(saw(f(n), d, { cut0: 1800, cut1: 420, tau: .12, att: .006, rel: .06, det: [0, 5], sub: .35 }), t, { g: .22 * (v || 1) }); }
    function ARP(n, t, g, pan, cut) { mus.add(saw(f(n), .3, { cut0: cut || 4200, cut1: 500, tau: .07, att: .002, rel: .05, det: [0, 8] }), t, { g: g * 1.4, pan: pan || 0, hall: .35 }); }
    var CH = [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F2', 'C4', 'F4', 'A4'], ['C3', 'G3', 'C4', 'E4']], ROOT = ['D2', 'Bb1', 'F2', 'C2'];
    var PENT = ['D', 'F', 'G', 'A', 'C'];
    function pent(i, o) { var k = ((i % 5) + 5) % 5, oc = o + Math.floor(i / 5); return PENT[k] + oc; }
    function groove(bar, o) { o = o || {}; (o.kick || [0, 7, 10]).forEach(function (s) { K(bt(bar, s), s ? .8 : 1); }); if (!o.noClap) [4, 12].forEach(function (s) { CL(bt(bar, s), .9); }); for (var i = 0; i < 16; i += 2) HH(bt(bar, i), false, i % 4 ? .65 : .4, .22); if (bar % 2) HH(bt(bar, 14), true, .5, -.25); }
    function bassLine(bar, v) { var r = ROOT[bar % 4]; BASS(r, bt(bar, 0), ST * 5.5, v); BASS(r, bt(bar, 6), ST * 3.5, v); BASS(oct(r, 1), bt(bar, 10), ST * 1.8, v * .8); BASS(r, bt(bar, 12), ST * 3.5, v); }
    var RIFF = [['A4', null, 'D5', null, 'C5', 'A4', 'G4', 'A4'], ['F4', null, 'G4', 'A4', null, 'C5', 'A4', 'G4'], ['A4', 'C5', 'D5', null, 'F5', 'D5', 'C5', 'A4'], ['G4', null, 'A4', 'C5', 'D5', null, 'C5', null]];
    function riff(bar, g) { RIFF[bar % 4].forEach(function (n, i) { if (n) ZHENG(n, bt(bar, i * 2), g * (i % 2 ? .75 : 1), i % 2 ? .3 : -.2); }); }
    var THEME = [['D5', 0, 1.5], ['F5', 1.5, .5], ['G5', 2, 1], ['A5', 3, 1], ['F5', 4, 2], ['D5', 6, 1], ['C5', 7, 1], ['A4', 8, 1.5], ['C5', 9.5, .5], ['D5', 10, 1], ['F5', 11, 1], ['C5', 12, 1.5], ['D5', 13.5, 2.5]];
    var bar, i, H = S.HITS;

    // ===== 引 0–12.5: drone, qin harmonics, coins in the air, landing, title gong
    PAD(['D3', 'A3', 'D4'], 0, 10.4, .07, { att: 2.5, bright: [.04, .3] });
    [['A5', .4], ['D6', 1.6], ['C6', 2.2]].forEach(function (q, j) { FAN(q[0], q[1], .1, j % 2 ? .4 : -.4); });
    QIN('D2', .3, .45, -.1, 7);
    H.coin.forEach(function (t0, j) { COIN(t0, .18, (j - 1) * .5); fx.add(whoosh(.5), t0, { g: .12, pan: (j - 1) * .4 }); });
    fx.add(noise(2.6, { f0: 600, f1: 2400, Q: 2, env: function (u) { return Math.sin(Math.PI * u) * .8; } }), 4.9, { g: .2, hall: .6 });    // slow-motion air
    [['A4', 5.0], ['C5', 5.6], ['D5', 6.2], ['F5', 6.8]].forEach(function (q, j) { FAN(oct(q[0], 1), q[1], .08, j % 2 ? .5 : -.5); });
    H.land.forEach(function (t0, j) { COIN(t0, .26, (j - 1) * .5); GU(t0, .18 + j * .05, 'A2'); });
    fx.add(riser(1.8), 8.2, { g: .32, hall: .4 });
    ZHONG('D3', 10.0, .55); fx.add(impact(), 10.0, { g: 0.21, hall: .4 }); GU(10.0, .4, 'D2');
    ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5'].forEach(function (n, j) { ZHENG(n, 10.05 + j * .045, .16 + j * .01, -.6 + j * .15); });
    XIAO('A4', 10.6, 1.6, .22, .05); XIAO('D5', 12.0, .6, .2, .05);

    // ===== 八字 12.5–30: a slow qin theme over drones; frame drum on 1 and 3
    for (bar = 5; bar < 12; bar++) {
      PAD(CH[bar % 4], bar * BAR, BAR + .6, .055, { att: .9 });
      GU(bt(bar, 0), .32, 'D2'); GU(bt(bar, 8), .22, 'A2');
      if (bar >= 6) for (i = 4; i < 16; i += 8) HH(bt(bar, i), false, .3, .3);
    }
    THEME.forEach(function (q) { QIN(oct(q[0], -1), 15 + q[1] * BT * 1.0, .38, -.05, 4); });
    for (i = 0; i < 4; i++) ZHENG(['D4', 'F4', 'A4', 'C5'][i], 12.7 + i * .35, .14, (i - 1.5) * .3);
    for (i = 0; i < 8; i++) FAN(pent(i, 5), 17.6 + i * .28, .1, (i % 2 ? .4 : -.4));
    ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5'].forEach(function (n, j) { ZHENG(n, 20.0 + j * .05, .14, -.5 + j * .14); });
    for (i = 0; i < 8; i++) fx.add(wood(i % 2 ? 1500 : 1900, .1), 25.0 + i * BT * .5, { g: .18, pan: i % 2 ? .3 : -.3, hall: .2 });
    fx.add(whoosh(.6), 29.6, { g: .3, hall: .4 });

    // ===== 起卦 30–45: one clink per throw, a rising note per line, the 64 cascade
    for (bar = 12; bar < 18; bar++) {
      PAD(CH[bar % 4], bar * BAR, BAR + .5, .055, { att: .8 });
      GU(bt(bar, 0), .34, 'D2'); GU(bt(bar, 6), .2, 'A2'); GU(bt(bar, 10), .26, 'D2');
      for (i = 0; i < 16; i += 2) HH(bt(bar, i), false, .45, .22);
      if (bar >= 13) bassLine(bar, .7);
    }
    H.throw.forEach(function (t0, j) { [0, .03, .055].forEach(function (d, k) { COIN(t0 + d, .09, (k - 1) * .4); }); FAN(pent(j, 5), t0 + .2, .1, (j % 2 ? .3 : -.3)); });
    XIAO('D5', 37.6, 1.6, .2, 0); XIAO('A4', 39.1, .8, .18, 0);
    for (i = 0; i < 24; i++) mus.add(bell(f(pent(i % 10, 5)), 1.4, 'cel'), 40.0 + i * .06, { g: .07, pan: (i % 2 ? .45 : -.45), hall: .6 });
    for (i = 0; i < 16; i++) ARP(oct(CH[1][i % 4], 2), bt(17, i), .045, i % 2 ? .4 : -.4, 3800);

    // ===== 叠加 45–65: the quantum sheen — airy pads, a soft pulse, xiao on top
    for (bar = 18; bar < 26; bar++) {
      PAD(CH[bar % 4], bar * BAR, BAR + .6, .06, { att: .7, bright: [.15, .6] });
      if (bar >= 19) { K(bt(bar, 0), .7); K(bt(bar, 8), .6); for (i = 2; i < 16; i += 4) HH(bt(bar, i), true, .35, .2); }
      bassLine(bar, .6);
      for (i = 0; i < 16; i++) ARP(oct(CH[bar % 4][i % 4], i % 8 < 4 ? 1 : 2), bt(bar, i), bar >= 23 ? .05 : .035, i % 2 ? .4 : -.4, bar >= 23 ? 5200 : 2800);
    }
    THEME.forEach(function (q) { XIAO(q[0], 50 + q[1] * BT, q[2] * BT * .95, .19, -.05); });
    for (i = 0; i < 10; i++) fx.add(tick(3200 + (i % 3) * 400), 57.7 + Math.pow(i / 10, 1.8) * 3.5, { g: .08, pan: (i % 2 ? .4 : -.4), hall: .3 });

    // ===== 坍塌 65–85
    fx.add(impact(), 65.0, { g: 0.25, hall: .35 }); fx.add(sweep(2200, 80, .5, .5), 65.0, { g: .3, hall: .4 }); ZHONG('A3', 65.0, .3);
    fx.add(sweep(1800, 120, .45, .5), 67.5, { g: .22, hall: .4 }); GU(67.5, .5, 'D2');
    for (bar = 26; bar < 34; bar++) PAD(bar < 29 ? ['D3', 'A3', 'D4'] : ['Bb2', 'F3', 'Bb3'], bar * BAR, BAR + .6, .06, { att: .8, bright: [.05, .35] });
    for (i = 0; i < 9; i++) { GU(70 + i * BT * 2, .3, 'A1'); GU(70 + i * BT * 2 + .18, .18, 'A1'); }    // a heartbeat while the eye looks
    ZHONG('D2', 72.5, .38); fx.add(impact(), 72.5, { g: 0.23, hall: .4 }); GU(72.5, .4, 'D1');
    fx.add(noise(.35, { f0: 3500, f1: 600, Q: .9, crackle: .5, env: function (u) { return Math.exp(-u * 5); } }), 75.0, { g: .35, hall: .3 });   // the crack
    [['D3', 77.5], ['A2', 80], ['F3', 82.5]].forEach(function (q) { QIN(q[0], q[1], .42, -.1, 5); });
    fx.add(whoosh(.6), 84.6, { g: .3, hall: .4 });

    // ===== 测量 85–107.5: the pulse returns; a pop for each molecule
    for (bar = 34; bar < 43; bar++) {
      PAD(CH[bar % 4], bar * BAR, BAR + .5, .05, { att: .7 });
      if (bar < 39 || bar >= 40) { groove(bar, { kick: [0, 10], noClap: bar < 36 }); bassLine(bar, .75); }
      if (bar >= 36) riff(bar, .2);
    }
    for (i = 0; i < 12; i++) fx.add(pop(700 + (i % 4) * 90), 87.5 + i * BT * .5 + .3, { g: .07, pan: (i % 2 ? .5 : -.5) });
    fx.add(impact(), 90.0, { g: 0.21, hall: .35 }); ZHONG('D3', 90.0, .16);
    fx.add(noise(4.8, { f0: 2200, f1: 7000, Q: .9, crackle: .6, env: function (u) { return Math.min(1, u * 3) * (1 - Math.pow(u, 5)); } }), 92.5, { g: .2, hall: .2 });
    XIAO('A4', 97.6, 2.2, .18, 0); XIAO('C5', 100, 1.2, .18, 0); XIAO('D5', 101.3, 1.0, .18, 0);
    fx.add(whoosh(.6), 107.0, { g: .3, hall: .4 });

    // ===== 天命？ 107.5–135
    for (bar = 43; bar < 45; bar++) { PAD(CH[bar % 4], bar * BAR, BAR + .4, .05); for (i = 0; i < 16; i += 2) fx.add(wood(i % 4 ? 1500 : 1950, .1), bt(bar, i), { g: .2, pan: i % 4 ? .3 : -.3, hall: .2 }); bassLine(bar, .7); K(bt(bar, 0), .8); }
    for (bar = 45; bar < 47; bar++) { PAD(CH[bar % 4], bar * BAR, BAR + .4, .05, { bright: [.15, .6] }); K(bt(bar, 0), .7); K(bt(bar, 8), .6); bassLine(bar, .6); }
    var RNDS = (function () { var s = 2026 >>> 0 || 1, a = []; function r() { s = (s + 0x6D2B79F5) | 0; var q = Math.imul(s ^ s >>> 15, 1 | s); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; } for (var j = 0; j < 64; j++) a.push(r() < .5 ? 1 : 0); return a; })();
    for (i = 0; i < 16; i++) { var tq = 112.5 + i * BT / 2 + BT / 2 * .35; ARP(RNDS[i] ? 'A6' : 'D6', tq, .06, RNDS[i] ? .4 : -.4, 6500); }
    PAD(['D3', 'A3', 'D4'], 117.5, 2.8, .07, { att: .4 });
    fx.add(impact(), 120.0, { g: 0.24, hall: .35 }); ZHONG('D3', 120.0, .16);
    for (bar = 48; bar < 54; bar++) { groove(bar, {}); bassLine(bar, 1); PAD(CH[bar % 4], bar * BAR, BAR + .4, .05); riff(bar, .24); }
    THEME.forEach(function (q) { DIZI(q[0], 125 + q[1] * BT, q[2] * BT * .95, .2, -.05); });
    H.stamp.forEach(function (t0) { drm.add(kick(.9), t0, { g: .28 }); fx.add(noise(.12, { f0: 1600, f1: 800, Q: .8, env: function (u) { return Math.exp(-u * 8); } }), t0, { g: .3, hall: .2 }); });
    fx.add(impact(), 125.0, { g: 0.20, hall: .35 });
    drm.add(kick(1), 130.2, { g: .28 }); ZHONG('A3', 130.2, .14);
    fx.add(riser(2.2), 132.6, { g: .3, hall: .4 });
    fx.add(whoosh(.6), 134.6, { g: .3, hall: .4 });

    // ===== 结语 135–150: the theme comes home
    for (bar = 54; bar < 60; bar++) PAD(CH[bar % 4], bar * BAR, BAR + (bar === 59 ? 2.5 : .6), .065, { att: 1.0 });
    QIN('D2', 135, .45, -.1, 6); QIN('A2', 137.5, .4, -.1, 6);
    THEME.forEach(function (q) { XIAO(q[0], 137.5 + q[1] * BT, q[2] * BT * .95, .2, -.05); });
    for (i = 0; i < 8; i++) ZHENG(pent(i, 4), 140 + i * BT * .5, .12, (i % 2 ? .4 : -.4));
    fx.add(riser(1.6), 142.6, { g: .3, hall: .4 });
    ZHONG('D3', 144.2, .5); GU(144.2, .35, 'D2'); fx.add(impact(), 144.2, { g: 0.15, hall: .45 });
    ['D5', 'F5', 'A5', 'D6'].forEach(function (n, j) { FAN(n, 144.3 + j * .08, .1, (j - 1.5) * .3); });
    for (i = 0; i < 7; i++) FAN(pent(i + 2, 5), 145.8 + i * .26, .06, (i % 2 ? .4 : -.4));
    QIN('D2', 148.0, .4, 0, 4);

    // caption pops (very soft)
    S.CAPS.forEach(function (c, j) { if (c[3]) return; fx.add(pop(620 + (j % 4) * 60), c[0], { g: .035, pan: (j % 2 ? .2 : -.2) }); });
    // sidechain the pads/bass under the kicks
    var env = new Float32Array(N); for (i = 0; i < N; i++) env[i] = 1;
    kicks.forEach(function (t0) { var a = Math.round(t0 * SR), L2 = Math.round(.3 * SR); for (var q = 0; q < L2 && a + q < N; q++) { var d = 1 - .45 * Math.exp(-q / SR / .09) * Math.min(1, q / 60 + .4); if (d < env[a + q]) env[a + q] = d; } });
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
    var secs = S.CH.map(function (s) { return [s[2], s[3]]; });
    var TARGET = opts.target || [-20.5, -17.5, -16.8, -17.2, -17.2, -16.8, -15.8, -19];
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
    var pk = []; for (var sec = 0; sec < 150; sec++) { var mx = 0; for (i = sec * SR; i < (sec + 1) * SR; i++) { var v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > mx) mx = v; } pk.push(20 * Math.log10(mx + 1e-9)); }
    log('pre-limit peaks > 0 dBFS at s: ' + pk.map(function (v, k) { return v > 0 ? k + ':' + v.toFixed(1) : ''; }).filter(Boolean).join(' '));
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
