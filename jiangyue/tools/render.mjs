// Render the film to MP4: 1080×1920, 30 fps, H.264 + AAC, exactly 150 s (4500 frames).
// Every frame is drawn by the same F.render(t) the browser player uses; audio is build/soundtrack.wav (tools/audio.mjs).
// usage: node tools/render.mjs [--workers 4] [--crf 15] [--narration path/to/narration.wav] [--keep]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from './still.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const WORKERS = +arg('--workers', 4), CRF = arg('--crf', '15'), NARR = arg('--narration', null);
const FPS = 30, DUR = 180, TOTAL = FPS * DUR;
const frames = path.join(ROOT, 'build/frames'); fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
const wavPath = path.join(ROOT, 'build/soundtrack.wav');
if (!fs.existsSync(wavPath)) { console.error('run tools/audio.mjs first'); process.exit(1); }

const { srv, url } = await serve();
const browser = await chromium.launch();
const t0 = Date.now(); let done = 0;
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exit(1); });
  await page.goto(url + '/index.html?harness=1');
  await page.evaluate(() => window.HARNESS.init(1));
  // contiguous chunks per worker keep each page's caches warm
  const a = Math.floor(TOTAL * w / WORKERS), b = Math.floor(TOTAL * (w + 1) / WORKERS);
  for (let i = a; i < b; i += 6) {
    const idx = []; for (let j = i; j < Math.min(b, i + 6); j++) idx.push(j);
    const jpgs = await page.evaluate(({ idx, FPS }) => idx.map(k => window.HARNESS.frame(k / FPS, 0.97)), { idx, FPS });
    jpgs.forEach((s, n) => fs.writeFileSync(path.join(frames, String(idx[n]).padStart(5, '0') + '.jpg'), Buffer.from(s, 'base64')));
    done += idx.length;
    if (w === 0 && (i - a) % 150 === 0) console.log(`  ${done}/${TOTAL} frames  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await page.close();
}));
await browser.close(); srv.close();
console.log(`rendered ${fs.readdirSync(frames).length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

const out = path.join(ROOT, 'dist/jiangyue-henian.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
const v = ['-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg')];
const vf = 'scale=in_color_matrix=bt601:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p';
const venc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv'];
const aenc = ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2'];
let cmd;
if (NARR) {
  // narration stem present: the music ducks under the voice (side-chain), then both are summed
  cmd = [...v, '-i', wavPath, '-i', NARR, '-filter_complex',
    `[0:v]${vf}[vo];[2:a]aresample=48000,asplit=2[n1][n2];[1:a][n1]sidechaincompress=threshold=0.02:ratio=5:attack=120:release=700:makeup=1[mu];[mu][n2]amix=inputs=2:normalize=0,alimiter=limit=0.84[ao]`,
    '-map', '[vo]', '-map', '[ao]', ...venc, ...aenc];
} else cmd = [...v, '-i', wavPath, '-vf', vf, '-map', '0:v', '-map', '1:a', ...venc, ...aenc];
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...cmd, '-t', String(DUR), '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
if (!process.argv.includes('--keep')) fs.rmSync(frames, { recursive: true, force: true });
