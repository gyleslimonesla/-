// Render stills / contact sheets from the film for visual review.
// usage: node tools/still.mjs [--q 1] [--cols 4] [--scale 0.3] [--out file.png] t1 t2 ...   (or a:b:step)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function serve(root = ROOT) {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.m4a': 'audio/mp4', '.json': 'application/json', '.css': 'text/css', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
  const srv = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': mime[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); let q = 1, cols = 4, scale = 0.3, out = null, crop = null; const ts = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--q') q = +args[++i]; else if (a === '--cols') cols = +args[++i]; else if (a === '--scale') scale = +args[++i]; else if (a === '--out') out = args[++i];
    else if (a === '--crop') crop = args[++i].split(',').map(Number);
    else if (a.includes(':')) { const [s, e, st] = a.split(':').map(Number); for (let t = s; t <= e + 1e-6; t += st) ts.push(+t.toFixed(3)); }
    else ts.push(+a);
  }
  const { srv, url } = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message, e.stack));
  await page.goto(url + '/index.html?harness=1');
  const t0 = Date.now();
  await page.evaluate(async (q) => { await window.HARNESS.init(q); }, q);
  console.log('init ms', Date.now() - t0);
  const data = await page.evaluate(async ({ ts, cols, scale, crop }) => window.HARNESS.sheet(ts, cols, scale, crop), { ts, cols, scale, crop });
  console.log('render ms/frame', data.ms.map(x => Math.round(x)).join(' '));
  out = out || path.join(process.env.SCRATCH || '/tmp', 'sheet.png');
  fs.writeFileSync(out, Buffer.from(data.png.split(',')[1], 'base64'));
  console.log('wrote', out);
  await browser.close(); srv.close();
}
