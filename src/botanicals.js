/* botanicals.js — watercolour leaves, branches and flowers that can grow in real time. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, A = F.art, lerp = F.lerp, clamp = F.clamp, seg = F.seg;

  /** one leaf, pointing up from the bottom-centre of a 60×160 sprite. shape: 'olive' | 'laurel' */
  A.leafSprite = function (shape, cols, seed) {
    return F.sprite(60, 160, function (g) {
      var R = F.rng(seed), w = shape === 'olive' ? 11 : 17, raw = shape === 'olive' ?
        [[30, 156], [30 - w, 110], [30 - w * .95, 60], [30, 6], [30 + w * .95, 60], [30 + w, 110]] :
        [[30, 156], [30 - w, 118], [30 - w * 1.05, 70], [30 - w * .5, 28], [30, 5], [30 + w * .5, 28], [30 + w * 1.05, 70], [30 + w, 118]];
      var sp = F.spline(raw, true, 6), pts = F.pts(sp, 2);
      F.wash(g, pts, cols[0], { R: R, layers: 14, alpha: .12, mag: .07 });
      F.wash(g, pts, cols[1], { R: R, layers: 10, alpha: .07, mag: .09, edge: .5, edgeW: 1 });
      F.wash(g, pts.filter(function (q) { return q[0] >= 29.5; }), cols[2], { R: R, layers: 8, alpha: .06, mag: .1 });
      g.strokeStyle = F.rgba(cols[2], .6); g.lineWidth = 1; g.beginPath(); g.moveTo(30, 156); g.quadraticCurveTo(29, 80, 30, 12); g.stroke();
      F.granulate(g, 60, 160, R, 220, .13);
    });
  };

  /** Build a growable branch. o:{pts, n, len:[a,b], spread, tones, seed, fruit, alt} */
  A.branch = function (o) {
    var R = F.rng(o.seed || 1), stem = F.spline(o.pts, false, 5), leaves = [], fruits = [], n = o.n, i;
    for (i = 0; i < n; i++) {
      var f = lerp(.1, .97, i / (n - 1)), q = F.at(stem, f);
      var sides = o.alt ? [i % 2 ? 1 : -1] : [-1, 1];
      sides.forEach(function (s) {
        leaves.push({ f: f, x: q.x, y: q.y, rot: q.a + Math.PI / 2 + s * ((o.spread || .7) + R.range(-.15, .15)), len: R.range(o.len[0], o.len[1]) * lerp(1, .7, f), tone: Math.floor(R() * o.tones), ph: R() * 6.28 });
      });
      if (o.fruit && R() < o.fruit && f < .85) fruits.push({ f: f, x: q.x + R.range(-10, 10), y: q.y + R.range(8, 18), r: R.range(5.5, 7.5) });
    }
    var end = F.at(stem, 1); leaves.push({ f: .98, x: end.x, y: end.y, rot: end.a + Math.PI / 2, len: o.len[0] * .75, tone: 0, ph: 0 });
    return { stem: stem, leaves: leaves, fruits: fruits, w0: o.w0 || 4, w1: o.w1 || 1.2, stemCol: o.stemCol || C.sageD, fruitCol: o.fruitCol || '#4E5443' };
  };
  /** Draw a branch grown to g (0..1). sprites: array of leaf sprites indexed by tone. */
  A.drawBranch = function (ctx, b, sprites, g, t, alpha, sway) {
    if (g <= 0 || alpha <= 0) return;
    var ga = ctx.globalAlpha, i; ctx.globalAlpha = ga * alpha; sway = sway === undefined ? .03 : sway;
    ctx.fillStyle = b.stemCol; F.ribbon(ctx, b.stem, 0, g, function (u) { return lerp(b.w0, b.w1, u); });
    for (i = 0; i < b.leaves.length; i++) {
      var l = b.leaves[i], q = E.outBack(seg(g, l.f, l.f + .14)); if (q <= 0) continue;
      F.blit(ctx, sprites[l.tone], l.x, l.y, { ax: .5, ay: .975, rot: l.rot + Math.sin(t * 1.1 + l.ph) * sway, sx: l.len / 156 * lerp(.6, 1, q), sy: l.len / 156 * q });
    }
    for (i = 0; i < b.fruits.length; i++) {
      var fr = b.fruits[i], fq = E.outBack(seg(g, fr.f + .08, fr.f + .22)); if (fq <= 0) continue;
      ctx.fillStyle = b.fruitCol; ctx.beginPath(); ctx.ellipse(fr.x, fr.y, fr.r * fq * .82, fr.r * fq, .3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,235,.35)'; ctx.beginPath(); ctx.arc(fr.x - fr.r * .25, fr.y - fr.r * .3, fr.r * .25 * fq, 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = ga;
  };

  /** A many-petalled flower (rose / peony) that opens with o (0..1). petals: sprites from act II. */
  A.flower = function (seed, rings) {
    var R = F.rng(seed), out = [];
    rings.forEach(function (ring, ri) {
      for (var i = 0; i < ring[0]; i++) out.push({ a: ring[3] + i / ring[0] * 6.2832 + R.range(-.12, .12), off: ring[1], sc: ring[2] * R.range(.92, 1.06), sp: ring[4] + (ri === 0 ? i % 2 : 0), d: ri / rings.length * .45 });
    });
    return out;
  };
  A.drawFlower = function (ctx, fl, petals, x, y, sc, o, t, alpha) {
    if (o <= 0 || alpha <= 0) return;
    var ga = ctx.globalAlpha; ctx.globalAlpha = ga * alpha;
    for (var i = 0; i < fl.length; i++) {
      var q = fl[i], op = E.out(seg(o, q.d, q.d + .55)), bud = E.out(seg(o, 0, .25));
      var s = sc * q.sc * lerp(.26, 1, op) * bud * .78, a = q.a + (1 - op) * .9 + Math.sin(t * .5 + i) * .012;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.translate(0, -q.off * op * sc); ctx.scale(s, s);
      ctx.drawImage(petals[q.sp].c, -120, -188, 240, 230); ctx.restore();
    }
    ctx.globalAlpha = ga;
  };
})(typeof window !== 'undefined' ? window : globalThis);
