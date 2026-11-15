#!/usr/bin/env python3
"""Subset the two typefaces to exactly the glyphs the film draws.
  Noto Serif SC (思源宋体) 200/300/400/600  — guide text, labels, seals, UI
  LXGW WenKai (霞鹜文楷) Light               — the poems
usage: python3 tools/build-fonts.py <node_modules dir containing @fontsource/noto-serif-sc and lxgw-wenkai-webfont>"""
import subprocess, sys, os, glob, tempfile
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.merge import Merger

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
nm = sys.argv[1]
text = subprocess.check_output(['node', '-e', "const S=require('%s/src/script.js');process.stdout.write(S.allText())" % root]).decode()
chars = sorted(set(text) - set('\n'))
uni = [ord(c) for c in chars]
print(len(chars), 'glyphs')

def sub(font, out=None):
    opt = subset.Options(); opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    s = subset.Subsetter(opt); s.populate(unicodes=uni); s.subset(font)
    return font

for w in (200, 300, 400, 600):
    f = sub(TTFont(os.path.join(nm, '@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-%d-normal.woff2' % w)))
    out = os.path.join(root, 'assets/fonts/noto-serif-sc-%d.woff2' % w); f.flavor = 'woff2'; f.save(out); print(out, os.path.getsize(out))

f = sub(TTFont(os.path.join(nm, '@fontsource/zhi-mang-xing/files/zhi-mang-xing-chinese-simplified-400-normal.woff2')))
out = os.path.join(root, 'assets/fonts/zhi-mang-xing.woff2'); f.flavor = 'woff2'; f.save(out); print(out, os.path.getsize(out))

# WenKai ships as ~100 unicode-range chunks: subset each chunk that holds a needed glyph, then merge.
for weight in ('light',):
    parts = []; tmp = tempfile.mkdtemp(); have = set()
    for p in sorted(glob.glob(os.path.join(nm, 'lxgw-wenkai-webfont/files/lxgwwenkai-%s-subset-*.woff2' % weight))):
        f = TTFont(p); cm = f.getBestCmap(); hit = [u for u in uni if u in cm and u not in have]
        if not hit: continue
        have.update(hit)
        opt = subset.Options(); opt.layout_features = []; opt.name_IDs = ['*']; opt.notdef_outline = True; opt.drop_tables += ['GSUB', 'GPOS', 'GDEF', 'vhea', 'vmtx', 'VORG', 'DSIG']
        s = subset.Subsetter(opt); s.populate(unicodes=hit); s.subset(f); f.flavor = None
        q = os.path.join(tmp, os.path.basename(p) + '.ttf'); f.save(q); parts.append(q)
    miss = [chr(u) for u in uni if u not in have and u > 0x2000]
    print('wenkai', weight, len(parts), 'chunks; missing:', ''.join(miss))
    m = Merger().merge(parts)
    out = os.path.join(root, 'assets/fonts/lxgw-wenkai-%s.woff2' % weight); m.flavor = 'woff2'; m.save(out); print(out, os.path.getsize(out))
