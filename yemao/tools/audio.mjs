// Render the soundtrack (48 kHz stereo) from src/score.js, write stems + mix, measure loudness, encode AAC.
// usage: node tools/audio.mjs [--gain dB] [--stems]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCORE = require(path.join(ROOT, 'src/score.js'));
const args = process.argv.slice(2);
const gain = args.includes('--gain') ? +args[args.indexOf('--gain') + 1] : 0;
const out = path.join(ROOT, 'build'); fs.mkdirSync(out, { recursive: true });

const r = SCORE.render({ gain }, s => console.log('  ' + s));
for (const s of r.stats) console.log(`  ${String(s.sec[0]).padStart(3)}–${String(s.sec[1]).padEnd(3)} s  rms ${s.rms.toFixed(1)} dBFS  peak ${s.peak.toFixed(1)} dBFS`);
fs.writeFileSync(path.join(out, 'soundtrack.wav'), SCORE.wav(r.mix.L, r.mix.R));
if (args.includes('--stems')) for (const k of ['music', 'vocal', 'foley']) fs.writeFileSync(path.join(out, `stem-${k}.wav`), SCORE.wav(r.stems[k].L, r.stems[k].R));

const lo = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(out, 'soundtrack.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
const tail = lo.stderr.split('Summary:')[1] || lo.stderr.slice(-600);
console.log(tail.replace(/\n\s*\n/g, '\n'));
fs.mkdirSync(path.join(ROOT, 'assets/audio'), { recursive: true });
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(out, 'soundtrack.wav'), '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', path.join(ROOT, 'assets/audio/lullaby.m4a')]);
if (args.includes('--stems')) for (const k of ['music', 'vocal', 'foley']) execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(out, `stem-${k}.wav`), '-c:a', 'aac', '-b:a', '160k', path.join(ROOT, `assets/audio/stem-${k}.m4a`)]);
console.log('wrote assets/audio/lullaby.m4a', fs.statSync(path.join(ROOT, 'assets/audio/lullaby.m4a')).size);
