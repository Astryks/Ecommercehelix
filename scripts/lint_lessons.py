"""Lesson step audit: one action per step, a 'done when' result, plain words, and where to click.

Usage: python3 scripts/lint_lessons.py [--json] [module-prefix ...]
Prints one line per problem. Exit code 0 always; this is a report, not a gate.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "docs" / "playbook"
JARGON = {  # term -> must be explained in the same step or lesson the first time it is used
    "ROAS", "MER", "CPA", "CAC", "AOV", "CTR", "CPM", "LTV", "COGS", "UTM", "SKU", "CRO", "KPI", "BNPL", "CBO", "ABO", "PMax", "DPA", "ASC", "GMV", "EOFY", "BAS",
}
VERBS = r"(?:open|click|tap|go|add|set|turn|write|pick|choose|type|copy|paste|create|make|check|compare|remove|upload|download|send|ask|list|move|save|run|test|fill|enter|select|press|find|read|install|connect|change|build|put|use|record|note)"

def steps(md):
    for m in re.finditer(r"^## (Lesson (\d+\.\d+):[^\n]*)\n(.*?)(?=^## |\Z)", md, re.S | re.M):
        title, ref, body = m.group(1), m.group(2), m.group(3)
        for s in re.finditer(r"\*\*Step (\d+)\.\*\*\s*(.*?)(?=\n\*\*Step \d+\.\*\*|\n## |\Z)", body, re.S):
            n, text = int(s.group(1)), s.group(2)
            instr = text.split("**Expected result:**")[0].strip()
            exp = re.search(r"\*\*Expected result:\*\*\s*(.+)", text)
            yield ref, title, body, n, instr, exp.group(1).strip() if exp else ""

def problems(ref, body, n, instr, exp):
    out = []
    plain = re.sub(r"<!--.*?-->|\(.*?\)|\[([^\]]*)\]\([^)]*\)", r"\1", instr)
    # A short goal line followed by numbered or bulleted clicks: check each line on its own.
    parts = [x.strip() for x in re.split(r"\n+", plain) if x.strip()]
    if len(parts) > 1 and all(len(x.split()) <= 45 for x in parts):
        bad = [x for x in parts if len(re.findall(r"(?:,|\band\b|\bthen\b)\s+" + VERBS + r"\b", x, re.I)) >= 2]
        return ([] if exp else ["no expected result"]) + (["a sub-step does several things"] if bad else []) + jargon(instr, body)
    sentences = [x for x in re.split(r"(?<=[.!?])\s+", plain.strip()) if x]
    if not exp:
        out.append("no expected result")
    if len(sentences) > 2:
        out.append(f"{len(sentences)} sentences (aim for 1 action)")
    if len(re.findall(r"(?:,|\band\b|\bthen\b)\s+" + VERBS + r"\b", plain, re.I)) >= 2:
        out.append("several actions joined")
    if len(plain.split()) > 45:
        out.append(f"{len(plain.split())} words (aim for under 45)")
    return out + jargon(instr, body)

def jargon(instr, body):
    return [f"jargon {j} not explained in this lesson" for j in JARGON
            if re.search(rf"\b{j}\b", instr) and not re.search(rf"\b{j}\b[^.\n]{{0,40}}\(|\({j}\)|{j}:|{j} is|{j} means|{j}, ", body)]

def main():
    as_json = "--json" in sys.argv
    prefixes = [a for a in sys.argv[1:] if not a.startswith("--")]
    rows, total = [], 0
    for f in sorted(ROOT.glob("[0-9][0-9]-*.md")):
        if prefixes and not any(f.name.startswith(p) for p in prefixes):
            continue
        seen = {}
        for ref, title, body, n, instr, exp in steps(f.read_text()):
            total += 1
            p = problems(ref, body, n, instr, exp)
            key = re.sub(r"\W+", " ", instr.lower())[:60]
            if key in seen.get(ref, set()):
                p.append("duplicate of an earlier step")
            seen.setdefault(ref, set()).add(key)
            if p:
                rows.append({"file": f.name, "lesson": ref, "step": n, "problems": p, "text": instr[:140]})
    if as_json:
        print(json.dumps({"steps": total, "flagged": len(rows), "rows": rows}, indent=1))
    else:
        for r in rows:
            print(f"{r['lesson']} step {r['step']}: {'; '.join(r['problems'])}")
        print(f"\n{len(rows)} of {total} steps flagged")

main()
