/* film.js — timeline, camera punch on cuts, beat pulses, lyric column, frame finishing. */
(function (G) {
  'use strict';
  var L = G.L, T = G.TIMING, P = L.P, E = L.E;
  var F = G.FILM = { scenes: [], DUR: T.DUR };
  F.scene = function (s) { F.scenes.push(s); F.scenes.sort(function (a, b) { return a.t0 - b.t0; }); };
  F.prevBeat = function (t, list) { list = list || T.BEATS; var b = -1e9; for (var i = 0; i < list.length; i++) if (list[i] <= t) b = list[i]; return b; };
  F.pulse = function (t, dec, list) { var b = F.prevBeat(t, list); return b < -1e8 ? 0 : Math.exp(-(t - b) / (dec || .2)); };
  F.beatIndex = function (t) { var n = -1; for (var i = 0; i < T.BEATS.length; i++) if (T.BEATS[i] <= t) n = i; return n; };
  // integrated gust displacement: each beat in `list` pushes by amp, settling with time constant tau
  F.gust = function (t, list, amp, tau) { var s = 0; for (var i = 0; i < list.length; i++) if (list[i] <= t) s += amp * (1 - Math.exp(-(t - list[i]) / tau)); return s; };

  F.init = function () {
    L.buildTexture(); L.buildPetals();
    F.scenes.forEach(function (s) { if (s.build) s.build(); });
    F.finishSprite = L.sprite(L.W, L.H, function (g) {
      var gr = g.createRadialGradient(L.W / 2, L.H / 2, L.H * .35, L.W / 2, L.H / 2, L.W * .62);
      gr.addColorStop(0, 'rgba(4,6,20,0)'); gr.addColorStop(1, 'rgba(4,6,20,.55)');
      g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
    });
  };

  /* vertical text: chars stacked from (x,y); reveal(i) → 0..1 */
  F.vtext = function (g, str, x, y, size, reveal, o) {
    o = o || {};
    g.save(); g.font = (o.weight || 900) + ' ' + size + 'px "Noto Serif SC", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var chars = Array.from(str);
    chars.forEach(function (ch, i) {
      var a = reveal(i); if (a <= 0) return;
      var yy = y + i * size * (o.lead || 1.12) + size / 2 - (1 - E.out3(a)) * size * .35;
      g.globalAlpha = Math.min(1, a * 1.4) * (o.alpha === undefined ? 1 : o.alpha);
      g.shadowColor = 'rgba(2,4,16,.75)'; g.shadowBlur = size * .25 * L.k; g.shadowOffsetY = size * .04 * L.k;
      g.fillStyle = o.accent && o.accent.indexOf(i) >= 0 ? P.redL : (o.col || P.cream);
      g.fillText(ch, x, yy);
    });
    g.restore();
  };
  F.seal = function (g, str, x, y, s, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(.8 + .2 * E.back(Math.min(1, a), 3), .8 + .2 * E.back(Math.min(1, a), 3));
    var p = new Path2D(); p.roundRect(-s / 2, -s / 2, s, s, s * .08);
    L.paper(g, p, P.red, { shadow: [2, 4, 8, .5], rim: 1.5, tex: .7 });
    g.fillStyle = P.cream; g.font = '900 ' + (s * .38) + 'px "Noto Serif SC", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var ch = Array.from(str);
    if (ch.length === 2) { g.fillText(ch[0], 0, -s * .2); g.fillText(ch[1], 0, s * .22); }
    else if (ch.length === 4) { g.fillText(ch[0], s * .2, -s * .2); g.fillText(ch[1], s * .2, s * .22); g.fillText(ch[2], -s * .2, -s * .2); g.fillText(ch[3], -s * .2, s * .22); }
    else g.fillText(str, 0, 0);
    g.restore();
  };

  function lyrics(g, t) {
    T.LYRICS.forEach(function (c) {
      var a = c[0], b = c[1]; if (t < a - .05 || t > b + 1.2) return;
      var chars = Array.from(c[2]), n = chars.length, size = 64;
      var out = 1 - L.seg(t, b + .5, b + 1.1);
      F.vtext(g, c[2], c.x || 1690, c.y || 150, size, function (i) { return L.seg(t, a + (b - a) * i / n, a + (b - a) * i / n + .22) * out; }, { accent: c[3] || [] });
    });
  }

  F.render = function (ctx, t) {
    var k = L.k; ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    var s = F.scenes[0];
    for (var i = 0; i < F.scenes.length; i++) if (t >= F.scenes[i].t0) s = F.scenes[i];
    var lt = t - s.t0;
    ctx.fillStyle = P.night; ctx.fillRect(0, 0, L.W, L.H);
    ctx.save();
    // cut punch + beat bump
    var punch = s.punch === undefined ? .07 : s.punch;
    var z = 1 + punch * (1 - E.out3(L.seg(lt, 0, .5))) + .006 * F.pulse(t, .16);
    ctx.translate(L.W / 2, L.H / 2); ctx.scale(z, z); ctx.translate(-L.W / 2, -L.H / 2);
    s.draw(ctx, t, lt);
    ctx.restore();
    // flash on the cut
    var fl = (s.flash === undefined ? .45 : s.flash) * (1 - L.seg(lt, 0, .24));
    if (fl > 0) { ctx.fillStyle = 'rgba(250,244,228,' + fl + ')'; ctx.fillRect(0, 0, L.W, L.H); }
    if (s.overlay) s.overlay(ctx, t, lt);
    lyrics(ctx, t);
    ctx.drawImage(F.finishSprite.c, 0, 0, L.W, L.H);
    var fade = Math.max(1 - L.seg(t, 0, .35), L.seg(t, T.DUR - .55, T.DUR - .05));
    if (fade > 0) { ctx.fillStyle = 'rgba(5,7,20,' + fade + ')'; ctx.fillRect(0, 0, L.W, L.H); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
