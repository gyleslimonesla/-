// Drive the real book in a phone viewport: open, turn every page, use each interaction, screenshot.
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
import { serve } from './still.mjs';
const out = process.env.SCRATCH || '/tmp', target = process.argv[2] || '/index.html';
const { srv, url } = await serve();
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 14'], deviceScaleFactor: 2 });
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(url + target); await page.waitForSelector('#book.ready', { timeout: 60000 });
const box = await page.locator('#plate').boundingBox(); const at = (u, v) => [box.x + box.width * u, box.y + box.height * v];
let n = 0; const shot = async () => page.screenshot({ path: `${out}/bk${n++}.png` });
await page.waitForTimeout(800); await shot();                                   // cover
await page.click('#open'); await page.waitForTimeout(1600); Object.assign(box, await page.locator('#plate').boundingBox());
for (let i = 0; i < 4; i++) { await page.mouse.click(...at(.6, .5)); await page.waitForTimeout(350); } await page.waitForTimeout(900); await shot();   // out
await page.click('#next'); await page.waitForTimeout(1500); await page.mouse.click(...at(.3, .75)); await page.waitForTimeout(1700); await shot();      // heron dips
await page.click('#next'); await page.waitForTimeout(1500); await page.mouse.click(...at(.5, .5)); await page.waitForTimeout(500); await shot();        // turtle
await page.click('#next'); await page.waitForTimeout(1500); await page.mouse.move(...at(.6, .7)); await page.mouse.down(); await page.waitForTimeout(900); await shot(); await page.mouse.up();   // fur
await page.click('#next'); await page.waitForTimeout(2600); await shot();                                                                                 // closed
await page.click('#next'); await page.waitForTimeout(1500); await page.mouse.move(...at(.5, .6)); await page.mouse.down(); await page.waitForTimeout(1800); await shot(); await page.waitForTimeout(2600); await page.mouse.up(); await page.waitForTimeout(1600); await shot();   // opening, open
console.log('open done:', await page.evaluate(() => BOOK.state().st.open.done));
await page.click('#next'); await page.waitForTimeout(3200); await shot(); await page.mouse.click(...at(.5, .31)); await page.waitForTimeout(1200); await shot();   // home, squint
console.log('state', await page.evaluate(() => ({ cur: BOOK.state().cur, audio: BOOK.state().audio, ctx: BOOK.state().ctx })), 'errors', errs, 'shots', n);
await browser.close(); srv.close();
