/* props.js — the cast: 签, 签筒, 太极眼, 算命先生, 墨镜, 猫, 骰子, 齿轮, 卡片, ket. */
(function (G) {
  'use strict';
  var L = G.L, C = L.C, E = L.E, P = G.PROPS = {};

  /** fortune stick, base at (x,y), pointing up rotated by ang. label drawn vertically on the red head. */
  P.stick = function (g, x, y, len, ang, label, head, o) {
    o = o || {}; var w = o.w || 44;
    g.save(); g.translate(x, y); g.rotate(ang || 0); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
    var body = L.rrect(-w / 2, -len, w, len, w * .28);
    L.sticker(g, body, o.wood || C.wood, { lw: o.lw === undefined ? 5 : o.lw, sh: o.sh === undefined ? [6, 8] : o.sh, hiCol: 'rgba(255,240,200,.6)' });
    g.save(); g.clip(body);
    g.strokeStyle = 'rgba(150,90,30,.35)'; g.lineWidth = 2;
    for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-w * .25 + i * w * .22, 0); g.lineTo(-w * .2 + i * w * .22, -len); g.stroke(); }
    var hp = new Path2D(); hp.rect(-w, -len, w * 2, len * .36); g.fillStyle = head || C.red; g.fill(hp);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-w / 2, -len, w * .22, len * .36);
    g.restore();
    g.lineWidth = o.lw === undefined ? 5 : o.lw; g.strokeStyle = C.ink; g.stroke(body);
    if (label) {
      var chs = Array.from(label), fs = Math.min(w * .62, len * .3 / chs.length);
      g.font = '900 ' + fs + 'px ' + L.FONT.sans; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.ink || C.yellow;
      chs.forEach(function (ch, i) { g.fillText(ch, 0, -len + len * .04 + fs * (i + .55)); });
    }
    g.restore();
  };

  /** 签筒: bamboo cup. back() draws the dark opening, front() the body (sticks go between). */
  P.tube = {
    W: 300, H: 430,
    back: function (g, x, y, s) {
      g.save(); g.translate(x, y); g.scale(s, s);
      var rim = new Path2D(); rim.ellipse(0, -this.H, this.W / 2, 52, 0, 0, Math.PI * 2);
      L.sticker(g, rim, '#3a1d12', { lw: 6, sh: false, hi: false });
      g.restore();
    },
    front: function (g, x, y, s, t) {
      var W = this.W, H = this.H;
      g.save(); g.translate(x, y); g.scale(s, s);
      var b = new Path2D(); b.moveTo(-W / 2, -H); b.lineTo(-W / 2, -20); b.ellipse(0, -20, W / 2, 50, 0, Math.PI, 0, true); b.lineTo(W / 2, -H); b.ellipse(0, -H, W / 2, 52, 0, 0, Math.PI, false); b.closePath();
      var gr = g.createLinearGradient(-W / 2, 0, W / 2, 0); gr.addColorStop(0, '#2fb27f'); gr.addColorStop(.35, '#7ff0b8'); gr.addColorStop(1, '#1a7d5b');
      L.sticker(g, b, gr, { lw: 7, sh: [10, 12] });
      g.save(); g.clip(b);
      // bamboo nodes
      [-H * .78, -H * .42].forEach(function (yy) { g.lineWidth = 7; g.strokeStyle = 'rgba(10,60,40,.55)'; g.beginPath(); g.ellipse(0, yy, W / 2, 46, 0, 0, Math.PI); g.stroke(); g.lineWidth = 3; g.strokeStyle = 'rgba(220,255,230,.5)'; g.beginPath(); g.ellipse(0, yy + 7, W / 2, 46, 0, 0, Math.PI); g.stroke(); });
      // red band with 签
      g.fillStyle = C.red; g.beginPath(); g.ellipse(0, -H * .62, W / 2 + 4, 50, 0, 0, Math.PI); g.lineTo(-W / 2 - 4, -H * .62 - 70); g.ellipse(0, -H * .62 - 70, W / 2 + 4, 50, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.restore();
      var disc = L.circle(0, -H * .58, 62); L.sticker(g, disc, C.yellow, { lw: 6, sh: [5, 6] });
      g.font = '400 82px ' + L.FONT.disp; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.red; g.fillText('签', 0, -H * .58 + 4);
      var rim = new Path2D(); rim.ellipse(0, -H, W / 2, 52, 0, 0, Math.PI); g.lineWidth = 7; g.strokeStyle = C.ink; g.stroke(rim);
      g.restore();
    }
  };

  P.taiji = function (g, x, y, R, rot, a, b) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = a; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
    g.fillStyle = b; g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); g.arc(0, R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true); g.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false); g.closePath(); g.fill();
    g.fillStyle = a; g.beginPath(); g.arc(0, R / 2, R * .15, 0, Math.PI * 2); g.fill();
    g.fillStyle = b; g.beginPath(); g.arc(0, -R / 2, R * .15, 0, Math.PI * 2); g.fill();
    g.restore();
  };
  /** the oracle eye: neon almond, rainbow iris, taiji pupil. open 0..1, pupil scale */
  P.eye = function (g, x, y, s, open, t, pupil) {
    g.save(); g.translate(x, y); g.scale(s, s);
    var W = 420, h = 230 * open;
    var lid = new Path2D(); lid.moveTo(-W, 0); lid.quadraticCurveTo(0, -h * 1.6, W, 0); lid.quadraticCurveTo(0, h * 1.6, -W, 0); lid.closePath();
    if (open > .02) {
      g.save(); g.clip(lid);
      g.fillStyle = '#fff3fb'; g.fillRect(-W, -300, W * 2, 600);
      var ir = 190, cg = g.createConicGradient(t * .8, 0, 0);
      L.RAINBOW.concat([L.RAINBOW[0]]).forEach(function (c, i, a) { cg.addColorStop(i / (a.length - 1), c); });
      g.fillStyle = cg; g.beginPath(); g.arc(0, 0, ir, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(26,15,61,.35)'; g.lineWidth = 3;
      for (var i = 0; i < 36; i++) { var a = i / 36 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 80, Math.sin(a) * 80); g.lineTo(Math.cos(a) * ir, Math.sin(a) * ir); g.stroke(); }
      g.lineWidth = 8; g.strokeStyle = C.ink; g.beginPath(); g.arc(0, 0, ir, 0, Math.PI * 2); g.stroke();
      var pr = 92 * (pupil || 1);
      P.taiji(g, 0, 0, pr, t * 1.6, C.ink, C.white);
      g.lineWidth = 5; g.strokeStyle = C.ink; g.beginPath(); g.arc(0, 0, pr, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(-70, -80, 34, 22, -.6, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    L.neon(g, lid, C.cyan, 14, 34);
    // lashes
    for (var j = -3; j <= 3; j++) {
      var u = j / 4, lx = u * W * .8, ly = -h * 1.6 * (1 - u * u) * .5 - 4, an = -Math.PI / 2 + u * .9;
      var lp = new Path2D(); lp.moveTo(lx, ly); lp.lineTo(lx + Math.cos(an) * 60 * open, ly + Math.sin(an) * 60 * open); L.neon(g, lp, C.magenta, 8, 18);
    }
    g.restore();
  };

  P.glasses = function (g, x, y, s, rot, glint) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s);
    var p = new Path2D(); p.arc(-62, 0, 52, 0, Math.PI * 2); p.moveTo(114, 0); p.arc(62, 0, 52, 0, Math.PI * 2);
    var br = new Path2D(); br.moveTo(-12, -10); br.quadraticCurveTo(0, -24, 12, -10);
    g.lineWidth = 10; g.strokeStyle = C.ink; g.stroke(br);
    L.sticker(g, p, '#140c2c', { lw: 7, sh: [5, 7], hi: false });
    g.save(); g.clip(p); var gl = (glint === undefined ? 0 : glint);
    g.fillStyle = 'rgba(255,146,201,.85)'; g.beginPath(); g.ellipse(-80 + gl * 30, -22, 18, 9, -.5, 0, Math.PI * 2); g.ellipse(44 + gl * 30, -22, 18, 9, -.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(37,226,255,.35)'; g.fillRect(-120, 18, 240, 10);
    g.restore();
    g.restore();
  };

  /** 算命先生. o:{t, banner:0..1 (raised/slammed), look:-1..1, glasses:1 (on) .. 0 (fallen), mouth:0..1 (open), sweat} */
  P.teller = function (g, x, y, s, o) {
    o = o || {}; var t = o.t || 0;
    g.save(); g.translate(x, y); g.scale(s, s);
    var bob = Math.sin(t * Math.PI / .625) * 4;
    // banner on its pole (behind the body)
    var ba = o.banner === undefined ? 0 : o.banner;
    g.save(); g.translate(150, -150); g.rotate(-.5 + ba * .5);
    var pole = L.rrect(-8, -540, 16, 640, 8); L.sticker(g, pole, C.woodD, { lw: 5, sh: [5, 6] });
    var cloth = new Path2D(); cloth.moveTo(8, -520); cloth.lineTo(190, -520); cloth.lineTo(190, -110); cloth.quadraticCurveTo(150, -80, 99, -110); cloth.quadraticCurveTo(50, -80, 8, -110); cloth.closePath();
    L.sticker(g, cloth, C.white, { lw: 6, sh: [7, 9] });
    g.strokeStyle = C.red; g.lineWidth = 6; g.strokeRect(26, -500, 146, 370);
    g.font = '400 74px ' + L.FONT.fun; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.ink;
    Array.from('铁口直断').forEach(function (ch, i) { g.fillText(ch, 99, -455 + i * 88); });
    g.restore();
    g.translate(0, bob);
    // robe
    var robe = new Path2D(); robe.moveTo(-170, 120); robe.bezierCurveTo(-160, -60, -110, -150, 0, -160); robe.bezierCurveTo(110, -150, 160, -60, 170, 120); robe.closePath();
    var rg = g.createLinearGradient(0, -160, 0, 120); rg.addColorStop(0, '#5a3fd6'); rg.addColorStop(1, '#2d1b78');
    L.sticker(g, robe, rg, { lw: 7, sh: [9, 11] });
    // trigram 乾 ☰ on the chest
    g.fillStyle = C.yellow; for (var i = 0; i < 3; i++) g.fillRect(-36, -70 + i * 22, 72, 11);
    g.strokeStyle = C.yellow; g.lineWidth = 5; g.beginPath(); g.arc(0, -48, 62, 0, Math.PI * 2); g.stroke();
    // collar
    var col = new Path2D(); col.moveTo(-60, -150); col.lineTo(0, -80); col.lineTo(60, -150); g.lineWidth = 12; g.strokeStyle = C.yellow; g.stroke(col);
    // arm holding the pole
    var arm = new Path2D(); arm.moveTo(90, -110); arm.quadraticCurveTo(150, -110, 150, -150); arm.lineTo(178, -150); arm.quadraticCurveTo(180, -80, 110, -60); arm.closePath();
    L.sticker(g, arm, '#4a33b8', { lw: 6, sh: false });
    var hand = L.circle(160, -158, 26); L.sticker(g, hand, '#ffd9b0', { lw: 5, sh: false });
    // head
    g.translate(0, -250);
    var head = new Path2D(); head.ellipse(0, 0, 112, 118, 0, 0, Math.PI * 2);
    L.sticker(g, head, '#ffd9b0', { lw: 7, sh: [8, 10], hiCol: 'rgba(255,255,255,.6)' });
    g.fillStyle = 'rgba(255,120,140,.35)'; g.beginPath(); g.ellipse(-70, 40, 22, 13, 0, 0, Math.PI * 2); g.ellipse(70, 40, 22, 13, 0, 0, Math.PI * 2); g.fill();
    // cap (瓜皮帽)
    var cap = new Path2D(); cap.moveTo(-108, -30); cap.bezierCurveTo(-100, -150, 100, -150, 108, -30); cap.quadraticCurveTo(0, -50, -108, -30); cap.closePath();
    L.sticker(g, cap, '#24164f', { lw: 6, sh: false });
    g.strokeStyle = C.yellow; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -42); g.lineTo(0, -128); g.stroke();
    var knob = L.circle(0, -134, 17); L.sticker(g, knob, C.red, { lw: 5, sh: false });
    // mustache + goatee
    var ms = new Path2D(); ms.moveTo(0, 48); ms.bezierCurveTo(-40, 30, -70, 50, -96, 96); ms.moveTo(0, 48); ms.bezierCurveTo(40, 30, 70, 50, 96, 96);
    g.lineWidth = 8; g.lineCap = 'round'; g.strokeStyle = C.ink; g.stroke(ms);
    var gt = new Path2D(); gt.moveTo(-12, 86); gt.quadraticCurveTo(0, 150, 12, 86); g.fillStyle = C.ink; g.fill(gt);
    // mouth
    var mo = o.mouth || 0; g.fillStyle = '#8a1f3d'; g.beginPath(); g.ellipse(0, 72, 18, 4 + mo * 16, 0, 0, Math.PI * 2); g.fill();
    // eyes under glasses (seen only when glasses fall)
    var gl = o.glasses === undefined ? 1 : o.glasses;
    if (gl < 1) { g.fillStyle = C.ink; g.beginPath(); g.arc(-44, -2, 9, 0, Math.PI * 2); g.arc(44, -2, 9, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(-60, -26); g.lineTo(-28, -32); g.moveTo(60, -26); g.lineTo(28, -32); g.stroke(); }
    if (gl > 0) P.glasses(g, (o.look || 0) * 8, -4 + (1 - gl) * 420, .82, (1 - gl) * 1.4, (t * .7) % 1);
    if (o.sweat) { var sw = new Path2D(); sw.moveTo(100, -60); sw.quadraticCurveTo(120, -20, 100, -10); sw.quadraticCurveTo(82, -20, 100, -60); L.sticker(g, sw, C.sky, { lw: 4, sh: false }); }
    g.restore();
  };

  /** cute cat sitting; state 'alive' | 'ghost'. */
  P.cat = function (g, x, y, s, ghost, t) {
    g.save(); g.translate(x, y); g.scale(s, s); if (ghost) g.globalAlpha *= .45;
    var fill = ghost ? C.sky : C.orange;
    var tail = new Path2D(); tail.moveTo(90, 60); tail.bezierCurveTo(200, 40, 190, -90, 140 + Math.sin(t * 3) * 20, -120);
    g.lineWidth = 30; g.lineCap = 'round'; g.strokeStyle = C.ink; g.stroke(tail); g.lineWidth = 18; g.strokeStyle = fill; g.stroke(tail);
    var body = new Path2D(); body.moveTo(-110, 90); body.bezierCurveTo(-120, -40, -60, -80, 0, -80); body.bezierCurveTo(60, -80, 120, -40, 110, 90); body.closePath();
    L.sticker(g, body, fill, { lw: 7, sh: ghost ? false : [8, 10] });
    var head = new Path2D(); head.moveTo(-110, -150); head.lineTo(-96, -250); head.lineTo(-40, -205); head.quadraticCurveTo(0, -215, 40, -205); head.lineTo(96, -250); head.lineTo(110, -150); head.bezierCurveTo(110, -70, -110, -70, -110, -150); head.closePath();
    L.sticker(g, head, fill, { lw: 7, sh: ghost ? false : [8, 10] });
    g.fillStyle = C.ink;
    if (ghost) { g.lineWidth = 7; g.strokeStyle = C.ink; [[-42, -140], [42, -140]].forEach(function (e) { g.beginPath(); g.moveTo(e[0] - 14, e[1] - 14); g.lineTo(e[0] + 14, e[1] + 14); g.moveTo(e[0] + 14, e[1] - 14); g.lineTo(e[0] - 14, e[1] + 14); g.stroke(); }); }
    else { g.beginPath(); g.ellipse(-42, -140, 13, 19, 0, 0, Math.PI * 2); g.ellipse(42, -140, 13, 19, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-38, -147, 5, 0, Math.PI * 2); g.arc(46, -147, 5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = C.pink; g.beginPath(); g.moveTo(-9, -112); g.lineTo(9, -112); g.lineTo(0, -102); g.closePath(); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath();
    [-1, 1].forEach(function (d) { g.moveTo(d * 60, -112); g.lineTo(d * 130, -122); g.moveTo(d * 60, -102); g.lineTo(d * 130, -96); }); g.stroke();
    g.restore();
  };

  /** pseudo-3D die. faces [top, left, right] values 1..6 */
  var PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  P.die = function (g, x, y, s, rot, faces, cols) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    var a = 100, h = a * .58;
    var faceDef = [
      [[0, -2 * h], [a, -h], [0, 0], [-a, -h]],      // top
      [[-a, -h], [0, 0], [0, 2 * h], [-a, h]],         // left
      [[0, 0], [a, -h], [a, h], [0, 2 * h]]];          // right
    cols = cols || ['#ffffff', '#ffd6ec', '#c9b8ff'];
    var shadow = new Path2D(); shadow.moveTo(0, -2 * h); shadow.lineTo(a, -h); shadow.lineTo(a, h); shadow.lineTo(0, 2 * h); shadow.lineTo(-a, h); shadow.lineTo(-a, -h); shadow.closePath();
    g.save(); g.translate(12, 16); g.fillStyle = 'rgba(10,4,32,.5)'; g.fill(shadow); g.restore();
    faceDef.forEach(function (q, fi) {
      var p = new Path2D(); p.moveTo(q[0][0], q[0][1]); for (var i = 1; i < 4; i++) p.lineTo(q[i][0], q[i][1]); p.closePath();
      g.fillStyle = cols[fi]; g.fill(p); g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = C.ink; g.stroke(p);
      // pips via bilinear map
      var o = q[0], u = [(q[1][0] - q[0][0]), (q[1][1] - q[0][1])], v = [(q[3][0] - q[0][0]), (q[3][1] - q[0][1])];
      (PIPS[faces[fi]] || []).forEach(function (pp) {
        var su = .5 + pp[0] * .27, sv = .5 + pp[1] * .27, px = o[0] + u[0] * su + v[0] * sv, py = o[1] + u[1] * su + v[1] * sv;
        g.save(); g.translate(px, py); g.transform(u[0] / a, u[1] / a, v[0] / a, v[1] / a, 0, 0);
        g.fillStyle = faces[fi] === 1 ? C.red : C.ink; g.beginPath(); g.arc(0, 0, faces[fi] === 1 ? 17 : 11, 0, Math.PI * 2); g.fill(); g.restore();
      });
    });
    g.restore();
  };

  P.gear = function (r, teeth) {
    var p = new Path2D(), n = teeth || 10;
    for (var i = 0; i < n * 2; i++) {
      var a0 = i / (n * 2) * Math.PI * 2, a1 = (i + 1) / (n * 2) * Math.PI * 2, R = i % 2 ? r * .82 : r;
      if (i === 0) p.moveTo(Math.cos(a0) * R, Math.sin(a0) * R);
      p.lineTo(Math.cos(a0 + .04) * R, Math.sin(a0 + .04) * R); p.lineTo(Math.cos(a1 - .04) * R, Math.sin(a1 - .04) * R);
    }
    p.closePath(); p.moveTo(r * .3, 0); p.arc(0, 0, r * .3, 0, Math.PI * 2);
    return p;
  };

  /** card with a header strip */
  P.card = function (g, x, y, w, h, rot, col, title, lines, o) {
    o = o || {};
    g.save(); g.translate(x, y); g.rotate(rot || 0); if (o.s) g.scale(o.s, o.s);
    var p = L.rrect(-w / 2, -h / 2, w, h, 26); L.sticker(g, p, C.white, { lw: 7, sh: [10, 12] });
    g.save(); g.clip(p); g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, 110); g.restore();
    g.lineWidth = 7; g.strokeStyle = C.ink; g.stroke(p);
    if (title) L.text(g, title, 0, -h / 2 + 56, 50, { fill: C.white, shadow: [3, 4, C.ink], marker: false, maxW: w - 60 });
    (lines || []).forEach(function (ln, i) { L.text(g, ln, 0, -h / 2 + 175 + i * 64, 40, { weight: 500, fill: C.ink, shadow: false, marker: false, maxW: w - 70 }); });
    g.restore();
  };

  /** |label⟩ with drawn bar and angle bracket. returns width */
  P.ket = function (g, x, y, size, label, col) {
    g.save(); g.font = '900 ' + size + 'px ' + L.FONT.sans; g.textBaseline = 'middle'; g.textAlign = 'left';
    var w = g.measureText(label).width, pad = size * .22, h = size * .62;
    g.strokeStyle = col; g.lineWidth = size * .09; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x, y - h); g.lineTo(x, y + h); g.stroke();
    g.fillStyle = col; g.fillText(label, x + pad, y + size * .04);
    var bx = x + pad * 2 + w; g.beginPath(); g.moveTo(bx, y - h); g.lineTo(bx + size * .3, y); g.lineTo(bx, y + h); g.stroke();
    g.restore();
    return pad * 2 + w + size * .36;
  };
})(typeof window !== 'undefined' ? window : globalThis);
