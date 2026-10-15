import json,random,collections
from data import POSTS,LAY
from design import CW
PREF={'countdown':['night','grape'],'meme':['sunny','peach','grape','sky','night'],'quote':['grape','night','lilac','kraft'],'stat':['sky','paper','mint','night']}
names=list(CW);use={k:0 for k in names};COL={};combo={};random.seed(11)
for p in POSTS:
    n=p['n'];bad={COL.get(n-1),COL.get(n-2)};recent={(COL[m],LAY[m]) for m in range(max(1,n-8),n)}
    c=[x for x in names if x not in bad and (x,LAY[n]) not in recent]
    c.sort(key=lambda x:(use[x]-(1.5 if x in PREF.get(LAY[n],[]) else 0)+3*combo.get((x,LAY[n]),0),random.random()))
    COL[n]=c[0];use[c[0]]+=1;combo[(c[0],LAY[n])]=combo.get((c[0],LAY[n]),0)+1
json.dump(dict(COL=COL),open('/workspace/reports/helix/social-v3/src/assign.json','w'));print(use)
