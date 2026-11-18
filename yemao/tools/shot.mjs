// Render plates for review. usage: node tools/shot.mjs out.png cols scale '<json items>'
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import { serve } from './still.mjs';
const [out, cols, scale, json] = process.argv.slice(2);
const { srv, url } = await serve();
const browser = await chromium.launch(); const page = await browser.newPage();
page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[pageerror]', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | ')));
await page.goto(url + '/plates.html');
const ms = await page.evaluate(q => window.HARNESS.init(q), 1); console.log('build ms', Math.round(ms));
const png = await page.evaluate(({ items, cols, scale }) => window.HARNESS.sheet(items, cols, scale), { items: JSON.parse(json), cols: +cols, scale: +scale });
fs.writeFileSync(out, Buffer.from(png.split(',')[1], 'base64')); console.log('wrote', out);
await browser.close(); srv.close();
