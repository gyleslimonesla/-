/* book.js — 装订：翻页、每页的互动、声音。 */
(function (G) {
  'use strict';
  if (/[?&]harness=1/.test(location.search) || !document.getElementById('plate')) return;
  var F = G.F, E = F.E, S = G.STORY, PG = S.PAGES, W = F.W, H = F.H, lerp = F.lerp, clamp = F.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('plate'), ctx = cv.getContext('2d', { alpha: false }), book = $('book');
  var cur = 0, shown = 0, fade = 0, fading = 0, target = 0, t0 = performance.now(), last = 0, ready = false;
  var par = { x: 0, y: 0, tx: 0, ty: 0 }, down = false, st = {};

  /* ---------- 每页的状态 ---------- */
  function fresh() {
    st = {
      cover: { open: 0, lit: .34, walk: 0 },
      out: { open: 0, lit: .34, walk: 0, walkT: 0, walking: 0 },
      heron: { dip: 0, dipT: 0, ripples: [], eaten: 0 },
      turtle: { step: 0, blinkAt: 0, shoot: [] },
      fur: { purr: 0 },
      closed: { open: 0, up: 0 },
      open: { open: 0, up: 0, done: false },
      home: { open: 1, lit: 1, home: 1, squint: 0, sq: 0, sqUntil: 0 }
    };
  }
  fresh();

  /* ---------- 声音：一首循环的摇篮曲 + 现场合成的小声响 ---------- */
  var ac = null, master = null, music = null, musicGain = null, purrGain = null, soundOn = true;
  function b64(s) { return F.b64buf(s); }
  function initAudio() {
    var AC = G.AudioContext || G.webkitAudioContext; if (!AC) return Promise.resolve();
    try { ac = new AC(); } catch (e) { return Promise.resolve(); }
    master = ac.createGain(); master.connect(ac.destination); musicGain = ac.createGain(); musicGain.gain.value = .9; musicGain.connect(master);
    var get = G.EMBED && G.EMBED.audio ? Promise.resolve(b64(G.EMBED.audio)) : fetch('assets/audio/lullaby.m4a').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); });
    return get.then(function (ab) { return new Promise(function (res, rej) { var p = ac.decodeAudioData(ab, res, rej); if (p && p.catch) p.catch(rej); }); }).then(function (b) { music = b; }).catch(function () { music = null; });
  }
  function startMusic() {
    if (!ac) return; if (ac.state !== 'running') ac.resume();
    if (music && !startMusic.src) { var s = ac.createBufferSource(); s.buffer = music; s.loop = true; s.connect(musicGain); s.start(0); startMusic.src = s; }
    if (!purrGain) { // 猫的呼噜：很低的两个音，被一个更慢的颤动推着
      purrGain = ac.createGain(); purrGain.gain.value = 0; purrGain.connect(master);
      var o1 = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), am = ac.createGain();
      o1.type = 'sawtooth'; o1.frequency.value = 55; o2.type = 'triangle'; o2.frequency.value = 82.5; lfo.frequency.value = 24; lg.gain.value = .5; am.gain.value = .5;
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
      lfo.connect(lg); lg.connect(am.gain); o1.connect(am); o2.connect(am); am.connect(lp); lp.connect(purrGain); o1.start(); o2.start(); lfo.start();
    }
  }
  function chime(freq, vol, dur) {
    if (!ac || !soundOn) return; var t = ac.currentTime, g = ac.createGain(); g.connect(master);
    [[1, 1], [2.76, .3], [5.4, .12]].forEach(function (p) { var o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = freq * p[0]; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime((vol || .12) * p[1], t + .008); og.gain.exponentialRampToValueAtTime(.0001, t + (dur || 1.6) / p[0]); o.connect(og); og.connect(g); o.start(t); o.stop(t + (dur || 1.6)); });
  }
  function plip() {
    if (!ac || !soundOn) return; var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(1100, t + .09);
    g.gain.setValueAtTime(.16, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); g.connect(master); o.start(t); o.stop(t + .25);
  }
  var NOTES = [587.3, 659.3, 740, 880, 987.8, 1174.7, 1318.5, 1480];
  function setSound(on) { soundOn = on; if (master) master.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, .05); $('snd').classList.toggle('off', !on); }

  /* ---------- 翻页 ---------- */
  function setText(i) {
    var p = PG[i], box = $('lines'), lines = p.cover ? [] : ((p.id === 'open' && st.open.done) ? p.after : p.text);
    box.innerHTML = ''; (lines || []).forEach(function (ln, k) { var d = document.createElement('p'); d.textContent = ln; d.style.animationDelay = (.25 + k * .5) + 's'; box.appendChild(d); });
    $('hint').textContent = (p.id === 'open' && st.open.done) ? '' : (p.hint || '');
    book.classList.toggle('cover', !!p.cover); book.classList.toggle('last', !!p.end);
    $('num').textContent = p.cover ? '' : i + ' / ' + (PG.length - 1);
    $('prev').disabled = i === 0; $('next').disabled = i === PG.length - 1;
    var dots = $('dots').children; for (var k2 = 0; k2 < dots.length; k2++) dots[k2].classList.toggle('on', k2 === i);
  }
  function go(i) {
    if (i < 0 || i >= PG.length || i === target || !ready) return;
    target = i; fading = 1; book.classList.add('turning');
    if (i === 0) fresh();
  }
  function swap() { // 在最暗的一瞬换页——像眨了一下眼
    shown = target; cur = target; setText(cur); book.classList.remove('turning');
    var id = PG[cur].id; if (id === 'out') { st.out.walk = 0; st.out.walkT = 0; } if (id === 'closed') st.closed.open = 0; if (id === 'open' && !st.open.done) { st.open.open = 0; st.open.up = 0; }
    if (id === 'home') { st.home.open = 0; st.home.lit = .34; }
    if (ac && soundOn && cur > 0) chime(NOTES[cur % NOTES.length] / 2, .07, 2.2);
  }

  /* ---------- 互动 ---------- */
  function plateXY(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; return { x: (p.clientX - r.left) / r.width * W, y: (p.clientY - r.top) / r.height * H, u: (p.clientX - r.left) / r.width, v: (p.clientY - r.top) / r.height }; }
  function tap(q) {
    var id = PG[cur].id, t = now(), s;
    if (id === 'cover') return;
    if (id === 'out') { s = st.out; s.lit = Math.min(1, s.lit + 1 / 9); s.walkT = Math.min(1, s.walkT + .34); chime(NOTES[Math.round(s.lit * 8) % 8], .1); }
    else if (id === 'heron') { s = st.heron; if (q.y > 470) { s.ripples.push({ x: q.x, y: q.y, t0: t }); if (s.ripples.length > 6) s.ripples.shift(); plip(); } s.dipT = t; if (s.eaten < 40) setTimeout(function () { s.eaten += 3; chime(NOTES[(s.eaten / 3) % 8 | 0] * 2, .06, 1); }, 1500); }
    else if (id === 'turtle') { s = st.turtle; s.step = 1; s.blinkAt = t; s.shoot.push({ t0: t + .2, x: 80 + Math.random() * 500, y: 60 + Math.random() * 260 }); if (s.shoot.length > 5) s.shoot.shift(); chime(196, .12, 2.6); setTimeout(function () { chime(1568, .05, 1.2); }, 350); }
    else if (id === 'closed') { chime(146.8, .1, 2.4); }
    else if (id === 'home') { s = st.home; if (Math.hypot(q.x - 540, q.y - 500) < 230) { s.sqUntil = t + 2.6; chime(880, .1, 2); setTimeout(function () { chime(659.3, .09, 2.4); }, 420); } else chime(NOTES[(Math.random() * 8) | 0], .07); }
  }
  function now() { return (performance.now() - t0) / 1000; }
  function onDown(e) { if (!ready || PG[cur].cover) return; down = true; var q = plateXY(e); par.tx = (q.u - .5) * 2; par.ty = (q.v - .5) * 2; onDown.q = q; onDown.t = performance.now(); onDown.moved = 0; startMusic(); }
  function onMove(e) { if (!ready) return; var q = plateXY(e); if (q.u < -.2 || q.u > 1.2) return; par.tx = clamp((q.u - .5) * 2, -1, 1); par.ty = clamp((q.v - .5) * 2, -1, 1); if (down && onDown.q) onDown.moved += Math.abs(q.x - onDown.q.x) + Math.abs(q.y - onDown.q.y) > 60 ? 1 : 0; }
  function onUp() { if (!down) return; down = false; if (performance.now() - onDown.t < 420) tap(onDown.q); }
  cv.addEventListener('mousedown', onDown); G.addEventListener('mousemove', onMove); G.addEventListener('mouseup', onUp);
  cv.addEventListener('touchstart', function (e) { e.preventDefault(); onDown(e); }, { passive: false }); cv.addEventListener('touchmove', function (e) { e.preventDefault(); onMove(e); }, { passive: false }); cv.addEventListener('touchend', function (e) { e.preventDefault(); onUp(); par.tx = 0; par.ty = 0; }, { passive: false });
  cv.addEventListener('mouseleave', function () { par.tx = 0; par.ty = 0; });

  /* ---------- 每帧 ---------- */
  function update(dt, t) {
    par.x += (par.tx - par.x) * Math.min(1, dt * 4); par.y += (par.ty - par.y) * Math.min(1, dt * 4);
    var s = st.out; s.walking = Math.abs(s.walkT - s.walk) > .01 ? 1 : 0; s.walk += (s.walkT - s.walk) * Math.min(1, dt * 1.2);
    s = st.heron; var want = (t - s.dipT < 2.6 && s.dipT) ? 1 : 0; s.dip += (want - s.dip) * Math.min(1, dt * 1.6);
    s = st.turtle; s.step = Math.max(0, s.step - dt * .7);
    s = st.fur; var pw = (down && PG[cur].id === 'fur') ? 1 : 0; s.purr += (pw - s.purr) * Math.min(1, dt * 2.5); if (purrGain) purrGain.gain.setTargetAtTime(soundOn ? s.purr * .5 : 0, ac.currentTime, .08);
    s = st.open;
    if (PG[cur].id === 'open') {
      var hold = down ? 1 : 0; s.up += ((s.done ? 1 : hold) - s.up) * Math.min(1, dt * 3);
      if (!s.done) { s.open = clamp(s.open + (hold && s.up > .6 ? dt * .3 : -dt * .16)); if (s.open >= 1) { s.done = true; setText(cur); chime(293.7, .12, 3); setTimeout(function () { chime(440, .1, 3); }, 300); setTimeout(function () { chime(587.3, .1, 3.4); }, 620); setTimeout(function () { chime(880, .08, 3.6); }, 980); } else if (hold && Math.random() < dt * 3) chime(NOTES[(s.open * 7) | 0] / 2, .03, .8); }
    }
    s = st.home; if (PG[cur].id === 'home') { s.open = Math.min(1, s.open + dt * .5); s.lit = Math.min(1, s.lit + dt * .22); var sq = t < s.sqUntil ? 1 : 0; s.squint += (sq - s.squint) * Math.min(1, dt * 2.4); }
    s = st.closed; if (PG[cur].id === 'closed') s.up += (0 - s.up) * dt;
  }
  function frame(ts) {
    requestAnimationFrame(frame); if (!ready) return;
    var t = now(), dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    if (fading) { fade += dt * 2.4 * fading; if (fade >= 1 && fading > 0) { fade = 1; swap(); fading = -1; } if (fade <= 0 && fading < 0) { fade = 0; fading = 0; } }
    update(dt, t);
    var q = F.Q, p = PG[shown];
    ctx.setTransform(q, 0, 0, q, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    F.plates[p.plate].draw(ctx, t, st[p.id], par);
    F.finish(ctx);
    if (fade > 0) { ctx.fillStyle = 'rgba(9,12,34,' + E.inOutS(fade) + ')'; ctx.fillRect(0, 0, W, H); }
  }

  /* ---------- 布局与启动 ---------- */
  function fit() {
    var vw = G.innerWidth, vh = G.innerHeight, wide = vw / vh > 1.05, w;
    book.classList.toggle('wide', wide);
    if (wide) w = Math.min((vh - 40) * 2 / 3, vw * .46, 640); else w = Math.min(vw, 620, (vh - 52 - 184) / 1.5, (vh - 52) / 1.97);
    book.style.setProperty('--pw', Math.round(w) + 'px'); book.style.setProperty('--u', (w / 100) + 'px');
  }
  G.addEventListener('resize', fit); fit();
  var dots = $('dots'); PG.forEach(function () { dots.appendChild(document.createElement('i')); });
  $('title').innerHTML = S.TITLE.slice(0, 4) + '<br>' + S.TITLE.slice(4); $('sub').textContent = S.SUB; $('openT').textContent = S.UI.open; $('loadT').textContent = S.UI.loading; $('againT').textContent = S.UI.again;
  $('open').addEventListener('click', function () { startMusic(); chime(587.3, .1, 2.4); setTimeout(function () { chime(880, .08, 2.6); }, 260); go(1); });
  $('next').addEventListener('click', function () { startMusic(); go(target + 1); }); $('prev').addEventListener('click', function () { go(target - 1); });
  $('again').addEventListener('click', function () { go(0); });
  $('snd').addEventListener('click', function () { startMusic(); setSound(!soundOn); });
  document.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (cur === 0) $('open').click(); else go(target + 1); } else if (e.key === 'ArrowLeft') go(target - 1); });
  var sx = 0; $('text').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $('text').addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(target + (dx < 0 ? 1 : -1)); }, { passive: true });

  var dpr = Math.min(G.devicePixelRatio || 1, 3), need = parseFloat(getComputedStyle(book).getPropertyValue('--pw')) * dpr / W;
  F.Q = need > .8 ? 1 : need > .55 ? 2 / 3 : .5; cv.width = Math.round(W * F.Q); cv.height = Math.round(H * F.Q);
  F.loadFonts().catch(function () { }).then(function () {
    var keys = Object.keys(F.plates).filter(function (k) { return F.plates[k].build; }), i = 0;
    return new Promise(function (res) { (function next() { if (i >= keys.length) { F.buildCommon(); res(); return; } F.plates[keys[i++]].build(); $('bar').style.transform = 'scaleX(' + (i / (keys.length + 1)) + ')'; setTimeout(next, 0); })(); });
  }).then(initAudio).then(function () { ready = true; setText(0); book.classList.add('ready'); requestAnimationFrame(frame); });
  G.BOOK = { go: go, state: function () { return { cur: cur, ready: ready, st: st, audio: !!music, ctx: ac ? ac.state : 'none' }; }, tap: tap, hold: function (v) { down = v; } };
})(window);
