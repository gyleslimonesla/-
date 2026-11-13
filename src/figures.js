/* figures.js — the fox and the crow. Shared by the pediment relief (act III) and the paper theatre (act IV). */
(function (G) {
  'use strict';
  var F = G.F, C = F.C, FIG = F.FIG = {};
  var P = {}, ready = false;
  var D = {
    body: 'M-66,0 L80,0 C106,-4 114,-42 104,-80 C94,-132 60,-178 22,-198 C8,-205 -8,-207 -20,-201 C-46,-190 -63,-160 -63,-128 C-63,-92 -54,-52 -56,-24 C-57,-12 -62,-6 -66,0 Z',
    chest: 'M-36,-190 C-60,-166 -61,-122 -53,-86 C-42,-100 -31,-140 -22,-184 Z',
    sock: 'M-66,0 L-30,0 C-31,-14 -31,-28 -30,-40 L-55,-40 C-55,-28 -57,-12 -66,0 Z',
    leg: 'M-28,-100 C-30,-66 -31,-30 -30,0',
    haunch: 'M22,0 C16,-52 52,-90 98,-72',
    tail: 'M84,-4 C142,2 182,-34 176,-86 C172,-122 142,-138 124,-114 C138,-86 126,-52 86,-42 Z',
    tip: 'M176,-86 C172,-122 142,-138 124,-114 C140,-116 160,-104 176,-86 Z',
    head: 'M26,-8 C30,-40 10,-66 -16,-66 C-36,-66 -50,-52 -58,-38 C-68,-28 -80,-20 -88,-12 C-92,-8 -90,-2 -84,-1 C-70,2 -56,8 -44,16 C-28,26 -6,26 10,16 C20,10 25,2 26,-8 Z',
    cheek: 'M-84,-1 C-70,2 -56,8 -44,16 C-28,26 -6,26 10,16 C-4,4 -30,-4 -50,-8 C-62,-10 -74,-9 -84,-1 Z',
    ear1: 'M-20,-60 L-4,-116 L18,-54 Z', ear1in: 'M-12,-64 L-3,-98 L9,-60 Z',
    ear2: 'M-38,-56 L-36,-102 L-14,-62 Z',
    crow: 'M-46,-18 C-30,-30 -14,-58 10,-66 C22,-72 36,-66 38,-54 L56,-49 L38,-43 C36,-30 26,-10 6,-6 C-8,-2 -28,-8 -46,-18 Z',
    crowTail: 'M-30,-22 L-78,4 L-68,-12 L-40,-30 Z',
    crowWing: 'M-28,-22 C-10,-30 10,-34 22,-48'
  };
  function init() { for (var k in D) P[k] = F.path(D[k], 3); ready = true; }
  FIG.NECK = { x: -14, y: -196 };

  /** style: 'paper' (flat cut-paper colour) or 'line' (engraved relief). headRot: + raises the nose. */
  FIG.fox = function (ctx, style, headRot, o) {
    if (!ready) init(); o = o || {};
    var line = style === 'line', fur = o.fur || '#B98566', white = o.white || '#F7F0DF', dark = o.dark || '#4B4033';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    function fill(p, col) { if (line) { F.draw(ctx, p, 1); } else { ctx.fillStyle = col; F.fillPath(ctx, p); } }
    if (line) { ctx.strokeStyle = o.stroke || F.rgba(C.sageD, .7); ctx.lineWidth = o.lw || 1.4; }
    fill(P.tail, fur); if (!line) fill(P.tip, white); else F.draw(ctx, P.tip, 1);
    fill(P.body, fur);
    if (!line) { fill(P.chest, white); fill(P.sock, dark); ctx.strokeStyle = F.rgba('#7C543D', .55); ctx.lineWidth = 2; }
    F.draw(ctx, P.leg, 1); F.draw(ctx, P.haunch, 1);
    ctx.save(); ctx.translate(FIG.NECK.x, FIG.NECK.y); ctx.rotate(headRot || 0);
    if (line) { ctx.strokeStyle = o.stroke || F.rgba(C.sageD, .7); ctx.lineWidth = o.lw || 1.4; }
    fill(P.ear2, dark); fill(P.head, fur); fill(P.ear1, fur);
    if (!line) {
      fill(P.ear1in, dark); fill(P.cheek, white);
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-86.5, -7, 5, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-40, -31, 5.2, 3.6, -.3, 0, 6.3); ctx.fill();
      ctx.fillStyle = white; ctx.beginPath(); ctx.arc(-41.5, -32.4, 1.3, 0, 6.3); ctx.fill();
    } else { ctx.beginPath(); ctx.arc(-40, -31, 3, 0, 6.3); ctx.stroke(); }
    ctx.restore();
  };
  FIG.crow = function (ctx, style, o) {
    if (!ready) init(); o = o || {};
    var line = style === 'line', col = o.col || '#3F3D32';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (line) { ctx.strokeStyle = o.stroke || F.rgba(C.sageD, .7); ctx.lineWidth = o.lw || 1.4; F.draw(ctx, P.crowTail, 1); F.draw(ctx, P.crow, 1); F.draw(ctx, P.crowWing, 1); return; }
    ctx.fillStyle = col; F.fillPath(ctx, P.crowTail); F.fillPath(ctx, P.crow);
    ctx.strokeStyle = F.rgba('#8E8A76', .7); ctx.lineWidth = 1.6; F.draw(ctx, P.crowWing, 1);
    ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(2, 2); ctx.moveTo(11, -7); ctx.lineTo(11, 2); ctx.stroke();
    ctx.fillStyle = '#F3EAD3'; ctx.beginPath(); ctx.arc(28, -58, 2.2, 0, 6.3); ctx.fill();
    // the prize in its beak: one fleck of gold
    ctx.fillStyle = '#C9A964'; ctx.beginPath(); ctx.arc(58, -48, 6, 0, 6.3); ctx.fill();
  };
})(typeof window !== 'undefined' ? window : globalThis);
