// Build the single-file edition: dist/from-haiku-to-mythos.html (code + fonts + soundtrack, no external requests),
// and the narration cue sheets: docs/narration.srt / .vtt / .json.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const S = createRequire(import.meta.url)(path.join(ROOT, 'src/script.js'));
const rd = p => fs.readFileSync(path.join(ROOT, p));

// ---- single file ----
let html = rd('index.html').toString();
const srcs = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]).filter(s => !/harness/.test(s));
const core = rd('src/core.js').toString();
const fonts = {}; for (const m of core.matchAll(/'([a-z0-9-]+\.woff2)'/g)) fonts[m[1]] = rd('assets/fonts/' + m[1]).toString('base64');
const audio = rd('assets/audio/soundtrack.m4a').toString('base64');
const js = 'window.EMBED=' + JSON.stringify({ fonts, audio }) + ';\n' + srcs.map(s => rd(s).toString()).join('\n');
html = html.replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, () => '<script>\n' + js.replace(/<\/script/g, '<\\/script') + '\n</script>');
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/from-haiku-to-mythos.html'), html);
// the same page as a body fragment (for hosts that supply their own <html> skeleton)
const style = html.match(/<!--STYLE-->([\s\S]*?)<!--\/STYLE-->/)[1].replace('<style>', '<style>\n:root{color-scheme:dark}');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(ROOT, 'build/from-haiku-to-mythos.fragment.html'), '<title>从俳句到神话</title>\n' + style + body);
console.log('dist/from-haiku-to-mythos.html', (html.length / 1e6).toFixed(2) + ' MB', srcs.length + ' scripts', Object.keys(fonts).length + ' fonts');

// ---- narration cue sheets ----
const ts = (t, sep) => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return [h, m, s].map(x => String(x).padStart(2, '0')).join(':') + sep + String(ms % 1000).padStart(3, '0'); };
const clean = s => s.replace(/_/g, '');
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/narration.srt'), S.NARRATION.map((c, i) => `${i + 1}\n${ts(c[0], ',')} --> ${ts(c[1], ',')}\n${clean(c[2])}\n`).join('\n'));
fs.writeFileSync(path.join(ROOT, 'docs/narration.vtt'), 'WEBVTT\n\n' + S.NARRATION.map(c => `${ts(c[0], '.')} --> ${ts(c[1], '.')}\n${clean(c[2])}\n`).join('\n'));
fs.writeFileSync(path.join(ROOT, 'docs/narration.json'), JSON.stringify({ sampleRate: 48000, duration: S.DUR, cues: S.NARRATION.map((c, i) => ({ id: i + 1, start: c[0], end: c[1], text: clean(c[2]).replace(/\n/g, '') })) }, null, 2));
console.log('docs/narration.{srt,vtt,json}', S.NARRATION.length + ' cues');
