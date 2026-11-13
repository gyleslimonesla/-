/* Act 0 — Prologue: the name not yet written (0–12 s, hand-off until 13.6 s). */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var T = S.TITLE, L = { from: 618, haiku: 806, to: 906, mythos: 1094, rule: 1168, zh: 1262, sub: 1334 };
  var st = {};

  F.acts.prologue = {
    build: function (ctx) {
      st.glow = F.glowSprite(260, '#F2DBA8', .9, 2.6);
      st.core = F.glowSprite(40, '#FFF6DC', 1, 1.6);
      // where the first letter will be written
      var w = F.text(ctx, T.l1, 0, 0, { font: 'cg', size: 50, weight: 500, track: .62, measure: true });
      ctx.font = '500 50px ' + F.FONT.cg; var fw = ctx.measureText('F').width;
      st.fx = 540 - w / 2 + fw / 2; st.fy = L.from - 17; st.fleft = 540 - w / 2;
      var R = F.rng(21); st.blot = F.blob(0, 0, 1, 1, R, 18, .16);
      st.sat = []; for (var i = 0; i < 7; i++) { var a = R() * 6.28, d = R.range(1.5, 2.9); st.sat.push([Math.cos(a) * d, Math.sin(a) * d, R.range(.08, .2)]); }
    },
    cam: function (t) {
      var q = p(t, 1.6, 8.8, E.inOutS);
      return { z: lerp(1.85, 1, q), x: lerp(st.fx, 540, q), y: lerp(st.fy + 40, 960, q) };
    },
    draw: function (ctx, t) {
      var cam = this.cam(t), z = cam.z, B = F.assets.border, i;
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-cam.x, -cam.y);
      ctx.drawImage(F.assets.paper.c, 0, 0, W, H);

      // gold line border grows out of the page
      var orn = 1 - p(t, 11.8, 13.8, E.inOutS);
      F.art.drawBorder(ctx, B, p(t, 2.2, 9.2, E.lin), t, true, 1, orn);

      // ---- title ----
      var out = 1; // covered by the unrolling washi in act I
      var ink = C.ink, gold = C.goldDD;
      // first letter is born from the ink drop
      var fq = p(t, 5.75, 6.7, E.inOutS);
      ctx.font = '500 50px ' + F.FONT.cg; ctx.fillStyle = gold; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      if (fq > 0) { ctx.globalAlpha = fq; ctx.fillText('F', st.fleft, L.from); ctx.globalAlpha = 1; }
      var rest = F.text(ctx, 'FROM', 540, L.from, { font: 'cg', size: 50, weight: 500, track: .62, color: gold, measure: true });
      // R O M
      var xw = st.fleft, chars = 'FROM';
      for (i = 0; i < 4; i++) {
        var cw = ctx.measureText(chars[i]).width;
        if (i > 0) { var q = E.out(seg(t, 6.3 + i * .2, 6.95 + i * .2)); if (q > 0) { ctx.globalAlpha = q; ctx.fillText(chars[i], xw, L.from + (1 - q) * 8); ctx.globalAlpha = 1; } }
        xw += cw + .62 * 50;
      }
      F.text(ctx, T.l2, 540, L.haiku, { font: 'cg', size: 176, weight: 300, track: .1, color: ink, reveal: seg(t, 6.7, 8.1) });
      F.text(ctx, T.l3, 540, L.to, { font: 'cg', size: 50, weight: 500, track: .62, color: gold, reveal: seg(t, 7.7, 8.3) });
      F.text(ctx, T.l4, 540, L.mythos, { font: 'cg', size: 176, weight: 300, track: .1, color: ink, reveal: seg(t, 8.0, 9.4) });
      F.rule(ctx, 540, L.rule, 250, p(t, 9.0, 9.9), gold, 1.4);
      F.text(ctx, T.zh, 540, L.zh, { font: 'sc', size: 56, weight: 600, track: .4, color: ink, reveal: seg(t, 9.2, 10.3), rise: 12 });
      F.text(ctx, T.sub, 540, L.sub, { font: 'cg', size: 46, weight: 400, italic: true, color: C.sageD, alpha: p(t, 9.8, 10.7, E.inOutS) });

      // ---- ink drop ----
      if (t > 4.7 && t < 7.2) {
        var fall = seg(t, 4.85, 5.5), fx = st.fx, fy = st.fy;
        ctx.fillStyle = C.ink;
        if (fall < 1) {
          var yy = fy - 520 * (1 - fall * fall), s = 1 + fall * .5;
          ctx.globalAlpha = clamp(fall * 6);
          ctx.beginPath(); ctx.moveTo(fx, yy - 22 * s); ctx.bezierCurveTo(fx + 4, yy - 9, fx + 6.5, yy - 3, fx + 6.5, yy + 1.5);
          ctx.arc(fx, yy + 1.5, 6.5, 0, Math.PI); ctx.bezierCurveTo(fx - 6.5, yy - 3, fx - 4, yy - 9, fx, yy - 22 * s); ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          var gq = E.outExpo(seg(t, 5.5, 6.0)), fade = 1 - p(t, 5.85, 6.9, E.inOutS), r = 21 * gq * lerp(1, .62, p(t, 5.9, 6.9));
          ctx.globalAlpha = .9 * fade;
          ctx.beginPath();
          for (i = 0; i < st.blot.length; i++) { var b = st.blot[i]; ctx[i ? 'lineTo' : 'moveTo'](fx + b[0] * r, fy + b[1] * r); }
          ctx.closePath(); ctx.fill();
          for (i = 0; i < st.sat.length; i++) { var sa = st.sat[i]; ctx.beginPath(); ctx.arc(fx + sa[0] * r, fy + sa[1] * r, sa[2] * 21 * gq, 0, 6.3); ctx.fill(); }
          // wet halo
          ctx.globalAlpha = .12 * fade; ctx.beginPath(); ctx.arc(fx, fy, r * 1.9, 0, 6.3); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();

      // ---- light: darkness recedes from the golden point ----
      var sx = (st.fx - cam.x) * z + 540, sy = (st.fy - cam.y) * z + 960;
      var dk = 1 - p(t, 4.8, 7.6, E.inOutS);
      if (dk > 0) {
        var Rr = Math.max(2, 2600 * p(t, 1.1, 6.8, E.inOut));
        var gr = ctx.createRadialGradient(sx, sy, Rr * .08, sx, sy, Rr);
        gr.addColorStop(0, 'rgba(14,12,8,0)'); gr.addColorStop(.45, 'rgba(14,12,8,.55)'); gr.addColorStop(1, 'rgba(14,12,8,1)');
        ctx.globalAlpha = dk; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      }
      // the point itself
      var ga = F.io(t, .25, 1.6, 4.9, 5.9);
      if (ga > 0) {
        var br = 1 + Math.sin(t * 2.1) * .08 + Math.sin(t * 5.3) * .03, pre = lerp(.45, 1, p(t, .3, 2.4, E.out));
        ctx.globalCompositeOperation = 'lighter';
        F.blit(ctx, st.glow, sx, sy, { sc: pre * br * lerp(1.1, .7, p(t, 2.2, 4.8)), a: ga * lerp(.5, .22, p(t, 2.2, 4.6)) });
        ctx.globalCompositeOperation = 'source-over';
        F.blit(ctx, st.core, sx, sy, { sc: .32 * br, a: ga });
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
