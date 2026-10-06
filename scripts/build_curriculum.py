"""Build src/lib/seed/curriculum.json and docs/daily-curriculum.md from scripts/curriculum_source.py."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from curriculum_source import STAGES, D

PB = os.path.join(ROOT, "docs", "playbook")
files = sorted(f for f in os.listdir(PB) if re.match(r"\d\d-.*\.md$", f))

def slugify(t):
    t = t.lower().strip()
    t = re.sub(r"[^\w\s-]", "", t)
    return re.sub(r"\s", "-", t)

def find(ref):
    mod = int(ref.split(".")[0])
    f = files[mod - 1]
    md = open(os.path.join(PB, f)).read()
    m = re.search(r"^## (Lesson " + re.escape(ref) + r": .+)$", md, re.M)
    if not m:
        raise SystemExit(f"missing lesson {ref} in {f}")
    title = m.group(1)
    return {"slug": f[:-3], "anchor": slugify(title), "label": title.split(": ", 1)[1], "ref": ref}

stage_of = lambda day: next(s for s in STAGES if day <= s[2])
out = []
for i, (_, topic, title, lesson, steps, minutes, area, ref, sop, doit) in enumerate(D):
    day = i + 1
    s = stage_of(day)
    out.append({
        "day": day, "stage": s[0], "stageName": s[1], "topic": topic, "title": title, "lesson": lesson,
        "steps": steps, "minutes": minutes, "area": area, "learn": find(ref), "sop": sop,
        "doIt": {"tier": doit[0], "label": doit[1]} if doit else None,
    })
assert len(out) == STAGES[-1][2], (len(out), STAGES[-1][2])
ranges = {}
prev = 0
for st in STAGES:
    ranges[st[0]] = f"Days {prev + 1} to {st[2]}"
    prev = st[2]
json.dump({"stages": [{"id": s[0], "name": s[1], "range": ranges[s[0]]} for s in STAGES], "days": out},
          open(os.path.join(ROOT, "src", "lib", "seed", "curriculum.json"), "w"), indent=1, ensure_ascii=False)

L = ["# Daily curriculum: one lesson, one topic, one action", "",
     "Helix delivers the whole programme as a daily habit. Each day has **one short lesson**, **one topic** and **one clear action**, plus the offer: *I'll do it for you if you want.* Tapping that creates an approval; nothing changes until you approve.", "",
     "The sequence is ordered by store stage: numbers first, then conversion, retention, creative and ads, more channels, promotions and peak, then scale. Stores that already have a stage covered can mark days done and move on. After the last day the daily loop continues with tasks raised by [Insights](audit-engine.md) and the weekly rhythm from the [Compound Plan](compound-daily-plan.md).", "",
     "This file is generated from `scripts/curriculum_source.py` by `python3 scripts/build_curriculum.py`, which also writes `src/lib/seed/curriculum.json` for the app (Today screen and roadmap timeline).", "",
     "**Do it for me** tiers: Free, Starter or Growth show the minimum plan for Helix to do the work. Days marked *Guide* are done by you with the checklist.", ""]
for s in STAGES:
    L += [f"## Stage {s[0]}: {s[1]} ({ranges[s[0]]})", "", "| Day | Topic | Today's action | Lesson | Time | Do it for me |", "| --- | --- | --- | --- | --- | --- |"]
    for d in [x for x in out if x["stage"] == s[0]]:
        lr = d["learn"]
        dit = f'{d["doIt"]["tier"].title()}: {d["doIt"]["label"]}' if d["doIt"] else "Guide"
        L.append(f'| {d["day"]} | {d["topic"]} | {d["title"]} | [{lr["ref"]} {lr["label"]}](playbook/{lr["slug"]}.md#{lr["anchor"]}) | {d["minutes"]} min | {dit} |')
    L.append("")
L += ["## Day detail", ""]
for d in out:
    L += [f'### Day {d["day"]}: {d["title"]}', "", f'*Topic: {d["topic"]} · Stage {d["stage"]} · {d["minutes"]} minutes · SOP {d["sop"]}*', "", f'**Lesson.** {d["lesson"]}', "", "**Action.**", ""]
    L += [f"{i+1}. {st}" for i, st in enumerate(d["steps"])]
    L += ["", f'**I\'ll do it for you:** {d["doIt"]["label"]} ({d["doIt"]["tier"].title()} plan, with your approval).' if d["doIt"] else "**I'll do it for you:** not for this one. It is quick to do yourself and you learn the most by doing it.", ""]
open(os.path.join(ROOT, "docs", "daily-curriculum.md"), "w").write("\n".join(L))
print("days", len(out))
