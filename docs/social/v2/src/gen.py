import csv, sys, os, subprocess, json, random
from multiprocessing import Pool
from data import POSTS, LAY, ANIM, CAPREF
from design import CW, cr
from page import build
OUT='/workspace/reports/helix/social-v2'; os.makedirs(OUT+'/static',exist_ok=True); os.makedirs(OUT+'/animated',exist_ok=True); os.makedirs(OUT+'/html',exist_ok=True)
# schedule adjacency
sched=[int(r['post_no']) for r in csv.DictReader(open('/workspace/reports/helix/facebook/schedule.csv'))]
nb={n:set() for n in range(1,58)}
for a,b in zip(range(1,57),range(2,58)): nb[a].add(b); nb[b].add(a)
for a,b in zip(sched,sched[1:]): nb[a].add(b); nb[b].add(a)
PREF={'countdown':['night','grape','sunny'],'meme':['sunny','peach','grape','sky','night'],'quote':['grape','night','lilac','kraft'],'stat':['sky','paper','mint','night']}
names=list(CW); use={k:0 for k in names}; COL={}; combo={}
random.seed(3)
for p in POSTS:
    n=p['n']; bad={COL[m] for m in nb[n] if m in COL}
    # also avoid same colour+layout combo used within last 8 posts
    recent={(COL[m],LAY[m]) for m in range(max(1,n-8),n)}
    cands=[c for c in names if c not in bad and (c,LAY[n]) not in recent]
    pref=PREF.get(LAY[n],[])
    cands.sort(key=lambda c:(use[c]-(1.5 if c in pref else 0)+3*combo.get((c,LAY[n]),0),random.random()))
    COL[n]=cands[0]; use[cands[0]]+=1; combo[(cands[0],LAY[n])]=combo.get((cands[0],LAY[n]),0)+1
# checks
viol=[(a,b) for a,b in list(zip(range(1,57),range(2,58)))+list(zip(sched,sched[1:])) if COL[a]==COL[b] or LAY[a]==LAY[b]]
print('adjacency violations (same colour OR same layout):',viol)
json.dump(dict(COL=COL),open(OUT+'/src/assign.json','w'))
for nm,c in CW.items():
    print(f"{nm:6} fg/bg {cr(c['fg'],c['bg']):.1f} hd/bg {cr(c['hd'],c['bg']):.1f} ac/bg {cr(c['ac'],c['bg']):.1f} hd/sw {cr(c['hd'],c['sw']):.1f} ct/cd {cr(c['ct'],c['cd']):.1f} ct/hl {cr(c['ct'],c['hl']):.1f}")

import collections;print('max combo repeats',collections.Counter((COL[n],LAY[n]) for n in COL).most_common(3))
