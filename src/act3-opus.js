/* Act III — OPUS: the art of creation (66–94 s). Staves become steps; columns rise; a temple in morning light. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var SON = F.SON, COLS = SON.COLS, BASE = SON.STAIR.top, COLH = 434, CAPY = BASE - 4 - COLH; // 858
  var ROOF = { x: 120, y: 574, w: 840, h: 290, cx: 420, base: 202, apex: 42, arch: 284 }; // local y = world y - 574
  var RELIEF = { x: 566, y: 770, s: 1 / 3.6 }; // fox foot in the tympanum; scaled 3.6x it lands on the fable stage
  F.OPUS = { RELIEF: RELIEF, FOX: { x: 640, y: 1250 }, CROW: { dx: -224, dy: -292 }, TRUNK: { dx: -350 } };
  var st = {};
  var INKL = function (a) { return F.rgba('#4A4A3A', a); };

  function columnSprite() {
    return F.sprite(110, 440, function (g) {
      var cx = 55, i, R = F.rng(81);
      function hw(y) { var u = (y - 67) / 341; return lerp(23, 27, u) + Math.sin(Math.PI * u) * .9; }
      // shaft
      var gr = g.createLinearGradient(cx - 28, 0, cx + 28, 0);
      gr.addColorStop(0, '#E4DCC4'); gr.addColorStop(.22, '#FAF4E2'); gr.addColorStop(.55, '#EFE7D0'); gr.addColorStop(.85, '#D3CDB4'); gr.addColorStop(1, '#BDB9A0');
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 23, 67);
      for (i = 67; i <= 408; i += 11) g.lineTo(cx - hw(i), i);
      for (i = 408; i >= 67; i -= 11) g.lineTo(cx + hw(i), i);
      g.closePath(); g.fill(); g.strokeStyle = INKL(.6); g.lineWidth = 1.2; g.stroke();
      // flutes
      [-62, -42, -22, 0, 22, 42, 62].forEach(function (deg) {
        var s = Math.sin(deg * Math.PI / 180);
        g.strokeStyle = INKL(.34); g.lineWidth = .9; g.beginPath(); g.moveTo(cx + 23 * s, 72); for (i = 80; i <= 404; i += 12) g.lineTo(cx + hw(i) * s, i); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + 23 * s - 1.6, 72); for (i = 80; i <= 404; i += 12) g.lineTo(cx + hw(i) * s - 1.6, i); g.stroke();
      });
      // right-hand hatching (copperplate shadow)
      g.strokeStyle = INKL(.16); g.lineWidth = .7;
      for (i = 74; i < 404; i += 5) { g.beginPath(); g.moveTo(cx + hw(i) * .66, i); g.lineTo(cx + hw(i) - 1, i + 2); g.stroke(); }
      // base: torus, scotia, torus
      function torus(y0, y1, w) { g.fillStyle = gr; g.beginPath(); g.moveTo(cx - w + 4, y0); g.quadraticCurveTo(cx - w - 3, (y0 + y1) / 2, cx - w + 4, y1); g.lineTo(cx + w - 4, y1); g.quadraticCurveTo(cx + w + 3, (y0 + y1) / 2, cx + w - 4, y0); g.closePath(); g.fill(); g.strokeStyle = INKL(.6); g.lineWidth = 1.1; g.stroke(); }
      torus(408, 417, 32); g.fillStyle = '#D9D2BA'; g.fillRect(cx - 28, 417, 56, 6); torus(423, 435, 36);
      // necking
      torus(62, 68, 26);
      // capital bell
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 23, 62); g.bezierCurveTo(cx - 24, 40, cx - 30, 24, cx - 38, 12); g.lineTo(cx + 38, 12); g.bezierCurveTo(cx + 30, 24, cx + 24, 40, cx + 23, 62); g.closePath(); g.fill(); g.strokeStyle = INKL(.5); g.stroke();
      // acanthus: two tiers
      function leaf(x, yb, w, h, lean) {
        g.fillStyle = '#F6F0DD'; g.strokeStyle = INKL(.62); g.lineWidth = 1;
        g.beginPath(); g.moveTo(x - w / 2, yb); g.bezierCurveTo(x - w / 2 - 1, yb - h * .6, x - w * .34 + lean, yb - h, x + lean * 1.6, yb - h);
        g.bezierCurveTo(x + w * .34 + lean, yb - h, x + w / 2 + 1, yb - h * .6, x + w / 2, yb); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(x, yb); g.quadraticCurveTo(x + lean * .6, yb - h * .5, x + lean * 1.4, yb - h + 3); g.stroke();
        g.lineWidth = .7; g.beginPath(); g.moveTo(x - w * .3, yb - h * .3); g.lineTo(x - w * .12 + lean, yb - h * .72); g.moveTo(x + w * .3, yb - h * .3); g.lineTo(x + w * .12 + lean, yb - h * .72); g.stroke();
        g.lineWidth = 1.3; g.beginPath(); g.arc(x + lean * 1.6, yb - h + 3, 3.2, Math.PI, 0); g.stroke();
      }
      leaf(cx - 26, 40, 15, 22, -3); leaf(cx - 9, 40, 16, 24, -1); leaf(cx + 9, 40, 16, 24, 1); leaf(cx + 26, 40, 15, 22, 3);
      leaf(cx - 18, 62, 17, 24, -2); leaf(cx, 62, 18, 26, 0); leaf(cx + 18, 62, 17, 24, 2);
      // volutes
      [-1, 1].forEach(function (s) {
        g.strokeStyle = INKL(.7); g.lineWidth = 1.3; g.beginPath();
        for (i = 0; i <= 26; i++) { var a = i * .36, r = 10 - i * .34; g[i ? 'lineTo' : 'moveTo'](cx + s * (33 + Math.cos(a) * r * -1), 19 + Math.sin(a) * r * -1); }
        g.stroke();
      });
      // abacus
      g.fillStyle = '#F4EDD9'; g.beginPath(); g.moveTo(cx - 43, 1); g.lineTo(cx + 43, 1); g.lineTo(cx + 39, 11); g.lineTo(cx - 39, 11); g.closePath(); g.fill(); g.strokeStyle = INKL(.65); g.lineWidth = 1.2; g.stroke();
      F.granulate(g, 110, 440, R, 500, .1);
    });
  }

  function roofSprite() {
    return F.sprite(ROOF.w, ROOF.h, function (g, w, h) {
      var cx = ROOF.cx, b = ROOF.base, ap = ROOF.apex, i, R = F.rng(83);
      var stone = g.createLinearGradient(0, 0, w, 0); stone.addColorStop(0, '#F3ECD8'); stone.addColorStop(.5, '#F8F2E0'); stone.addColorStop(1, '#DDD6BE');
      g.lineJoin = 'round';
      // architrave + frieze
      g.fillStyle = stone; g.fillRect(cx - 371, b + 20, 742, 62); g.strokeStyle = INKL(.6); g.lineWidth = 1.2; g.strokeRect(cx - 371, b + 20, 742, 62);
      g.fillStyle = 'rgba(186,176,140,.22)'; g.fillRect(cx - 371, b + 20, 742, 32);
      g.strokeStyle = INKL(.4); g.lineWidth = .9; g.beginPath(); g.moveTo(cx - 371, b + 52); g.lineTo(cx + 371, b + 52); g.moveTo(cx - 371, b + 62); g.lineTo(cx + 371, b + 62); g.moveTo(cx - 371, b + 72); g.lineTo(cx + 371, b + 72); g.stroke();
      // meander on the frieze
      g.strokeStyle = INKL(.5); g.lineWidth = 1.1; g.beginPath();
      var u = 24, y0 = b + 26, x0 = cx - 360;
      for (i = 0; i < 30; i++) { var x = x0 + i * u; g.moveTo(x, y0 + 20); g.lineTo(x, y0); g.lineTo(x + 18, y0); g.lineTo(x + 18, y0 + 14); g.lineTo(x + 7, y0 + 14); g.lineTo(x + 7, y0 + 7); g.lineTo(x + 12, y0 + 7); g.moveTo(x, y0 + 20); g.lineTo(x + u, y0 + 20); }
      g.stroke();
      // cornice with dentils
      g.fillStyle = stone; g.fillRect(cx - 392, b, 784, 20); g.strokeStyle = INKL(.6); g.lineWidth = 1.2; g.strokeRect(cx - 392, b, 784, 20);
      g.fillStyle = INKL(.3); for (i = 0; i < 64; i++) g.fillRect(cx - 384 + i * 12, b + 11, 6.5, 7);
      g.strokeStyle = INKL(.35); g.lineWidth = .8; g.beginPath(); g.moveTo(cx - 392, b + 8); g.lineTo(cx + 392, b + 8); g.stroke();
      // pediment
      g.fillStyle = stone; g.beginPath(); g.moveTo(cx - 396, b); g.lineTo(cx, ap); g.lineTo(cx + 396, b); g.closePath(); g.fill(); g.strokeStyle = INKL(.65); g.lineWidth = 1.3; g.stroke();
      g.strokeStyle = INKL(.35); g.lineWidth = .8; g.beginPath(); g.moveTo(cx - 372, b - 4); g.lineTo(cx, ap + 12); g.lineTo(cx + 372, b - 4); g.stroke();
      // tympanum (recessed)
      var ty = b - 6, ta = ap + 28, thw = 336;
      var tg = g.createLinearGradient(0, ta, 0, ty); tg.addColorStop(0, '#D2CBB1'); tg.addColorStop(.5, '#E6DFC8'); tg.addColorStop(1, '#EEE7D2');
      g.fillStyle = tg; g.beginPath(); g.moveTo(cx - thw, ty); g.lineTo(cx, ta); g.lineTo(cx + thw, ty); g.closePath(); g.fill(); g.strokeStyle = INKL(.55); g.lineWidth = 1.1; g.stroke();
      // corner sprays of laurel in relief
      g.save(); g.beginPath(); g.moveTo(cx - thw, ty); g.lineTo(cx, ta); g.lineTo(cx + thw, ty); g.closePath(); g.clip();
      [-1, 1].forEach(function (s) {
        g.strokeStyle = INKL(.5); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + s * 318, ty - 6); g.quadraticCurveTo(cx + s * 230, ty - 20, cx + s * 150, ty - 12); g.stroke();
        for (i = 0; i < 9; i++) {
          var lx = cx + s * (306 - i * 18), ly = ty - 8 - Math.sin(i / 8 * Math.PI) * 9, up = i % 2 ? -1 : 1;
          g.save(); g.translate(lx, ly); g.rotate((s > 0 ? Math.PI : 0) + s * up * .65); g.fillStyle = '#F3ECD8'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(9, -6, 19, 0); g.quadraticCurveTo(9, 6, 0, 0); g.fill(); g.stroke(); g.restore();
        }
      });
      g.restore();
      // acroteria
      function palmette(x, y, sc, half) {
        g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = '#F6F0DD'; g.strokeStyle = INKL(.65); g.lineWidth = 1.1 / sc;
        var as = half === 0 ? [-1.05, -.55, 0, .55, 1.05] : (half < 0 ? [-1.2, -.7, -.2] : [.2, .7, 1.2]);
        as.forEach(function (a) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-7, -14, -6, -30, 0, -40 + Math.abs(a) * 7); g.bezierCurveTo(6, -30, 7, -14, 0, 0); g.fill(); g.stroke(); g.restore(); });
        g.beginPath(); g.arc(0, 0, 6, 0, 6.3); g.fill(); g.stroke(); g.restore();
      }
      palmette(cx, ap + 2, 1, 0); palmette(cx - 392, b - 2, .7, -1); palmette(cx + 392, b - 2, .7, 1);
      F.granulate(g, w, h, R, 1800, .1);
    });
  }

  function backSprite() {
    return F.sprite(W, 600, function (g, w, h) { // world y = 740 + local y
      var R = F.rng(85), i;
      // cypresses
      [[60, 150, 26, 330], [118, 220, 20, 250], [1020, 130, 28, 350], [958, 230, 19, 240], [176, 280, 14, 180], [900, 290, 13, 170]].forEach(function (c) {
        var pts = []; for (i = 0; i <= 20; i++) { var a = i / 20 * Math.PI; pts.push([c[0] - Math.sin(a) * c[2] * (1 + R.range(-.08, .08)), c[1] + c[3] * (1 - Math.cos(a)) / 2]); }
        for (i = 20; i >= 0; i--) { var a2 = i / 20 * Math.PI; pts.push([c[0] + Math.sin(a2) * c[2] * (1 + R.range(-.08, .08)), c[1] + c[3] * (1 - Math.cos(a2)) / 2]); }
        F.wash(g, pts, C.sage, { R: R, layers: 12, alpha: .035, mag: .06 }); F.wash(g, pts, C.sageL, { R: R, layers: 8, alpha: .04, mag: .08 });
      });
      // far colonnade
      var top = 232, bot = 522;
      g.fillStyle = F.rgba('#DAD5BE', .55); g.fillRect(-10, top - 30, w + 20, 30);
      g.strokeStyle = F.rgba(C.sageD, .3); g.lineWidth = 1; g.strokeRect(-10, top - 30, w + 20, 30); g.beginPath(); g.moveTo(0, top - 12); g.lineTo(w, top - 12); g.stroke();
      for (i = 0; i < 23; i++) {
        var x = 15 + i * 48.6, gr = g.createLinearGradient(x - 10, 0, x + 10, 0);
        gr.addColorStop(0, F.rgba('#E2DCC6', .75)); gr.addColorStop(.4, F.rgba('#F4EEDC', .75)); gr.addColorStop(1, F.rgba('#C6C3AC', .75));
        g.fillStyle = gr; g.fillRect(x - 9, top, 18, bot - top); g.strokeStyle = F.rgba(C.sageD, .26); g.lineWidth = .9; g.strokeRect(x - 9, top, 18, bot - top);
        g.fillStyle = F.rgba('#E6E0CB', .8); g.fillRect(x - 13, top, 26, 9); g.fillRect(x - 12, bot - 8, 24, 8);
        g.beginPath(); g.moveTo(x - 3, top + 12); g.lineTo(x - 3, bot - 10); g.moveTo(x + 3, top + 12); g.lineTo(x + 3, bot - 10); g.stroke();
      }
      g.fillStyle = F.rgba('#E1DBC5', .6); g.fillRect(-10, bot, w + 20, 16); g.strokeStyle = F.rgba(C.sageD, .25); g.strokeRect(-10, bot, w + 20, 16);
      // morning mist at the foot
      var mg = g.createLinearGradient(0, 380, 0, 600); mg.addColorStop(0, F.rgba(C.parch, 0)); mg.addColorStop(1, F.rgba(C.parch, .9)); g.fillStyle = mg; g.fillRect(0, 380, w, 220);
    });
  }

  function raysSprite() {
    return F.sprite(1400, 1400, function (g) {
      var R = F.rng(87), n = 34, i;
      for (i = 0; i < n; i++) {
        var a = i / n * 6.2832 + R.range(-.03, .03), wd = R.range(.018, .06), L = R.range(480, 700);
        var gr = g.createRadialGradient(700, 700, 120, 700, 700, L); gr.addColorStop(0, F.rgba('#F0DCA4', .55)); gr.addColorStop(1, F.rgba('#F0DCA4', 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(700, 700); g.arc(700, 700, L, a - wd, a + wd); g.closePath(); g.fill();
      }
    }, Math.min(F.Q, .5));
  }

  F.acts.opus = {
    build: function () {
      st.col = columnSprite(); st.roof = roofSprite(); st.back = backSprite(); st.rays = raysSprite();
      // L4: olive boughs lean in from the upper corners
      st.boughs = [[[46, 720], [70, 610], [128, 525], [214, 474]], [[40, 930], [58, 850], [100, 790], [150, 760]]].map(function (pts, i) {
        return [F.art.branch({ pts: pts, n: i ? 6 : 9, len: i ? [70, 96] : [86, 124], spread: .62, tones: 3, seed: 91 + i, fruit: .5, w0: 5, w1: 1.6 }),
          F.art.branch({ pts: pts.map(function (q) { return [W - q[0], q[1]]; }), n: i ? 6 : 9, len: i ? [70, 96] : [86, 124], spread: .62, tones: 3, seed: 95 + i, fruit: .5, w0: 5, w1: 1.6 })];
      });
      st.sun = F.glowSprite(460, '#F6E4B2', .85, 1.7);
      st.order = [2, 3, 1, 4, 0, 5];
      // a whole small temple, for the far distance of act V
      F.OPUS._mini = function (g) {
        for (var i = 0; i < 6; i++) g.drawImage(st.col.c, COLS[i] - 55, CAPY - 4, 110, 440);
        g.drawImage(st.roof.c, ROOF.x, ROOF.y, ROOF.w, ROOF.h);
        g.fillStyle = '#EDE6D2'; g.strokeStyle = 'rgba(74,74,58,.5)'; g.lineWidth = 2;
        for (i = 0; i < 4; i++) { g.beginPath(); g.rect(540 - 404 - i * 22, BASE + i * 40, 808 + i * 44, 40); g.fill(); g.stroke(); }
      };
    },
    /** zoom into the pediment: world -> screen transform used for the hand-off to act IV */
    zoom: function (t) {
      var q = p(t, 88.2, 93.4, E.inOut), z = Math.pow(3.6, q);
      return { q: q, z: z, px: lerp(RELIEF.x, F.OPUS.FOX.x, q), py: lerp(RELIEF.y, F.OPUS.FOX.y, q) };
    },
    relief: function (ctx, a) {
      if (a <= 0) return;
      var s = RELIEF.s, ga = ctx.globalAlpha; ctx.globalAlpha = ga * a;
      ctx.save(); ctx.translate(RELIEF.x, RELIEF.y); ctx.scale(s, s);
      var o = { stroke: F.rgba('#4A4A3A', .62), lw: 1.15 / s };
      F.FIG.fox(ctx, 'line', .2, o);
      ctx.save(); ctx.translate(F.OPUS.CROW.dx, F.OPUS.CROW.dy); F.FIG.crow(ctx, 'line', o); ctx.restore();
      // trunk and bough
      ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw; ctx.beginPath();
      var tx = F.OPUS.TRUNK.dx; ctx.moveTo(tx - 26, 0); ctx.bezierCurveTo(tx - 16, -120, tx - 20, -260, tx - 12, -420); ctx.moveTo(tx + 26, 0); ctx.bezierCurveTo(tx + 14, -110, tx + 16, -220, tx + 20, -262);
      ctx.bezierCurveTo(tx + 70, -280, tx + 150, -286, tx + 200, -290); ctx.moveTo(tx + 22, -300); ctx.bezierCurveTo(tx + 80, -306, tx + 130, -300, tx + 170, -296); ctx.stroke();
      ctx.restore(); ctx.globalAlpha = ga;
    },

    draw: function (ctx, t) {
      var Z = this.zoom(t), i, cam = p(t, 74, 90, E.inOutS);
      var leave = 1 - p(t, 89.6, 92.6, E.inOutS); // everything but the tympanum dissolves during the zoom
      // L0 tint: dawn
      var dawn = Math.min(p(t, 62, 70, E.inOutS), 1 - p(t, 90, 93.6, E.inOutS));
      if (dawn > 0) { var dg = ctx.createLinearGradient(0, 0, 0, 1500); dg.addColorStop(0, F.rgba('#EAD7A4', .26 * dawn)); dg.addColorStop(.55, F.rgba('#EAD7A4', .1 * dawn)); dg.addColorStop(1, F.rgba('#EAD7A4', 0)); ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H); }

      ctx.save();
      // hand-off zoom (identity until 88.2 s)
      ctx.translate(Z.px, Z.py); ctx.scale(Z.z, Z.z); ctx.translate(-RELIEF.x, -RELIEF.y);

      // L1 — sun and rays behind the roof
      var sunA = p(t, 62.5, 72, E.inOutS) * leave, peak = .55 + .45 * p(t, 78, 86.5, E.inOutS);
      if (sunA > 0) {
        var sy = lerp(900, 716, p(t, 62.5, 76, E.out));
        F.blit(ctx, st.sun, 540, sy, { a: sunA * .8 * peak, sc: 1 + cam * .05 });
        ctx.globalCompositeOperation = 'source-over';
        F.blit(ctx, st.rays, 540, sy, { a: sunA * peak * .8 * p(t, 67, 76, E.inOutS), rot: t * .012, sc: 1.02 + Math.sin(t * .4) * .012 });
      }
      // L1 — far colonnade and cypresses (slow parallax)
      var ba = p(t, 69, 76, E.inOutS) * leave;
      if (ba > 0) { ctx.save(); ctx.translate(540, 1296); ctx.scale(1 + cam * .018, 1 + cam * .018); ctx.translate(-540, -1296); F.blit(ctx, st.back, 0, 740 + (1 - E.out(seg(t, 69, 76))) * 26, { ax: 0, ay: 0, a: ba * .95 }); ctx.restore(); }

      // L2 — the staircase the staves became
      var sa = p(t, 65.4, 68.6, E.inOutS) * leave;
      if (sa > 0) {
        ctx.globalAlpha = sa;
        for (i = 0; i < 9; i++) {
          var y0 = SON.stairY(i), y1 = SON.stairY(i + 1), h0 = SON.stairHW(i), h1 = SON.stairHW(i + 1);
          var sg = ctx.createLinearGradient(0, y0, 0, y1); sg.addColorStop(0, '#FAF4E3'); sg.addColorStop(.75, '#E7E0C9'); sg.addColorStop(1, '#D0CAB1');
          ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(540 - h0, y0); ctx.lineTo(540 + h0, y0); ctx.lineTo(540 + h1, y1); ctx.lineTo(540 - h1, y1); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = INKL(.5); ctx.lineWidth = 1.1; ctx.beginPath();
        for (i = 0; i < 10; i++) { var yy = SON.stairY(i), hh = SON.stairHW(i); ctx.moveTo(540 - hh, yy); ctx.lineTo(540 + hh, yy); }
        ctx.moveTo(540 - SON.stairHW(0), SON.stairY(0)); ctx.lineTo(540 - SON.stairHW(9), SON.stairY(9)); ctx.moveTo(540 + SON.stairHW(0), SON.stairY(0)); ctx.lineTo(540 + SON.stairHW(9), SON.stairY(9));
        ctx.stroke(); ctx.globalAlpha = 1;
      }

      // L2 — columns rise out of the page
      if (t > 66.4 && leave > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, BASE - 2); ctx.clip(); ctx.globalAlpha = leave;
        for (i = 0; i < 6; i++) {
          var c0 = 66.7 + st.order.indexOf(i) * .42, rq = p(t, c0, c0 + 3.4, E.out); if (rq <= 0) continue;
          ctx.drawImage(st.col.c, COLS[i] - 55, CAPY - 4 + (1 - rq) * (COLH + 12), 110, 440);
        }
        ctx.restore(); ctx.globalAlpha = 1;
      }
      // L2 — entablature unrolls from the centre; pediment lifts
      var eq = p(t, 70.5, 73.2, E.inOut), q2 = F.Q, R0 = ROOF;
      if (eq > 0 && leave > 0) {
        var hw = 420 * eq, drop = (1 - E.out(seg(t, 70.5, 73.2))) * -14;
        ctx.globalAlpha = leave * clamp(eq * 3);
        ctx.drawImage(st.roof.c, (R0.cx - hw) * q2, (R0.base - 2) * q2, 2 * hw * q2, (R0.h - R0.base + 2) * q2, R0.x + R0.cx - hw, R0.y + R0.base - 2 + drop, 2 * hw, R0.h - R0.base + 2);
        ctx.globalAlpha = 1;
      }
      var pq = p(t, 72.2, 75.4, E.out);
      if (pq > 0) {
        var ph = R0.base - 2, pa = clamp(pq * 2.5) * lerp(1, Math.max(leave, Z.q > 0 ? 1 : 0), 1);
        ctx.globalAlpha = pa * (1 - p(t, 91.4, 93.6, E.inOutS));
        ctx.drawImage(st.roof.c, 0, 0, R0.w * q2, ph * q2, R0.x, R0.y + ph * (1 - pq), R0.w, ph * pq);
        ctx.globalAlpha = 1;
        this.relief(ctx, p(t, 74.6, 77, E.inOutS) * (1 - p(t, 92.2, 94, E.inOutS)));
      }
      ctx.restore();

      // L4 — olive boughs frame the view (strong parallax, they drift outward as we approach)
      var fq = p(t, 73.5, 81, E.inOutS), fo = 1 - p(t, 88.2, 90.6, E.inOutS);
      if (fq > 0 && fo > 0) st.boughs.forEach(function (pair, i) {
        pair.forEach(function (b, j) {
          ctx.save(); ctx.translate((j ? 1 : -1) * (cam * 26 + (1 - fo) * 160), cam * -10);
          F.art.drawBranch(ctx, b, F.assets.olive, E.inOutS(seg(fq, i * .25, .75 + i * .25)), t + j * 3, fo, .035); ctx.restore();
        });
      });
      // L5 — title
      F.titleBlock(ctx, S.ACTS[3], t, { x: 540, y: 352, t0: 67.6, out0: 87.8, out1: 89.4, size: 150 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
