/* Act I — HAIKU: a world in a moment (12–38 s). Washi, sumi bamboo, a small gold moon, mountains in a lake. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var SX = 76, SY = 150, SW = 928, SH = 1620, WATER = 1292, IMPACT = { x: 500, y: 1342, t: 34.3 };
  var st = {};
  F.HAIKU = { IMPACT: IMPACT, TILT: 582 };

  /* ---- bamboo definition (local to each stalk: x across, y up = negative) ---- */
  var STALKS = [
    { // back stalk: thinner, paler
      bx: 992, by: 1800, tilt: -.012, w0: 15, w1: 9, tone: .42, t0: 14.6, t1: 21.4,
      joints: [0, 215, 440, 650, 850, 1035, 1200, 1352],
      twigs: [
        { y: -1352, pts: [[0, -1352], [-6, -1392], [-16, -1420]], t: 0, clusters: [{ at: 1, rot: [.95, .45, -.05, -.55], L: [118, 150, 132, 96], tone: 2 }] },
        { y: -650, pts: [[-3, -650], [-40, -676], [-78, -682]], t: 0, clusters: [{ at: 1, rot: [.85, .3, -.25], L: [112, 138, 92], tone: 2 }] }
      ]
    },
    { // front stalk
      bx: 930, by: 1800, tilt: -.037, w0: 27, w1: 17, tone: .9, t0: 13.2, t1: 19.6,
      joints: [0, 158, 340, 530, 722, 912, 1098, 1280, 1458, 1630, 1800],
      twigs: [
        { y: -912, pts: [[-6, -912], [-92, -948], [-218, -956]], clusters: [{ at: .52, rot: [.8, .28, -.2], L: [128, 150, 104], tone: 1 }, { at: 1, rot: [1.08, .62, .16, -.34], L: [168, 192, 158, 118], tone: 0, fall: 1 }] },
        { y: -1098, pts: [[-6, -1098], [-82, -1136], [-196, -1148]], clusters: [{ at: .5, rot: [.55, .02, -.5], L: [118, 140, 98], tone: 1 }, { at: 1, rot: [1.22, .72, .22, -.3], L: [148, 186, 168, 108], tone: 0 }] },
        { y: -1280, pts: [[5, -1280], [34, -1306], [56, -1312]], clusters: [{ at: 1, rot: [-.95, -.45, .1], L: [84, 104, 76], tone: 1 }] }
      ]
    }
  ];

  function leafSprite(alpha) {
    return F.sprite(64, 228, function (g) {
      var gr = g.createLinearGradient(0, 0, 0, 228);
      gr.addColorStop(0, F.rgba(C.ink, alpha)); gr.addColorStop(.55, F.rgba(C.ink, alpha * .9)); gr.addColorStop(1, F.rgba(C.ink, alpha * .62));
      g.fillStyle = gr; g.shadowColor = F.rgba(C.ink, alpha * .55); g.shadowBlur = 3.5 * g.q;
      g.beginPath(); g.moveTo(32, 5); g.bezierCurveTo(50, 44, 51, 100, 30, 224); g.bezierCurveTo(17, 108, 15, 46, 32, 5); g.fill();
      g.shadowBlur = 0;
      // dry-brush streak
      g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(33, 30); g.quadraticCurveTo(37, 100, 31, 190); g.stroke();
      g.lineWidth = .9; g.beginPath(); g.moveTo(28, 60); g.quadraticCurveTo(29, 110, 29, 160); g.stroke();
    });
  }

  function mountainSprite() {
    return F.sprite(SW, 270, function (g, w, h) {
      var R = F.rng(5);
      function ridge(peaks, base, rough, seed) {
        var pts = [];
        for (var x = -10; x <= w + 10; x += 6) {
          var y = 0; for (var i = 0; i < peaks.length; i++) { var pk = peaks[i], d = (x - pk[0] * w) / (pk[2] * w); y += pk[1] * Math.exp(-d * d); }
          y += rough * (F.noise(x * .012, seed) * .6 + F.noise(x * .045, seed + 3) * .3 + F.noise(x * .13, seed + 7) * .1);
          pts.push([x, h - base - y]);
        }
        return pts;
      }
      function paint(pts, a, fade) {
        var top = h; pts.forEach(function (q) { if (q[1] < top) top = q[1]; });
        var gr = g.createLinearGradient(0, top, 0, h);
        gr.addColorStop(0, F.rgba(C.ink, a)); gr.addColorStop(.5, F.rgba(C.ink, a * fade)); gr.addColorStop(1, F.rgba(C.ink, 0));
        g.fillStyle = gr;
        for (var k = 0; k < 3; k++) { // three soft passes = wet edge
          g.beginPath(); g.moveTo(-10, h);
          for (var i = 0; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1] + k * 2.2 + R.range(-.6, .6));
          g.lineTo(w + 10, h); g.closePath(); g.globalAlpha = k === 0 ? .55 : .3; g.fill();
        }
        g.globalAlpha = 1;
      }
      paint(ridge([[.34, 168, .16], [.56, 96, .1], [.1, 60, .12]], 14, 13, 1), .26, .42);
      paint(ridge([[.7, 120, .13], [.86, 78, .08], [.5, 40, .1]], 8, 11, 2), .40, .4);
      paint(ridge([[.12, 62, .11], [.27, 38, .07], [.97, 52, .08]], 0, 8, 3), .62, .35);
      F.granulate(g, w, h, R, 2600, .16);
    });
  }

  F.acts.haiku = {
    build: function () {
      // washi sheet with baked shadow
      var washi = F.makePaper({ seed: 23, base: C.washi, mott: ['#FFFFFF', '#E6DCC2', '#F1E9D6'], mottA: .8, fib: ['#FFFFFF', '#A8966C'], fibN: 1700, fibL: [40, 170], fibLight: .62, grain: 7 });
      st.sheet = F.sprite(W, H, function (g) {
        g.shadowColor = 'rgba(84,66,34,.30)'; g.shadowBlur = 26 * g.q; g.shadowOffsetY = 9 * g.q;
        g.fillStyle = C.washi; g.fillRect(SX, SY, SW, SH);
        g.shadowColor = 'rgba(0,0,0,0)';
        g.drawImage(washi.c, SX, SY, SW, SH, SX, SY, SW, SH);
        g.strokeStyle = 'rgba(150,130,90,.22)'; g.lineWidth = 1; g.strokeRect(SX + .5, SY + .5, SW - 1, SH - 1);
      });
      st.leaf = [leafSprite(.93), leafSprite(.66), leafSprite(.36)];
      st.mount = mountainSprite();
      st.moon = F.sprite(240, 240, function (g) {
        var R = F.rng(9), gr = g.createRadialGradient(104, 100, 8, 120, 120, 104);
        gr.addColorStop(0, '#F2E3BC'); gr.addColorStop(.6, '#E2CD9F'); gr.addColorStop(1, '#CDB07A');
        g.fillStyle = gr; g.beginPath(); g.arc(120, 120, 100, 0, 6.3); g.fill();
        g.save(); g.clip();
        for (var i = 0; i < 16; i++) F.wash(g, F.blob(R.range(40, 200), R.range(40, 200), R.range(12, 44), R.range(10, 34), R, 10, .3), i % 3 ? '#B89858' : '#FFF6DC', { R: R, layers: 5, alpha: .035, mag: .3 });
        g.restore();
        g.strokeStyle = 'rgba(150,120,60,.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(120, 120, 99.4, 0, 6.3); g.stroke();
        F.granulate(g, 240, 240, R, 700, .12);
      });
      st.halo = F.glowSprite(300, '#E8D29E', .5, 2.2); F.HAIKU.moon = st.moon;
      // growth schedule: when does each stalk reach each twig?
      STALKS.forEach(function (s) {
        s.len = s.joints[s.joints.length - 1];
        s.twigs.forEach(function (tw, k) {
          var f = -tw.y / s.len, lo = s.t0, hi = s.t1;
          for (var i = 0; i < 24; i++) { var m = (lo + hi) / 2; if (E.inOutS(seg(m, s.t0, s.t1)) < f) lo = m; else hi = m; }
          tw.t = lo + .15; tw.s = F.spline(tw.pts, false, 4);
          tw.clusters.forEach(function (c, ci) { c.t = tw.t + .5 + ci * .75; var q = F.at(tw.s, c.at); c.x = q.x; c.y = q.y; });
        });
      });
      // rest position of the leaf that will fall (world coords)
      var s1 = STALKS[1], c = s1.twigs[0].clusters[1], cs = Math.cos(s1.tilt), sn = Math.sin(s1.tilt);
      st.fall = { x: s1.bx + c.x * cs - c.y * sn, y: s1.by + c.x * sn + c.y * cs, rot: c.rot[1] + s1.tilt, L: c.L[1] };
    },

    drawStalk: function (ctx, s, t) {
      var grown = E.inOutS(seg(t, s.t0, s.t1)) * s.len; if (grown <= 0) return;
      var wind = seg(t, 20, 26) * (1 - seg(t, 36, 38)), sway = Math.sin(t * .55 + s.bx) * .0028 + wind * Math.sin(t * .8 + s.bx * .3) * .004;
      ctx.save(); ctx.translate(s.bx, s.by); ctx.rotate(s.tilt + sway);
      var j, a = s.tone, gr = ctx.createLinearGradient(-s.w0 / 2, 0, s.w0 / 2, 0);
      gr.addColorStop(0, F.rgba(C.ink, a * .98)); gr.addColorStop(.2, F.rgba(C.ink, a * .72)); gr.addColorStop(.52, F.rgba(C.ink, a * .34)); gr.addColorStop(.8, F.rgba(C.ink, a * .6)); gr.addColorStop(1, F.rgba(C.ink, a * .92));
      for (j = 0; j < s.joints.length - 1; j++) {
        var y0 = s.joints[j] + (j ? 3 : 0), y1 = Math.min(s.joints[j + 1] - 3, grown); if (y1 <= y0) break;
        var w0 = lerp(s.w0, s.w1, y0 / s.len) / 2, w1 = lerp(s.w0, s.w1, y1 / s.len) / 2, mid = (y0 + y1) / 2, bow = .9;
        ctx.fillStyle = gr; ctx.beginPath();
        ctx.moveTo(-w0 - 1.5, -y0); ctx.quadraticCurveTo(-(w0 + w1) / 2 * bow, -mid, -w1 - 1.2, -y1);
        ctx.quadraticCurveTo(0, -y1 - 3, w1 + 1.2, -y1);
        ctx.quadraticCurveTo((w0 + w1) / 2 * bow, -mid, w0 + 1.5, -y0); ctx.quadraticCurveTo(0, -y0 + 3, -w0 - 1.5, -y0); ctx.fill();
        // node ring
        if (y1 >= s.joints[j + 1] - 3.01) {
          ctx.strokeStyle = F.rgba(C.ink, a * .95); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-w1 - 3, -y1 - 1.5); ctx.quadraticCurveTo(0, -y1 - 5.5, w1 + 3, -y1 - 1.5); ctx.stroke();
        }
      }
      // twigs and leaves
      for (j = 0; j < s.twigs.length; j++) {
        var tw = s.twigs[j], tq = E.out(seg(t, tw.t, tw.t + 1.5)); if (tq <= 0) continue;
        ctx.fillStyle = F.rgba(C.ink, a * .9);
        F.ribbon(ctx, tw.s, 0, tq, function (u) { return lerp(4.2, 1.6, u); });
        for (var k = 0; k < tw.clusters.length; k++) {
          var c = tw.clusters[k];
          for (var i = 0; i < c.rot.length; i++) {
            if (c.fall && i === 1 && t >= 32) continue; // this one lets go
            var g = E.out(seg(t, c.t + i * .2, c.t + i * .2 + .7)); if (g <= 0) continue;
            var ph = i * 1.9 + k * 2.7 + j * 1.3, amp = .022 + wind * .075;
            var rot = c.rot[i] + Math.sin(t * 1.15 + ph) * amp + Math.sin(t * 2.3 + ph * 1.7) * amp * .4;
            F.blit(ctx, st.leaf[c.tone], c.x, c.y, { ax: .5, ay: .02, rot: rot, sx: (c.L[i] / 224) * lerp(.5, 1, g) * 1.05, sy: (c.L[i] / 224) * g });
          }
        }
      }
      ctx.restore();
    },

    draw: function (ctx, t) {
      var open = p(t, 11.6, 13.95, E.inOut); if (open <= 0) return;
      var k = p(t, 34.7, 37.9, E.inOut), out = 1 - p(t, 35.0, 37.6, E.inOutS); if (out <= 0) return;
      var top = lerp(960, SY - 40, open), bot = lerp(960, SY + SH + 60, open), ty = -k * F.HAIKU.TILT, i;

      // after the hand-off the prologue is fully covered: repaint parchment so the fade reveals the page
      ctx.save(); ctx.globalAlpha = out; ctx.translate(0, ty);
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, bot - top); ctx.clip();
      ctx.drawImage(st.sheet.c, 0, 0, W, H);
      ctx.beginPath(); ctx.rect(SX, SY, SW, SH); ctx.clip();

      // L1 — moon
      var mq = p(t, 14.4, 22.5, E.out), my = lerp(930, 700, mq), ma = p(t, 14.4, 17.4, E.inOutS), mx = 806 + Math.sin(t * .12) * 2;
      if (ma > 0) { F.blit(ctx, st.halo, mx, my, { a: ma * .75, sc: 1 + Math.sin(t * .7) * .03 }); F.blit(ctx, st.moon, mx, my, { a: ma, sc: 1 }); }

      // L2 — ink becomes mountains and their reflection (masked by a spreading blot)
      var bq = p(t, 20.0, 25.5, E.out);
      if (bq > 0) {
        var sc = F.scratch(), g = sc.g, drift = (t - 20) * -.5;
        g.drawImage(st.mount.c, SX + drift, WATER - 270, SW, 270);
        // reflection: mirrored strips with a gentle horizontal wave
        var rq = p(t, 22, 26.5, E.inOutS);
        if (rq > 0) {
          g.globalAlpha = .42 * rq;
          for (i = 0; i < 44; i++) {
            var yy = i * 4, dx = Math.sin(yy * .09 + t * 1.3) * (1.5 + yy * .035), q = F.Q;
            g.drawImage(st.mount.c, 0, (270 - yy - 4) * q, SW * q, 4 * q, SX + drift + dx, WATER + yy * .86, SW, 4);
          }
          g.globalAlpha = 1;
          var fg = g.createLinearGradient(0, WATER, 0, WATER + 160); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
          g.globalCompositeOperation = 'destination-out'; g.fillStyle = fg; g.fillRect(0, WATER, W, 170);
        }
        g.globalCompositeOperation = 'destination-in';
        F.softDisc(g, 470, 1215, 60 + bq * 760, .55);
        ctx.drawImage(sc.c, 0, 0, W, H);
        // the blot itself, strongest at the start
        var ba = (1 - p(t, 20.4, 23.5, E.inOutS)) * seg(t, 20, 20.5);
        if (ba > 0) { ctx.globalAlpha = out * ba * .5; F.softDisc(ctx, 470, 1215, 30 + bq * 260, .8, C.ink); ctx.globalAlpha = out; }
        // waterline
        var wq = p(t, 22, 26, E.inOut);
        ctx.strokeStyle = F.rgba(C.ink, .3); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(540 - 440 * wq, WATER + .5); ctx.lineTo(540 + 440 * wq, WATER + .5); ctx.stroke();
        // moon on the water
        var mr = p(t, 23, 27, E.inOutS);
        if (mr > 0) for (i = 0; i < 9; i++) {
          var ry = WATER + 26 + i * 13, rw = (58 - i * 4.5) * (.7 + .3 * Math.sin(t * 1.6 + i * 1.3));
          ctx.fillStyle = F.rgba('#C9A964', (.55 - i * .05) * mr);
          ctx.fillRect(mx - rw + Math.sin(t * 1.1 + i) * 5, ry, rw * 2, 2.2);
        }
      }

      // L3 — bamboo
      this.drawStalk(ctx, STALKS[0], t); this.drawStalk(ctx, STALKS[1], t);

      // the leaf lets go
      if (t >= 32 && t < IMPACT.t + .5) {
        var f = st.fall, q2 = seg(t, 32, IMPACT.t), qe = Math.pow(q2, 1.35);
        var lx = lerp(f.x, IMPACT.x, E.inOutS(q2)) + Math.sin(q2 * Math.PI * 3.2) * 54 * (1 - q2 * .7);
        var ly = lerp(f.y, IMPACT.y - 60, qe), rot = lerp(f.rot, 1.35, q2) + Math.sin(q2 * Math.PI * 3.2 + .6) * .55;
        var sink = 1 - seg(t, IMPACT.t - .05, IMPACT.t + .4);
        F.blit(ctx, st.leaf[0], lx, ly, { ax: .5, ay: .5, rot: rot, sx: (f.L / 224) * (.55 + .45 * Math.abs(Math.cos(q2 * Math.PI * 3.2))), sy: (f.L / 224) * lerp(1, .5, q2), a: sink });
      }
      ctx.restore();

      // scroll rolls at the opening edges
      var ra = 1 - p(t, 13.5, 14.7, E.inOutS);
      if (ra > 0 && open > 0) {
        [[top, 1], [bot, -1]].forEach(function (e) {
          var y = e[0], gr = ctx.createLinearGradient(0, y - 15, 0, y + 15);
          gr.addColorStop(0, '#D8CCAE'); gr.addColorStop(.35, '#FBF7EC'); gr.addColorStop(.7, '#E4D9BC'); gr.addColorStop(1, '#B7A680');
          ctx.globalAlpha = out * ra; ctx.fillStyle = gr; ctx.fillRect(SX - 6, y - 15, SW + 12, 30);
          ctx.fillStyle = 'rgba(70,55,30,.16)'; ctx.fillRect(SX - 6, y + (e[1] > 0 ? -22 : 15), SW + 12, 7);
        });
        ctx.globalAlpha = out;
      }

      // L5 — title
      // a small seal: the one touch of rose on the sheet
      var sq = E.outBack(seg(t, 17.6, 18.3));
      if (sq > 0) {
        var so = (1 - p(t, 34.2, 36.2, E.inOutS));
        ctx.save(); ctx.translate(156, 644); ctx.scale(sq, sq); ctx.rotate(-.03); ctx.globalAlpha = out * so * .92;
        ctx.fillStyle = '#A9735C'; ctx.beginPath(); ctx.moveTo(-22, -26); ctx.lineTo(23, -25); ctx.quadraticCurveTo(27, -24, 26, -20); ctx.lineTo(25, 24); ctx.quadraticCurveTo(24, 27, 20, 26); ctx.lineTo(-23, 25); ctx.quadraticCurveTo(-26, 24, -26, 20); ctx.lineTo(-25, -22); ctx.quadraticCurveTo(-25, -26, -22, -26); ctx.fill();
        F.text(ctx, '俳', 0, 13, { font: 'sc', size: 36, weight: 600, color: C.washi, alpha: .95 });
        ctx.restore(); ctx.globalAlpha = out;
      }
      F.titleBlock(ctx, S.ACTS[1], t, { x: 130, y: 384, align: 'l', t0: 13.9, out0: 34.2, out1: 36.2, size: 168 });
      ctx.restore();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
