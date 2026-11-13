#!/usr/bin/env python3
"""Subset Noto Serif SC to exactly the glyphs the film draws (keeps the project small and self-contained).
usage: python3 tools/build-fonts.py <dir containing noto-serif-sc-chinese-simplified-{400,600}-normal.woff2>"""
import json, subprocess, sys, os
from fontTools import subset
from fontTools.ttLib import TTFont

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
text = subprocess.check_output(['node', '-e', "const S=require('%s/src/script.js');process.stdout.write(S.allText())" % root]).decode()
chars = sorted(set(c for c in text + '“”‘’——…·，。：；、（）！？《》「」' if ord(c) >= 0x2E80 or c in '“”‘’—…·'))
print(len(chars), 'glyphs:', ''.join(chars))
for w in (400, 600):
    f = TTFont(os.path.join(src, 'noto-serif-sc-chinese-simplified-%d-normal.woff2' % w))
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.name_IDs = ['*']
    s = subset.Subsetter(opt); s.populate(unicodes=[ord(c) for c in chars]); s.subset(f)
    out = os.path.join(root, 'assets/fonts/noto-serif-sc-subset-%d.woff2' % w)
    f.flavor = 'woff2'; f.save(out); print(out, os.path.getsize(out))
