// Render 落花雨 to MP4: 1920×1080, 30 fps, H.264; the user's song excerpt is muxed in untouched (stream copy).
// usage: node tools/render.mjs [--workers 4] [--crf 18] [--q 1]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from './still.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = createRequire(import.meta.url)(path.join(ROOT, 'src/script.js'));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const WORKERS = +arg('--workers', 4), CRF = arg('--crf', '18'), Q = +arg('--q', 1), OUT = arg('--out', 'dist/xuedinge-de-qian.mp4');
const FPS = 30, TOTAL = Math.ceil(T.DUR * FPS);
const frames = path.join(ROOT, 'build/frames'); fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
const { srv, url } = await serve();
const browser = await chromium.launch();
const t0 = Date.now(); let done = 0;
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exit(1); });
  await page.goto(url + '/index.html?harness=1');
  await page.evaluate(q => window.HARNESS.init(q), Q);
  const a = Math.floor(TOTAL * w / WORKERS), b = Math.floor(TOTAL * (w + 1) / WORKERS);
  for (let i = a; i < b; i += 5) {
    const idx = []; for (let j = i; j < Math.min(b, i + 5); j++) idx.push(j);
    const jpgs = await page.evaluate(({ idx, FPS }) => idx.map(k => window.HARNESS.frame(k / FPS, 0.92)), { idx, FPS });
    jpgs.forEach((s, n) => fs.writeFileSync(path.join(frames, String(idx[n]).padStart(5, '0') + '.jpg'), Buffer.from(s, 'base64')));
    done += idx.length;
    if (w === 0 && (i - a) % 50 === 0) console.log(`  ${done}/${TOTAL}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await page.close();
}));
await browser.close(); srv.close();
console.log(`rendered ${fs.readdirSync(frames).length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
const out = path.join(ROOT, OUT); fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg'), '-i', path.join(ROOT, 'assets/soundtrack.m4a'),
  '-map', '0:v', '-map', '1:a', '-vf', 'scale=in_color_matrix=bt601:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-c:a', 'aac', '-b:a', '192k', '-t', String(T.DUR), '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
