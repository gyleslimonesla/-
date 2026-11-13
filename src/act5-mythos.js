/* Act V — MYTHOS: the stories we live by (119–142 s). Night paper, a celestial chart, a marble muse, laurel. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, E = F.E, S = G.SCRIPT, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp, seg = F.seg, p = F.p;
  var O = { x: 540, y: 1000, R: 400 }, BS = .78, BX = 540 - 262 * BS, BY = 822; // bust placement
  F.MYTH = { O: O };
  var st = {};
  // constellations: [stars (x,y,mag)], [edges]
  var CON = [
    { t0: 114.6, s: [[250, 716, 3.2], [226, 760, 1.8], [270, 772, 1.8], [244, 826, 1.7], [288, 838, 1.7]], e: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]] }, // Lyra
    { t0: 115.5, s: [[842, 668, 3], [800, 742, 2], [760, 812, 2.2], [722, 884, 1.7], [716, 716, 1.9], [868, 806, 1.9]], e: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]] }, // Cygnus
    { t0: 116.5, s: [[820, 1150, 2.8], [792, 1110, 1.7], [848, 1196, 1.7], [760, 1196, 1.8], [884, 1104, 1.8]], e: [[1, 0], [0, 2], [0, 3], [0, 4]] }, // Aquila
    { t0: 117.4, s: [[236, 1100, 2.2], [282, 1140, 1.7], [220, 1176, 1.7], [300, 1214, 1.9]], e: [[0, 1], [1, 2], [1, 3]] } // Vulpecula, the little fox
  ];

  function bustSprite() {
    return F.sprite(524, 812, function (g) {
      var R = F.rng(131), INK = function (a) { return F.rgba('#55533F', a); };
      var skin = F.path('M196,128 C180,150 170,176 168,200 C166,212 160,218 158,228 L126,292 C122,300 130,306 146,308 C142,318 138,326 138,334 C136,342 142,348 150,350 C142,354 138,362 142,370 C146,378 154,380 156,386 C150,398 144,412 150,426 C156,440 174,446 192,442 C196,470 198,500 196,530 C194,570 170,610 120,640 C96,654 84,676 80,704 L440,704 C446,670 440,640 420,620 C380,596 356,560 352,510 C350,480 356,450 370,420 L380,300 L330,110 Z', 4);
      var hair = F.path('M190,134 C200,80 270,44 340,60 C400,74 440,130 444,200 C446,240 436,270 420,290 C450,300 470,330 462,366 C454,404 410,420 380,404 C372,430 366,446 362,462 C344,440 330,410 322,380 C300,372 284,350 280,320 C270,300 262,270 262,240 C240,214 214,190 196,176 C188,160 186,146 190,134 Z', 4);
      // pedestal
      var pg = g.createLinearGradient(180, 0, 340, 0); pg.addColorStop(0, '#EDE6D2'); pg.addColorStop(.5, '#DCD5BF'); pg.addColorStop(1, '#B4AF98');
      g.fillStyle = pg; g.strokeStyle = INK(.6); g.lineWidth = 1.3; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(186, 704); g.lineTo(334, 704); g.bezierCurveTo(330, 732, 302, 746, 302, 764); g.lineTo(218, 764); g.bezierCurveTo(218, 746, 190, 732, 186, 704); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.rect(190, 764, 140, 44); g.fill(); g.stroke();
      // marble
      var mg = g.createLinearGradient(110, 0, 450, 0); mg.addColorStop(0, '#FBF6E8'); mg.addColorStop(.45, '#EFE8D4'); mg.addColorStop(.8, '#D5CEB8'); mg.addColorStop(1, '#BDB8A2');
      g.fillStyle = mg; F.fillPath(g, skin);
      // shade under the jaw and along the back of the neck
      g.save(); g.beginPath(); var sp = skin[0].p; g.moveTo(sp[0], sp[1]); for (var i = 1; i < skin[0].n; i++) g.lineTo(sp[2 * i], sp[2 * i + 1]); g.closePath(); g.clip();
      F.wash(g, [[190, 446], [300, 408], [352, 470], [350, 560], [300, 600], [236, 560], [206, 500]], '#B4B29A', { R: R, layers: 10, alpha: .03, mag: .12 });
      F.wash(g, [[80, 704], [130, 640], [300, 628], [420, 620], [444, 704]], '#B4B29A', { R: R, layers: 10, alpha: .03, mag: .08 });
      g.strokeStyle = INK(.13); g.lineWidth = .8;
      for (i = 0; i < 40; i++) { var y = 430 + i * 7; g.beginPath(); g.moveTo(300 + i * .8, y); g.lineTo(350 + i * 2, y - 22); g.stroke(); }
      g.restore();
      g.strokeStyle = INK(.7); g.lineWidth = 1.5; F.draw(g, skin, 1);
      // hair
      var hg = g.createLinearGradient(190, 60, 460, 400); hg.addColorStop(0, '#E9E2CC'); hg.addColorStop(.6, '#D2CBB3'); hg.addColorStop(1, '#B2AD96');
      g.fillStyle = hg; F.fillPath(g, hair); g.strokeStyle = INK(.7); g.lineWidth = 1.4; F.draw(g, hair, 1);
      g.strokeStyle = INK(.42); g.lineWidth = 1;
      ['M200,150 C240,96 310,76 372,100', 'M214,176 C250,126 320,104 392,134', 'M236,206 C270,160 340,140 412,176', 'M262,240 C296,196 360,180 428,222', 'M276,290 C304,246 370,232 428,268',
        'M290,340 C316,300 372,290 424,300', 'M330,380 C352,350 392,336 440,330', 'M392,300 C432,306 452,336 446,366', 'M380,330 C416,330 436,350 432,376', 'M368,404 C372,424 370,440 364,456'].forEach(function (d) { F.draw(g, F.path(d, 4), 1); });
      // fillet across the hair
      g.strokeStyle = INK(.6); g.lineWidth = 1.2; F.draw(g, F.path('M414,286 C426,300 426,322 412,338 M424,290 C438,304 438,326 424,342', 3), 1);
      // features
      g.strokeStyle = INK(.75); g.lineWidth = 1.3; g.lineCap = 'round';
      ['M172,208 C188,198 210,198 228,208', 'M180,238 C190,228 206,228 217,236', 'M185,242 C195,246 206,246 215,240', 'M146,305 C150,298 158,298 161,305', 'M150,350 C158,353 166,352 173,347',
        'M192,442 C232,436 272,420 302,394', 'M290,282 C306,276 318,292 312,314 C308,330 296,336 290,324', 'M298,294 C306,298 306,310 300,318'].forEach(function (d) { F.draw(g, F.path(d, 3), 1); });
      g.strokeStyle = INK(.35); g.lineWidth = 1; F.draw(g, F.path('M178,228 C190,219 208,219 221,228 M312,412 C302,480 262,560 212,598 M160,386 C168,392 178,392 184,388', 3), 1);
      // drapery
      g.strokeStyle = INK(.6); g.lineWidth = 1.2;
      ['M120,640 C200,612 300,620 420,620', 'M180,630 C170,660 150,690 140,704', 'M240,622 C236,660 220,690 214,704', 'M300,622 C304,660 310,690 316,704', 'M360,622 C372,650 390,680 400,704', 'M146,634 C124,660 104,684 96,704'].forEach(function (d) { F.draw(g, F.path(d, 4), 1); });
      g.fillStyle = '#E9D7AA'; g.beginPath(); g.arc(134, 646, 9, 0, 6.3); g.fill(); g.strokeStyle = INK(.6); g.stroke();
      F.granulate(g, 524, 812, R, 2400, .08);
    });
  }

  F.acts.mythos = {
    build: function () {
      st.night = F.makePaper({ seed: 41, base: C.night, mott: ['#3D4431', '#1F2219', '#4A4F3A', '#2F3528'], mottA: 2.2, fib: ['#8F8A62', '#14160F'], fibN: 1500, fibLight: .35, grain: 8, edge: '#151811', edgeA: .5, edgeW: 320 });
      var g = st.night.g; // a breath of olive light low in the sky
      var gr = g.createRadialGradient(540, 1250, 60, 540, 1250, 1000); gr.addColorStop(0, 'rgba(110,116,82,.34)'); gr.addColorStop(1, 'rgba(110,116,82,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      st.bust = bustSprite();
      st.halo = F.glowSprite(520, '#E8D6A2', .5, 2.0);
      st.spark = F.glowSprite(18, '#FFF3CF', 1, 1.4);
      var R = F.rng(133); st.stars = [];
      for (var i = 0; i < 170; i++) st.stars.push([R.range(70, 1010), R.range(150, 1480), R.range(.6, 2.1), R() * 6.28, R.range(.6, 2.2)]);
      // gold laurel: a crown in the hair and two boughs embracing the pedestal
      st.crown = F.art.branch({ pts: [[196, 158], [250, 118], [320, 112], [386, 142], [430, 200]].map(function (q) { return [BX + q[0] * BS, BY + q[1] * BS]; }), n: 8, len: [44, 60], spread: .62, tones: 2, seed: 135, w0: 2.4, w1: 1, stemCol: '#C4A972' });
      st.boughs = [-1, 1].map(function (s, k) {
        return F.art.branch({ pts: [[540 + s * 78, 1440], [540 + s * 210, 1424], [540 + s * 336, 1360], [540 + s * 412, 1250], [540 + s * 440, 1130]], n: 13, len: [70, 104], spread: .6, tones: 2, seed: 137 + k, w0: 4, w1: 1.2, stemCol: '#C4A972', fruit: .35, fruitCol: '#E2CFA2' });
      });
      // star-chart tick ring
      st.temple = F.sprite(360, 330, function (g2) { // a small far temple assembled from act III's pieces
        var o = F.acts.opus, s = .36;
        g2.save(); g2.scale(s, s); g2.translate(-40, -566);
        F.OPUS._mini(g2); g2.restore();
      });
    },

    /** night ground — drawn *under* the sinking paper theatre */
    ground: function (ctx, t) {
      var d = F.dark(t); if (d <= 0) return;
      ctx.globalAlpha = d; ctx.drawImage(st.night.c, 0, 0, W, H); ctx.globalAlpha = 1;
    },

    chart: function (ctx, t, cx, cy, R, alpha, grow, onLight) {
      if (alpha <= 0 || grow <= 0) return;
      var gold = F.gold(ctx, onLight, t), i; ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.lineCap = 'round';
      var ga = ctx.globalAlpha; ctx.globalAlpha = ga * alpha;
      function arc(r, lw, q, a0) { if (q <= 0) return; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(cx, cy, r, a0 - Math.PI * q, a0 + Math.PI * q); ctx.stroke(); }
      arc(R, 2.4, E.inOut(seg(grow, 0, .7)), Math.PI / 2); arc(R - 12, 1, E.inOut(seg(grow, .1, .8)), Math.PI / 2);
      arc(R - 54, 1, E.inOut(seg(grow, .25, .95)), -Math.PI / 2);
      // ticks
      var rot = t * .006, tq = seg(grow, .3, 1);
      ctx.lineWidth = 1.1; ctx.beginPath();
      for (i = 0; i < 120; i++) {
        if (i / 120 > tq) break;
        var a = rot + i / 120 * 6.2832, l = i % 10 === 0 ? 22 : (i % 5 === 0 ? 14 : 8), c = Math.cos(a), s = Math.sin(a);
        ctx.moveTo(cx + c * (R - 14), cy + s * (R - 14)); ctx.lineTo(cx + c * (R - 14 - l), cy + s * (R - 14 - l));
      }
      ctx.stroke();
      for (i = 0; i < 12; i++) { if (i / 12 > tq) break; var a2 = rot + i / 12 * 6.2832; ctx.beginPath(); ctx.arc(cx + Math.cos(a2) * (R + 14), cy + Math.sin(a2) * (R + 14), 2.6, 0, 6.3); ctx.fill(); }
      // tilted ecliptic
      var eq = E.inOut(seg(grow, .4, 1));
      if (eq > 0) { ctx.globalAlpha = ga * alpha * .7; ctx.lineWidth = 1; ctx.setLineDash([3, 9]); ctx.beginPath(); ctx.ellipse(cx, cy, R - 54, (R - 54) * .42, -.38, -Math.PI * eq, Math.PI * eq); ctx.stroke(); ctx.setLineDash([]); }
      ctx.globalAlpha = ga;
    },

    draw: function (ctx, t) {
      var d = F.dark(t), i, j, out = 1 - p(t, 138.8, 141.6, E.inOutS);
      var push = p(t, 121, 138, E.inOutS);
      // ---- field stars ----
      var sa = p(t, 114.2, 118.5, E.inOutS) * out;
      if (sa > 0) {
        ctx.fillStyle = '#F1E3BA';
        for (i = 0; i < st.stars.length; i++) {
          var s = st.stars[i], tw = .55 + .45 * Math.sin(t * s[4] + s[3]), ap = seg(sa, (i % 17) / 24, (i % 17) / 24 + .3);
          ctx.globalAlpha = ap * tw * .85 * d; ctx.beginPath(); ctx.arc(s[0], s[1] - push * 14, s[2] * .8, 0, 6.3); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // ---- far temples (L1) ----
      var ta = p(t, 120.5, 126, E.inOutS) * out * d;
      if (ta > 0) { F.blit(ctx, st.temple, 176, 1424 + (1 - ta) * 20, { ax: .5, ay: 1, a: ta * .36 }); F.blit(ctx, st.temple, 904, 1424 + (1 - ta) * 20, { ax: .5, ay: 1, a: ta * .36 }); }
      // ---- halo light + celestial chart (L2) ----
      var cz = 1 + push * .03;
      F.blit(ctx, st.halo, O.x, O.y - 60, { a: p(t, 119.5, 126, E.inOutS) * out * (.7 + .3 * p(t, 130, 136, E.inOutS)), sc: 1.1 });
      // climax: rays engrave themselves outward
      var rq = p(t, 129.5, 136.5, E.inOutS) * out;
      if (rq > 0) {
        ctx.strokeStyle = F.gold(ctx, false, t); ctx.lineWidth = 1.1; ctx.globalAlpha = .55 * out; ctx.beginPath();
        for (i = 0; i < 72; i++) {
          var a = i / 72 * 6.2832 + t * .004, r0 = O.R + 26, r1 = r0 + (i % 2 ? 70 : 150) * E.out(seg(rq, (i % 6) * .05, .6 + (i % 6) * .05));
          ctx.moveTo(O.x + Math.cos(a) * r0, O.y + Math.sin(a) * r0); ctx.lineTo(O.x + Math.cos(a) * r1, O.y + Math.sin(a) * r1);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (t < 139) this.chart(ctx, t, O.x, O.y, O.R * cz, 1, p(t, 118.4, 124.5, E.lin), d < .5);
      // ---- constellations: the fox's stars join up ----
      for (i = 0; i < CON.length; i++) {
        var c = CON[i], cq = seg(t, c.t0, c.t0 + 2.6); if (cq <= 0) continue;
        ctx.strokeStyle = F.rgba('#E2CFA2', .7); ctx.lineWidth = 1.2; ctx.globalAlpha = out * d;
        for (j = 0; j < c.e.length; j++) {
          var eq = E.inOut(seg(cq, .15 + j / c.e.length * .6, .15 + (j + 1) / c.e.length * .6 + .1)); if (eq <= 0) continue;
          var A = c.s[c.e[j][0]], B = c.s[c.e[j][1]];
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(lerp(A[0], B[0], eq), lerp(A[1], B[1], eq)); ctx.stroke();
        }
        for (j = 0; j < c.s.length; j++) {
          var sq = E.outBack(seg(cq, j / c.s.length * .5, j / c.s.length * .5 + .22)); if (sq <= 0) continue;
          var S2 = c.s[j], tw2 = 1 + Math.sin(t * 2.2 + j * 1.7 + i) * .14;
          F.blit(ctx, st.spark, S2[0], S2[1], { sc: S2[2] * .5 * sq * tw2, a: out * d });
          ctx.fillStyle = '#FFF6DC'; ctx.globalAlpha = out * d; ctx.beginPath(); ctx.arc(S2[0], S2[1], S2[2] * sq, 0, 6.3); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // ---- the muse (L3) ----
      var ba = p(t, 121.2, 126.2, E.inOutS) * (1 - p(t, 138.6, 141, E.inOutS));
      if (ba > 0) {
        var rise = (1 - E.out(seg(t, 121.2, 127))) * 46, bz = 1 + push * .035;
        ctx.save(); ctx.translate(540, 1460); ctx.scale(bz, bz); ctx.translate(-540, -1460); ctx.translate(0, rise);
        ctx.globalAlpha = ba; ctx.drawImage(st.bust.c, BX, BY, 524 * BS, 812 * BS); ctx.globalAlpha = 1;
        F.art.drawBranch(ctx, st.crown, F.assets.laurelGold, p(t, 124.2, 128.4, E.inOutS), t, ba, .012);
        ctx.restore();
      }
      // ---- laurel boughs (L4) ----
      var lq = p(t, 122.5, 129.5, E.inOutS), la = 1 - p(t, 138.6, 141, E.inOutS);
      if (lq > 0 && la > 0) st.boughs.forEach(function (b, k) { ctx.save(); ctx.translate((k ? 1 : -1) * push * 16, push * 8); F.art.drawBranch(ctx, b, F.assets.laurelGold, lq, t + k * 2, la, .02); ctx.restore(); });
      // L5 — title
      F.titleBlock(ctx, S.ACTS[5], t, { x: 540, y: 352, t0: 119.6, out0: 138.4, out1: 140.2, size: 150 });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
