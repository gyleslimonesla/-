/* s4.js — 六「月下舟」(bar 6: long notes, a boat under the great moon) and 七「四拍」(bar 7: one cut per beat). */
(function (G) {
  'use strict';
  var L = G.L, F = G.FILM, T = G.TIMING, P = L.P, E = L.E;

  /* a band of sea with curling foam crests; returns a sprite twice as wide as needed so it can scroll */
  function seaBand(w, top, col, foam, seed, amp, per) {
    var r = L.rng(seed);
    return L.sprite(w, 420, function (g) {
      var p = new Path2D(), x = -20, pts = [];
      p.moveTo(-20, 420); p.lineTo(-20, top);
      while (x < w + per) {
        var h = amp * r.range(.6, 1.1);
        p.bezierCurveTo(x + per * .3, top - h * .2, x + per * .45, top - h, x + per * .62, top - h * .95);
        p.bezierCurveTo(x + per * .8, top - h * .9, x + per * .82, top - h * .3, x + per * .72, top - h * .25);
        p.quadraticCurveTo(x + per * .9, top + 4, x + per, top);
        pts.push([x + per * .62, top - h * .95, h]); x += per;
      }
      p.lineTo(w + per, 420); p.closePath();
      var gr = g.createLinearGradient(0, top - amp, 0, 420); gr.addColorStop(0, L.light(col, .12)); gr.addColorStop(1, L.dark(col, .35));
      L.paper(g, p, gr, { shadow: [4, -6, 18, .5], rim: 2.6, rimCol: foam, tex: .6 });
      // foam curls on each crest
      g.strokeStyle = foam; g.lineCap = 'round';
      pts.forEach(function (c) {
        var cx = c[0] + per * .05, cy = c[1] + c[2] * .42, R = c[2] * .32;
        g.lineWidth = Math.max(2, c[2] * .05);
        for (var q = 0; q < 2; q++) {
          g.beginPath();
          for (var a = 0; a <= 1; a += .03) { var an = -Math.PI * .1 - a * Math.PI * 1.6, rr = R * (1 - a * .6) - q * R * .28; var px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr; a ? g.lineTo(px, py) : g.moveTo(px, py); }
          g.stroke();
        }
      });
      // a few horizontal current lines
      g.globalAlpha = .35; g.lineWidth = 2;
      for (var i = 0; i < 8; i++) { var y = top + 40 + r() * 300, xx = r() * w; g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + 60 + r() * 140, y); g.stroke(); }
    }, 0, 0);
  }

  L.boat = function (s) {
    return L.sprite(560 * s, 360 * s, function (g) {
      g.scale(s, s);
      // lantern pole at the stern
      g.strokeStyle = '#3b2c22'; g.lineWidth = 5; g.beginPath(); g.moveTo(-200, 0); g.quadraticCurveTo(-210, -120, -240, -190); g.stroke();
      // canopy (woven awning)
      var cp = new Path2D(); cp.moveTo(-120, -10); cp.bezierCurveTo(-120, -120, 90, -120, 90, -10); cp.closePath();
      L.paper(g, cp, '#1a2246', { shadow: [4, 8, 12, .55], rim: 2.2, rimCol: '#4a5a90', tex: .6 });
      g.save(); g.clip(cp); g.strokeStyle = 'rgba(217,178,97,.4)'; g.lineWidth = 1.5;
      for (var i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(-15 + i * 16, -96); g.quadraticCurveTo(-15 + i * 19, -50, -15 + i * 22, -8); g.stroke(); }
      for (i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-15, -10, 105 - i * 4, 82 - i * 18, 0, Math.PI, 0); g.stroke(); }
      g.restore();
      // figure at the bow, sitting, looking at the moon
      var robe = new Path2D(); robe.moveTo(110, -2); robe.bezierCurveTo(108, -40, 120, -66, 136, -70); robe.bezierCurveTo(156, -64, 160, -30, 168, -2); robe.closePath();
      L.paper(g, robe, P.cream, { shadow: [2, 4, 6, .45], rim: 1.4, tex: .4 });
      var sash = new Path2D(); sash.rect(118, -46, 42, 6); L.paper(g, sash, P.red, { shadow: false, rim: 0, tex: 0 });
      var head = new Path2D(); head.ellipse(140, -84, 11, 12, -.3, 0, 6.283); L.paper(g, head, '#f3e3cf', { shadow: [1, 2, 3, .3], rim: .8, tex: 0 });
      var hair = new Path2D(); hair.ellipse(135, -90, 12, 10, -.3, 0, 6.283); hair.ellipse(128, -101, 7, 6, 0, 0, 6.283); hair.moveTo(130, -88); hair.quadraticCurveTo(118, -60, 124, -40); hair.lineTo(130, -42); hair.quadraticCurveTo(128, -66, 136, -86);
      L.paper(g, hair, '#121629', { shadow: false, rim: .8, rimCol: '#3a4366', tex: 0 });
      // hull
      var h = new Path2D(); h.moveTo(-260, -36); h.quadraticCurveTo(-230, -6, -170, 0); h.lineTo(170, 0); h.quadraticCurveTo(240, -8, 270, -50);
      h.quadraticCurveTo(250, 30, 170, 44); h.lineTo(-160, 44); h.quadraticCurveTo(-240, 30, -260, -36); h.closePath();
      var hg = g.createLinearGradient(0, -40, 0, 44); hg.addColorStop(0, '#5a3f34'); hg.addColorStop(1, '#2a1c1f');
      L.paper(g, h, hg, { shadow: [6, 12, 18, .6], rim: 2.4, rimCol: '#8c6450', tex: .6 });
      g.strokeStyle = P.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(-240, -14); g.quadraticCurveTo(0, 14, 250, -24); g.stroke();
    }, 280 * s, 230 * s);
  };

  var MX = 1060, MY = 470, MR = 290, s6 = {};
  F.scene({
    id: 'moonboat', t0: T.BARS[5],
    build: function () {
      s6.sky = L.sprite(L.W, L.H, function (g) {
        var gr = g.createLinearGradient(0, 0, 0, 700); gr.addColorStop(0, '#0c1433'); gr.addColorStop(1, '#2b4380');
        g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
        var r = L.rng(66); g.fillStyle = 'rgba(240,229,204,.7)';
        for (var i = 0; i < 120; i++) { g.beginPath(); g.arc(r() * L.W, r() * 600, r() * 1.7 + .3, 0, 6.283); g.fill(); }
        L.blit(g, L.glow(720, '#c5d2f2', .12), MX, MY, 1, 0, .55);
        var m = new Path2D(); m.arc(MX, MY, MR, 0, 6.283);
        var mg = g.createRadialGradient(MX - 80, MY - 90, 20, MX, MY, MR); mg.addColorStop(0, P.white); mg.addColorStop(1, '#e3d8bf');
        L.paper(g, m, mg, { shadow: false, rim: 0, tex: .7 });
        g.save(); g.clip(m);
        [[MX - 90, MY + 40, 90, .06], [MX + 110, MY - 70, 60, .06], [MX + 30, MY + 160, 50, .05], [MX - 150, MY - 130, 40, .05]].forEach(function (c) {
          var cg = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], c[2]); cg.addColorStop(0, 'rgba(150,130,95,' + c[3] + ')'); cg.addColorStop(1, 'rgba(150,130,95,0)');
          g.fillStyle = cg; g.fillRect(c[0] - c[2], c[1] - c[2], c[2] * 2, c[2] * 2);
        });
        g.restore();
        L.blit(g, L.cloud(420, 61, { col: '#cdd7ee' }), MX - 520, MY - 40, 1);
        L.blit(g, L.cloud(300, 62, { col: '#b8c6e6' }), MX + 230, MY + 120, 1);
        [[-60, 620, 520, 160, '#2b417e', 71], [1500, 640, 2000, 120, '#22376f', 72]].forEach(function (m2) {
          var rg = L.ridge(m2[0], m2[2], m2[1], 900, { seed: m2[5], n: 4, h: [m2[3] * .5, m2[3]] });
          L.paper(g, rg.path, m2[4], { shadow: [4, -2, 14, .4], rim: 2, rimCol: L.light(m2[4], .35), tex: .5 });
        });
      });
      s6.bands = [
        { s: seaBand(2600, 60, '#33549a', '#bcd0f0', 1, 46, 170), y: 600, v: 22 },
        { s: seaBand(2600, 60, '#27447f', '#a9bde6', 2, 62, 230), y: 690, v: 34 },
        { s: seaBand(2600, 60, '#1c3266', '#98aee0', 3, 82, 300), y: 800, v: 50 },
        { s: seaBand(2600, 60, '#13234d', '#8aa2d8', 4, 104, 380), y: 920, v: 70 }];
      s6.boat = L.boat(1.25);
      s6.lantern = L.glow(160, '#f7a258', .18);
      s6.petals = L.petalField(68, 60, { v: [40, 90], s: [.5, .9], wind: 40 });
      var r = L.rng(5); s6.floating = [];
      for (var i = 0; i < 26; i++) s6.floating.push({ x: r() * 2400, row: Math.floor(r() * 3), k: i % 6, rot: r() * 6.28, s: r.range(.5, .8) });
    },
    draw: function (g, t, lt) {
      var z = 1 + .05 * E.sine(L.seg(lt, 0, 3.4));
      g.save(); g.translate(MX, MY); g.scale(z, z); g.translate(-MX, -MY);
      g.drawImage(s6.sky.c, 0, 0, L.W, L.H);
      // moon road
      g.fillStyle = 'rgba(251,246,234,.45)';
      for (var i = 0; i < 12; i++) { var y = 640 + i * 22, w = 220 - i * 12 + Math.sin(t * 2 + i) * 30; g.fillRect(MX - w / 2 + Math.sin(t + i) * 10, y, w, 3); }
      var hitA = Math.max(F.pulse(t, .5, [17.44]), F.pulse(t, .5, [19.09]));
      s6.bands.forEach(function (b, i) {
        var x = -((t * b.v + i * 300) % 600), bob = Math.sin(t * 1.4 + i) * 6;
        if (i === 2) {   // the boat rides between the second and third swell
          var bx = 420 + lt * 60, by = 742 + Math.sin(t * 1.6) * 8, rot = Math.sin(t * 1.6 + .6) * .035;
          L.blit(g, s6.lantern, bx - 228 * 1.25, by - 168 * 1.25, 1 + .6 * hitA, 0, .75 + .25 * F.pulse(t, .4));
          L.blit(g, s6.boat, bx, by, 1, rot);
          g.save(); g.translate(bx, by); g.rotate(rot); g.scale(1.25, 1.25); var lp = new Path2D(); lp.ellipse(-240, -190, 13, 16, 0, 0, 6.283);
          L.paper(g, lp, '#e86a3e', { shadow: [1, 3, 5, .4], rim: 1.2, rimCol: '#ffb27a', tex: 0 }); g.restore();
        }
        L.blit(g, b.s, x, b.y + bob, 1);
        s6.floating.forEach(function (p) {
          if (p.row !== i) return;
          var px = ((p.x - t * b.v) % 2400 + 2400) % 2400 - 200;
          L.blit(g, L.petals[p.k], px, b.y + bob + 70 + Math.sin(t * 1.4 + p.x) * 6, p.s, p.rot + Math.sin(t + p.x) * .3);
        });
      });
      g.restore();
      L.drawPetals(g, s6.petals, t, F.gust(t, T.BEATS, 14, .6), 0, 1, .9);
    }
  });

  /* ---- 7 四拍：four cuts, one per beat ---- */
  var B7 = T.BEATS.slice(24, 28), s7 = {};   // 19.92, 20.71, 21.52, 22.36
  function bgRings(g, cx, cy, cols) {
    g.drawImage(s7.rings[cols].c, cx - L.W, cy - L.H, L.W * 2, L.H * 2);
  }
  F.scene({
    id: 'cut-blossom', t0: B7[0], flash: .5, punch: .1,
    build: function () {
      s7.rings = [0, 1].map(function (v) {
        return L.sprite(L.W * 2, L.H * 2, function (g) {
          g.fillStyle = v ? '#0f1838' : '#13204a'; g.fillRect(0, 0, L.W * 2, L.H * 2);
          for (var i = 12; i >= 0; i--) {
            var p = new Path2D(); p.arc(L.W, L.H, 140 + i * 110, 0, 6.2832);
            var c = v ? L.mix('#2a3f7c', '#101a3e', i / 12) : L.mix('#4e6db0', '#15224e', i / 12);
            L.paper(g, p, c, { shadow: [4, 8, 20, .5], rim: 2, rimCol: L.light(c, .2), tex: .5 });
          }
        }, 0, 0);
      });
      s7.big = L.blossom(250, 'plum', 97); s7.bigR = L.blossom(120, 'red', 98);
      s7.sat = [L.blossom(70, 'peach', 11), L.blossom(60, 'white', 12), L.blossom(80, 'plum', 13), L.blossom(55, 'red', 14), L.blossom(66, 'white', 15), L.blossom(74, 'peach', 16)];
      s7.burst = L.glow(620, '#f6dccb', .1);
      s7.bud = L.bud(90);
      s7.petals = L.petalField(76, 50, { v: [80, 160], s: [.7, 1.2], wind: 50 });
    },
    draw: function (g, t, lt) {
      bgRings(g, 960, 540, 0);
      var b = E.elastic(L.seg(lt, .02, .7));
      L.blit(g, s7.burst, 960, 540, .6 + .5 * b, 0, .45 * L.seg(lt, 0, .2));
      g.save(); g.translate(960, 540); g.rotate(lt * .2); g.strokeStyle = 'rgba(241,212,142,.18)'; g.lineWidth = 3;
      for (var i = 0; i < 24; i++) { var a = i * .2618, r0 = 330 * b, r1 = r0 + 260 * b; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke(); }
      g.restore();
      s7.sat.forEach(function (sp, i) {
        var a = i * 1.047 + .4, d = 470 + (i % 2) * 70, k = E.back(L.seg(lt, .1 + i * .07, .45 + i * .07), 2.8);
        L.blit(g, sp, 960 + Math.cos(a) * d * 1.25, 540 + Math.sin(a) * d * .8, k, lt * (i % 2 ? .5 : -.5));
      });
      if (lt < .05) L.blit(g, s7.bud, 960, 540, 1);
      L.blit(g, s7.big, 960, 540, b * 1.05, -.8 + .8 * b + lt * .15);
            L.drawPetals(g, s7.petals, t, lt * 220, 0, 1, 1);
    }
  });
  F.scene({
    id: 'cut-bell', t0: B7[1], flash: .45, punch: .1,
    build: function () {
      s7.eave = L.sprite(1300, 700, function (g) {
        // a flying eave corner from the top-left
        var p = new Path2D(); p.moveTo(-40, 120); p.lineTo(780, 210); p.quadraticCurveTo(1010, 220, 1150, 90); p.quadraticCurveTo(1110, 250, 860, 300); p.lineTo(-40, 300); p.closePath();
        L.paper(g, p, '#1b2551', { shadow: [8, 14, 24, .65], rim: 3, rimCol: '#4c5d98', tex: .6 });
        g.save(); g.clip(p); g.fillStyle = '#26336a'; for (var x = -40; x < 900; x += 44) { g.beginPath(); g.ellipse(x, 280, 20, 26, 0, 0, 6.283); g.fill(); } g.restore();
        g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(-40, 126); g.lineTo(780, 214); g.quadraticCurveTo(1010, 224, 1148, 96); g.stroke();
        var beam = new Path2D(); beam.rect(-40, 300, 920, 34); L.paper(g, beam, '#8a2a22', { shadow: [4, 8, 12, .5], rim: 2, rimCol: '#c45a44', tex: .5 });
      }, 0, 0);
      s7.bell = L.sprite(220, 520, function (g) {
        g.strokeStyle = '#2a2236'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 90); g.stroke();
        var b = new Path2D(); b.moveTo(-14, 92); b.quadraticCurveTo(-60, 110, -64, 200); b.lineTo(64, 200); b.quadraticCurveTo(60, 110, 14, 92); b.closePath();
        var gr = g.createLinearGradient(-64, 0, 64, 0); gr.addColorStop(0, '#9c7633'); gr.addColorStop(.4, '#f1d48e'); gr.addColorStop(1, '#7d5a24');
        L.paper(g, b, gr, { shadow: [5, 10, 14, .55], rim: 2, rimCol: '#fff0c0', tex: .4 });
        g.strokeStyle = 'rgba(90,60,20,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-58, 176); g.lineTo(58, 176); g.stroke(); g.beginPath(); g.moveTo(-50, 150); g.lineTo(50, 150); g.stroke();
        g.lineWidth = 2; g.strokeStyle = '#2a2236'; g.beginPath(); g.moveTo(0, 200); g.lineTo(0, 250); g.stroke();
        var tag = new Path2D(); tag.rect(-22, 250, 44, 150); L.paper(g, tag, P.red, { shadow: [3, 6, 8, .5], rim: 1.5, tex: .5 });
        g.fillStyle = P.goldL; g.font = '900 34px "Noto Serif SC"'; g.textAlign = 'center'; g.fillText('落', 0, 300); g.fillText('花', 0, 340); g.fillText('雨', 0, 380);
      }, 110, 0);
      s7.moon = L.glow(300, '#dfe6f7', .25);
      s7.cl = L.cloud(380, 81, { col: '#cdd7ee' });
    },
    draw: function (g, t, lt) {
      bgRings(g, 1450, 420, 1);
      L.blit(g, s7.moon, 1450, 420, 1, 0, .5);
      var m = new Path2D(); m.arc(1450, 420, 170, 0, 6.283); L.paper(g, m, '#f4ecd8', { shadow: false, rim: 0, tex: .6 });
      L.blit(g, s7.cl, 1330 + lt * 40, 580, 1);
      L.blit(g, s7.eave, -60, -70, 1.45);
      // the bell, struck by the beat: a damped swing
      var sw = .5 * Math.exp(-lt / .5) * Math.sin(lt * 9) + .06 * Math.sin(t * 2);
      L.blit(g, s7.bell, 1050, 405, 1.5, sw);
      // sound rings off the bell
      for (var q = 0; q < 3; q++) { var a = lt - q * .12; if (a < 0) continue; var R = 120 + a * 600, al = Math.max(0, .5 - a * .7);
        g.strokeStyle = 'rgba(241,212,142,' + al + ')'; g.lineWidth = 3; g.beginPath(); g.arc(1050 + Math.sin(sw) * -225, 405 + 225, R, 0, 6.283); g.stroke(); }
      L.drawPetals(g, s7.petals, t, lt * 300, 0, 1, 1);
    }
  });
  F.scene({
    id: 'cut-umbrella', t0: B7[2], flash: .45, punch: .1,
    build: function () { s7.U = L.umbrella(470); },
    draw: function (g, t, lt) {
      bgRings(g, 960, 540, 0);
      var rot = lt * 2.6 + E.out3(L.seg(lt, 0, .5)) * 1.2;
      L.drawUmbrella(g, s7.U, 960, 540, 1, rot, 1);
      // petals flung off the spinning rim
      for (var i = 0; i < 40; i++) {
        var a0 = i * 2.4, born = (i % 10) * .06, age = lt - born; if (age < 0) continue;
        var a = a0 + rot * .3, r = 470 + age * 700;
        L.blit(g, L.petals[i % 6], 960 + Math.cos(a) * r, 540 + Math.sin(a) * r + age * age * 200, .9, a + age * 4, Math.max(0, 1 - age * .9), Math.cos(age * 6 + i));
      }
    }
  });
  F.scene({
    id: 'cut-walker', t0: B7[3], flash: .5, punch: .12,
    build: function () {
      s7.walker = L.walker(2.3);
      s7.tree = L.branch(91, 1990, -60, 2.5, 760, 80, 2, { rate: .6, bend: .004 });
      s7.treeS = L.sprite(L.W, L.H, function (g) { L.paper(g, s7.tree.path, '#221b36', { shadow: [10, 16, 26, .6], rim: 2.6, rimCol: '#5c4f78', tex: .6 }); });
      var sp = [L.blossom(46, 'plum', 1), L.blossom(40, 'peach', 2), L.blossom(50, 'white', 3), L.blossom(40, 'red', 4)], r = L.rng(3);
      s7.fl = s7.tree.spots.map(function (s, i) { return { x: s.x, y: s.y, sp: sp[i % 4], sc: r.range(.7, 1.15), rot: r() * 6 }; });
    },
    draw: function (g, t, lt) {
      bgRings(g, 760, 300, 1);
      L.blit(g, s7.moon, 700, 300, 1.4, 0, .4);
      var m = new Path2D(); m.arc(700, 300, 150, 0, 6.283); L.paper(g, m, '#f4ecd8', { shadow: false, rim: 0, tex: .6 });
      L.blit(g, s7.walker, 760 - lt * 30, 1150, 1, .02);
      L.blit(g, s7.treeS, 0, 0, 1);
      s7.fl.forEach(function (f, i) { L.blit(g, f.sp, f.x, f.y, f.sc * (1 + .1 * F.pulse(t, .2)), f.rot + Math.sin(t * 2 + i) * .06); });
      L.drawPetals(g, s7.petals, t, 200 + lt * 120, 0, 1, 1);
    }
  });
})(window);
