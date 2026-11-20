// Render the soundtrack from src/score.js → build/soundtrack.wav, measure loudness, encode assets/soundtrack.m4a.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCORE = require(path.join(ROOT, 'src/score.js'));
const gain = process.argv.includes('--gain') ? +process.argv[process.argv.indexOf('--gain') + 1] : 0;
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
const r = SCORE.render({ gain }, s => console.log('  ' + s));
for (const s of r.stats) console.log(`  ${String(s.sec[0]).padStart(5)}–${String(s.sec[1]).padEnd(5)} s  rms ${s.rms.toFixed(1)} dBFS  peak ${s.peak.toFixed(1)} dBFS`);
const wavP = path.join(ROOT, 'build/soundtrack.wav'); fs.writeFileSync(wavP, SCORE.wav(r.mix.L, r.mix.R));
const lo = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', wavP, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
console.log((lo.stderr.split('Summary:')[1] || '').replace(/\n\s*\n/g, '\n'));
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', wavP, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', path.join(ROOT, 'assets/soundtrack.m4a')]);
console.log('wrote assets/soundtrack.m4a');
