/* Coda — the words are still growing (142–150 s; hand-off from 139 s). The star chart returns to the page as a wreath. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var RC = { x: 540, y: 806, R: 316 }, st = {};

  F.acts.coda = {
    build: function () {
      var A = F.art, i;
      st.peony = A.flower(201, [[7, 60, 1.0, 0, 0], [6, 42, .86, .45, 2], [5, 25, .68, .2, 3], [4, 10, .5, .9, 4]]);
      st.rosebud = A.flower(203, [[5, 44, .9, .3, 0], [4, 24, .7, .8, 2], [3, 9, .5, .2, 4]]);
      var side = [[196, 1600], [118, 1520], [92, 1400], [112, 1280], [94, 1170], [118, 1060], [104, 960]];
      st.olive = [A.branch({ pts: side, n: 13, len: [74, 108], spread: .66, tones: 3, seed: 205, fruit: .45, w0: 5, w1: 1.4 }),
        A.branch({ pts: side.map(function (q) { return [W - q[0], q[1]]; }), n: 13, len: [74, 108], spread: .66, tones: 3, seed: 207, fruit: .45, w0: 5, w1: 1.4 })];
      var top = [[488, 160], [400, 178], [310, 166], [226, 190], [160, 250]];
      st.laurel = [A.branch({ pts: top, n: 10, len: [58, 82], spread: .6, tones: 2, seed: 209, w0: 3.6, w1: 1.2 }),
        A.branch({ pts: top.map(function (q) { return [W - q[0], q[1]]; }), n: 10, len: [58, 82], spread: .6, tones: 2, seed: 211, w0: 3.6, w1: 1.2 })];
      // wreath: two laurel boughs climbing the ring from its foot
      st.wreath = [-1, 1].map(function (s, k) {
        var pts = []; for (i = 0; i <= 9; i++) { var a = Math.PI / 2 + s * lerp(.1, 2.2, i / 9); pts.push([RC.x + Math.cos(a) * (RC.R + 2), RC.y + Math.sin(a) * (RC.R + 2)]); }
        return A.branch({ pts: pts, n: 17, len: [50, 72], spread: .5, tones: 2, seed: 213 + k, w0: 3, w1: 1 });
      });
      st.dirs = [[-.75, -.66], [1, -.2], [-1, .1], [.8, .6], [0, 1]];
    },
    draw: function (ctx, t) {
      var A = F.art, d = F.dark(t), i;
      // the chart glides up the page and settles as a ring
      var q = p(t, 139.0, 143.2, E.inOut), cy = lerp(F.MYTH.O.y, RC.y, q), R = lerp(F.MYTH.O.R * 1.03, RC.R, q);
      F.acts.mythos.chart(ctx, t, RC.x, cy, R, 1, 1, d < .5);
      if (d > .02) return;
      // the border flowers
      A.drawBorder(ctx, F.assets.border, p(t, 140.6, 145.6, E.lin), t, true, 1, 1);
      st.olive.forEach(function (b, k) { A.drawBranch(ctx, b, F.assets.olive, p(t, 142.0, 146.6, E.inOutS), t + k * 2, 1, .022 * (1 - seg(t, 147.5, 149))); });
      st.laurel.forEach(function (b, k) { A.drawBranch(ctx, b, F.assets.laurel, p(t, 142.6, 146.6, E.inOutS), t + k * 3, 1, .02 * (1 - seg(t, 147.5, 149))); });
      st.wreath.forEach(function (b, k) { A.drawBranch(ctx, b, F.assets.laurel, p(t, 141.8, 146.4, E.inOutS), t + k, .95, .012 * (1 - seg(t, 147.5, 149))); });
      var pet = F.SON.petals, ts = Math.min(t, 148.4);
      A.drawFlower(ctx, st.peony, pet, 186, 1652, 1.02, p(t, 142.2, 147.6, E.out), ts, 1);
      A.drawFlower(ctx, st.peony, pet, W - 186, 1652, 1.02, p(t, 142.5, 147.8, E.out), ts + 4, 1);
      A.drawFlower(ctx, st.rosebud, pet, 540, 1748, .56, p(t, 143.2, 147.8, E.out), ts + 2, 1);
      // the small gold moon of act I, now a seal at the head of the page
      var mq = E.outBack(seg(t, 143.4, 145.2));
      if (mq > 0 && F.HAIKU.moon) F.blit(ctx, F.HAIKU.moon, 540, 246, { sc: .4 * mq, a: clamp(mq * 2) });

      // five names gather
      var names = S.CODA.names;
      for (i = 0; i < 5; i++) {
        var t0 = 142.2 + i * .3, nq = E.out(seg(t, t0, t0 + 2.7)), na = E.inOutS(seg(t, t0, t0 + 1.8)); if (na <= 0) continue;
        var ty = cy - 152 + i * 76, dx = st.dirs[i][0] * 420 * (1 - nq), dy = st.dirs[i][1] * 420 * (1 - nq);
        F.text(ctx, names[i], 540 + dx, ty + dy + 18, { font: 'cg', size: 56, weight: 500, track: lerp(.7, .3, nq), color: C.ink, alpha: na });
        if (i < 4) { var dq = E.outBack(seg(t, 145.2 + i * .12, 145.8 + i * .12)); if (dq > 0) { ctx.fillStyle = C.goldDD; ctx.beginPath(); ctx.arc(540, ty + 42, 2.6 * dq, 0, 6.3); ctx.fill(); } }
      }
      // the last sentence
      F.text(ctx, S.CODA.line[0], 540, 1268, { font: 'sc', size: 52, weight: 600, track: .2, color: C.ink, reveal: seg(t, 143.5, 145.7), rise: 12 });
      F.text(ctx, S.CODA.line[1], 540, 1346, { font: 'sc', size: 52, weight: 600, track: .2, color: C.ink, reveal: seg(t, 145.3, 147.5), rise: 12 });
      F.rule(ctx, 540, 1408, 200, p(t, 146.4, 147.8), C.goldDD, 1.3);
      for (i = 0; i < 2; i++) F.text(ctx, S.CODA.colophon[i], 540, 1462 + i * 36, { font: 'sc', size: 22, weight: 500, wsc: 400, track: .1, latin: 1.15, color: C.sageD, alpha: p(t, 146.6 + i * .3, 148.0 + i * .2, E.inOutS) * .92 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
