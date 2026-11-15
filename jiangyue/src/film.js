/* film.js — 总谱：素材构建、转场合成、唯一的 render(t)。 */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, K = F.K, W = F.W, H = F.H, seg = F.seg, p = F.p, clamp = F.clamp;
  F.assets = F.assets || {}; F.acts = F.acts || {};
  var SEQ = ['xu', 'jiang', 'shan', 'feng', 'baidi', 'xihu', 'xia', 'yuan', 'ba'], TXT = {};
  S.TEXT.forEach(function (x) { TXT[x.id] = x; });

  /* ---------- words ---------- */
  /** draw text block `id` at (x,y). o:{color, halo, size, gap, pitch, hold} */
  F.say = function (ctx, t, id, x, y, o) {
    var x0 = TXT[id], a = x0.t[0], b = x0.t[1]; if (t < a || t > b) return;
    o = o || {}; var poem = x0.kind === 'poem', n = x0.cols.join('').length;
    var rv = seg(t, a, a + (o.dur || (poem ? Math.min(3.4, .22 * n + .8) : Math.min(2.4, .16 * n + .7)))), out = 1 - E.inOutS(seg(t, b - (o.out || 1.1), b));
    var size = o.size || (poem ? 88 : 38);
    F.vtext(ctx, x0.cols, x, y, { font: poem ? 'xing' : 'sc', weight: poem ? 400 : (o.weight || 300), size: size, pitch: o.pitch || size * (poem ? 1.0 : 1.42), gap: o.gap || size * (poem ? 1.22 : 1.9),
      color: o.color || C.ink, alpha: out * (o.alpha || 1), reveal: rv, halo: o.halo, haloBlur: o.haloBlur, stagger: o.stagger });
  };
  /** 落款：朝代 作者 篇名 + 时辰印 */
  F.sign = function (ctx, t, key, x, y, o) {
    var act = S.ACTS[key], a = act.t0 + (o.delay === undefined ? 2.4 : o.delay), b = act.t1 - (o.early || 1.4); if (t < a || t > b + .1) return;
    var al = E.inOutS(F.io(t, a, a + 1.4, b - 1.1, b));
    F.vtext(ctx, [act.who + '　' + act.work], x, y, { font: 'sc', weight: o.weight || 300, size: 30, pitch: 40, color: o.color || C.ink, alpha: al * .95, halo: o.halo, haloBlur: 10 });
    var n = (act.who + act.work).length + .5, sy = y + n * 40 + 20, sq = E.outBack(seg(t, a + .9, a + 1.6));
    if (sq > 0) F.blit(ctx, F.assets.seals[act.seal], x, sy + 62, { sc: .82 * (.9 + .1 * sq), a: al * clamp(sq * 2) });
  };

  /** 画帘：章首的古画自中缝拉开。在每章 paint 的最后调用。 */
  F.OPEN = [.9, 3.1];
  F.curtain = function (ctx, key, t) { var t0 = S.ACTS[key].t0; if (t < t0 + F.OPEN[1]) K.curtain(ctx, F.assets.cards[key], seg(t, t0 + F.OPEN[0], t0 + F.OPEN[1])); };
  /** local progress helper: seconds since the curtain began to open */
  F.since = function (key, t) { return t - S.ACTS[key].t0 - F.OPEN[0]; };

  /* ---------- build ---------- */
  F.init = function (q, onProgress) {
    F.Q = q;
    var steps = [function () {
      F.assets.paper = F.makePaper({ seed: 11, base: C.paper, mott: ['#D9CFB6', '#FFFFFF', '#CFC4A8', '#EDE6D4'], fib: ['#FFFEF8', '#8E8262'], fibN: 2600, fibL: [18, 90], edge: '#B7A887', edgeA: .12, edgeW: 260, grain: 8 });
      // 纸纹覆层：让深色的夜也仍是“画在纸上”
      F.assets.fiber = F.sprite(W, H, function (g) {
        var R = F.rng(77); g.lineCap = 'round';
        for (var i = 0; i < 1500; i++) { var x = R() * W, y = R() * H, L = R.range(20, 110), a = R() * 6.28, b = R.range(-.5, .5); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + b) * L * .5, y + Math.sin(a + b) * L * .5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.strokeStyle = R() < .6 ? 'rgba(255,252,240,' + R.range(.03, .09) + ')' : 'rgba(40,36,24,' + R.range(.02, .06) + ')'; g.lineWidth = R.range(.5, 1.4); g.stroke(); }
      });
      F.assets.seals = {}; ['黄昏', '人定', '夜半', '日出', '日中', '日入', '一昼夜'].forEach(function (s, i) { F.assets.seals[s] = K.sealSprite(s, 31 + i); });
      F.assets.buf = F.sprite(W, H);
      // 每章开卷的“古画”
      F.assets.cards = {};
      ['jiang', 'shan', 'feng', 'baidi', 'xihu', 'yuan'].forEach(function (k, i) { var a = S.ACTS[k]; F.assets.cards[k] = K.oldPainting(k, a.work.replace(/\u3000/g, ''), a.who, F.assets.seals[a.seal], 900 + i * 17); });
    }];
    SEQ.forEach(function (id) { var a = F.acts[id]; if (a && a.build) steps.push(function () { a.build(); }); });
    var i = 0;
    return F.loadFonts().then(function () {
      return new Promise(function (res, rej) {
        (function next() {
          if (i >= steps.length) { res(); return; }
          try { steps[i++](); } catch (e) { rej(e); return; }
          if (onProgress) onProgress(i / steps.length);
          setTimeout(next, 0);
        })();
      });
    });
  };

  /** the frame for master-clock time t — a pure function of t */
  F.render = function (ctx, t) {
    var q = F.Q, i, cur = 0;
    t = Math.max(0, Math.min(F.DUR, t));
    ctx.setTransform(q, 0, 0, q, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // an act becomes the base layer once its entrance has finished
    for (i = 0; i < SEQ.length; i++) { var a = F.acts[SEQ[i]]; if (a && t >= S.ACTS[SEQ[i]].t0 + (a.post || 0)) cur = i; }
    var A = F.acts[SEQ[cur]]; A.paint(ctx, t);
    ctx.setTransform(q, 0, 0, q, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    var nx = SEQ[cur + 1], B = nx && F.acts[nx];
    if (B) {
      var t0 = S.ACTS[nx].t0 - (B.pre || 0), t1 = S.ACTS[nx].t0 + (B.post || 0);
      if (t >= t0) {
        var buf = F.assets.buf, g = buf.g, qq = seg(t, t0, t1);
        g.setTransform(q, 0, 0, q, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
        B.paint(g, t);
        g.setTransform(q, 0, 0, q, 0, 0); g.globalAlpha = 1;
        if (B.mask) { g.globalCompositeOperation = 'destination-in'; B.mask(g, qq, t); g.globalCompositeOperation = 'source-over'; ctx.drawImage(buf.c, 0, 0, W, H); }
        else { ctx.globalAlpha = E.inOutS(qq); ctx.drawImage(buf.c, 0, 0, W, H); ctx.globalAlpha = 1; }
        if (B.veil) B.veil(ctx, qq, t);
      }
    }
    ctx.globalAlpha = .55; ctx.drawImage(F.assets.fiber.c, 0, 0, W, H); ctx.globalAlpha = 1;
    for (i = 0; i < SEQ.length; i++) { var ac = F.acts[SEQ[i]], d = S.ACTS[SEQ[i]]; if (ac && ac.words && t >= d.t0 - 3 && t <= d.t1 + 3) ac.words(ctx, t); }
    ctx.globalAlpha = 1;
  };
  F.SEQ = SEQ;
})(typeof window !== 'undefined' ? window : globalThis);
