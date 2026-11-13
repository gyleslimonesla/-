/* player.js — the screening room: one master clock (the audio clock) drives picture, subtitles and sound. */
(function (G) {
  'use strict';
  if (/[?&]harness=1/.test(location.search)) return;
  var F = G.F, S = G.SCRIPT, UI = S.UI, DUR = F.DUR;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('stage'), ctx = cv.getContext('2d', { alpha: false }), wrap = $('wrap'), frame = $('frame');
  var QS = [1, 2 / 3, 1 / 2], qi = 0;
  var ac = null, master = null, musicGain = null, narrGain = null, buf = null, narrBuf = null, src = null, nsrc = null;
  var playing = false, offset = 0, t0ctx = 0, t0perf = 0, ended = false, ready = false, vol = 1, muted = false, hideTimer = 0, seeking = false;
  var slow = 0, lastTs = 0, building = false;

  /* ---------- layout: 9:16 stage, contained in the viewport ---------- */
  function fit() {
    var vw = wrap.clientWidth, vh = wrap.clientHeight, w = Math.min(vw, vh * 9 / 16), h = w * 16 / 9;
    frame.style.width = w + 'px'; frame.style.height = h + 'px';
    frame.style.setProperty('--u', (w / 108) + 'px');
  }
  G.addEventListener('resize', fit); G.addEventListener('orientationchange', fit); fit();

  function pickQuality() {
    var dpr = Math.min(G.devicePixelRatio || 1, 3), need = frame.clientWidth * dpr / 1080, mobile = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
    var mem = navigator.deviceMemory || 4;
    if (need > .8 && !(mobile && mem < 4)) return 0;
    if (need > .55 || mobile) return 1;
    return 2;
  }
  function setCanvas() { cv.width = Math.round(1080 * QS[qi]); cv.height = Math.round(1920 * QS[qi]); }
  function build(i) {
    building = true; qi = i; setCanvas(); markQ();
    return F.init(QS[qi], function (p) { $('bar').style.transform = 'scaleX(' + (.15 + p * .6) + ')'; }).then(function () { building = false; F.render(ctx, ready ? now() : 11.3); });
  }

  /* ---------- audio ---------- */
  function b64(s) { return F.b64buf(s); }
  function loadAudio() {
    var AC = G.AudioContext || G.webkitAudioContext; if (!AC) return Promise.resolve();
    try { ac = new AC({ latencyHint: 'playback' }); } catch (e) { try { ac = new AC(); } catch (e2) { return Promise.resolve(); } }
    master = ac.createGain(); master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.connect(master); narrGain = ac.createGain(); narrGain.connect(master);
    var get = G.EMBED && G.EMBED.audio ? Promise.resolve(b64(G.EMBED.audio)) : fetch('assets/audio/soundtrack.m4a').then(function (r) { if (!r.ok) throw new Error('audio ' + r.status); return r.arrayBuffer(); });
    return get.then(decode).then(function (b) { buf = b; }).catch(function (e) { console.warn('soundtrack unavailable', e); buf = null; })
      .then(function () { // optional narration stem next to the project (assets/audio/narration.m4a|mp3|wav)
        if (G.EMBED) return;
        return ['m4a', 'mp3', 'wav'].reduce(function (pr, ext) { return pr.then(function (ok) { return ok || fetch('assets/audio/narration.' + ext).then(function (r) { if (!r.ok) return false; return r.arrayBuffer().then(decode).then(function (b) { narrBuf = b; noteNarr(); return true; }); }).catch(function () { return false; }); }); }, Promise.resolve(false));
      });
  }
  function decode(ab) { return new Promise(function (res, rej) { var pr = ac.decodeAudioData(ab, res, rej); if (pr && pr.catch) pr.catch(rej); }); }
  function noteNarr() { $('narrState').textContent = narrBuf ? UI.narrOk : UI.narrNone; }
  /** music makes room for the voice: −7 dB under every narration cue (only when a narration stem is loaded) */
  function scheduleDuck(from) {
    if (!musicGain) return; var g = musicGain.gain, at = ac.currentTime; g.cancelScheduledValues(at); g.setValueAtTime(1, at);
    if (!narrBuf) return;
    S.NARRATION.forEach(function (c) {
      var a = c[0] - .35, b = c[1] + .25; if (b + .7 < from) return;
      var ta = at + Math.max(0, a - from), tb = at + Math.max(0, b - from);
      if (a >= from) { g.setValueAtTime(1, ta); g.linearRampToValueAtTime(.45, ta + .35); } else g.setValueAtTime(.45, at);
      g.setValueAtTime(.45, Math.max(tb, at + .001)); g.linearRampToValueAtTime(1, Math.max(tb, at) + .7);
    });
  }
  function startSources(from) {
    stopSources(); if (!ac) return;
    if (buf) { src = ac.createBufferSource(); src.buffer = buf; src.connect(musicGain); src.start(0, Math.min(from, buf.duration - .01)); }
    if (narrBuf && from < narrBuf.duration) { nsrc = ac.createBufferSource(); nsrc.buffer = narrBuf; nsrc.connect(narrGain); nsrc.start(0, from); }
    scheduleDuck(from);
  }
  function stopSources() { [src, nsrc].forEach(function (s) { if (s) { try { s.stop(); } catch (e) { } s.disconnect(); } }); src = nsrc = null; }
  function applyVol() { if (master) master.gain.setTargetAtTime(muted ? 0 : vol, ac.currentTime, .03); $('mute').classList.toggle('off', muted || vol === 0); }

  /* ---------- transport ---------- */
  function now() { if (!playing) return offset; var t = ac && buf ? offset + (ac.currentTime - t0ctx) : offset + (performance.now() - t0perf) / 1000; return Math.min(DUR, t); }
  function play() {
    if (!ready || building) return;
    if (ended) { offset = 0; ended = false; }
    var go = function () { t0ctx = ac ? ac.currentTime : 0; t0perf = performance.now(); startSources(offset); playing = true; sync(); poke(); };
    if (ac && ac.state !== 'running') ac.resume().then(go, go); else go();
  }
  function pause() { if (!playing) return; offset = now(); playing = false; stopSources(); sync(); poke(true); }
  function seek(t) { t = Math.max(0, Math.min(DUR - .01, t)); var was = playing; if (was) { playing = false; stopSources(); } offset = t; ended = false; if (was) play(); else { F.render(ctx, offset); sync(); } }
  function fmt(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function sync() {
    frame.classList.toggle('playing', playing); frame.classList.toggle('ended', ended);
    var t = now(); $('time').textContent = fmt(t) + ' / ' + fmt(DUR); $('fill').style.transform = 'scaleX(' + (t / DUR) + ')'; $('knob').style.left = (t / DUR * 100) + '%';
  }
  function poke(stay) { frame.classList.add('ui'); clearTimeout(hideTimer); if (playing && !stay) hideTimer = setTimeout(function () { if (playing && !seeking) frame.classList.remove('ui'); }, 2600); }

  /* ---------- the loop ---------- */
  function tick(ts) {
    requestAnimationFrame(tick);
    if (!ready || building) return;
    if (playing) {
      var t = now();
      F.render(ctx, t);
      if (t >= DUR) { playing = false; ended = true; offset = DUR; stopSources(); F.render(ctx, DUR); sync(); clearTimeout(hideTimer); frame.classList.remove('ui'); } // hold the last plate, undisturbed; never cut to black
      // adaptive quality: if the device cannot hold ~24 fps, step down once (same composition, fewer pixels)
      if (lastTs) { var dt = ts - lastTs; slow = dt > 45 ? slow + dt : Math.max(0, slow - dt * .5); if (slow > 3200 && qi < 2) { slow = 0; var o = now(); pause(); toast(UI.auto); build(qi + 1).then(function () { offset = o; play(); }); } }
      if ((ts | 0) % 4 === 0) sync();
    }
    lastTs = playing ? ts : 0;
  }
  function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.add('on'); setTimeout(function () { el.classList.remove('on'); }, 2400); }
  function markQ() { [].forEach.call(document.querySelectorAll('[data-q]'), function (b) { b.classList.toggle('on', +b.dataset.q === qi); }); }

  /* ---------- wiring ---------- */
  $('start').addEventListener('click', function (e) { e.stopPropagation(); frame.classList.add('started'); play(); });
  $('startLayer').addEventListener('click', function (e) { e.stopPropagation(); });
  $('pp').addEventListener('click', function (e) { e.stopPropagation(); playing ? pause() : play(); });
  $('replay').addEventListener('click', function (e) { e.stopPropagation(); seek(0); play(); });
  $('mute').addEventListener('click', function (e) { e.stopPropagation(); muted = !muted; applyVol(); });
  $('vol').addEventListener('input', function (e) { vol = +e.target.value; muted = false; applyVol(); });
  [].forEach.call(document.querySelectorAll('[data-q]'), function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation(); var i = +b.dataset.q; if (i === qi || building) return;
      var was = playing, o = now(); if (was) pause(); build(i).then(function () { offset = o; if (was) play(); });
    });
  });
  var fsEl = wrap, canFS = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen;
  if (!canFS) $('fs').style.display = 'none';
  $('fs').addEventListener('click', function (e) {
    e.stopPropagation();
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else { var p = (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl); if (p && p.catch) p.catch(function () { }); }
  });
  $('narrFile').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0]; if (!f || !ac) return;
    f.arrayBuffer().then(decode).then(function (b) { narrBuf = b; noteNarr(); toast(UI.narrOk); if (playing) { var o = now(); pause(); offset = o; play(); } }).catch(function () { toast(UI.err); });
  });
  // scrubbing
  var track = $('track');
  function at(e) { var r = track.getBoundingClientRect(), x = (e.touches ? e.touches[0] : e).clientX; return Math.max(0, Math.min(1, (x - r.left) / r.width)) * DUR; }
  function down(e) { e.preventDefault(); e.stopPropagation(); seeking = true; seek(at(e)); poke(true); }
  function move(e) { if (!seeking) return; e.preventDefault(); seek(at(e)); }
  function up() { if (seeking) { seeking = false; poke(); } }
  track.addEventListener('mousedown', down); G.addEventListener('mousemove', move); G.addEventListener('mouseup', up);
  track.addEventListener('touchstart', down, { passive: false }); G.addEventListener('touchmove', move, { passive: false }); G.addEventListener('touchend', up);
  $('controls').addEventListener('click', function (e) { e.stopPropagation(); poke(); });
  frame.addEventListener('click', function () { if (!frame.classList.contains('started')) return; if (frame.classList.contains('ui') && playing) pause(); else if (!playing && !ended) play(); else poke(); });
  frame.addEventListener('mousemove', function () { if (frame.classList.contains('started')) poke(); });
  document.addEventListener('keydown', function (e) {
    if (!frame.classList.contains('started')) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); $('start').click(); } return; }
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(now() + 5); else if (e.code === 'ArrowLeft') seek(now() - 5);
    else if (e.key === 'm') { muted = !muted; applyVol(); } else if (e.key === 'f') $('fs').click(); else if (e.key === 'r') { seek(0); play(); }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) pause(); });

  /* ---------- boot ---------- */
  $('loadText').textContent = UI.loading; $('startText').textContent = UI.start; $('hint').textContent = UI.hint; $('replayText').textContent = UI.replay;
  $('qLabel').textContent = UI.quality; $('narrLabel').textContent = UI.narr; noteNarr();
  [].forEach.call(document.querySelectorAll('[data-q]'), function (b) { b.textContent = UI.q[+b.dataset.q]; });
  build(pickQuality()).then(function () { $('loadText').textContent = UI.tune; $('bar').style.transform = 'scaleX(.8)'; return loadAudio(); })
    .then(function () { $('bar').style.transform = 'scaleX(1)'; ready = true; applyVol(); sync(); frame.classList.add('ready'); requestAnimationFrame(tick); })
    .catch(function (e) { console.error(e); $('loadText').textContent = UI.err; });
  G.PLAYER = { play: play, pause: pause, seek: seek, now: now, state: function () { return { playing: playing, ended: ended, ready: ready, q: qi, t: now(), audio: !!buf, narration: !!narrBuf, ctx: ac ? ac.state : 'none' }; } };
})(window);
