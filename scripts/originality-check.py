#!/usr/bin/env python3
"""Originality check: compare Helix lesson text against private source material.

Usage: python3 scripts/originality-check.py <source_dir_or_file> [more ...] [--json out.json]

Contains no source text. Source paths are given on the command line and are
never written into the repo. Reports:
  * 8-word runs shared between a Helix file and any source file
    (minus generic n-grams: all-stopword/terminology, or seen in >= GENERIC_DF source files)
  * close paraphrases: sentence pairs with difflib ratio > 0.75 (>= 8 words)
Exit code 1 if any non-generic 8-gram overlap remains.
"""
import sys, os, re, json, difflib
from collections import defaultdict

HELIX_ROOTS = ["docs", "src"]
HELIX_EXT = {".md", ".json", ".html", ".csv", ".py", ".ts", ".tsx", ".txt"}
SRC_EXT = {".md", ".txt", ".vtt", ".srt"}
N, P = 8, 5
GENERIC_DF = 25  # n-gram in this many separate source files = everyday phrasing
STOP = set("""a an the and or but if of to in on at for with by from as is are was were be been being it its this that these those
i you he she we they me him her us them my your our their do does did have has had not no so then than there here what which who
how when where why can could will would should may might just very really get got go going like about into out up down over all any
some more most much many one two first also only own same too s t don isn re ve ll m d""".split())
TERMS = set("""return ad spend roas cost goods sold cogs profit margin revenue aov average order value customer lifetime ltv cac acquisition
conversion rate cpa cpm ctr click through meta google facebook instagram tiktok shopify email sms campaign campaigns ads ad set sets
budget audience lookalike pixel landing page product products store sales inventory cash flow gst tax""".split())
# calendar words (month/day lists in code are not prose)
TERMS |= set("january february march april may june july august september october november december jan feb mar apr jun jul aug sep sept oct nov dec monday tuesday wednesday thursday friday saturday sunday".split())

def norm_words(t):
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\d\d:\d\d[:.,\d]*\s*-->\s*[\d:.,]+", " ", t)  # caption timestamps
    return re.sub(r"[^a-z0-9' ]+", " ", t.lower().replace("’", "'")).replace("'", "").split()

def sentences(t):
    t = re.sub(r"<[^>]+>", " ", t)
    for s in re.split(r"(?<=[.!?])\s+|\n+", t):
        w = norm_words(s)
        if len(w) >= 8:
            yield s.strip(), w

def walk(roots, exts, skip=("node_modules", ".next", "audio", ".venv", ".git")):
    for r in roots:
        if os.path.isfile(r):
            yield r; continue
        for d, ds, fs in os.walk(r):
            ds[:] = [x for x in ds if x not in skip]
            for f in fs:
                if os.path.splitext(f)[1].lower() in exts:
                    yield os.path.join(d, f)

def read(p):
    try:
        with open(p, encoding="utf-8", errors="ignore") as f: return f.read()
    except OSError: return ""

def grams(w, n): return [" ".join(w[i:i+n]) for i in range(len(w)-n+1)]

def trivial(g):
    if all(len(x) == 2 for x in g.split()): return True  # code lists (country codes)
    return all(x in STOP or x in TERMS or x.isdigit() for x in g.split())

def main():
    args = sys.argv[1:]; out = None
    if "--json" in args:
        i = args.index("--json"); out = args[i+1]; del args[i:i+2]
    if not args: sys.exit(__doc__)
    helix = {}
    for p in walk(HELIX_ROOTS, HELIX_EXT):
        t = read(p)
        if t.strip(): helix[p] = t
    h8 = defaultdict(set); h4 = defaultdict(list); hs = []
    for p, t in helix.items():
        for g in grams(norm_words(t), N): h8[g].add(p)
        for s, w in sentences(t):
            idx = len(hs); hs.append((p, s, w))
            for g in set(grams(w, 4)):
                if not trivial(g): h4[g].append(idx)
    hits = defaultdict(set); df = defaultdict(int); para = []; nsrc = 0
    for sp in walk(args, SRC_EXT):
        nsrc += 1; t = read(sp)
        seen = set(g for g in grams(norm_words(t), N) if g in h8)
        for g in seen: df[g] += 1; hits[g].add(sp)
        for s, w in sentences(t):
            cand = defaultdict(int)
            for g in set(grams(w, 4)):
                for i in h4.get(g, ()): cand[i] += 1
            for i, c in cand.items():
                if c < 2: continue
                r = difflib.SequenceMatcher(None, hs[i][2], w, autojunk=False).ratio()
                if r > 0.75: para.append((hs[i][0], hs[i][1][:80], sp, round(r, 2)))
    flagged = defaultdict(list)
    for g, srcs in hits.items():
        if trivial(g) or df[g] >= GENERIC_DF: continue
        for hp in h8[g]: flagged[hp].append(g)
    nsent = len(hs)
    print(f"helix files: {len(helix)}  helix sentences: {nsent}  source files: {nsrc}")
    print(f"files with 8-gram overlap: {len(flagged)}  overlapping 8-grams: {sum(len(v) for v in flagged.values())}")
    for hp, gs in sorted(flagged.items()):
        print(f"  {hp}: {len(gs)} -> e.g. '{gs[0]}'")
    pf = sorted(set(para))
    print(f"paraphrase pairs (ratio>0.75): {len(pf)}")
    for a, s, b, r in pf: print(f"  {a} [{r}] '{s}' ~ {os.path.basename(b)}")
    if out:
        json.dump({"flagged": {k: v for k, v in flagged.items()}, "para": pf}, open(out, "w"), indent=1)
    sys.exit(1 if flagged else 0)

if __name__ == "__main__": main()
