/* Act II — SONNET: emotion in form (38–66 s). Ripples become a medallion; a rose opens; fourteen lines; lines become staves. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var M = { x: 540, y: 846 }, R1 = 226, R2 = 238, R3 = 258, NS = 26;
  var LX0 = 200, LX1 = 880, LY0 = 1166, PITCH = 19, GAP = 13, RHYME = 'abbaabbacdecde';
  var COLS = [215, 345, 475, 605, 735, 865];
  var STAFF = { x0: 170, x1: 910, up: 1196, lo: 1352, sp: 21, bars: [170, 410, 670, 910] };
  var STAIR = { top: 1296, step: 20.6, hw0: 404, hw1: 478 }; // ten edges, shared with act III
  F.SON = { M: M, COLS: COLS, STAFF: STAFF, STAIR: STAIR };
  F.HAIKU.TILT = F.HAIKU.IMPACT.y - M.y;
  var st = {};

  function lineY(k) { return LY0 + k * PITCH + (k >= 4 ? GAP : 0) + (k >= 8 ? GAP : 0) + (k >= 11 ? GAP : 0); }
  F.SON.stairY = function (k) { return STAIR.top + k * STAIR.step; };
  F.SON.stairHW = function (k) { return lerp(STAIR.hw0, STAIR.hw1, k / 9); };

  function petalSprite(tone, seed) {
    var cols = [[C.roseLL, C.roseL, C.rose], [C.roseL, C.rose, C.roseD], [C.rose, C.roseD, '#7E5946']][tone];
    return F.sprite(240, 230, function (g) {
      var R = F.rng(seed), Wd = 196, L = 190, ox = 120, oy = 218;
      var raw = [[0, 0], [-.3, -.16], [-.5, -.5], [-.43, -.84], [-.17, -1.0], [0, -.955], [.17, -1.0], [.43, -.84], [.5, -.5], [.3, -.16]];
      var sp = F.spline(raw.map(function (q) { return [ox + q[0] * Wd + R.range(-3, 3), oy + q[1] * L + R.range(-3, 3)]; }), true, 9), pts = F.pts(sp, 2);
      F.wash(g, pts, cols[0], { R: R, layers: 16, alpha: .11, mag: .1 });
      F.wash(g, pts, cols[1], { R: R, layers: 10, alpha: .055, mag: .12, edge: .5, edgeW: 1.2 });
      // depth toward the heart of the flower
      var inner = pts.map(function (q) { return [ox + (q[0] - ox) * .7, oy + (q[1] - oy) * .62]; });
      F.wash(g, inner, cols[2], { R: R, layers: 12, alpha: .06, mag: .16 });
      var core = pts.map(function (q) { return [ox + (q[0] - ox) * .42, oy + (q[1] - oy) * .36]; });
      F.wash(g, core, cols[2], { R: R, layers: 10, alpha: .07, mag: .2 });
      // light on the rolled lip
      var lip = F.spline([[ox - .36 * Wd, oy - .8 * L], [ox - .15 * Wd, oy - .93 * L], [ox, oy - .9 * L], [ox + .15 * Wd, oy - .93 * L], [ox + .36 * Wd, oy - .8 * L]], false, 6);
      g.fillStyle = F.rgba('#FFF8EC', .34); F.ribbon(g, lip, 0, 1, function (u) { return 13 * Math.sin(u * Math.PI); });
      // veins
      g.strokeStyle = F.rgba(cols[2], .2); g.lineWidth = .9;
      for (var i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(ox + i * 4, oy - 14); g.quadraticCurveTo(ox + i * 22, oy - L * .45, ox + i * 25, oy - L * (.84 - Math.abs(i) * .04)); g.stroke(); }
      // fine engraved contour
      g.strokeStyle = F.rgba('#6B4A3A', .42); g.lineWidth = 1.05; g.lineJoin = 'round'; F.draw(g, sp, 1);
      F.granulate(g, 240, 230, R, 900, .13);
    });
  }
  function leafSprite(seed) {
    return F.sprite(120, 200, function (g) {
      var R = F.rng(seed), raw = [[60, 196], [34, 160], [22, 110], [30, 60], [60, 6], [90, 60], [98, 110], [86, 160]];
      // serrated margin
      var sp = F.spline(raw, true, 7), pts = F.pts(sp, 1).map(function (q, i) { var d = (i % 2 ? 2.2 : -1.2); return [q[0] + (q[0] - 60) / 38 * d, q[1]]; });
      F.wash(g, pts, C.sageL, { R: R, layers: 14, alpha: .1, mag: .08 });
      F.wash(g, pts, C.sage, { R: R, layers: 12, alpha: .07, mag: .1, edge: .55, edgeW: 1.1 });
      F.wash(g, pts.map(function (q) { return [60 + (q[0] - 60) * .5, q[1]]; }).filter(function (q) { return q[0] <= 60.5; }), C.sageD, { R: R, layers: 8, alpha: .06, mag: .1 });
      g.strokeStyle = F.rgba(C.sageD, .6); g.lineWidth = 1.1; g.beginPath(); g.moveTo(60, 196); g.quadraticCurveTo(58, 100, 60, 12); g.stroke();
      g.lineWidth = .7; g.strokeStyle = F.rgba(C.sageD, .34);
      for (var i = 1; i < 7; i++) { var y = 196 - i * 26; g.beginPath(); g.moveTo(60, y); g.quadraticCurveTo(44, y - 14, 30 + i * 1.5, y - 30); g.moveTo(60, y); g.quadraticCurveTo(76, y - 14, 90 - i * 1.5, y - 30); g.stroke(); }
      F.granulate(g, 120, 200, R, 400, .13);
    });
  }
  function scriptPath(R, y, xEnd) {
    var x = LX0 + 4, pts = [], subs = [];
    while (x < xEnd - 30) {
      var n = 2 + Math.floor(R() * 6); pts = [[x, y - 2]];
      for (var i = 0; i < n && x < xEnd - 12; i++) {
        var w = R.range(8, 13), asc = R() < .22 ? R.range(9, 12) : R.range(4.5, 7), desc = R() < .12;
        pts.push([x + w * .35, y - 2 - asc], [x + w * .7, y - 2 - asc * .25 + (desc ? 5 : 0)], [x + w, y - 2.5]);
        x += w;
      }
      subs.push(F.spline(pts, false, 2.5)); x += R.range(11, 17);
    }
    var L = 0; subs.forEach(function (s) { L += s.len; }); subs.len = L; return subs;
  }

  F.acts.sonnet = {
    build: function () {
      st.petals = [petalSprite(0, 31), petalSprite(0, 32), petalSprite(1, 33), petalSprite(1, 34), petalSprite(2, 35)];
      st.leaf = [leafSprite(41), leafSprite(42)]; F.SON.petals = st.petals;
      st.disc = F.sprite(520, 520, function (g) {
        var R = F.rng(51);
        F.wash(g, F.blob(260, 260, 214, 214, R, 26, .04), C.roseLL, { R: R, layers: 18, alpha: .05, mag: .05 });
        F.wash(g, F.blob(260, 268, 190, 186, R, 22, .08), C.roseL, { R: R, layers: 12, alpha: .012, mag: .1 });
        F.granulate(g, 520, 520, R, 2400, .12);
      });
      // flower architecture: ring -> petals
      var R = F.rng(61); st.rose = [];
      [[5, 50, 1.0, 0, 0, 41.2, 4.2], [5, 34, .84, .63, 2, 42.0, 4.2], [4, 20, .66, .3, 3, 42.9, 4.2], [3, 9, .48, 1.0, 4, 43.8, 4.0]].forEach(function (ring, ri) {
        for (var i = 0; i < ring[0]; i++) st.rose.push({ a: ring[3] + i / ring[0] * 6.2832 + R.range(-.1, .1), off: ring[1], sc: ring[2] * R.range(.94, 1.05), sp: ri === 0 ? i % 2 : ring[4], t0: ring[5] + i * .16, d: ring[6], ri: ri });
      });
      st.stem = F.spline([[552, 1072], [560, 1010], [546, 940], [540, 870], [540, 846]], false, 5);
      // fourteen lines of asemic verse
      var R2 = F.rng(71); st.lines = [];
      for (var k = 0; k < 14; k++) { var y = lineY(k), xe = LX1 - R2.range(20, 150); st.lines.push({ y: y, script: scriptPath(R2, y, xe) }); }
      // corner fleurons of the book page
      st.corner = F.path('M0,118 C0,60 4,30 22,16 C40,2 70,0 118,0 M14,14 C40,26 56,44 52,62 C49,74 36,74 34,64 C33,57 40,53 45,57 M14,14 C26,40 44,56 62,52 C74,49 74,36 64,34 C57,33 53,40 57,45 M0,132 L0,150 M132,0 L150,0', 3);
      st.scal = F.path('M-1,0 C-1,-1.25 1,-1.25 1,0', .05)[0];
    },

    drawRose: function (ctx, t, x, y, sc, alpha) {
      var i, ga = ctx.globalAlpha; ctx.globalAlpha = ga * alpha;
      var breathe = 1 + Math.sin(t * .8) * .008;
      for (i = 0; i < st.rose.length; i++) {
        var q = st.rose[i], o = E.out(seg(t, q.t0, q.t0 + q.d)), bud = E.out(seg(t, 40.3, 41.6));
        var s = sc * q.sc * lerp(.26, 1, o) * bud * breathe, a = q.a + (1 - o) * .9 + Math.sin(t * .5 + i) * .012;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.translate(0, -q.off * o * sc);
        ctx.scale(s * .78, s * .78); ctx.drawImage(st.petals[q.sp].c, -120, -218 + 30, 240, 230); ctx.restore();
      }
      // the heart: a small spiral
      var hq = E.out(seg(t, 44.2, 47.5));
      if (hq > 0) {
        ctx.strokeStyle = F.rgba('#7A5442', .55 * hq); ctx.lineWidth = 1.3; ctx.beginPath();
        for (i = 0; i <= 44 * hq; i++) { var an = i * .42, rr = 2 + i * .52; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr * sc, y + Math.sin(an) * rr * sc * .92); }
        ctx.stroke();
      }
      ctx.globalAlpha = ga;
    },

    draw: function (ctx, t) {
      var imp = F.HAIKU.IMPACT, k = p(t, 34.7, 37.9, E.inOut), i;
      var cx = lerp(imp.x, M.x, k), cy = lerp(imp.y, M.y, k), sq = lerp(.25, 1, k);
      var gold = F.gold(ctx, true, t), out = 1 - p(t, 60.4, 63.6, E.inOutS); // medallion + rose leave
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      // warm the page: a breath of rose
      var warm = Math.min(p(t, 37, 41), 1 - p(t, 61, 66));
      if (warm > 0) { ctx.fillStyle = F.rgba(C.rose, .055 * warm); ctx.fillRect(0, 0, W, H); }

      if (out > 0) {
        var lift = p(t, 60.4, 63.6, E.in) * -60, ms = lerp(1, .94, 1 - out);
        ctx.save(); ctx.translate(cx, cy + lift); ctx.scale(ms, ms * sq);
        // rose-tinted ground
        F.blit(ctx, st.disc, 0, 0, { a: p(t, 37.6, 41, E.inOutS) * out });
        // ripples -> rings
        var targets = [R3, R2, R1, 150];
        for (i = 0; i < 4; i++) {
          var tb = imp.t + i * .34, q = E.out(seg(t, tb, tb + 3.0)); if (q <= 0) continue;
          var r = targets[i] * q, a = i === 3 ? (1 - seg(t, tb + .8, tb + 2.6)) * .5 : lerp(.5, 1, k);
          ctx.globalAlpha = a * out * seg(t, tb, tb + .25);
          ctx.strokeStyle = k < .98 ? F.mix(C.ink, '#A98E5C', k) : gold; ctx.lineWidth = i === 2 ? lerp(1.2, 2.6, k) : 1.2;
          ctx.beginPath(); ctx.arc(0, 0, Math.max(.5, r), 0, 6.2832); ctx.stroke();
        }
        // scallops and beads grow around the outer ring
        var sq2 = p(t, 37.6, 42.2, E.inOutS);
        if (sq2 > 0) {
          ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.globalAlpha = out;
          var sr = Math.PI * R3 / NS;
          for (i = 0; i < NS; i++) {
            var g = E.outBack(seg(sq2, i / NS * .8, i / NS * .8 + .2)); if (g <= 0) continue;
            var an = -Math.PI / 2 + (i + .5) / NS * 6.2832;
            ctx.save(); ctx.rotate(an + Math.PI / 2); ctx.translate(0, -R3); ctx.scale(sr * .98, sr * g * .8);
            ctx.lineWidth = 1.3 / sr; F.draw(ctx, st.scal, 1); ctx.restore();
            var an2 = -Math.PI / 2 + i / NS * 6.2832;
            ctx.beginPath(); ctx.arc(Math.cos(an2) * (R3 + 9), Math.sin(an2) * (R3 + 9), 2.3 * g, 0, 6.3); ctx.fill();
            ctx.beginPath(); ctx.arc(Math.cos(an) * (R1 + 6), Math.sin(an) * (R1 + 6), 1.3 * g, 0, 6.3); ctx.fill();
          }
        }
        ctx.restore(); ctx.globalAlpha = 1;

        // L2/L3 — stem, leaves, rose
        var sg = p(t, 38.6, 41.4, E.inOutS);
        if (sg > 0) {
          ctx.save(); ctx.translate(0, lift); ctx.globalAlpha = out;
          ctx.fillStyle = F.rgba(C.sageD, .82); F.ribbon(ctx, st.stem, 0, sg, function (u) { return lerp(6.5, 4, u); });
          ctx.fillStyle = F.rgba(C.sageL, .5); F.ribbon(ctx, st.stem, 0, sg, function (u) { return 1.6; });
          [[.2, -1, 0, 1.0], [.36, 1, 1, .92], [.5, -1, 1, .7]].forEach(function (l, j) {
            var lg = E.outBack(seg(sg, l[0] + .05, l[0] + .4)); if (lg <= 0) return;
            var q = F.at(st.stem, l[0]), sway = Math.sin(t * .9 + j * 2) * .03;
            F.blit(ctx, st.leaf[l[2]], q.x, q.y, { ax: .5, ay: .98, rot: l[1] * (1.08 + j * .08) + sway, sc: .62 * l[3] * lg, a: out });
          });
          this.drawRose(ctx, t, M.x, M.y - 28, 1.0, out);
          ctx.restore(); ctx.globalAlpha = 1;
        }
        // page-corner fleurons
        var cq = p(t, 38.4, 42.4, E.inOutS) * 1; ctx.strokeStyle = gold; ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - p(t, 61, 64)) * .95;
        [[84, 170, 1, 1], [W - 84, 170, -1, 1], [84, H - 150, 1, -1], [W - 84, H - 150, -1, -1]].forEach(function (c) {
          ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(c[2], c[3]); F.draw(ctx, st.corner, cq, false); ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      // ---- fourteen lines -> staves -> stair edges ----
      if (t >= 43.8) {
        var txt = 1 - p(t, 59.6, 61.2, E.inOutS), SF = STAFF, toStair = p(t, 64.6, 67.6, E.inOut), fade = 1 - p(t, 67.0, 68.2);
        for (var kk = 0; kk < 14; kk++) {
          var ln = st.lines[kk], t0 = 44 + kk * 1.0, gq = p(t, t0, t0 + 1.5, E.inOut); if (gq <= 0) continue;
          var mq = p(t, 60.3 + kk * .07, 63.3 + kk * .07, E.inOut);
          var mx = 540, my = ln.y, hw = 340, ang = 0;
          if (kk < 10) {
            var sy = (kk < 5 ? SF.up + kk * SF.sp : SF.lo + (kk - 5) * SF.sp);
            my = lerp(ln.y, sy, mq); hw = lerp(340, 370, mq);
            if (toStair > 0) { my = lerp(my, F.SON.stairY(kk), toStair); hw = lerp(hw, F.SON.stairHW(kk), toStair); }
          } else {
            var b = kk - 10; mx = lerp(540, SF.bars[b], mq); my = lerp(ln.y, (SF.up + SF.lo + 4 * SF.sp) / 2, mq); hw = lerp(340, (SF.lo + 4 * SF.sp - SF.up) / 2, mq); ang = mq * Math.PI / 2 * (b % 2 ? 1 : -1);
          }
          var ca = Math.cos(ang), sa = Math.sin(ang), la = (kk >= 10 ? 1 - p(t, 64.4, 66) : 1) * fade;
          if (la > 0) {
            ctx.globalAlpha = la; ctx.strokeStyle = gold; ctx.lineWidth = lerp(1.5, 1.8, mq);
            ctx.beginPath(); ctx.moveTo(mx - ca * hw, my - sa * hw); ctx.lineTo(mx - ca * hw + ca * 2 * hw * gq, my - sa * hw + sa * 2 * hw * gq); ctx.stroke();
          }
          if (txt > 0) {
            ctx.globalAlpha = txt * .62; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.15;
            F.draw(ctx, ln.script, p(t, t0 + .15, t0 + 2.6, E.lin), true);
            F.text(ctx, RHYME[kk], LX1 + 34, ln.y + 1, { font: 'cg', size: 27, weight: 500, italic: true, color: C.goldDD, alpha: txt * p(t, t0 + 1.3, t0 + 2.1, E.out) });
          }
        }
        ctx.globalAlpha = 1;
        // the motif, written on the stave; then each note sinks to become the foot of a column
        var NOTE = [[0, 1248.5, 1], [1, 1238, 1], [2, 1217, -1], [3, 1206.5, -1], [4, 1238, 1], [5, 1217, -1]];
        for (i = 0; i < 6; i++) {
          var nq = E.outBack(seg(t, 63.0 + i * .5, 63.45 + i * .5)); if (nq <= 0) continue;
          var dq = p(t, 65.2 + i * .12, 66.7 + i * .12, E.inOut), na = 1 - p(t, 66.6, 67.6);
          var nx = COLS[i], ny = lerp(NOTE[i][1], STAIR.top - 4, dq), rx = lerp(11.5, 30, dq), ry = lerp(8.2, 5, dq), up = NOTE[i][2];
          ctx.globalAlpha = na; ctx.fillStyle = F.mix(C.goldDD, C.ink, .35); ctx.strokeStyle = ctx.fillStyle;
          ctx.save(); ctx.translate(nx, ny); ctx.rotate(-.36 * (1 - dq)); ctx.scale(nq, nq); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.2832); ctx.fill(); ctx.restore();
          var sl = 64 * nq * (1 - dq); ctx.lineWidth = 1.8;
          if (sl > 1) { ctx.beginPath(); ctx.moveTo(nx + up * 10.5, ny - up * 2); ctx.lineTo(nx + up * 10.5, ny - up * 2 - up * sl); ctx.stroke(); }
        }
        // three ground notes in the lower stave
        [[290, 1394], [540, 1436], [790, 1352]].forEach(function (n, j) {
          var q = E.outBack(seg(t, 63.2 + j * 1.0, 63.7 + j * 1.0)) * (1 - p(t, 64.8, 66)); if (q <= 0) return;
          ctx.globalAlpha = q; ctx.strokeStyle = F.mix(C.goldDD, C.ink, .35); ctx.lineWidth = 2.4;
          ctx.save(); ctx.translate(n[0], n[1]); ctx.rotate(-.3); ctx.beginPath(); ctx.ellipse(0, 0, 12, 7.6, 0, 0, 6.2832); ctx.stroke(); ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      // L5 — title
      F.titleBlock(ctx, S.ACTS[2], t, { x: 540, y: 372, t0: 38.2, out0: 61.4, out1: 63.4, size: 150 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
