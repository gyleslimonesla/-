/* film.js — chapters, ring transitions over a persistent star chart, captions, calligraphy words, top chapter bar. */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, S = G.SCRIPT;
  var F = G.FILM = { scenes: {}, DUR: S.DUR };
  F.scene = function (o) { F.scenes[o.id] = o; };
  F.beat = function (t, dec) { var b = Math.floor(t / S.BEAT) * S.BEAT; return Math.exp(-(t - b) / (dec || .18)); };
  F.hit = function (t, list, dec) { var b = -1e9; list.forEach(function (x) { if (x <= t) b = x; }); return b < -1e8 ? 0 : Math.exp(-(t - b) / (dec || .25)); };

  F.init = function () {
    L.buildSky(); if (G.PROPS && !G.PROPS.lp) G.PROPS.build();
    S.CH.forEach(function (c) { var s = F.scenes[c[0]]; s.t0 = c[2]; s.t1 = c[3]; if (s.build) s.build(); });
  };
  function drawScene(g, s, t) {
    g.save();
    var z = 1 + (s.push || .04) * L.seg(t, s.t0, s.t1), f = s.focus || [L.W / 2, 860];
    g.translate(f[0], f[1]); g.scale(z, z); g.translate(-f[0], -f[1]);
    s.draw(g, t, t - s.t0);
    g.restore();
  }
  var TR = .8;
  F.render = function (ctx, t) {
    var k = L.k; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    var idx = 0; S.CH.forEach(function (c, i) { if (t >= c[2]) idx = i; });
    var s = F.scenes[S.CH[idx][0]], prev = idx ? F.scenes[S.CH[idx - 1][0]] : null, lt = t - s.t0;
    L.bgDraw(ctx, t, s.tint);
    if (prev && lt < TR && s.trIn !== 'none') {
      var u = lt / TR, R = 30 + 2100 * E.in2(u), cx = L.W / 2, cy = 860;
      ctx.save(); var outside = new Path2D(); outside.rect(0, 0, L.W, L.H); outside.arc(cx, cy, R, 0, Math.PI * 2, true); ctx.clip(outside, 'evenodd');
      ctx.globalAlpha = 1 - u * .6; drawScene(ctx, prev, Math.min(prev.t1 - .001, t)); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = E.out3(Math.min(1, u * 1.6)); drawScene(ctx, s, t); ctx.restore();
      var ring = L.circle(cx, cy, R); L.gline(ctx, ring, 3 + 6 * (1 - u), { glow: 26, a: 1 - u * .5, col: '#ffe2a6' });
      L.dot(ctx, cx, cy, 400 * (1 - u), '#ffd796', .5 * (1 - u));
    } else drawScene(ctx, s, t);
    L.dustDraw(ctx, t, .55 + .25 * F.beat(t, .3));
    overlay(ctx, t);
    L.finish(ctx, t);
    topBar(ctx, t);
    var fade = Math.max(1 - L.seg(t, 0, .4), L.seg(t, S.DUR - .7, S.DUR - .05));
    if (fade > 0) { ctx.fillStyle = 'rgba(3,3,6,' + fade + ')'; ctx.fillRect(0, 0, L.W, L.H); }
  };

  function overlay(g, t) {
    S.CAPS.forEach(function (c) {
      var a = c[0], b = c[1]; if (t < a || t > b + .02) return;
      var st = c[3] || 'cap', out = L.seg(t, b - .25, b);
      if (st === 'big') {
        var chars = Array.from(c[2]), n = chars.length, size = n > 4 ? 170 : 200, y0 = 480;
        g.save(); g.globalAlpha = 1 - out;
        var sp = L.dot; sp(g, L.W / 2, y0, 520, '#ffcf88', .25 * L.seg(t, a, a + .3));
        L.text(g, c[2], L.W / 2, y0, size, { font: 'brush', weight: 400, fill: 'gold', track: .04, reveal: function (i) { return L.seg(t, a + i * .09, a + i * .09 + .3); } });
        if (c[4]) L.text(g, c[4], L.W / 2, y0 + size * .72, 34, { weight: 500, fill: C.ivory, track: .3, reveal: function () { return L.seg(t, a + .4, a + .8); } });
        var sa = E.back(L.seg(t, a + n * .09 + .1, a + n * .09 + .35), 2.2);
        if (sa > 0) seal(g, L.W / 2 + (n * size * 1.04) / 2 + 50, y0 + size * .32, 74, '天机', sa);
        g.restore(); return;
      }
      if (st === 'note') { g.save(); g.globalAlpha = .75 * L.win(t, a, b, .4, .4); L.text(g, c[2], L.W / 2, 1600, 30, { weight: 500, fill: C.ivory, maxW: 980 }); g.restore(); return; }
      g.save(); g.globalAlpha = 1 - out;
      L.text(g, c[2], L.W / 2, 1480 - E.out3(out) * 20, 56, { weight: 700, fill: C.ivory, maxW: 980, track: .04,
        reveal: function (i) { return L.seg(t, a + i * .03, a + i * .03 + .3); } });
      g.restore();
    });
  }
  function seal(g, str, x, y, s, a) {
    g.save(); g.translate(x, y); var z = 1.8 - .8 * a; g.scale(z, z); g.rotate(-.05); g.globalAlpha *= Math.min(1, a * 1.5);
    var p = L.rrect(-s / 2, -s / 2, s, s, s * .1); g.fillStyle = C.cinnabar; g.fill(p);
    g.strokeStyle = '#f1d9c8'; g.lineWidth = 2; g.strokeRect(-s / 2 + 6, -s / 2 + 6, s - 12, s - 12);
    g.fillStyle = '#f6e9df'; g.font = '400 ' + (s * .4) + 'px ' + L.FONT.brush; g.textAlign = 'center'; g.textBaseline = 'middle';
    var ch = Array.from(str); if (ch.length === 2) { g.fillText(ch[0], 0, -s * .19); g.fillText(ch[1], 0, s * .21); } else if (ch.length === 4) { g.fillText(ch[0], s * .19, -s * .19); g.fillText(ch[1], s * .19, s * .21); g.fillText(ch[2], -s * .19, -s * .19); g.fillText(ch[3], -s * .19, s * .21); } else g.fillText(str, 0, 0);
    g.restore();
  }
  F.seal = seal;

  /* the chapter bar along the top, like a video player's chapter strip */
  function topBar(g, t) {
    var y = 104, h = 74, W = L.W, D = S.DUR;
    g.save();
    g.fillStyle = 'rgba(0,0,0,.62)'; g.fillRect(0, y, W, h);
    // elapsed fill
    var px = W * t / D;
    var eg = g.createLinearGradient(0, y, 0, y + h); eg.addColorStop(0, 'rgba(255,255,255,.07)'); eg.addColorStop(1, 'rgba(255,255,255,.02)');
    g.fillStyle = eg; g.fillRect(0, y, px, h);
    S.CH.forEach(function (c, i) {
      var x0 = W * c[2] / D, x1 = W * c[3] / D, active = t >= c[2] && t < c[3];
      if (active) {
        g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x0, y, x1 - x0, h);
        g.fillStyle = 'rgba(255,214,140,.22)'; g.fillRect(x0, y, (x1 - x0) * L.seg(t, c[2], c[3]), h);
      }
      if (i) { g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x0 - 1.5, y + 18, 3, h - 36); }
      g.font = (active ? 900 : 700) + ' 30px ' + L.FONT.serif; g.textAlign = 'center'; g.textBaseline = 'middle';
      var label = c[1], room = x1 - x0 - 16;
      if (g.measureText(label).width > room) label = '…';
      g.fillStyle = active ? '#ffe2a6' : (t >= c[3] ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.62)');
      g.fillText(label, (x0 + x1) / 2, y + h / 2 + 1);
    });
    // playhead line
    var lg = g.createLinearGradient(0, 0, px, 0); lg.addColorStop(0, '#8a6731'); lg.addColorStop(1, '#ffe2a6');
    g.fillStyle = lg; g.fillRect(0, y + h - 4, px, 4);
    L.dot(g, px, y + h - 2, 22, '#ffd796', .9);
    g.restore();
  }
})(typeof window !== 'undefined' ? window : globalThis);
