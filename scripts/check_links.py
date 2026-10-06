"""Checks that every in-repo markdown link to a playbook/SOP anchor, and every
curriculum lesson anchor, points at a heading that exists. Run after editing docs."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")


def slug(t):
    t = re.sub(r"<[^>]+>", "", t.lower().strip())
    t = re.sub(r"[^\w\s-]", "", t, flags=re.U).replace("_", "")
    return re.sub(r"\s", "-", t)


def anchors(path):
    md = open(path).read()
    return {slug(re.sub(r"[*`]", "", m)) for m in re.findall(r"^#{1,6} (.+)$", md, re.M)}


bad = []
for root, _, files in os.walk(DOCS):
    for f in files:
        if not f.endswith(".md"):
            continue
        p = os.path.join(root, f)
        for target, anchor in re.findall(r"\]\(([^)#\s]*\.md)?#([^)\s]+)\)", open(p).read()):
            tp = os.path.normpath(os.path.join(root, target)) if target else p
            if not os.path.exists(tp):
                bad.append(f"{p}: missing file {target}")
            elif anchor not in anchors(tp):
                bad.append(f"{os.path.relpath(p, ROOT)}: #{anchor} not in {os.path.relpath(tp, ROOT)}")
        for target in re.findall(r"\]\(([^)#\s:]+\.md)\)", open(p).read()):
            if not os.path.exists(os.path.normpath(os.path.join(root, target))):
                bad.append(f"{os.path.relpath(p, ROOT)}: missing file {target}")

cur = json.load(open(os.path.join(ROOT, "src", "lib", "seed", "curriculum.json")))
for d in cur["days"]:
    l = d["learn"]
    tp = os.path.join(DOCS, "playbook", l["slug"] + ".md")
    if l["anchor"] not in anchors(tp):
        bad.append(f"curriculum day {d['day']}: #{l['anchor']} not in {l['slug']}")

print("\n".join(bad) or "links ok")
sys.exit(1 if bad else 0)
