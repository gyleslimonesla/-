#!/usr/bin/env python3
"""Subset LXGW WenKai Light to the glyphs the book uses. usage: python3 tools/build-fonts.py <node_modules>"""
import subprocess, sys, os, glob, tempfile
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); nm = sys.argv[1]
text = subprocess.check_output(['node', '-e', "const S=require('%s/src/story.js');process.stdout.write(S.allText())" % root]).decode()
uni = sorted(set(ord(c) for c in text + '“”，。：——？！…✦' if c != '\n'))
parts = []; tmp = tempfile.mkdtemp(); have = set()
for p in sorted(glob.glob(os.path.join(nm, 'lxgw-wenkai-webfont/files/lxgwwenkai-light-subset-*.woff2'))):
    f = TTFont(p); cm = f.getBestCmap(); hit = [u for u in uni if u in cm and u not in have]
    if not hit: continue
    have.update(hit)
    opt = subset.Options(); opt.layout_features = []; opt.name_IDs = ['*']; opt.notdef_outline = True; opt.drop_tables += ['GSUB', 'GPOS', 'GDEF', 'vhea', 'vmtx', 'VORG', 'DSIG']
    s = subset.Subsetter(opt); s.populate(unicodes=hit); s.subset(f); f.flavor = None
    q = os.path.join(tmp, os.path.basename(p) + '.ttf'); f.save(q); parts.append(q)
print(len(uni), 'glyphs;', len(parts), 'chunks; missing:', ''.join(chr(u) for u in uni if u not in have and u > 0x2000))
m = Merger().merge(parts); out = os.path.join(root, 'assets/fonts/lxgw-wenkai-light.woff2'); m.flavor = 'woff2'; m.save(out); print(out, os.path.getsize(out))
