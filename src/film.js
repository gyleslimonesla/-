/* film.js — asset building + the one render(t) entry point driven by the master clock. */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, W = F.W, H = F.H;
  F.assets = {};
  var ORDER = ['prologue', 'haiku', 'sonnet', 'opus', 'fable', 'mythos', 'coda'];

  /** Build every sprite. Quality q: 1 (1080×1920), 2/3 (720×1280), 1/2 (540×960). Same composition at every level. */
  F.init = function (q, onProgress) {
    F.Q = q;
    var probe = document.createElement('canvas').getContext('2d');
    var steps = [
      function () {
        F.assets.paper = F.makePaper({ seed: 11, base: C.parch, mott: ['#C9B58C', '#FFFFFF', '#B9A27A', '#E3D6B8'], fib: ['#FFFDF4', '#8C7A52'], edge: '#B49A6A', edgeA: .17, edgeW: 230 });
      },
      function () {
        F.assets.border = F.art.buildBorder();
        F.assets.olive = [F.art.leafSprite('olive', [C.sageL, C.sage, C.sageD], 301), F.art.leafSprite('olive', [C.sageLL, C.sageL, C.sage], 302), F.art.leafSprite('olive', [C.sage, C.sageD, '#454B3B'], 303)];
        F.assets.laurel = [F.art.leafSprite('laurel', [C.sageL, C.sage, C.sageD], 311), F.art.leafSprite('laurel', [C.sage, C.sageD, '#454B3B'], 312)];
        F.assets.laurelGold = [F.art.leafSprite('laurel', ['#E9D7AA', '#D9C29A', '#A98E5C'], 321), F.art.leafSprite('laurel', ['#D9C29A', '#C4A972', '#8C7443'], 322)];
      }
    ];
    ORDER.forEach(function (id) { var a = F.acts[id]; if (a && a.build) steps.push(function () { a.build(probe); }); });
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

  /** Draw the frame for master-clock time t (seconds) — a pure function of t. */
  F.render = function (ctx, t) {
    var q = F.Q, a = F.acts;
    t = Math.max(0, Math.min(F.DUR, t));
    ctx.setTransform(q, 0, 0, q, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (t < 13.95) a.prologue.draw(ctx, t); else ctx.drawImage(F.assets.paper.c, 0, 0, W, H);
    if (a.haiku && t >= 11 && t < 38.6) a.haiku.draw(ctx, t);
    if (a.sonnet && t >= 33.8 && t < 68.2) a.sonnet.draw(ctx, t);
    if (a.opus && t >= 60 && t < 95) a.opus.draw(ctx, t);
    if (a.mythos && t >= 113 && t < 143) a.mythos.ground(ctx, t);
    if (a.fable && t >= 91 && t < 120) a.fable.draw(ctx, t);
    if (a.mythos && t >= 113 && t < 143) a.mythos.draw(ctx, t);
    if (a.coda && t >= 139) a.coda.draw(ctx, t);
    // page furniture and words always on top (L5) — never occluded
    if (t >= 13) {
      F.art.drawBorder(ctx, F.assets.border, 1, t, F.dark(t) < .5, Math.min(1, (t - 13) / 1.2), 0);
      F.chrome(ctx, t);
    }
    F.captions(ctx, t);
    F.subtitles(ctx, t);
    ctx.globalAlpha = 1;
  };
})(typeof window !== 'undefined' ? window : globalThis);
